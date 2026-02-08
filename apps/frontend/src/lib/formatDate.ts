import { format, isSameDay, isSameMonth, isSameYear, parseISO } from "date-fns";

export const parseToDate = (input: Date | string | number | null | undefined): Date | null => {
  try {
    if (!input && input !== 0) return null;
    if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
    if (typeof input === "number") {
      // assume milliseconds when large, seconds when small
      const millis = input > 1e12 ? input : input > 1e10 ? input : input * 1000;
      const d = new Date(millis);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof input === "string") {
      try {
        const d = parseISO(input);
        return isNaN(d.getTime()) ? null : d;
      } catch {
        const d = new Date(input);
        return isNaN(d.getTime()) ? null : d;
      }
    }
    return null;
  } catch {
    return null;
  }
};

const monthYear = (d: Date) => format(d, "MMMM yyyy");
const monthDay = (d: Date) => format(d, "MMM d");
const monthDayYear = (d: Date) => format(d, "MMM d, yyyy");
const timeOnly = (d: Date) => format(d, "h:mm a");

export const formatAdaptiveRange = (startRaw: Date | string | number | null | undefined, endRaw: Date | string | number | null | undefined): string => {
  try {
    const s = parseToDate(startRaw);
    const e = parseToDate(endRaw);
    if (!s || !e) return "--";

    const diffMs = e.getTime() - s.getTime();
    if (diffMs <= 0) return "--";
    const diffMinutes = Math.round(diffMs / 60000);

    // For short windows (less than 60 minutes) return concise minute phrasing
    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    }

    // same day: show date + times
    if (isSameDay(s, e)) {
      const dateLabel = monthDayYear(s);
      return `${dateLabel}, ${timeOnly(s)} - ${timeOnly(e)}`;
    }

    // less than a month but same month/year: show month day range
    if (isSameMonth(s, e) && isSameYear(s, e)) {
      return `${monthDay(s)} - ${format(e, "d, yyyy")}`;
    }

    // same year: show month day ranges
    if (isSameYear(s, e)) {
      return `${monthDay(s)} - ${monthDayYear(e)}`;
    }

    // fallback to month year for long ranges
    return `Payout between ${monthYear(s)} and ${monthYear(e)}`;
  } catch {
    return "--";
  }
};

export const formatPayoutWindow = (
  cycleStartRaw: Date | string | number | null | undefined,
  windowStartRaw: Date | string | number | null | undefined,
  windowEndRaw: Date | string | number | null | undefined
): string => {
  try {
    const cycleStart = parseToDate(cycleStartRaw);
    const ws = parseToDate(windowStartRaw);
    const we = parseToDate(windowEndRaw);
    if (!cycleStart || !ws || !we) return "--";

    const startOffset = Math.round((ws.getTime() - cycleStart.getTime()) / 60000);
    const endOffset = Math.round((we.getTime() - cycleStart.getTime()) / 60000);
    if (startOffset >= 0 && endOffset >= startOffset && endOffset - startOffset < 60) {
      return `Payouts between ${startOffset} to ${endOffset} minutes`;
    }

    // fallback to the adaptive range when not a short minute window
    return formatAdaptiveRange(ws, we);
  } catch {
    return "--";
  }
};

export const formatAdaptiveDate = (input: Date | string | number | null | undefined): string => {
  try {
    const d = parseToDate(input);
    if (!d) return "--";
    return monthDayYear(d);
  } catch {
    return "--";
  }
};

export default {
  parseToDate,
  formatAdaptiveRange,
  formatPayoutWindow,
  formatAdaptiveDate,
};
