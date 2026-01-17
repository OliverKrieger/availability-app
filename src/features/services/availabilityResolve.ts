import type { AvailabilityExportV1 } from "../export/model/types";
import { normalizeRanges } from "../../utility/lib/time";

export type TimeRange = { startMins: number; endMins: number };

export function resolveFreeWindowsForDay(
    exp: AvailabilityExportV1,
    dayKey: string,
    eveningsOnly: boolean
): TimeRange[] {
    const ov = exp.overridesByDay?.[dayKey];

    let ranges: TimeRange[] = [];
    if (!ov || ov.kind === "none") ranges = [];
    else if (ov.kind === "allDayFree") ranges = [{ startMins: 0, endMins: 24 * 60 }];
    else if (ov.kind === "eveningFree")
        ranges = [{ startMins: exp.prefs.eveningStartMins, endMins: 24 * 60 }];
    else if (ov.kind === "ranges") ranges = ov.ranges ?? [];

    ranges = normalizeRanges(ranges);

    if (!eveningsOnly) return ranges;

    // clip to evening for this person
    const start = exp.prefs.eveningStartMins;
    const clipped = ranges
        .map((r) => ({ startMins: Math.max(r.startMins, start), endMins: r.endMins }))
        .filter((r) => r.endMins > r.startMins);

    return normalizeRanges(clipped);
}

export function hasAnyFreeTime(ranges: TimeRange[]): boolean {
    return ranges.length > 0;
}

export function isFreeAtMinute(ranges: TimeRange[], minute: number): boolean {
    // minute in [0,1440)
    for (const r of ranges) {
        if (minute >= r.startMins && minute < r.endMins) return true;
    }
    return false;
}
