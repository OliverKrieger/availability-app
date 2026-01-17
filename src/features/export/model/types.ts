import type { DayAvailabilityOverride } from "../../../components/availability/DayEditorModal";

export type AvailabilityExportV1 = {
    schemaVersion: 1;
    exportId: string;        // unique per export
    exportedAtIso: string;   // ISO timestamp
    
     // Allow "all" for backups
    month: string | "all"; // "YYYY-MM" or "all"

    user: {
        id: string;            // stable per user install
        fullName: string;
    };
    prefs: {
        eveningStartMins: number;
    };
    overridesByDay: Record<string, DayAvailabilityOverride>; // keys: "YYYY-MM-DD"
};
