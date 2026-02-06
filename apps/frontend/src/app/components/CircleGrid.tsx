"use client";

import { useEffect, useRef, useState } from "react";

type CircleGridProps = {
  totalDots?: number;
  filledDot?: number;
  earlyEntryDots?: number[];
  dotSize?: number;
  baseGap?: number;
  minGap?: number;
  maxGap?: number;
};

export function CircleGrid({
  totalDots = 24,
  filledDot = 0,
  earlyEntryDots = [],
  dotSize = 32,
  baseGap = 10,
  minGap = 6,
  maxGap = 20,
}: CircleGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridConfig, setGridConfig] = useState({ cols: 8, gap: baseGap });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const computeGrid = () => {
      const containerWidth = container.offsetWidth;
      if (containerWidth <= 0) return;

      const minCols = 3;
      const maxCols = totalDots;

      let cols = Math.floor((containerWidth + baseGap) / (dotSize + baseGap));
      cols = Math.max(minCols, Math.min(cols, maxCols));

      let gap =
        cols > 1 ? (containerWidth - cols * dotSize) / (cols - 1) : 0;

      while (gap > maxGap && cols > minCols) {
        cols--;
        gap =
          cols > 1 ? (containerWidth - cols * dotSize) / (cols - 1) : 0;
      }

      while (gap < minGap && cols < maxCols) {
        cols++;
        gap =
          cols > 1 ? (containerWidth - cols * dotSize) / (cols - 1) : 0;
      }

      gap = Math.max(minGap, Math.min(maxGap, gap));

      setGridConfig({ cols, gap: Math.round(gap * 10) / 10 });
    };

    computeGrid();

    const resizeObserver = new ResizeObserver(() => {
      computeGrid();
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [totalDots, dotSize, baseGap, minGap, maxGap]);

  const dots = Array.from({ length: totalDots }, (_, i) => i);

  return (
    <div ref={containerRef} className="w-full">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridConfig.cols}, ${dotSize}px)`,
          columnGap: `${gridConfig.gap}px`,
          rowGap: `${gridConfig.gap}px`,
          width: "100%",
          justifyContent: "start",
          transition: "gap 150ms ease-out",
        }}
      >
        {dots.map((i) => {
          const dotNumber = i + 1;
          const isFilled = dotNumber === filledDot;
          const isEarlyEntry = earlyEntryDots.includes(dotNumber);

          let bgColor = "#E5E5E5";
          if (isFilled) bgColor = "#1A1A1A";
          else if (isEarlyEntry) bgColor = "#C4B5FD";

          return (
            <div
              key={i}
              style={{
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                borderRadius: "9999px",
                backgroundColor: bgColor,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
