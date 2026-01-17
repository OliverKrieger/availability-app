import { downloadJson } from "../../utility/lib/download";
import type { AvailabilityExportV1 } from "../../features/export/model/types";
import type { DayAvailabilityOverride } from "./DayEditorModal";

type Props = {
    month: Date; // current viewed month
    userId: string;
    fullName: string;
    eveningStartMins: number;
    overrides: Record<string, DayAvailabilityOverride>; // all overrides
};

function pad2(n: number) {
    return n < 10 ? `0${n}` : String(n);
}

function monthKey(month: Date) {
    return `${month.getFullYear()}-${pad2(month.getMonth() + 1)}`;
}

function isDayInMonth(dayKey: string, monthKeyStr: string) {
    // dayKey is "YYYY-MM-DD"
    return dayKey.startsWith(monthKeyStr + "-");
}

export function ExportAvailabilityButton({
    month,
    userId,
    fullName,
    eveningStartMins,
    overrides,
}: Props) {
    const mk = monthKey(month);

    const canExport = fullName.trim().length > 0 && userId.trim().length > 0;

    const handleExport = () => {
        if (!canExport) return;

        const filtered: Record<string, DayAvailabilityOverride> = {};
        for (const [dayKey, ov] of Object.entries(overrides)) {
            if (!isDayInMonth(dayKey, mk)) continue;
            if (!ov || ov.kind === "none") continue;
            filtered[dayKey] = ov;
        }

        const payload: AvailabilityExportV1 = {
            schemaVersion: 1,
            exportId: crypto.randomUUID(),
            exportedAtIso: new Date().toISOString(),
            month: mk,
            user: {
                id: userId,
                fullName,
            },
            prefs: {
                eveningStartMins,
            },
            overridesByDay: filtered,
        };

        const safeName = fullName.trim().replace(/\s+/g, "_");
        const filename = `availability_${safeName}_${mk}.json`;

        downloadJson(filename, payload);
    };

    return (
        <button
            type="button"
            disabled={!canExport}
            onClick={handleExport}
            className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-50"
            title={!canExport ? "Set your name in Settings first." : "Download availability JSON"}
        >
            Export JSON
        </button>
    );
}
