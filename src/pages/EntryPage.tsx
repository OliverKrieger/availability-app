import { useMemo, useState } from "react";
import { MonthPicker } from "../components/calendar/MonthPicker";
import { MonthGrid } from "../components/calendar/MonthGrid";
import { ymd, daysInMonthGrid } from "../utility/lib/date";
import { DayAvailabilityOverride, DayEditorModal } from "../components/availability/DayEditorModal";
import { minsToHHmm } from "../utility/lib/time";
import { useLocalSettings } from "../components/core/LocalSettingsProvider";
import { useAvailabilityStore } from "../stores/availability/availabilityStore";
import { ExportAvailabilityButton } from "../components/availability/ExportAvailabilityButton";
import { ImportAvailabilityButton } from "../components/availability/ImportAvailabilityButton";
import type { AvailabilityExportV1 } from "../features/export/model/types";
import { entryTint } from "../utility/lib/availabilityColours";
import { useUIStore } from "../stores/state/uiStore";

function pad2(n: number) {
    return n < 10 ? `0${n}` : String(n);
}
function monthKey(d: Date) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}


export function EntryPage() {
    const { settings, updateSettings } = useLocalSettings();
    const eveningStartMins = settings.prefs.eveningStartMins;
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
    const setOverridesBulk = useAvailabilityStore((s) => s.setOverridesBulk);
    const clearAll = useAvailabilityStore((s) => s.clearAll);
    const clearMonth = useAvailabilityStore((s) => s.clearMonth);

    const [banner, setBanner] = useState<string | null>(null);

    const openConfirm = useUIStore((s) => s.openConfirm);
    const pushAlert = useUIStore((s) => s.pushAlert);

    const handleImport = (data: AvailabilityExportV1) => {
        setBanner(null);

        // Restore settings bits (optional but convenient)
        updateSettings((curr) => ({
            ...curr,
            user: { ...curr.user, fullName: data.user.fullName },
            prefs: { ...curr.prefs, eveningStartMins: data.prefs.eveningStartMins },
        }));

        // Replace strategy:
        if (data.month === "all") {
            clearAll();
            setOverridesBulk(data.overridesByDay as Record<string, DayAvailabilityOverride>);
            setBanner(`Imported full backup (${Object.keys(data.overridesByDay).length} overrides).`);
            return;
        }

        // Month-only: clear that month first, then import only those keys
        clearMonth(data.month);

        const filtered: Record<string, DayAvailabilityOverride> = {};
        for (const [k, v] of Object.entries(data.overridesByDay ?? {})) {
            if (k.startsWith(data.month + "-")) filtered[k] = v as DayAvailabilityOverride;
        }
        setOverridesBulk(filtered);
        setMonth(new Date(Number(data.month.slice(0, 4)), Number(data.month.slice(5, 7)) - 1, 1));
        setBanner(`Imported ${data.month} (${Object.keys(filtered).length} overrides).`);
    };

    const selectedKey = selectedDate ? ymd(selectedDate) : null;

    const selectedOverride: DayAvailabilityOverride = useMemo(() => {
        if (!selectedKey) return { kind: "none" };
        return getOverride(selectedKey);
    }, [getOverride, selectedKey]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">{fullName} Availability</h1>
                    <p className="mt-1 text-sm text-zinc-400">
                        Default is busy. Click a day to mark: all day, evening (after{" "}
                        {minsToHHmm(eveningStartMins)}), or custom ranges.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <ImportAvailabilityButton
                        onImport={(data) => {
                            try {
                                handleImport(data);
                                pushAlert({
                                    type: "success",
                                    title: "Imported availability",
                                    message:
                                        data.month === "all"
                                            ? `Restored full backup (${Object.keys(data.overridesByDay ?? {}).length} days).`
                                            : `Imported ${data.month} (${Object.keys(data.overridesByDay ?? {}).length} days).`,
                                    ttlMs: 3500,
                                });
                            } catch (e) {
                                pushAlert({
                                    type: "error",
                                    title: "Import failed",
                                    message: e instanceof Error ? e.message : "Failed to import availability.",
                                });
                            }
                        }}
                        onError={(msg) =>
                            pushAlert({
                                type: "error",
                                title: "Import failed",
                                message: msg,
                            })
                        }
                    />

                    <ExportAvailabilityButton
                        month={month}
                        userId={settings.user.id}
                        fullName={settings.user.fullName}
                        eveningStartMins={eveningStartMins}
                        overrides={overrides}
                    />
                </div>
            </div>

            {banner ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-3 text-sm text-zinc-300">
                    {banner}
                </div>
            ) : null}

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

            {/* Add clear buttons wherever you render MonthPicker actions */}
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                    onClick={() => {
                        const mk = monthKey(month);
                        openConfirm({
                            tone: "warning",
                            title: "Clear month availability?",
                            message: `This will remove all overrides for ${mk}.`,
                            confirmText: "Clear month",
                            cancelText: "Cancel",
                            onConfirm: () => {
                                clearMonth(mk);
                                pushAlert({
                                    type: "success",
                                    title: "Month cleared",
                                    message: `Cleared overrides for ${mk}.`,
                                    ttlMs: 3000,
                                });
                            },
                        });
                    }}
                >
                    Clear month
                </button>

                <button
                    type="button"
                    className="cursor-pointer rounded-xl border border-red-900/40 bg-red-950/30 px-3 py-2 text-sm text-red-100 hover:bg-red-950/40"
                    onClick={() => {
                        openConfirm({
                            tone: "error",
                            title: "Clear all availability?",
                            message: "This will remove ALL stored overrides across all months. This cannot be undone.",
                            confirmText: "Clear all",
                            cancelText: "Cancel",
                            onConfirm: () => {
                                clearAll();
                                pushAlert({
                                    type: "success",
                                    title: "All cleared",
                                    message: "All availability overrides have been removed.",
                                    ttlMs: 3000,
                                });
                            },
                        });
                    }}
                >
                    Clear all
                </button>
            </div>

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
                    viewMonth={month}
                    eveningStartMins={eveningStartMins}
                    value={selectedOverride}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={(next) => {
                        setOverride(ymd(selectedDate), next);
                        setIsEditorOpen(false);
                    }}
                    onApplyToWeekdayInMonth={(weekday, next) => {
                        // apply to all matching weekday days in the currently viewed month
                        const updates: Record<string, DayAvailabilityOverride> = {};
                        for (const d of daysInMonthGrid(month)) {
                            if (d.getDay() !== weekday) continue;
                            updates[ymd(d)] = next;
                        }
                        setOverridesBulk(updates);
                        setIsEditorOpen(false);
                    }}
                />
            ) : null}
        </div>
    );
}
