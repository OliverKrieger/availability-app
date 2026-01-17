import { useMemo, useState } from "react";
import type { AvailabilityExportV1 } from "../features/export/model/types";
import { ImportPanel } from "../components/aggregation/ImportPanel";
import { PeopleList } from "../components/aggregation/PeopleList";
import { AggregateMonthGrid } from "../components/aggregation/AggregateMonthGrid";
import { aggregateMonth, dayKey, monthKeyFromDate } from "../features/services/aggregate";
import { HorizontalDayTimeline } from "../components/aggregation/HorizontalDayTimeline";
import { overrideToFreeIntervals } from "../features/aggregate/lib/freeIntervals";
import { intersectAll } from "../features/aggregate/lib/intervals";
import { Interval } from "../features/aggregate/lib/intervals";
import { minsToHHmm } from "../utility/lib/time";

export function AggregatePage() {
    const [imports, setImports] = useState<AvailabilityExportV1[]>([]);
    const [includedUserIds, setIncludedUserIds] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);

    const [month, setMonth] = useState(() => {
        const t = new Date();
        return new Date(t.getFullYear(), t.getMonth(), 1);
    });

    const [eveningsOnly, setEveningsOnly] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const importedMonth = useMemo(() => {
        if (imports.length === 0) return monthKeyFromDate(month);
        return imports[0].month;
    }, [imports, month]);

    const activeImports = useMemo(() => {
        const list = imports.filter((x) => includedUserIds.has(x.user.id));
        return list;
    }, [imports, includedUserIds]);

    const monthDate = useMemo(() => {
        // Keep UI month aligned with imported month when available
        const [y, m] = importedMonth.split("-").map(Number);
        if (!y || !m) return month;
        return new Date(y, m - 1, 1);
    }, [importedMonth]);

    const agg = useMemo(() => {
        return aggregateMonth(activeImports, importedMonth, eveningsOnly);
    }, [activeImports, importedMonth, eveningsOnly]);

    const selectedDayKey = selectedDate ? dayKey(selectedDate) : null;

    const rows = useMemo(() => {
        if (!selectedDayKey) return [];

        return activeImports.map((x) => {
            const ov = x.overridesByDay[selectedDayKey];
            const intervals = overrideToFreeIntervals(ov, x.prefs.eveningStartMins);

            // Optional: eveningsOnly filter at display-time as well
            const filtered = eveningsOnly
                ? intervals
                    .map((iv) => ({
                        start: Math.max(iv.start, x.prefs.eveningStartMins),
                        end: iv.end,
                    }))
                    .filter((iv) => iv.end > iv.start)
                : intervals;

            return {
                id: x.user.id,
                name: x.user.fullName,
                intervals: filtered,
            };
        });
    }, [activeImports, selectedDayKey, eveningsOnly]);

    const everyoneOverlap = useMemo(() => {
        if (rows.length === 0) return [] as Interval[];
        return intersectAll(rows.map((r) => r.intervals));
    }, [rows]);

    const overlapSummary = useMemo(() => {
        if (!everyoneOverlap.length) return null;
        // longest interval as a quick “best window”
        let best = everyoneOverlap[0];
        for (const iv of everyoneOverlap) {
            if (iv.end - iv.start > best.end - best.start) best = iv;
        }
        return best;
    }, [everyoneOverlap]);


    const onImported = (items: AvailabilityExportV1[]) => {
        setError(null);

        // Enforce same-month imports for MVP
        const months = new Set(items.map((x) => x.month));
        const existingMonths = new Set(imports.map((x) => x.month));
        const combinedMonths = new Set([...existingMonths, ...months]);

        if (combinedMonths.size > 1) {
            setError(
                `For now, please import files from the same month. Detected months: ${Array.from(combinedMonths).join(", ")}`
            );
            return;
        }

        // Deduplicate by userId (keep newest by exportedAtIso if present)
        const map = new Map<string, AvailabilityExportV1>();
        for (const x of [...imports, ...items]) {
            const prev = map.get(x.user.id);
            if (!prev) map.set(x.user.id, x);
            else {
                const a = Date.parse(prev.exportedAtIso ?? "");
                const b = Date.parse(x.exportedAtIso ?? "");
                map.set(x.user.id, b >= a ? x : prev);
            }
        }
        const merged = Array.from(map.values());

        setImports(merged);
        setIncludedUserIds((prev) => {
            const next = new Set(prev);
            for (const x of items) next.add(x.user.id);
            return next;
        });

        // auto select month/day
        if (merged.length > 0) {
            const [y, m] = merged[0].month.split("-").map(Number);
            if (y && m) setMonth(new Date(y, m - 1, 1));
            setSelectedDate(null);
        }
    };

    const toggleIncluded = (userId: string) => {
        setIncludedUserIds((prev) => {
            const next = new Set(prev);
            if (next.has(userId)) next.delete(userId);
            else next.add(userId);
            return next;
        });
    };

    const removeUser = (userId: string) => {
        setImports((prev) => prev.filter((x) => x.user.id !== userId));
        setIncludedUserIds((prev) => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Aggregate</h1>
                    <p className="mt-1 text-sm text-zinc-400">
                        Import multiple exports and see overlap across the month.
                    </p>
                </div>

                <label className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/20 px-3 py-2 text-sm text-zinc-200">
                    <input
                        type="checkbox"
                        checked={eveningsOnly}
                        onChange={(e) => setEveningsOnly(e.target.checked)}
                        className="h-4 w-4 accent-zinc-200 cursor-pointer"
                    />
                    Evenings only
                </label>
            </div>

            {error ? (
                <div className="rounded-2xl border border-red-900/40 bg-red-950/30 p-4 text-sm text-red-200">
                    {error}
                </div>
            ) : null}

            <ImportPanel onImported={onImported} onError={(m) => setError(m)} />

            <div className="grid gap-4 lg:grid-cols-2">
                <PeopleList
                    items={imports}
                    includedUserIds={includedUserIds}
                    onToggleIncluded={toggleIncluded}
                    onRemove={removeUser}
                />
                {activeImports.length > 0 && 
                    (
                        <AggregateMonthGrid
                            month={monthDate}
                            totalPeople={activeImports.length}
                            dayAggByKey={agg.byDay}
                            selectedDate={selectedDate}
                            onSelectDate={(d) => setSelectedDate(d)}
                        />
                    )
                }
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="text-sm font-medium text-zinc-200">Selected day</div>
                        <div className="mt-1 text-sm text-zinc-400">
                            {selectedDate ? selectedDate.toDateString() : "Click a day in the heatmap."}
                        </div>
                    </div>

                    {selectedDate ? (
                        <div className="text-sm text-zinc-300">
                            {overlapSummary ? (
                                <div className="rounded-xl border border-green-900/40 bg-green-950/25 px-3 py-2">
                                    <div className="text-xs text-green-100/90">Best overlap</div>
                                    <div className="font-medium text-green-50">
                                        {minsToHHmm(overlapSummary.start)} – {minsToHHmm(overlapSummary.end)}
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-400">
                                    No time where everyone overlaps.
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {selectedDate ? (
                    rows.length > 0 ? (
                        <HorizontalDayTimeline rows={rows} />
                    ) : (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-400">
                            No included people to display.
                        </div>
                    )
                ) : null}
            </div>

        </div>
    );
}
