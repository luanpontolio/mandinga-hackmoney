"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  erc20Abi,
  http,
  type Address,
  type Hash,
} from "viem";
import { createSiweMessage, generateSiweNonce } from "viem/siwe";
import { arcTestnet } from "../lib/config";
import { env } from "../lib/env";
import {
  Vault,
  positionNftAbi,
  type VaultSummary,
  vaultAbi,
} from "../lib/contracts";
import { useUser } from "./UserContext";
import { formatUsd } from "../utils";
import { useToast } from "./ToastContext";

type Step = "idle" | "siwe" | "checkout" | "result";
type StepStatus = "success" | "error" | null;

type VaultContextValue = {
  loading: boolean;
  error: string | null;
  summary: VaultSummary | null;
  participants: Address[];
  quota: string;
  setQuota: (value: string) => void;
  tokenId: bigint;
  positionQuotaId: number | null;
  paidInstallments: bigint;
  totalPaid: bigint;
  claimTokenBalance: bigint;
  step: Step;
  signature: string | null;
  stepStatus: StepStatus;
  stepError: string | null;
  isSubmitting: boolean;
  progress: number;
  flowMode: "deposit" | "pay";
  actionLabel: string;
  reload: () => Promise<void>;
  resetStepper: () => void;
  handleStartFlow: () => void;
  handleSignSiwe: () => Promise<boolean>;
  handleCheckout: () => Promise<void>;
};

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({
  children,
  vaultAddress,
}: {
  children: ReactNode;
  vaultAddress: string;
}) {
  const { isConnected, connect, fullAddress } = useUser();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<VaultSummary | null>(null);
  const [participants, setParticipants] = useState<Address[]>([]);
  const [quota, setQuota] = useState("0");
  const [tokenId, setTokenId] = useState<bigint>(0n);
  const [positionQuotaId, setPositionQuotaId] = useState<number | null>(null);
  const [paidInstallments, setPaidInstallments] = useState<bigint>(0n);
  const [totalPaid, setTotalPaid] = useState<bigint>(0n);
  const [claimTokenBalance, setClaimTokenBalance] = useState<bigint>(0n);
  const [step, setStep] = useState<Step>("idle");
  const [signature, setSignature] = useState<string | null>(null);
  const [stepStatus, setStepStatus] = useState<StepStatus>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const client = useMemo(
    () =>
      createPublicClient({
        chain: arcTestnet,
        transport: http(env.rpcUrl),
      }),
    []
  );

  const normalizedVaultAddress = vaultAddress as Address;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const vault = new Vault(client, normalizedVaultAddress);
      const data = await vault.getSummary();
      setSummary(data);

      const activeCount = Number(data.activeParticipantCount);
      if (activeCount > 0) {
        const results = await client.multicall({
          contracts: Array.from({ length: activeCount }, (_, index) => ({
            address: normalizedVaultAddress,
            abi: vaultAbi,
            functionName: "participants",
            args: [BigInt(index)],
          })),
          allowFailure: false,
        });
        setParticipants(results as Address[]);
      } else {
        setParticipants([]);
      }

      if (fullAddress) {
        const [positionNft, shareToken] = await Promise.all([
          client.readContract({
            address: normalizedVaultAddress,
            abi: vaultAbi,
            functionName: "positionNft",
          }),
          client.readContract({
            address: normalizedVaultAddress,
            abi: vaultAbi,
            functionName: "shareToken",
          }),
        ]);
        const tokenIdValue = await client.readContract({
          address: normalizedVaultAddress,
          abi: vaultAbi,
          functionName: "participantToTokenId",
          args: [fullAddress as Address],
        });
        const normalizedTokenId = BigInt(tokenIdValue as bigint);
        setTokenId(normalizedTokenId);

        if (normalizedTokenId > 0n) {
          const position = (await client.readContract({
            address: positionNft as Address,
            abi: positionNftAbi,
            functionName: "getPosition",
            args: [normalizedTokenId],
          })) as { paidInstallments?: bigint; quotaId?: bigint; totalPaid?: bigint };
          setPaidInstallments(position.paidInstallments ?? 0n);
          setTotalPaid(position.totalPaid ?? 0n);
          if (typeof position.quotaId === "bigint") {
            setPositionQuotaId(Number(position.quotaId));
          } else {
            setPositionQuotaId(null);
          }
        } else {
          setPaidInstallments(0n);
          setTotalPaid(0n);
          setPositionQuotaId(null);
        }

        const balance = await client.readContract({
          address: shareToken as Address,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [fullAddress as Address],
        });
        setClaimTokenBalance(balance as bigint);
      } else {
        setTokenId(0n);
        setPaidInstallments(0n);
        setTotalPaid(0n);
        setPositionQuotaId(null);
        setClaimTokenBalance(0n);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load circle vault."
      );
    } finally {
      setLoading(false);
    }
  }, [client, normalizedVaultAddress, fullAddress]);

  useEffect(() => {
    if (!fullAddress) {
      setSignature(null);
      return;
    }
    try {
      const stored = localStorage.getItem("siweSignature");
      if (!stored) {
        setSignature(null);
        return;
      }
      const parsed = JSON.parse(stored) as {
        address?: string;
        signature?: string;
      };
      if (
        parsed?.address &&
        parsed?.signature &&
        parsed.address.toLowerCase() === fullAddress.toLowerCase()
      ) {
        setSignature(parsed.signature);
      } else {
        setSignature(null);
      }
    } catch {
      setSignature(null);
    }
  }, [fullAddress]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      await load();
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const progress = useMemo(() => {
    if (!summary) return 0;
    const currentValue = Number((summary.snapshotBalance / 10n ** 18n).toString());
    const targetValue = Number((summary.targetValue / 10n ** 18n).toString());
    if (!targetValue) return 0;
    return (currentValue / targetValue) * 100;
  }, [summary]);

  const isEnrolled = tokenId > 0n;
  const shouldPayInstallment = isEnrolled && paidInstallments > 0n;
  const flowMode: "deposit" | "pay" = shouldPayInstallment ? "pay" : "deposit";

  const resetStepper = useCallback(() => {
    setStep("idle");
    setSignature(null);
    setStepStatus(null);
    setStepError(null);
    setIsSubmitting(false);
  }, []);

  const handleSignSiwe = useCallback(async (): Promise<boolean> => {
    if (flowMode === "pay") return false;
    if (!fullAddress) return false;
    if (!window.ethereum) {
      setStepError("No wallet provider found.");
      return false;
    }
    setIsSubmitting(true);
    setStepError(null);
    try {
      const message = createSiweMessage({
        address: fullAddress as Address,
        chainId: arcTestnet.id,
        domain: window.location.host,
        uri: window.location.origin,
        nonce: generateSiweNonce(),
        version: "1",
        statement: `If you accept, you agree that:

      01.
      Fixed Monthly Installment
      You agree to pay $892 every month for 24 months. Early exit is not guaranteed.

      02.
      Missed Payments
      Penalties may apply. Rules are enforced automatically.

      03.
      Shared Financial Risk
      This is a collective system. Other members may affect outcomes.

      04.
      Legal Responsibility
      You are responsible for handling legal and tax obligations in your country.

      05.
      Blockchain Finality
      Transactions are irreversible once confirmed.
      `,
      });
      const walletClient = createWalletClient({
        chain: arcTestnet,
        transport: custom(window.ethereum),
      });
      const signed = await walletClient.signMessage({
        account: fullAddress as Address,
        message,
      });
      setSignature(signed);
      try {
        localStorage.setItem(
          "siweSignature",
          JSON.stringify({ address: fullAddress, signature: signed })
        );
      } catch {
        // Ignore localStorage write failures (e.g. privacy mode).
      }
      setStep("checkout");
      return true;
    } catch (err) {
      setStepError(
        err instanceof Error ? err.message : "Failed to sign the message."
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [flowMode, fullAddress]);

  const handleCheckout = useCallback(async () => {
    if (!summary || !fullAddress) return;
    if (!window.ethereum) {
      setStepError("No wallet provider found.");
      setStep("result");
      setStepStatus("error");
      return;
    }
    setIsSubmitting(true);
    setStepError(null);
    try {
      const walletClient = createWalletClient({
        chain: arcTestnet,
        transport: custom(window.ethereum),
      });
      let hash: Hash;

      if (flowMode === "deposit") {
        hash = await walletClient.writeContract({
          address: normalizedVaultAddress,
          abi: vaultAbi,
          functionName: "deposit",
          args: [BigInt(quota)],
          value: summary.installmentAmount,
          account: fullAddress as Address,
        });
      } else {
        hash = await walletClient.writeContract({
          address: normalizedVaultAddress,
          abi: vaultAbi,
          functionName: "payInstallment",
          value: summary.installmentAmount,
          account: fullAddress as Address,
        });
      }

      await client.waitForTransactionReceipt({ hash });
      setStepStatus("success");
      setStep("result");
    } catch (err) {
      setStepStatus("error");
      setStepError(
        err instanceof Error ? err.message : "Transaction failed."
      );
      showToast("Transaction Failed");
      setStep("result");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    summary,
    fullAddress,
    flowMode,
    normalizedVaultAddress,
    quota,
    client,
    showToast,
  ]);

  const handleStartFlow = useCallback(() => {
    if (!isConnected) {
      connect();
      return;
    }
    if (flowMode === "pay" || (flowMode === "deposit" && signature)) {
      void handleCheckout();
      return;
    }
    setStep("siwe");
    setStepError(null);
    setStepStatus(null);
  }, [connect, flowMode, handleCheckout, isConnected, signature]);

  const actionLabel = !isConnected
    ? "Connect wallet"
    : flowMode === "pay"
      ? summary
        ? `Pay installment (${formatUsd(summary.installmentAmount)})`
        : "Pay installment"
      : "Join circle";

  const value = useMemo<VaultContextValue>(
    () => ({
      loading,
      error,
      summary,
      participants,
      quota,
      setQuota,
      tokenId,
      positionQuotaId,
      paidInstallments,
      totalPaid,
      claimTokenBalance,
      step,
      signature,
      stepStatus,
      stepError,
      isSubmitting,
      progress,
      flowMode,
      actionLabel,
      reload: load,
      resetStepper,
      handleStartFlow,
      handleSignSiwe,
      handleCheckout,
    }),
    [
      loading,
      error,
      summary,
      participants,
      quota,
      tokenId,
      positionQuotaId,
      paidInstallments,
      totalPaid,
      claimTokenBalance,
      step,
      signature,
      stepStatus,
      stepError,
      isSubmitting,
      progress,
      flowMode,
      actionLabel,
      load,
      resetStepper,
      handleStartFlow,
      handleSignSiwe,
      handleCheckout,
    ]
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) {
    throw new Error("useVault must be used within VaultProvider");
  }
  return ctx;
}
