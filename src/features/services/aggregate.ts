import type { AvailabilityExportV1 } from "../export/model/types";
import { resolveFreeWindowsForDay, hasAnyFreeTime, isFreeAtMinute } from "./availabilityResolve";
import { pad2 } from "../../utility/lib/date";

export type DayAggregate = {
    dayKey: string;       // YYYY-MM-DD
    freeCount: number;    // people free at any time that day (or in evening if eveningsOnly)
    total: number;
};

export type MonthAggregate = {
    month: string; // YYYY-MM
    byDay: Record<string, DayAggregate>;
};

export function monthKeyFromDate(d: Date): string {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

export function dayKey(d: Date): string {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function aggregateMonth(
    exports: AvailabilityExportV1[],
    month: string,
    eveningsOnly: boolean
): MonthAggregate {
    const byDay: Record<string, DayAggregate> = {};
    const total = exports.length;

    // We compute on-demand per day: the UI iterates calendar days anyway.
    // Fill lazily: caller can request any dayKey and we'll compute it there if missing.
    // For simplicity, we'll compute for all overrides days AND allow missing days to compute in UI as needed.
    // (Month heatmap will create day keys from calendar cells and fall back.)
    for (const exp of exports) {
        for (const dk of Object.keys(exp.overridesByDay ?? {})) {
            if (!dk.startsWith(month + "-")) continue;
            if (!byDay[dk]) byDay[dk] = { dayKey: dk, freeCount: 0, total };
        }
    }

    // compute freeCount for the day keys we have so far
    for (const dk of Object.keys(byDay)) {
        let freeCount = 0;
        for (const exp of exports) {
            const ranges = resolveFreeWindowsForDay(exp, dk, eveningsOnly);
            if (hasAnyFreeTime(ranges)) freeCount++;
        }
        byDay[dk] = { dayKey: dk, freeCount, total };
    }

    return { month, byDay };
}

export function computeDayBuckets(
    exports: AvailabilityExportV1[],
    dk: string,
    eveningsOnly: boolean,
    bucketMins: number = 30
) {
    const buckets: Array<{ startMins: number; endMins: number; freeCount: number }> = [];

    for (let start = 0; start < 24 * 60; start += bucketMins) {
        const mid = start + Math.floor(bucketMins / 2);
        let freeCount = 0;

        for (const exp of exports) {
            const ranges = resolveFreeWindowsForDay(exp, dk, eveningsOnly);
            if (isFreeAtMinute(ranges, mid)) freeCount++;
        }

        buckets.push({ startMins: start, endMins: Math.min(start + bucketMins, 24 * 60), freeCount });
    }

    return buckets;
}
