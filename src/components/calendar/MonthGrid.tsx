import { buildMonthGrid, isSameDay } from "../../utility/lib/date";
import { DayCell } from "./DayCell";
import type { Tint } from "../../utility/lib/availabilityColours";

type MonthGridProps = {
    month: Date;
    selectedDate?: Date | null;
    onSelectDate?: (date: Date) => void;

    getDayBottomText?: (date: Date) => string | undefined;
    getDayBadge?: (date: Date) => string | undefined;

    getDayTint?: (date: Date) => Tint | undefined;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthGrid({
    month,
    selectedDate,
    onSelectDate,
    getDayBottomText,
    getDayBadge,
    getDayTint,
}: MonthGridProps) {
    const days = buildMonthGrid(month);

    return (
        <div className="mt-4">
            <div className="grid grid-cols-7 gap-2">
                {WEEKDAYS.map((d) => (
                    <div key={d} className="px-1 pb-1 text-xs text-zinc-400">
                        {d}
                    </div>
                ))}

                {days.map((d) => {
                    const inMonth = d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
                    const isSelected = !!selectedDate && isSameDay(d, selectedDate);

                    return (
                        <DayCell
                            key={d.toISOString()}
                            date={d}
                            inMonth={inMonth}
                            isSelected={isSelected}
                            onSelect={onSelectDate}
                            topRightBadge={getDayBadge?.(d)}
                            bottomText={getDayBottomText?.(d)}
                            tint={getDayTint?.(d)}
                        />
                    );
                })}
            </div>

            <div className="mt-3 text-xs text-zinc-500">
                Tip: click a day to edit (we’ll add the modal next).
            </div>
        </div>
    );
}
