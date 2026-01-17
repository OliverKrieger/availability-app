import { useMemo, useState } from "react";
import { MonthPicker } from "../components/calendar/MonthPicker";
import { MonthGrid } from "../components/calendar/MonthGrid";
import { ymd } from "../utility/lib/date";
import { DayAvailabilityOverride, DayEditorModal } from "../components/availability/DayEditorModal";
import { minsToHHmm } from "../utility/lib/time";
import { useLocalSettings } from "../components/core/LocalSettingsProvider";
import { useAvailabilityStore } from "../stores/availability/availabilityStore";
import { ExportAvailabilityButton } from "../components/availability/ExportAvailabilityButton";
import { entryTint } from "../utility/lib/availabilityColours";

export function EntryPage() {
    const { settings } = useLocalSettings();
    const eveningStartMins = settings.prefs.eveningStartMins;
    const userId = settings.user.id;
    const fullName = settings.user.fullName;

    const [month, setMonth] = useState(() => {
        const t = new Date();
        return new Date(t.getFullYear(), t.getMonth(), 1);
    });

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const overrides = useAvailabilityStore((s) => s.overrides);
    const getOverride = useAvailabilityStore((s) => s.getOverride);
    const setOverride = useAvailabilityStore((s) => s.setOverride);

    const selectedKey = selectedDate ? ymd(selectedDate) : null;

    const selectedOverride: DayAvailabilityOverride = useMemo(() => {
        if (!selectedKey) return { kind: "none" };
        return getOverride(selectedKey);
    }, [getOverride, selectedKey]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">My Availability</h1>
                    <p className="mt-1 text-sm text-zinc-400">
                        Default is busy. Click a day to mark: all day, evening (after{" "}
                        {minsToHHmm(eveningStartMins)}), or custom ranges.
                    </p>
                </div>

                <ExportAvailabilityButton
                    month={month}
                    userId={userId}
                    fullName={fullName}
                    eveningStartMins={eveningStartMins}
                    overrides={overrides}
                />
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
                    if (ov.kind === "eveningFree") return `Free after ${minsToHHmm(eveningStartMins)}`;
                    if (ov.kind === "ranges") return "Custom";
                    return undefined;
                }}
                getDayTint={(d) => {
                    const k = ymd(d);
                    const ov = overrides[k];
                    const hasFree = !!ov && ov.kind !== "none";
                    return entryTint(hasFree); // busy -> red, free -> green
                }}
            />

            {selectedDate ? (
                <DayEditorModal
                    isOpen={isEditorOpen}
                    date={selectedDate}
                    eveningStartMins={eveningStartMins}
                    value={selectedOverride}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={(next) => {
                        setOverride(ymd(selectedDate), next);
                        setIsEditorOpen(false);
                    }}
                />
            ) : null}
        </div>
    );
}
