"use client";

import { GAP_M, PADDING_L, TYPOGRAPHY } from "./designTokens";

type TimelineCardProps = {
  startDate: string;
  endDate: string;
};

export function TimelineCard({ startDate, endDate }: TimelineCardProps) {
  return (
    <div
      className={`rounded-xl border border-[#E5E5E5] bg-white ${PADDING_L} flex flex-col ${GAP_M}`}
    >
      <div className="flex items-center justify-between">
        <p className={TYPOGRAPHY.label}>Started on</p>
        <p className="font-semibold text-[#1A1A1A] whitespace-nowrap">
          {startDate}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <p className={TYPOGRAPHY.label}>Ends on</p>
        <p className="font-semibold text-[#1A1A1A] whitespace-nowrap">
          {endDate}
        </p>
      </div>
    </div>
  );
}
