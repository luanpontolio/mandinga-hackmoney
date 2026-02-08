"use client";

import { GAP_M, PADDING_L, TYPOGRAPHY } from "./designTokens";

type TimelineCardProps = {
  startDate: string;
  endDate: string;
  baseStatus?: string;
};

export function TimelineCard({ startDate, endDate, baseStatus }: TimelineCardProps) {
  const upcoming = (base?: string) => (base || "").toUpperCase() === "UPCOMING";
  const active = (base?: string) => (base || "").toUpperCase() === "ACTIVE";
  const ended = (base?: string) => (base || "").toUpperCase() === "ENDED";

  const startLabel = upcoming(baseStatus) ? "Starts on" : active(baseStatus) ? "Started" : ended(baseStatus) ? "Started" : "Started on";
  const endLabel = upcoming(baseStatus) ? "Ends on" : active(baseStatus) ? "Ends" : ended(baseStatus) ? "Ended" : "Ends on";

  return (
    <div
      className={`rounded-xl border border-[#E5E5E5] bg-white ${PADDING_L} flex flex-col ${GAP_M}`}
    >
      <div className="flex items-center justify-between">
        <p className={TYPOGRAPHY.label}>{startLabel}</p>
        <p className="font-semibold text-[#1A1A1A] whitespace-nowrap">{startDate}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className={TYPOGRAPHY.label}>{endLabel}</p>
        <p className="font-semibold text-[#1A1A1A] whitespace-nowrap">{endDate}</p>
      </div>
    </div>
  );
}
