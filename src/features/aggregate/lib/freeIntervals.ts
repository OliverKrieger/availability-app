import type { DayAvailabilityOverride } from "../../../components/availability/DayEditorModal";
import type { Interval } from "./intervals";
import { normalize } from "./intervals";

export function overrideToFreeIntervals(
    ov: DayAvailabilityOverride | undefined,
    eveningStartMins: number
): Interval[] {
    if (!ov || ov.kind === "none") return [];
    if (ov.kind === "allDayFree") return [{ start: 0, end: 24 * 60 }];
    if (ov.kind === "eveningFree") return [{ start: eveningStartMins, end: 24 * 60 }];
    if (ov.kind === "ranges") return normalize(ov.ranges.map(r => ({ start: r.startMins, end: r.endMins })));
    return [];
}
