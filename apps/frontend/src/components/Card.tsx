"use client";

import Link from "next/link";
import { useState } from "react";
import type { VaultSummary } from "../lib/contracts";
import { Rings } from "../shared/Rings";
import type { SlotsByWindow } from "../shared/totalMonths";
import { formatAddress, formatUsd } from "../utils";

type EntryId = "early" | "middle" | "late";

type CardProps = {
  circle: VaultSummary;
  statusLabel: "Active" | "Upcoming" | "Ended";
  slotsLeft: number;
  slots: SlotsByWindow;
  ensName?: string | null;
};

const STATUS_STYLES: Record<
  CardProps["statusLabel"],
  { text: string; bg: string; dot: string }
> = {
  Active: { text: "#2E7D32", bg: "#E8F5E9", dot: "#2E7D32" },
  Upcoming: { text: "#1976D2", bg: "#E3F2FD", dot: "#1976D2" },
  Ended: { text: "#F44336", bg: "#FFEBEE", dot: "#F44336" },
};

const ENTRY_LABELS: Record<EntryId, string> = {
  early: "Early entry",
  middle: "Middle entry",
  late: "Late entry",
};

export function Card({ circle, statusLabel, slotsLeft, slots, ensName }: CardProps) {
  const [hoveredEntry, setHoveredEntry] = useState<EntryId | "">("");
  const statusStyle = STATUS_STYLES[statusLabel];
  const monthlyAmountLabel = formatUsd(circle.installmentAmount);
  const totalInstallments = Number(circle.totalInstallments);
  const activeEntry = hoveredEntry as EntryId | "";
  const entryLabel = activeEntry ? ENTRY_LABELS[activeEntry] : "";
  const entryShort = entryLabel.split(" ")[0]?.toLowerCase();
  const slotsLabel = activeEntry
    ? `${slots[activeEntry]} ${entryShort} slots left`
    : `${slotsLeft} slots left`;

  return (
    <Link
      href={`/circle/${circle.vaultAddress}`}
      className="rounded-xl border border-[#E5E5E5] p-5 flex flex-col gap-4 transition-all duration-200 hover:bg-[#FAFAFA]"
      onMouseLeave={() => setHoveredEntry("")}
    >
      <h2 className="text-base font-semibold text-[#1A1A1A] text-center min-h-[48px] flex flex-col justify-center transition-all duration-200">
        {activeEntry ? (
          <>
            <span>{entryLabel}</span>
            <span className="text-xs font-normal text-[#666666] mt-1">
              {slots[activeEntry]} rings available
            </span>
          </>
        ) : (
          <span>
            Pay {monthlyAmountLabel} /mo for {totalInstallments || "--"} months
          </span>
        )}
      </h2>

      <div className="relative flex items-center justify-center -mx-5 px-5 w-full aspect-square">
        <Rings
          slots={slots}
          hoveredEntry={hoveredEntry}
          onHoverEntry={(entry) => setHoveredEntry(entry as EntryId | "")}
          className="w-full h-full"
          showCounts={false}
        />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ opacity: activeEntry ? 0 : 1 }}
        >
          <span className="text-3xl font-bold text-[#1A1A1A]">
            {formatUsd(circle.targetValue)}
          </span>
          <span className="text-base font-semibold text-[#1A1A1A]">
            {circle.circleName || "--"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 rounded-2xl px-3 py-1.5"
          style={{ backgroundColor: statusStyle.bg }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: statusStyle.dot }}
          />
          <span className="text-sm font-medium" style={{ color: statusStyle.text }}>
            {statusLabel}
          </span>
        </div>
        <div className="rounded-2xl bg-[#F5F5F5] px-3 py-1.5 transition-all duration-200">
          <span className="text-sm font-medium text-[#666666]">{slotsLabel}</span>
        </div>
      </div>

      <div className="rounded-full bg-[#E3F2FD] px-4 py-2 w-full text-center">
        <span className="text-xs font-semibold text-[#1976D2]">
          {ensName || formatAddress(circle.vaultAddress)}
        </span>
      </div>
    </Link>
  );
}
