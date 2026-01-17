import { isSameDay, ymd } from "../../utility/lib/date";
import type { Tint } from "../../utility/lib/availabilityColours";
import { tintClass } from "../../utility/lib/availabilityColours";

type DayCellProps = {
    date: Date;
    inMonth: boolean;
    isSelected?: boolean;
    onSelect?: (date: Date) => void;

    // Optional: let you show little status labels later (e.g., "Free", "Ranges")
    topRightBadge?: string;
    bottomText?: string;

    tint?: Tint;
};

export function DayCell({
    date,
    inMonth,
    isSelected,
    onSelect,
    topRightBadge,
    bottomText,
    tint,
}: DayCellProps) {
    const today = new Date();
    const isToday = isSameDay(date, today);

    return (
        <button
            type="button"
            onClick={() => onSelect?.(date)}
            className={[
                "group relative flex h-24 w-full flex-col rounded-xl border p-2 text-left transition",
                "focus:outline-none focus:ring-2 focus:ring-zinc-600",
                inMonth ? "text-zinc-100" : "text-zinc-600",
                !tint
                    ? inMonth
                        ? "border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40"
                        : "border-zinc-900 bg-zinc-950/40 hover:bg-zinc-950/60"
                    : "",
                tint ? tintClass(tint, { dim: !inMonth }) : "",
                isSelected ? "ring-2 ring-zinc-300" : "",
            ].join(" ")}
            aria-label={ymd(date)}
        >
            <div className="flex items-start justify-between">
                <div
                    className={[
                        "flex h-6 min-w-6 items-center justify-center rounded-lg px-2 text-xs",
                        isToday ? "bg-zinc-100 text-zinc-900" : inMonth ? "bg-zinc-950/40 text-zinc-200" : "bg-transparent text-zinc-600",
                    ].join(" ")}
                >
                    {date.getDate()}
                </div>

                {topRightBadge ? (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-2 py-1 text-[10px] text-zinc-200">
                        {topRightBadge}
                    </div>
                ) : null}
            </div>

            <div className="mt-auto">
                {bottomText ? (
                    <div className="text-xs text-zinc-200/80">{bottomText}</div>
                ) : null}
            </div>
        </button>
    );
}
