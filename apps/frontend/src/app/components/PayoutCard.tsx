"use client";

import { useState } from "react";
import { Rings } from "../../shared/Rings";
import { PADDING_L, TYPOGRAPHY } from "./designTokens";

type EntryId = "early" | "middle" | "late";

type PayoutCardProps = {
  isWalletConnected: boolean;
  hasJoined: boolean;
  currentRound: number;
  totalRounds: number;
  totalMembers?: number;
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
  totalMembers,
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

    const perWindow = Math.floor(safeTotalRounds / 3);
    const rem = safeTotalRounds - perWindow * 3;
    // distribute remainder to the last window
    const ranges = {
      early: { start: 1, end: perWindow },
      middle: { start: perWindow + 1, end: perWindow * 2 },
      late: { start: perWindow * 2 + 1, end: perWindow * 3 + rem },
    };

    if (activeEntry === "early") {
      const r = ranges.early;
      return {
        counter: `${String(r.start).padStart(2, "0")}/${String(r.end).padStart(2, "0")}`,
        nextRound: `Round ${r.start}`,
        nextRoundLabel: "Next round - Early",
        nextRoundDate: earlyParts.dateLabel,
        nextRoundYear: earlyParts.yearLabel,
        color: "hsl(var(--entry-early-default))",
      };
    }
    if (activeEntry === "middle") {
      const r = ranges.middle;
      return {
        counter: `${String(r.start).padStart(2, "0")}/${String(r.end).padStart(2, "0")}`,
        nextRound: `Round ${r.start}`,
        nextRoundLabel: "Next round - Middle",
        nextRoundDate: middleParts.dateLabel,
        nextRoundYear: middleParts.yearLabel,
        color: "hsl(var(--entry-middle-default))",
      };
    }
    if (activeEntry === "late") {
      const r = ranges.late;
      return {
        counter: `${String(r.start).padStart(2, "0")}/${String(r.end).padStart(2, "0")}`,
        nextRound: `Round ${r.start}`,
        nextRoundLabel: "Next round - Late",
        nextRoundDate: lateParts.dateLabel,
        nextRoundYear: lateParts.yearLabel,
        color: "hsl(var(--entry-late-default))",
      };
    }
    return null;
  };

  const simulationData = activeEntry ? getSimulationData() : null;

  // display denominator: default to `totalRounds`, but allow hovering to reveal `totalMembers` when present
  const headerNumerator = isPreJoin ? 0 : safeCurrentRound;

  const [hoverDenom, setHoverDenom] = useState(false);
  const hasMembersDenom = typeof totalMembers === "number" && totalMembers > 0;
  const denomDuringHover = hoverDenom && hasMembersDenom ? totalMembers! : safeTotalRounds;
  const headerCounter = `${String(headerNumerator).padStart(2, "0")}/${String(
    denomDuringHover
  ).padStart(2, "0")}`;

  const computeRoundDate = (roundIndex: number) => {
    if (!windowDates) return { dateLabel: "--", yearLabel: "" };
    const { startDate, closeWindowLate } = windowDates;
    if (!isValidDate(startDate) || !isValidDate(closeWindowLate) || safeTotalRounds <= 0) {
      return { dateLabel: "--", yearLabel: "" };
    }
    const totalMs = closeWindowLate.getTime() - startDate.getTime();
    const roundMs = totalMs / safeTotalRounds;
    const roundStart = new Date(startDate.getTime() + (roundIndex - 1) * roundMs);
    return formatDateParts(roundStart, closeWindowLate);
  };
  if (isPreJoin) {
    return (
      <div
        className={`rounded-xl border border-[#E5E5E5] bg-white ${PADDING_L} flex flex-col gap-3`}
      >
        <div className="flex items-center justify-between">
          <span className={TYPOGRAPHY.label}>Payouts</span>
          <span
            className={TYPOGRAPHY.caption}
            onMouseEnter={() => setHoverDenom(true)}
            onMouseLeave={() => setHoverDenom(false)}
            title={hoverDenom ? "Denominator: total rounds" : "Denominator: total members"}
          >
            {headerCounter}
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
            showCounts={false}
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
        <span
          className={TYPOGRAPHY.caption}
          onMouseEnter={() => setHoverDenom(true)}
          onMouseLeave={() => setHoverDenom(false)}
          title={hoverDenom ? "Denominator: total rounds" : "Denominator: total members"}
        >
          {headerCounter}
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
          <span className="font-semibold text-[#1A1A1A]">{`Round ${Math.min(safeCurrentRound + 1, safeTotalRounds)}`}</span>
          <span className={TYPOGRAPHY.label}>Next round</span>
        </div>
        <div className="flex flex-col gap-1 items-end">
          {
            (() => {
              const nextIndex = Math.min(safeCurrentRound + 1, safeTotalRounds);
              const parts = computeRoundDate(nextIndex);
              return (
                <>
                  <span className="font-semibold text-[#1A1A1A]">{parts.dateLabel}</span>
                </>
              );
            })()
          }
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
          showCounts={false}
          highlightFirst={!activeEntry}
        />
      </div>
    </div>
  );
}
