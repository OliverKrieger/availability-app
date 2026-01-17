export type MonthKey = `${number}-${string}`; // e.g. "2026-01"

export function pad2(n: number): string {
    return n < 10 ? `0${n}` : String(n);
}

export function monthKeyFromDate(d: Date): MonthKey {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}` as MonthKey;
}

export function monthLabel(d: Date): string {
    return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

/**
 * Returns a Date representing the first day of the month (local time).
 */
export function startOfMonth(month: Date): Date {
    return new Date(month.getFullYear(), month.getMonth(), 1);
}

/**
 * Monday-first day-of-week index: Mon=0 ... Sun=6
 */
export function mondayIndex(jsDay: number): number {
    // JS: Sun=0..Sat=6 => Mon=0..Sun=6
    return (jsDay + 6) % 7;
}

export function addMonths(month: Date, delta: number): Date {
    return new Date(month.getFullYear(), month.getMonth() + delta, 1);
}

export function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export function ymd(d: Date): string {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Build a 6-week (42 cell) grid for the given month, Monday-first.
 * Includes leading/trailing days from adjacent months.
 */
export function buildMonthGrid(month: Date): Date[] {
    const first = startOfMonth(month);
    const offset = mondayIndex(first.getDay()); // how many days to go back to Monday
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - offset);

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
        const d = new Date(gridStart);
        d.setDate(gridStart.getDate() + i);
        days.push(d);
    }
    return days;
}
