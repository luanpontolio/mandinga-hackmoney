"use client";

import { useMemo } from "react";
import type { VaultSummary } from "../../lib/contracts";
import { formatExitFee } from "../../utils";

export function useJoinSummary(summary: VaultSummary | null) {
  return useMemo(() => {
    if (!summary) return null;
    const totalCommitment =
      summary.installmentAmount * summary.totalInstallments;
    const feeLabel = formatExitFee(summary.exitFeeBps);
    const protocolFee =
      (totalCommitment * BigInt(summary.exitFeeBps)) / 10000n;
    const totalWithFees = totalCommitment + protocolFee;
    const circleLabel = summary.circleName || "--";

    return {
      totalCommitment,
      feeLabel,
      protocolFee,
      totalWithFees,
      circleLabel,
    };
  }, [summary]);
}
