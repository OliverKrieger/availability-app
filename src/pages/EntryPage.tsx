import { useMemo, useState } from "react";
import { MonthPicker } from "../components/calendar/MonthPicker";
import { MonthGrid } from "../components/calendar/MonthGrid";
import { ymd } from "../utility/lib/date";
import { DEFAULT_SETTINGS } from "../features/settings/model/types";
import { DayAvailabilityOverride, DayEditorModal } from "../components/availability/DayEditorModal";
import { minsToHHmm } from "../utility/lib/time";

type OverridesByDay = Record<string, DayAvailabilityOverride>;

export function EntryPage() {
    const [settings] = useState(() => DEFAULT_SETTINGS);

    const [month, setMonth] = useState(() => {
        const t = new Date();
        return new Date(t.getFullYear(), t.getMonth(), 1);
    });

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const [overrides, setOverrides] = useState<OverridesByDay>({});

    const selectedKey = selectedDate ? ymd(selectedDate) : null;

    const selectedOverride: DayAvailabilityOverride = useMemo(() => {
        if (!selectedKey) return { kind: "none" };
        return overrides[selectedKey] ?? { kind: "none" };
    }, [overrides, selectedKey]);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold tracking-tight">My Availability</h1>
                <p className="mt-1 text-sm text-zinc-400">
                    Default is busy. Click a day to mark: all day, evening (after {minsToHHmm(settings.eveningStartMins)}), or custom ranges.
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
                onSelectDate={(d) => {
                    setSelectedDate(d);
                    setIsEditorOpen(true);
                }}
                getDayBadge={(d) => {
                    const k = ymd(d);
                    const ov = overrides[k];
                    if (!ov || ov.kind === "none") return undefined;
                    if (ov.kind === "allDayFree") return "All day";
                    if (ov.kind === "eveningFree") return "Evening";
                    if (ov.kind === "ranges") return `${ov.ranges.length} ranges`;
                    return undefined;
                }}
                getDayBottomText={(d) => {
                    const k = ymd(d);
                    const ov = overrides[k];
                    if (!ov || ov.kind === "none") return undefined;
                    if (ov.kind === "allDayFree") return "Free";
                    if (ov.kind === "eveningFree") return `Free after ${minsToHHmm(settings.eveningStartMins)}`;
                    if (ov.kind === "ranges") return "Custom";
                    return undefined;
                }}
            />

            {selectedDate ? (
                <DayEditorModal
                    isOpen={isEditorOpen}
                    date={selectedDate}
                    eveningStartMins={settings.eveningStartMins}
                    value={selectedOverride}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={(next) => {
                        const k = ymd(selectedDate);
                        setOverrides((prev) => {
                            const copy = { ...prev };
                            if (next.kind === "none") delete copy[k];
                            else copy[k] = next;
                            return copy;
                        });
                        setIsEditorOpen(false);
                    }}
                />
            ) : null}
        </div>
    );
}
