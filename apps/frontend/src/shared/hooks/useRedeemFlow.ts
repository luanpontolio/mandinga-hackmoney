"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  erc20Abi,
  getAddress,
  http,
  type Address,
} from "viem";
import { arcTestnet } from "../../lib/config";
import { vaultAbi } from "../../lib/contracts";
import { env } from "../../lib/env";

type UseRedeemFlowProps = {
  vaultAddress: Address | null;
  currentQuotaId: number;
  walletAddress: string | null;
};

export function useRedeemFlow({
  vaultAddress,
  currentQuotaId,
  walletAddress,
}: UseRedeemFlowProps) {
  const [drawCompleted, setDrawCompleted] = useState(false);
  const [windowSettled, setWindowSettled] = useState(false);
  const [winnerAddress, setWinnerAddress] = useState<string | null>(null);
  const [potShare, setPotShare] = useState<bigint | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: arcTestnet,
        transport: http(env.rpcUrl),
      }),
    []
  );

  useEffect(() => {
    if (!vaultAddress) return;
    let cancelled = false;

    const loadRedeemInfo = async () => {
      try {
        console.log("loading redeem info");
        console.log("vaultAddress", vaultAddress);
        console.log("currentQuotaId", currentQuotaId);
        const [drawCompletedValue, windowSettledValue, potShareValue] =
          await publicClient.multicall({
            contracts: [
              {
                address: vaultAddress,
                abi: vaultAbi,
                functionName: "drawCompleted",
                args: [BigInt(currentQuotaId)],
              },
              {
                address: vaultAddress,
                abi: vaultAbi,
                functionName: "windowSettled",
                args: [BigInt(currentQuotaId)],
              },
              {
                address: vaultAddress,
                abi: vaultAbi,
                functionName: "getWindowPotShare",
                args: [BigInt(currentQuotaId)],
              },
            ],
            allowFailure: false,
          });

        if (cancelled) return;
        setDrawCompleted(Boolean(drawCompletedValue));
        setWindowSettled(Boolean(windowSettledValue));
        setPotShare(potShareValue as bigint);

        console.log("drawCompletedValue", drawCompletedValue);
        if (drawCompletedValue) {
          console.log("getting draw order");
          console.log("vaultAddress", vaultAddress);
          console.log("currentQuotaId", currentQuotaId);
          const order = (await publicClient.readContract({
            address: vaultAddress,
            abi: vaultAbi,
            functionName: "getDrawOrder",
            args: [BigInt(currentQuotaId)],
          })) as Address[];
          console.log("order", order);
          if (cancelled) return;
          setWinnerAddress(getAddress(order[0]) ?? null);
        } else {
          setWinnerAddress(null);
        }
      } catch {
        if (cancelled) return;
        setDrawCompleted(false);
        setWindowSettled(false);
        setWinnerAddress(null);
        setPotShare(null);
      }
    };

    void loadRedeemInfo();
    return () => {
      cancelled = true;
    };
  }, [publicClient, vaultAddress, currentQuotaId]);

  const handleRedeem = useCallback(async () => {
    if (!vaultAddress || !walletAddress) return;
    if (!window.ethereum) {
      setRedeemError("No wallet provider found.");
      return;
    }
    setRedeemError(null);
    setIsRedeeming(true);
    try {
      const walletClient = createWalletClient({
        chain: arcTestnet,
        transport: custom(window.ethereum),
      });
      const [shareToken, claimAmount] = await Promise.all([
        publicClient.readContract({
          address: vaultAddress,
          abi: vaultAbi,
          functionName: "shareToken",
        }),
        publicClient.readContract({
          address: vaultAddress,
          abi: vaultAbi,
          functionName: "windowSnapshotBalance",
          args: [BigInt(currentQuotaId), walletAddress as Address],
        }),
      ]);

      if (claimAmount > 0n) {
        const allowance = await publicClient.readContract({
          address: shareToken as Address,
          abi: erc20Abi,
          functionName: "allowance",
          args: [walletAddress as Address, vaultAddress],
        });

        if (allowance < claimAmount) {
          const approveHash = await walletClient.writeContract({
            address: shareToken as Address,
            abi: erc20Abi,
            functionName: "approve",
            args: [vaultAddress, claimAmount],
            account: walletAddress as Address,
          });
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
        }
      }

      const redeemHash = await walletClient.writeContract({
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "redeem",
        args: [BigInt(currentQuotaId)],
        account: walletAddress as Address,
      });
      await publicClient.waitForTransactionReceipt({ hash: redeemHash });
    } catch (err) {
      setRedeemError(
        err instanceof Error ? err.message : "Redeem failed."
      );
    } finally {
      setIsRedeeming(false);
    }
  }, [vaultAddress, walletAddress, currentQuotaId, publicClient]);

  console.log("walletAddress", walletAddress);
  console.log("winnerAddress", winnerAddress);
  const isWinner =
    Boolean(walletAddress) &&
    Boolean(winnerAddress) &&
    walletAddress?.toLowerCase() === winnerAddress?.toLowerCase();

  return {
    drawCompleted,
    windowSettled,
    winnerAddress,
    potShare,
    redeemError,
    isRedeeming,
    handleRedeem,
    isWinner,
  };
}
