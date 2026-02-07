"use client";

import type { CSSProperties } from "react";
import { PADDING_L, TYPOGRAPHY } from "./designTokens";

type EntryStatusCardProps = {
  isWalletConnected: boolean;
  selectedEntry: string;
  hoveredEntry: string;
  onSelectEntry: (id: string) => void;
  onHoverEntry: (id: string) => void;
  lockedEntryId?: "early" | "middle" | "late" | null;
  entryCounts: {
    early: number;
    middle: number;
    late: number;
  };
  entryDescriptions: {
    early: string;
    middle: string;
    late: string;
  };
};

export function EntryStatusCard({
  isWalletConnected,
  selectedEntry,
  hoveredEntry,
  onSelectEntry,
  onHoverEntry,
  lockedEntryId,
  entryCounts,
  entryDescriptions,
}: EntryStatusCardProps) {
  const isLocked = Boolean(lockedEntryId);
  const handleEntryClick = (entryId: string) => {
    if (!isWalletConnected || isLocked) return;
    onSelectEntry(entryId);
  };

  const entryGroups = [
    {
      id: "early",
      label: "Early entry",
      description: entryDescriptions.early,
      colorDefault: "hsl(var(--entry-early-default))",
      count: entryCounts.early,
    },
    {
      id: "middle",
      label: "Middle entry",
      description: entryDescriptions.middle,
      colorDefault: "hsl(var(--entry-middle-default))",
      count: entryCounts.middle,
    },
    {
      id: "late",
      label: "Late entry",
      description: entryDescriptions.late,
      colorDefault: "hsl(var(--entry-late-default))",
      count: entryCounts.late,
    },
  ];

  const visibleGroups = lockedEntryId
    ? entryGroups.filter((group) => group.id === lockedEntryId)
    : entryGroups;

  return (
    <div className={`rounded-xl border border-[#E5E5E5] bg-white ${PADDING_L}`}>
      <div className="flex flex-col xl:grid xl:grid-cols-3">
        {visibleGroups.map((group) => (
          <button
            key={group.id}
            onClick={() => handleEntryClick(group.id)}
            onMouseEnter={() => onHoverEntry(group.id)}
            onMouseLeave={() => onHoverEntry("")}
            aria-label={`Select ${group.label}`}
            className={`
              group relative
              flex items-center gap-6 p-4 rounded-2xl
              xl:flex-col xl:items-center xl:gap-6 xl:py-4 xl:px-4
              transition-all duration-200 ease-out
              focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
              cursor-pointer
              ${selectedEntry === group.id ? "ring-2 ring-inset" : ""}
            `}
            style={{
              backgroundColor:
                hoveredEntry === group.id || selectedEntry === group.id
                  ? `color-mix(in srgb, ${group.colorDefault} 10%, transparent)`
                  : "transparent",
              "--tw-ring-color": group.colorDefault,
            } as CSSProperties}
          >
            <div className="flex justify-center shrink-0 xl:w-full">
              <div className="grid grid-cols-4 gap-x-3 gap-y-3 xl:w-full xl:gap-x-3 xl:gap-y-3 xl:place-items-center">
                {Array.from({ length: group.count }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full w-5 h-5 px-1 xl:w-5 xl:h-5"
                    style={{
                      backgroundColor: group.colorDefault,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-0.5 items-start min-w-0 xl:items-center xl:text-center xl:gap-0.5">
              <span
                className="font-semibold text-base xl:text-lg whitespace-nowrap leading-tight"
                style={{ color: group.colorDefault }}
              >
                {group.label}
              </span>
              <p
                className={`${TYPOGRAPHY.bodyMuted} text-sm leading-tight line-clamp-3 text-left xl:text-center xl:max-w-[220px]`}
              >
                {group.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
