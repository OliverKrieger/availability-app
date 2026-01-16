import { ReactNode, useMemo, useState } from "react";
import { minsToHHmm, normalizeRanges } from "../../utility/lib/time";
import { TimeRange, TimeRangeEditor } from "./TimeRangeEditor";

export type DayAvailabilityOverride =
    | { kind: "none" }
    | { kind: "allDayFree" }
    | { kind: "eveningFree" }
    | { kind: "ranges"; ranges: TimeRange[] };

type Props = {
    isOpen: boolean;
    date: Date;
    eveningStartMins: number;
    value: DayAvailabilityOverride;
    onClose: () => void;
    onSave: (next: DayAvailabilityOverride) => void;
};

function formatDateLong(d: Date) {
    return d.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function ModalFrame({ children }: { children: ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
                {children}
            </div>
        </div>
    );
}

export function DayEditorModal({
    isOpen,
    date,
    eveningStartMins,
    value,
    onClose,
    onSave,
}: Props) {
    const [draft, setDraft] = useState<DayAvailabilityOverride>(value);

    // reset draft when opening/changing date/value
    useMemo(() => {
        if (isOpen) setDraft(value);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, date.getTime()]);

    const eveningLabel = `Evening (${minsToHHmm(eveningStartMins)}–24:00)`;

    const setKind = (kind: DayAvailabilityOverride["kind"]) => {
        if (kind === "ranges") {
            setDraft((prev) =>
                prev.kind === "ranges" ? prev : { kind: "ranges", ranges: [{ startMins: 18 * 60, endMins: 20 * 60 }] }
            );
            return;
        }
        setDraft({ kind } as DayAvailabilityOverride);
    };

    const canSave = true;

    if (!isOpen) return null;

    return (
        <ModalFrame>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-lg font-semibold tracking-tight">Edit availability</div>
                    <div className="mt-1 text-sm text-zinc-400">{formatDateLong(date)}</div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm hover:bg-zinc-900"
                >
                    Close
                </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                {/* Mode selection */}
                <div className="space-y-2">
                    <div className="text-sm font-medium text-zinc-200">Mode</div>

                    <ModeButton active={draft.kind === "none"} onClick={() => setKind("none")}>
                        Busy (default)
                    </ModeButton>

                    <ModeButton active={draft.kind === "allDayFree"} onClick={() => setKind("allDayFree")}>
                        Free all day (00:00–24:00)
                    </ModeButton>

                    <ModeButton active={draft.kind === "eveningFree"} onClick={() => setKind("eveningFree")}>
                        {eveningLabel}
                    </ModeButton>

                    <ModeButton active={draft.kind === "ranges"} onClick={() => setKind("ranges")}>
                        Custom time ranges
                    </ModeButton>

                    <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/20 p-3 text-xs text-zinc-400">
                        Note: “Evening” uses your Settings workday end time.
                    </div>
                </div>

                {/* Editor panel */}
                <div className="space-y-3">
                    {draft.kind === "ranges" ? (
                        <TimeRangeEditor
                            ranges={draft.ranges}
                            onChange={(nextRanges) =>
                                setDraft({ kind: "ranges", ranges: normalizeRanges(nextRanges) })
                            }
                        />
                    ) : (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 text-sm text-zinc-400">
                            {draft.kind === "none" && "This day will be treated as busy."}
                            {draft.kind === "allDayFree" && "You’re free the entire day."}
                            {draft.kind === "eveningFree" && `You’re free from ${minsToHHmm(eveningStartMins)} onward.`}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={() => setDraft(value)}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm hover:bg-zinc-900"
                >
                    Reset
                </button>

                <button
                    type="button"
                    disabled={!canSave}
                    onClick={() => onSave(draft)}
                    className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-50"
                >
                    Save
                </button>
            </div>
        </ModalFrame>
    );
}

function ModeButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "w-full rounded-xl border px-3 py-3 text-left text-sm transition",
                active ? "border-zinc-600 bg-zinc-900" : "border-zinc-800 bg-zinc-950 hover:bg-zinc-900/40",
            ].join(" ")}
        >
            {children}
        </button>
    );
}
