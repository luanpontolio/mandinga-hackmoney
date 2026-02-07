"use client";

import { useMemo } from "react";

type WindowDates = {
  closeWindowEarly: Date | null;
  closeWindowMiddle: Date | null;
  closeWindowLate: Date | null;
};

export function useCurrentQuotaId(
  windowDates: WindowDates | null | undefined
): number {
  return useMemo(() => {
    if (!windowDates) return 0;
    const now = Date.now();
    const closeEarly = windowDates.closeWindowEarly?.getTime() ?? 0;
    const closeMiddle = windowDates.closeWindowMiddle?.getTime() ?? 0;
    const closeLate = windowDates.closeWindowLate?.getTime() ?? 0;

    if (closeEarly && now <= closeEarly) return 0;
    if (closeMiddle && now <= closeMiddle) return 1;
    if (closeLate && now <= closeLate) return 2;
    return 2;
  }, [windowDates]);
}
