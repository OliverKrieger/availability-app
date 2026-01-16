import { useState } from "react";
import { MonthPicker } from "../components/calendar/MonthPicker";
import { MonthGrid } from "../components/calendar/MonthGrid";

export function EntryPage() {
    const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold tracking-tight">My Availability</h1>
                <p className="mt-1 text-sm text-zinc-400">
                    Default is busy. Click a day to mark free times.
                </p>
            </div>

            <MonthPicker
                month={month}
                onChangeMonth={(m) => {
                    setMonth(new Date(m.getFullYear(), m.getMonth(), 1));
                    setSelectedDate(null);
                }}
                onJumpToToday={() => {
                    const t = new Date();
                    setMonth(new Date(t.getFullYear(), t.getMonth(), 1));
                    setSelectedDate(t);
                }}
            />

            <MonthGrid
                month={month}
                selectedDate={selectedDate}
                onSelectDate={(d) => setSelectedDate(d)}
                // For now, just a placeholder to prove it works
                getDayBottomText={(d) => {
                    if (selectedDate && d.toDateString() === selectedDate.toDateString()) return "Selected";
                    return undefined;
                }}
            />
        </div>
    );
}
