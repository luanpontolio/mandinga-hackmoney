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
  handleSignSiwe: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<VaultSummary | null>(null);
  const [participants, setParticipants] = useState<Address[]>([]);
  const [quota, setQuota] = useState("0");
  const [tokenId, setTokenId] = useState<bigint>(0n);
  const [positionQuotaId, setPositionQuotaId] = useState<number | null>(null);
  const [paidInstallments, setPaidInstallments] = useState<bigint>(0n);
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
        const positionNft = await client.readContract({
          address: normalizedVaultAddress,
          abi: vaultAbi,
          functionName: "positionNft",
        });
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
          })) as { paidInstallments?: bigint; quotaId?: bigint };
          setPaidInstallments(position.paidInstallments ?? 0n);
          if (typeof position.quotaId === "bigint") {
            setPositionQuotaId(Number(position.quotaId));
          } else {
            setPositionQuotaId(null);
          }
        } else {
          setPaidInstallments(0n);
          setPositionQuotaId(null);
        }
      } else {
        setTokenId(0n);
        setPaidInstallments(0n);
        setPositionQuotaId(null);
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

  const handleSignSiwe = useCallback(async () => {
    if (flowMode === "pay") return;
    if (!fullAddress) return;
    if (!window.ethereum) {
      setStepError("No wallet provider found.");
      return;
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
        statement:
          "I agree to the Mandinga protocol terms. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
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
    } catch (err) {
      setStepError(
        err instanceof Error ? err.message : "Failed to sign the message."
      );
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
