import { buildMonthGrid, isSameDay, ymd } from "../../utility/lib/date";
import type { DayAggregate } from "../../features/services/aggregate";
import { aggregateTint, tintClass, badgeClass } from "../../utility/lib/availabilityColours";

type Props = {
    month: Date;
    totalPeople: number;
    dayAggByKey: Record<string, DayAggregate>;
    selectedDate?: Date | null;
    onSelectDate?: (d: Date) => void;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function AggregateMonthGrid({
    month,
    totalPeople,
    dayAggByKey,
    selectedDate,
    onSelectDate,
}: Props) {
    const days = buildMonthGrid(month);

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-4">
            <div className="grid grid-cols-7 gap-2">
                {WEEKDAYS.map((d) => (
                    <div key={d} className="px-1 pb-1 text-xs text-zinc-400">
                        {d}
                    </div>
                ))}

                {days.map((d) => {
                    const inMonth = d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
                    const key = ymd(d);
                    const agg = dayAggByKey[key];
                    const freeCount = agg?.freeCount ?? 0;
                    const ratio = totalPeople > 0 ? freeCount / totalPeople : 0;
                    const tint = aggregateTint(ratio);
                    const isSelected = !!selectedDate && isSameDay(d, selectedDate);

                    return (
                        <button
                            key={d.toISOString()}
                            type="button"
                            onClick={() => onSelectDate?.(d)}
                            className={[
                                "cursor-pointer relative flex h-24 w-full flex-col rounded-xl border p-2 text-left transition",
                                "focus:outline-none focus:ring-2 focus:ring-zinc-600",
                                inMonth ? "" : "text-zinc-600",
                                tintClass(tint),
                                isSelected ? "ring-2 ring-zinc-300" : "",
                            ].join(" ")}
                        >
                            <div className="flex items-start justify-between">
                                <div className="text-xs text-zinc-200">{d.getDate()}</div>
                                {inMonth && totalPeople > 0 ? (
                                    <div className={["rounded-lg border px-2 py-1 text-[10px]", badgeClass(tint)].join(" ")}>
                                        {freeCount}/{totalPeople}
                                    </div>
                                ) : null}
                            </div>

                            <div className="mt-auto text-xs text-zinc-400">
                                {inMonth && freeCount > 0 ? freeCount < totalPeople ? "tentative" : "free" : inMonth ? "busy" : ""}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-3 text-xs text-zinc-500">
                Darker = more people free. Click a day to view timeline.
            </div>
        </div>
    );
}
