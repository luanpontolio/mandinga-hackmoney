"use client";

import Link from "next/link";
import { GAP_M, PADDING_L, TYPOGRAPHY } from "./designTokens";

type PaymentVisualizationCardProps = {
  monthlyAmountLabel: string;
  totalMonths: number;
  currentMonth: number;
  isWalletConnected: boolean;
  selectedEntry: string;
  joinHref: string;
  statusLabel: string;
  hasJoined: boolean;
  paidInstallments: number;
};

export function PaymentVisualizationCard({
  monthlyAmountLabel,
  totalMonths,
  currentMonth,
  isWalletConnected,
  selectedEntry,
  joinHref,
  statusLabel,
  hasJoined,
  paidInstallments,
}: PaymentVisualizationCardProps) {
  const safeTotalMonths = totalMonths > 0 ? totalMonths : 1;
  const progressPercentage = Math.max(
    1,
    (currentMonth / safeTotalMonths) * 100
  );

  const getButtonColor = () => {
    if (selectedEntry === "early") return "hsl(var(--entry-early-default))";
    if (selectedEntry === "middle") return "hsl(var(--entry-middle-default))";
    return "hsl(var(--entry-late-default))";
  };
  const isJoinDisabled = statusLabel !== "Active" && statusLabel !== "Joined";
  const hasPaidInstallment = paidInstallments > 0;
  const buttonLabel = hasJoined && hasPaidInstallment ? "Pay installment" : "Join";

  return (
    <div
      className={`rounded-xl border border-[#E5E5E5] bg-white ${PADDING_L} flex flex-col ${GAP_M}`}
    >
      <div>
        <h2 className={`${TYPOGRAPHY.h3} text-[#1A1A1A] text-center`}>
          Pay {monthlyAmountLabel} /mo for {totalMonths || "--"} months
        </h2>
      </div>

      <div
        className={`rounded-xl border border-[#E5E5E5] bg-white ${PADDING_L} flex flex-col ${GAP_M}`}
      >
        <div className="flex items-center justify-between">
          <span className={TYPOGRAPHY.label}>Installments</span>
          <span className={TYPOGRAPHY.caption}>
            {String(currentMonth).padStart(2, "0")}/{safeTotalMonths}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5E5E5]">
          <div
            className="h-full bg-[#1A1A1A] rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#1A1A1A]">Due now</span>
          <span className="font-semibold text-[#1A1A1A] whitespace-nowrap">
            {monthlyAmountLabel}
          </span>
        </div>

        {isWalletConnected && selectedEntry && (
          <Link
            href={joinHref}
            aria-disabled={isJoinDisabled}
            tabIndex={isJoinDisabled ? -1 : 0}
            onClick={(event) => {
              if (isJoinDisabled) {
                event.preventDefault();
              }
            }}
            className={`w-full rounded-full text-white mt-2 transition-colors text-center py-3 text-sm font-semibold ${
              isJoinDisabled ? "cursor-not-allowed opacity-50" : "hover:opacity-90"
            }`}
            style={{ backgroundColor: getButtonColor() }}
          >
            {buttonLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
