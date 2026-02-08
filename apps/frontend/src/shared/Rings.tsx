"use client";

import { useRef, type MouseEventHandler } from "react";
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

// Increase base radius and step so rings dominate the card area (unscaled)
const BASE_RADIUS = 28;
// Reduce step so rings are closer together visually (tighter concentric rings)
const RING_STEP = 3;

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

    let color = "hsl(var(--border))";
    let opacity = 0.3;

    if (activeGroup && group === activeGroup) {
      color = ENTRY_COLORS[group];
      opacity = 1;
    } else if (!activeGroup && highlightFirst && index === 0) {
      color = "hsl(var(--foreground))";
      opacity = 1;
    }

    return { index, color, opacity };
  });

  // Compute raw radii and a scale factor so rings fill the available SVG area
  const outerRadiusRaw = getRingRadius(Math.max(0, total - 1));
  // target visual radius (close to viewBox half size) so rings touch card padding
  const maxVisualRadius = 116; // viewBox center is 120, leave ~4px padding
  // allow upscaling for few rings so grid fills the area; cap to avoid extreme scaling
  const scale = outerRadiusRaw > 0 ? Math.min(2.0, maxVisualRadius / outerRadiusRaw) : 1;

  const outerRadius = outerRadiusRaw * scale;
  const earlyRadius =
    normalizedSlots.early > 0
      ? (getRingRadius(normalizedSlots.early - 1) + RING_STEP / 2) * scale
      : 0;
  const middleRadius =
    normalizedSlots.middle > 0
      ? (getRingRadius(normalizedSlots.early + normalizedSlots.middle - 1) + RING_STEP / 2) * scale
      : 0;

  const handleSelect = (entry: EntryId) => {
    if (!onSelectEntry || !canSelect) return;
    onSelectEntry(entry);
  };

  // Pointer-based detection settings derived from computed scale and radii
  const DET_BASE = BASE_RADIUS * scale; // base detection radius
  const DET_STEP = RING_STEP * scale; // detection step per ring
  const DET_STROKE = 3 * scale; // stroke tolerance
  const DET_MAX_INDEX = Math.max(0, total - 1); // max ring index for detection

  const lastHoveredRef = useRef<EntryId | "">(hoveredEntry || "");

  const mapDistanceToEntry = (distance: number): EntryId | "" => {
    if (distance < DET_BASE - DET_STROKE) return "";
    if (distance > DET_BASE + DET_MAX_INDEX * DET_STEP + DET_STROKE) return "";
    let i = Math.round((distance - DET_BASE) / DET_STEP);
    if (i < 0) i = 0;
    if (i > DET_MAX_INDEX) i = DET_MAX_INDEX;
    // Map low / mid / high indices to early/middle/late using proportional buckets
    const ratio = i / Math.max(1, DET_MAX_INDEX);
    if (ratio <= 0.33) return "early";
    if (ratio <= 0.66) return "middle";
    return "late";
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const vbW = 240;
    const vbH = 240;
    const scaleX = vbW / rect.width;
    const scaleY = vbH / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const distance = Math.hypot(x - vbW / 2, y - vbH / 2);
    const entry = mapDistanceToEntry(distance);
    if (entry !== lastHoveredRef.current) {
      lastHoveredRef.current = entry;
      onHoverEntry?.(entry);
    }
  };

  const handleSvgPointerLeave = () => {
    lastHoveredRef.current = "";
    onHoverEntry?.("");
  };

  const handleSvgClick = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!onSelectEntry || !canSelect) return;
    const svg = e.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const vbW = 240;
    const vbH = 240;
    const scaleX = vbW / rect.width;
    const scaleY = vbH / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const distance = Math.hypot(x - vbW / 2, y - vbH / 2);
    const entry = mapDistanceToEntry(distance);
    if (entry) handleSelect(entry as EntryId);
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
          onPointerMove={handleSvgPointerMove}
          onPointerLeave={handleSvgPointerLeave}
          onClick={handleSvgClick}
        >
          {rings.map((ring) => (
            <circle
              key={ring.index}
              cx="120"
              cy="120"
              r={getRingRadius(ring.index) * scale}
              fill="none"
              stroke={ring.color}
              strokeWidth={3}
              opacity={ring.opacity}
              className="transition-all duration-200"
            />
          ))}

          {/* Pointer-based ring band detection replaces the overlapping invisible circles */}
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
