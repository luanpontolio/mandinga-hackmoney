"use client";

import { Rings } from "../../shared/Rings";
import { PADDING_L, TYPOGRAPHY } from "./designTokens";

type EntryId = "early" | "middle" | "late";

type PayoutCardProps = {
  isWalletConnected: boolean;
  hasJoined: boolean;
  currentRound: number;
  totalRounds: number;
  windowDates?: {
    startDate: Date | null;
    closeWindowEarly: Date | null;
    closeWindowMiddle: Date | null;
    closeWindowLate: Date | null;
  } | null;
  selectedEntry: string;
  hoveredEntry: string;
  onHoverEntry: (id: string) => void;
  onSelectEntry: (id: string) => void;
  entryCounts: {
    early: number;
    middle: number;
    late: number;
  };
};

export function PayoutCard({
  isWalletConnected,
  hasJoined,
  currentRound,
  totalRounds,
  windowDates,
  selectedEntry,
  hoveredEntry,
  onHoverEntry,
  onSelectEntry,
  entryCounts,
}: PayoutCardProps) {
  const normalizeEntry = (value: string): EntryId | "" => {
    if (value === "early" || value === "middle" || value === "late") {
      return value;
    }
    return "";
  };
  const isPreJoin = !isWalletConnected || !hasJoined;
  const normalizedSelected = normalizeEntry(selectedEntry);
  const normalizedHovered = normalizeEntry(hoveredEntry);
  const safeTotalRounds = totalRounds > 0 ? totalRounds : 24;
  const safeCurrentRound = currentRound > 0 ? currentRound : 1;
  const progressPercentage = Math.max(
    1,
    (safeCurrentRound / safeTotalRounds) * 100
  );
  const activeEntry = normalizedHovered || normalizedSelected;

  const isValidDate = (value: Date | null | undefined): value is Date =>
    value instanceof Date && !Number.isNaN(value.getTime());

  const isSameDay = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

  const formatDateParts = (
    date: Date | null | undefined,
    compareDate: Date | null | undefined
  ) => {
    if (!isValidDate(date)) {
      return { dateLabel: "--", yearLabel: "--" };
    }

    if (isValidDate(compareDate) && isSameDay(date, compareDate)) {
      return {
        dateLabel: date.toLocaleString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        yearLabel: "",
      };
    }

    return {
      dateLabel: date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
      }),
      yearLabel: date.toLocaleString("en-US", {
        year: "numeric",
      }),
    };
  };

  const getSimulationData = () => {
    const earlyParts = formatDateParts(
      windowDates?.closeWindowEarly,
      windowDates?.startDate
    );
    const middleParts = formatDateParts(
      windowDates?.closeWindowMiddle,
      windowDates?.closeWindowEarly
    );
    const lateParts = formatDateParts(
      windowDates?.closeWindowLate,
      windowDates?.closeWindowMiddle
    );

    if (activeEntry === "early") {
      return {
        counter: "01/08",
        nextRound: "Round 1",
        nextRoundLabel: "Next round - Early",
        nextRoundDate: earlyParts.dateLabel,
        nextRoundYear: earlyParts.yearLabel,
        color: "hsl(var(--entry-early-default))",
      };
    }
    if (activeEntry === "middle") {
      return {
        counter: "09/16",
        nextRound: "Round 9",
        nextRoundLabel: "Next round - Middle",
        nextRoundDate: middleParts.dateLabel,
        nextRoundYear: middleParts.yearLabel,
        color: "hsl(var(--entry-middle-default))",
      };
    }
    if (activeEntry === "late") {
      return {
        counter: "17/24",
        nextRound: "Round 17",
        nextRoundLabel: "Next round - Late",
        nextRoundDate: lateParts.dateLabel,
        nextRoundYear: lateParts.yearLabel,
        color: "hsl(var(--entry-late-default))",
      };
    }
    return null;
  };

  const simulationData = activeEntry ? getSimulationData() : null;

  if (isPreJoin) {
    return (
      <div
        className={`rounded-xl border border-[#E5E5E5] bg-white ${PADDING_L} flex flex-col gap-3`}
      >
        <div className="flex items-center justify-between">
          <span className={TYPOGRAPHY.label}>Payouts</span>
          <span className={TYPOGRAPHY.caption}>
            {simulationData ? simulationData.counter : "00/24"}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5E5E5] relative">
          {simulationData ? (
            <div
              className="h-full rounded-full transition-all absolute"
              style={{
                left:
                  activeEntry === "early"
                    ? "0%"
                    : activeEntry === "middle"
                      ? "33.33%"
                      : "66.66%",
                width: "33.33%",
                backgroundColor: simulationData.color,
              }}
            />
          ) : (
            <div className="h-full w-[1%] bg-[#1A1A1A] rounded-full" />
          )}
        </div>

        <div className="flex items-start justify-between gap-1">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-[#1A1A1A]">
              {simulationData?.nextRound || "Round 1"}
            </span>
            <span className={TYPOGRAPHY.label}>
              {simulationData?.nextRoundLabel || "Next round"}
            </span>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <span className="font-semibold text-[#1A1A1A] whitespace-nowrap">
              {simulationData?.nextRoundDate || "March 1"}
            </span>
            <span className={TYPOGRAPHY.label}>
              {simulationData?.nextRoundYear || "2026"}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <Rings
            slots={entryCounts}
            activeEntry={normalizedSelected}
            hoveredEntry={normalizedHovered}
            onHoverEntry={onHoverEntry}
            onSelectEntry={onSelectEntry}
            canSelect={isWalletConnected}
            highlightFirst={!activeEntry}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-[#E5E5E5] bg-white ${PADDING_L} flex flex-col gap-3`}
    >
      <div className="flex items-center justify-between">
        <span className={TYPOGRAPHY.label}>Payouts</span>
        <span className={TYPOGRAPHY.caption}>
          {String(safeCurrentRound).padStart(2, "0")}/{safeTotalRounds}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5E5E5]">
        <div
          className="h-full bg-[#1A1A1A] rounded-full transition-all"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="flex items-start justify-between gap-1">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-[#1A1A1A]">Round 1</span>
          <span className={TYPOGRAPHY.label}>Next round</span>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <span className="font-semibold text-[#1A1A1A]">March 1</span>
          <span className={TYPOGRAPHY.label}>2026</span>
        </div>
      </div>

      <div className="mt-4">
        <Rings
          slots={entryCounts}
          activeEntry={normalizedSelected}
          hoveredEntry={normalizedHovered}
          onHoverEntry={onHoverEntry}
          onSelectEntry={onSelectEntry}
          canSelect={isWalletConnected}
          highlightFirst={!activeEntry}
        />
      </div>
    </div>
  );
}
