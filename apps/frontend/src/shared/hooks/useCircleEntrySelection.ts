"use client";

import { useEffect, useMemo, useState } from "react";

type EntryId = "early" | "middle" | "late";

type UseCircleEntrySelectionProps = {
  isConnected: boolean;
  hasJoined: boolean;
  positionQuotaId: number | null;
};

export function useCircleEntrySelection({
  isConnected,
  hasJoined,
  positionQuotaId,
}: UseCircleEntrySelectionProps) {
  const [selectedEntry, setSelectedEntry] = useState("");
  const [hoveredEntry, setHoveredEntry] = useState("");

  const lockedEntryId = useMemo<EntryId | null>(() => {
    if (!hasJoined) return null;
    if (positionQuotaId === 0) return "early";
    if (positionQuotaId === 1) return "middle";
    if (positionQuotaId === 2) return "late";
    return null;
  }, [hasJoined, positionQuotaId]);

  useEffect(() => {
    if (lockedEntryId) {
      setSelectedEntry(lockedEntryId);
    }
  }, [lockedEntryId]);

  useEffect(() => {
    if (isConnected && !selectedEntry) {
      setSelectedEntry("early");
    }
  }, [isConnected, selectedEntry]);

  return {
    selectedEntry,
    setSelectedEntry,
    hoveredEntry,
    setHoveredEntry,
    lockedEntryId,
  };
}
