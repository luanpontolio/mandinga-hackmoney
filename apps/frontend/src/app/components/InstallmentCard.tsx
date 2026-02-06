"use client";

import { GAP_M, PADDING_L, TYPOGRAPHY } from "./designTokens";

type InstallmentCardProps = {
  isWalletConnected: boolean;
  hasJoined: boolean;
  currentInstallment: number;
  totalInstallments: number;
  amountLabel: string;
  dueLabel: string;
};

export function InstallmentCard({
  isWalletConnected,
  hasJoined,
  currentInstallment,
  totalInstallments,
  amountLabel,
  dueLabel,
}: InstallmentCardProps) {
  const progressPercentage =
    totalInstallments > 0
      ? Math.max(1, (currentInstallment / totalInstallments) * 100)
      : 1;
  const isPreJoin = !isWalletConnected || !hasJoined;

  if (isPreJoin) {
    return (
      <div
        className={`rounded-xl border border-[#E5E5E5] bg-white ${PADDING_L} flex flex-col ${GAP_M}`}
      >
        <div className="flex items-center justify-between">
          <span className={TYPOGRAPHY.label}>Installments</span>
          <span></span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5E5E5]">
          <div className="h-full w-[1%] bg-[#1A1A1A] rounded-full" />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#1A1A1A]">
            Always due on {dueLabel}, every month
          </span>
          <span className="font-semibold text-[#1A1A1A] whitespace-nowrap">
            {amountLabel}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-[#E5E5E5] bg-white ${PADDING_L} flex flex-col ${GAP_M}`}
    >
      <div className="flex items-center justify-between">
        <span className={TYPOGRAPHY.label}>Installments</span>
        <span className={TYPOGRAPHY.caption}>
          {String(currentInstallment).padStart(2, "0")}/
          {totalInstallments || "--"}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5E5E5]">
        <div
          className="h-full bg-[#1A1A1A] rounded-full transition-all"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="font-semibold text-[#1A1A1A]">
          Always due on {dueLabel}, every month
        </span>
        <span className="font-semibold text-[#1A1A1A] whitespace-nowrap">
          {amountLabel}
        </span>
      </div>
    </div>
  );
}
