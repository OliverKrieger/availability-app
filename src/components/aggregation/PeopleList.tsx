import type { AvailabilityExportV1 } from "../../features/export/model/types";

type Props = {
    items: AvailabilityExportV1[];
    includedUserIds: Set<string>;
    onToggleIncluded: (userId: string) => void;
    onRemove: (userId: string) => void;
};

export function PeopleList({ items, includedUserIds, onToggleIncluded, onRemove }: Props) {
    if (items.length === 0) return null;

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4">
            <div className="text-sm font-medium text-zinc-200">People</div>
            <div className="mt-3 space-y-2">
                {items.map((x) => {
                    const included = includedUserIds.has(x.user.id);
                    return (
                        <div
                            key={x.user.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3"
                        >
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={included}
                                    onChange={() => onToggleIncluded(x.user.id)}
                                    className="cursor-pointer h-4 w-4 accent-zinc-200"
                                />
                                <div>
                                    <div className="text-sm text-zinc-200">{x.user.fullName}</div>
                                    <div className="text-xs text-zinc-500">
                                        Month: <span className="text-zinc-300">{x.month}</span> • Evening:{" "}
                                        <span className="text-zinc-300">{Math.floor(x.prefs.eveningStartMins / 60)
                                            .toString()
                                            .padStart(2, "0")}:{(x.prefs.eveningStartMins % 60).toString().padStart(2, "0")}</span>
                                    </div>
                                </div>
                            </label>

                            <button
                                type="button"
                                onClick={() => onRemove(x.user.id)}
                                className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-900"
                            >
                                Remove
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
