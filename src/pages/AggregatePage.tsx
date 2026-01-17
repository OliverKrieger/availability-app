import { useMemo, useState } from "react";
import type { AvailabilityExportV1 } from "../features/export/model/types";
import { ImportPanel } from "../components/aggregation/ImportPanel";
import { PeopleList } from "../components/aggregation/PeopleList";
import { AggregateMonthGrid } from "../components/aggregation/AggregateMonthGrid";
import { DayTimeline } from "../components/aggregation/DayTimeline";
import { aggregateMonth, computeDayBuckets, dayKey, monthKeyFromDate } from "../features/services/aggregate";

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

    const buckets = useMemo(() => {
        if (!selectedDayKey) return [];
        return computeDayBuckets(activeImports, selectedDayKey, eveningsOnly, 30);
    }, [activeImports, selectedDayKey, eveningsOnly]);

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

                <AggregateMonthGrid
                    month={monthDate}
                    totalPeople={activeImports.length}
                    dayAggByKey={agg.byDay}
                    selectedDate={selectedDate}
                    onSelectDate={(d) => setSelectedDate(d)}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4 text-sm text-zinc-400">
                    <div className="text-sm font-medium text-zinc-200">Selected day</div>
                    <div className="mt-2">
                        {selectedDate ? selectedDate.toDateString() : "Click a day in the heatmap."}
                    </div>
                </div>

                <DayTimeline buckets={buckets} totalPeople={activeImports.length} />
            </div>
        </div>
    );
}
