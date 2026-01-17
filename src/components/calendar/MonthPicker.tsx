import { addMonths, monthLabel } from "../../utility/lib/date";

type MonthPickerProps = {
    month: Date; // should be a date on the 1st, but not required
    onChangeMonth: (nextMonth: Date) => void;
    onJumpToToday?: () => void;
};

export function MonthPicker({ month, onChangeMonth, onJumpToToday }: MonthPickerProps) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onChangeMonth(addMonths(month, -1))}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm hover:bg-zinc-900"
                >
                    ←
                </button>

                <button
                    type="button"
                    onClick={() => onChangeMonth(addMonths(month, 1))}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm hover:bg-zinc-900"
                >
                    →
                </button>

                <div className="ml-2">
                    <div className="text-lg font-semibold tracking-tight">{monthLabel(month)}</div>
                    <div className="text-xs text-zinc-400">Monday-first calendar</div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {onJumpToToday ? (
                    <button
                        type="button"
                        onClick={onJumpToToday}
                        className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900 cursor-pointer"
                    >
                        Today
                    </button>
                ) : null}
            </div>
        </div>
    );
}
