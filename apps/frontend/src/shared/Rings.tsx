"use client";

import type { MouseEventHandler } from "react";
import { totalMonths, type SlotsByWindow } from "./totalMonths";

type EntryId = "early" | "middle" | "late";

type RingsProps = {
  slots: SlotsByWindow;
  activeEntry?: EntryId | "";
  hoveredEntry?: EntryId | "";
  onHoverEntry?: (entry: EntryId | "") => void;
  onSelectEntry?: (entry: EntryId) => void;
  canSelect?: boolean;
  showCounts?: boolean;
  highlightFirst?: boolean;
  className?: string;
};

const ENTRY_LABELS: Record<EntryId, string> = {
  early: "Early entry",
  middle: "Middle entry",
  late: "Late entry",
};

const ENTRY_COLORS: Record<EntryId, string> = {
  early: "hsl(var(--entry-early-default))",
  middle: "hsl(var(--entry-middle-default))",
  late: "hsl(var(--entry-late-default))",
};

const BASE_RADIUS = 20;
const RING_STEP = 4.5;

const getRingRadius = (index: number) => BASE_RADIUS + index * RING_STEP;

export function Rings({
  slots,
  activeEntry = "",
  hoveredEntry = "",
  onHoverEntry,
  onSelectEntry,
  canSelect = false,
  showCounts = true,
  highlightFirst = false,
  className,
}: RingsProps) {
  const total = Math.max(1, totalMonths(slots));
  const normalizedSlots = {
    early: Math.max(0, slots.early),
    middle: Math.max(0, slots.middle),
    late: Math.max(0, slots.late),
  };
  const activeGroup = (hoveredEntry || activeEntry) as EntryId | "";
  const earlyEnd = normalizedSlots.early;
  const middleEnd = normalizedSlots.early + normalizedSlots.middle;

  const rings = Array.from({ length: total }, (_, index) => {
    let group: EntryId = "late";
    if (index < earlyEnd) group = "early";
    else if (index < middleEnd) group = "middle";

    let color = "#E5E5E5";
    let opacity = 0.3;

    if (activeGroup && group === activeGroup) {
      color = ENTRY_COLORS[group];
      opacity = 1;
    } else if (!activeGroup && highlightFirst && index === 0) {
      color = "#1A1A1A";
      opacity = 1;
    }

    return { index, color, opacity };
  });

  const outerRadius = getRingRadius(total - 1);
  const earlyRadius =
    normalizedSlots.early > 0
      ? getRingRadius(normalizedSlots.early - 1) + RING_STEP / 2
      : 0;
  const middleRadius =
    normalizedSlots.middle > 0
      ? getRingRadius(normalizedSlots.early + normalizedSlots.middle - 1) +
        RING_STEP / 2
      : 0;

  const handleSelect = (entry: EntryId) => {
    if (!onSelectEntry || !canSelect) return;
    onSelectEntry(entry);
  };

  const handleHover =
    (entry: EntryId | ""): MouseEventHandler<SVGCircleElement> =>
    () => {
      onHoverEntry?.(entry);
    };

  const entryItems = (Object.keys(ENTRY_LABELS) as EntryId[]).map((id) => ({
    id,
    label: ENTRY_LABELS[id],
    count: normalizedSlots[id],
    color: ENTRY_COLORS[id],
  }));

  return (
    <div className={className}>
      <div className="flex items-center justify-center w-full h-full">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 240 240"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full block"
        >
          {rings.map((ring) => (
            <circle
              key={ring.index}
              cx="120"
              cy="120"
              r={getRingRadius(ring.index)}
              fill="none"
              stroke={ring.color}
              strokeWidth={3}
              opacity={ring.opacity}
              className="transition-all duration-200"
            />
          ))}

          {outerRadius > 0 && (
            <circle
              cx="120"
              cy="120"
              r={outerRadius + RING_STEP / 2}
              fill="transparent"
              className={onHoverEntry || onSelectEntry ? "cursor-pointer" : ""}
              onMouseEnter={handleHover("late")}
              onMouseLeave={handleHover("")}
              onClick={() => handleSelect("late")}
            />
          )}

          {middleRadius > 0 && (
            <circle
              cx="120"
              cy="120"
              r={middleRadius}
              fill="transparent"
              className={onHoverEntry || onSelectEntry ? "cursor-pointer" : ""}
              onMouseEnter={handleHover("middle")}
              onMouseLeave={handleHover("")}
              onClick={() => handleSelect("middle")}
            />
          )}

          {earlyRadius > 0 && (
            <circle
              cx="120"
              cy="120"
              r={earlyRadius}
              fill="transparent"
              className={onHoverEntry || onSelectEntry ? "cursor-pointer" : ""}
              onMouseEnter={handleHover("early")}
              onMouseLeave={handleHover("")}
              onClick={() => handleSelect("early")}
            />
          )}
        </svg>
      </div>

      {showCounts && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-[#666666]">
          {entryItems.map((entry) => (
            <div key={entry.id} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>
                {entry.label}: {entry.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
