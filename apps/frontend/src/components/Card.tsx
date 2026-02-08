"use client";

import Link from "next/link";
import { useState } from "react";
import type { VaultSummary } from "../lib/contracts";
import { Rings } from "../shared/Rings";
import type { SlotsByWindow } from "../shared/totalMonths";
import { formatAddress, formatUsd } from "../utils";
import { TYPOGRAPHY } from "../app/components/designTokens";
import { Card as CardUI } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { formatAdaptiveRange, formatPayoutWindow } from "../lib/formatDate";

type EntryId = "early" | "middle" | "late";

type CardProps = {
  circle: VaultSummary;
  statusLabel: "Active" | "Upcoming" | "Ended";
  slotsLeft: number;
  slots: SlotsByWindow;
};

// STATUS_STYLES removed in favor of design tokens and `Badge` component

const ENTRY_LABELS: Record<EntryId, string> = {
  early: "Early entry",
  middle: "Middle entry",
  late: "Late entry",
};

export function Card({ circle, statusLabel, slotsLeft, slots }: CardProps) {
  const [hoveredEntry, setHoveredEntry] = useState<EntryId | "">("");
  const monthlyAmountLabel = formatUsd(circle.installmentAmount);
  const totalInstallments = Number(circle.totalInstallments);
  const activeEntry = hoveredEntry as EntryId | "";
  const entryLabel = activeEntry ? ENTRY_LABELS[activeEntry] : "";
  const entryShort = entryLabel.split(" ")[0]?.toLowerCase();
  const slotsLabel = activeEntry
    ? `${slots[activeEntry]} ${entryShort} slots left`
    : `${slotsLeft} slots left`;

  const formatPayoutRange = (entry: EntryId) => {
    if (entry === "early") return formatPayoutWindow(circle.startTime, circle.startTime, circle.closeWindowEarly);
    if (entry === "middle") return formatPayoutWindow(circle.startTime, circle.closeWindowEarly, circle.closeWindowMiddle);
    return formatPayoutWindow(circle.startTime, circle.closeWindowMiddle, circle.closeWindowLate);
  };

  return (
    <CardUI as={Link} href={`/circle/${circle.vaultAddress}`} onPointerLeave={() => setHoveredEntry("")} className="hover:bg-popover">
      <h2 className="text-base font-semibold text-foreground text-center min-h-[48px] flex flex-col justify-center transition-all duration-200">
        {activeEntry ? (
          <>
            <span>{entryLabel}</span>
            <span className="text-xs font-normal text-muted-foreground mt-1">
              {formatPayoutRange(activeEntry)}
            </span>
          </>
        ) : (
          <span>
            Pay {monthlyAmountLabel} /mo for {totalInstallments || "--"} months
          </span>
        )}
      </h2>

      <div className="relative flex items-center justify-center w-full aspect-square">
        <Rings
          slots={slots}
          hoveredEntry={hoveredEntry}
          onHoverEntry={(entry) => setHoveredEntry(entry as EntryId | "")}
          className="w-full h-full"
          showCounts={false}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-foreground">
            {formatUsd(circle.targetValue)}
          </span>
          <span className="text-base font-semibold text-foreground">
            {circle.circleName || "--"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Badge variant={statusLabel.toLowerCase() as "active" | "upcoming" | "ended"}>
          <span className="h-2 w-2 rounded-full bg-current" />
          <span>{statusLabel}</span>
        </Badge>
        <div className="rounded-2xl bg-muted/10 px-3 py-1.5 transition-all duration-200">
          <span className="text-sm font-medium text-muted-foreground">{slotsLabel}</span>
        </div>
      </div>

      <div className="rounded-full bg-[#E3F2FD] px-4 py-2 w-full text-center">
        <span className={`${TYPOGRAPHY.button} text-[#1976D2]`}>{circle.circleName ?? formatAddress(circle.vaultAddress)}</span>
      </div>
    </CardUI>
  );
}
