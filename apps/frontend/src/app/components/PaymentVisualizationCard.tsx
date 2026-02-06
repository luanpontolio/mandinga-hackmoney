"use client";

import { CircleGrid } from "./CircleGrid";
import { GAP_M, PADDING_L, TYPOGRAPHY } from "./designTokens";

type PaymentVisualizationCardProps = {
  monthlyAmountLabel: string;
  totalMonths: number;
  currentMonth: number;
  earlyEntryLabel: string;
};

export function PaymentVisualizationCard({
  monthlyAmountLabel,
  totalMonths,
  currentMonth,
  earlyEntryLabel,
}: PaymentVisualizationCardProps) {
  const safeTotalMonths = totalMonths > 0 ? totalMonths : 1;

  return (
    <div
      className={`rounded-xl border border-[#E5E5E5] bg-white ${PADDING_L} flex flex-col ${GAP_M} w-full`}
    >
      <div>
        <h2 className={`${TYPOGRAPHY.h3} text-[#1A1A1A]`}>
          Pay {monthlyAmountLabel} /mo for {totalMonths || "--"} months
        </h2>
        <p className={`${TYPOGRAPHY.bodyMuted} mt-1`}>
          Early entry: {earlyEntryLabel}.
        </p>
      </div>
      <div>
        <CircleGrid
          totalDots={safeTotalMonths}
          filledDot={currentMonth}
          earlyEntryDots={[]}
          dotSize={32}
          baseGap={10}
          minGap={6}
          maxGap={18}
        />
      </div>
    </div>
  );
}
