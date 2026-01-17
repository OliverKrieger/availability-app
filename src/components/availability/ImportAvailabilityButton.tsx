import { useRef } from "react";
import type { AvailabilityExportV1 } from "../../features/export/model/types";

type Props = {
    onImport: (data: AvailabilityExportV1) => void;
    onError?: (msg: string) => void;
};

function isExportV1(x: any): x is AvailabilityExportV1 {
    const monthOk =
        x?.month === "all" ||
        (typeof x?.month === "string" && /^\d{4}-\d{2}$/.test(x.month));

    return (
        x &&
        x.schemaVersion === 1 &&
        typeof x.exportId === "string" &&
        typeof x.exportedAtIso === "string" &&
        monthOk &&
        x.user &&
        typeof x.user.id === "string" &&
        typeof x.user.fullName === "string" &&
        x.prefs &&
        typeof x.prefs.eveningStartMins === "number" &&
        x.overridesByDay &&
        typeof x.overridesByDay === "object"
    );
}

export function ImportAvailabilityButton({ onImport, onError }: Props) {
    const fileRef = useRef<HTMLInputElement | null>(null);

    return (
        <>
            <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
            >
                Import Availability
            </button>

            <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;

                    try {
                        const parsed = JSON.parse(await f.text());
                        if (!isExportV1(parsed)) {
                            onError?.("That file doesn’t look like a valid availability export.");
                            return;
                        }
                        onImport(parsed);
                    } catch (err) {
                        onError?.(err instanceof Error ? err.message : "Failed to import JSON.");
                    }
                }}
            />
        </>
    );
}
