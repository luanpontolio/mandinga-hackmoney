"use client";

import { PADDING_L, TYPOGRAPHY } from "./designTokens";

type SlotsCardProps = {
  statusLabel: string;
  slotsLeftLabel: string;
};

export function SlotsCard({ statusLabel, slotsLeftLabel }: SlotsCardProps) {
  return (
    <div
      className={`rounded-xl border border-[#E5E5E5] bg-white ${PADDING_L} flex items-center justify-between`}
    >
      <div className="flex items-center gap-2 rounded-2xl bg-[#E8F5E9] px-3 py-1.5">
        <span className="h-2 w-2 rounded-full bg-[#2E7D32]" />
        <span className={`${TYPOGRAPHY.button} text-[#2E7D32]`}>
          {statusLabel}
        </span>
      </div>
      <span className={`${TYPOGRAPHY.button} text-[#666666]`}>
        {slotsLeftLabel}
      </span>
    </div>
  );
}
