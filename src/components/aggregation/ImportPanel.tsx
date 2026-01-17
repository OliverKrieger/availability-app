import type { AvailabilityExportV1 } from "../../features/export/model/types";

type Props = {
    onImported: (items: AvailabilityExportV1[]) => void;
    onError?: (message: string) => void;
};

function isExportV1(x: any): x is AvailabilityExportV1 {
    return (
        x &&
        x.schemaVersion === 1 &&
        typeof x.month === "string" &&
        x.user &&
        typeof x.user.id === "string" &&
        typeof x.user.fullName === "string" &&
        x.prefs &&
        typeof x.prefs.eveningStartMins === "number" &&
        typeof x.overridesByDay === "object"
    );
}

async function readFileAsJson(file: File): Promise<any> {
    const text = await file.text();
    return JSON.parse(text);
}

export function ImportPanel({ onImported, onError }: Props) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="text-sm font-medium text-zinc-200">Import availability exports</div>
                    <div className="mt-1 text-xs text-zinc-400">Select multiple .json export files.</div>
                </div>

                <label className="cursor-pointer rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white">
                    Import JSON
                    <input
                        className="hidden"
                        type="file"
                        accept=".json,application/json"
                        multiple
                        onChange={async (e) => {
                            const files = Array.from(e.target.files ?? []);
                            e.target.value = ""; // allow re-importing same files
                            if (files.length === 0) return;

                            try {
                                const parsed = await Promise.all(files.map(readFileAsJson));
                                const valid: AvailabilityExportV1[] = [];
                                const invalidNames: string[] = [];

                                for (let i = 0; i < parsed.length; i++) {
                                    if (isExportV1(parsed[i])) valid.push(parsed[i]);
                                    else invalidNames.push(files[i]?.name ?? `file${i + 1}`);
                                }

                                if (invalidNames.length) {
                                    onError?.(`Some files were not valid exports: ${invalidNames.join(", ")}`);
                                }
                                if (valid.length) onImported(valid);
                            } catch (err) {
                                onError?.(err instanceof Error ? err.message : "Failed to import JSON files");
                            }
                        }}
                    />
                </label>
            </div>
        </div>
    );
}
