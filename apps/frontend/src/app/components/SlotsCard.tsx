"use client";

import { PADDING_L, TYPOGRAPHY } from "./designTokens";

type SlotsCardProps = {
  statusLabel: string;
  slotsLeftLabel: string;
};

// define status labels colors
const STATUS_LABELS_COLORS = {
  ACTIVE: "#2E7D32",
  ENDED: "#F44336",
  FROZEN: "#FFA726",
  CLOSED: "#F44336",
  JOINED: "#1976D2",
  WINNER: "#F9A825",
};

export function SlotsCard({ statusLabel, slotsLeftLabel }: SlotsCardProps) {
  const normalizedStatus =
    statusLabel.toUpperCase() as keyof typeof STATUS_LABELS_COLORS;
  const statusColor = STATUS_LABELS_COLORS[normalizedStatus] ?? "#2E7D32";
  const isHighlighted =
    normalizedStatus !== "ENDED" &&
    normalizedStatus === "ACTIVE" ||
    normalizedStatus === "JOINED" ||
    normalizedStatus === "WINNER";

  return (
    <div
      className={`rounded-xl border border-[#E5E5E5] bg-white ${PADDING_L} flex items-center justify-between`}
    >
      <div
        className={`flex items-center gap-2 rounded-2xl px-3 py-1.5 ${
          isHighlighted ? "bg-[#E8F5E9]" : "bg-[#F5F5F5]"
        }`}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: statusColor }}
        />
        <span className={TYPOGRAPHY.button} style={{ color: statusColor }}>
          {statusLabel}
        </span>
      </div>
      <span className={`${TYPOGRAPHY.button} text-[#666666] whitespace-nowrap`}>
        {slotsLeftLabel}
      </span>
    </div>
  );
}
