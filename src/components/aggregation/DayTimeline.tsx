import { minsToHHmm } from "../../utility/lib/time";

type Bucket = { startMins: number; endMins: number; freeCount: number };

type Props = {
    buckets: Bucket[];
    totalPeople: number;
};

export function DayTimeline({ buckets, totalPeople }: Props) {
    if (totalPeople === 0) {
        return (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4 text-sm text-zinc-400">
                Import at least one person to see a timeline.
            </div>
        );
    }

    const max = Math.max(...buckets.map((b) => b.freeCount), 0);

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4">
            <div className="text-sm font-medium text-zinc-200">Timeline (30-minute buckets)</div>
            <div className="mt-3 space-y-2">
                {buckets.map((b, idx) => {
                    const pct = totalPeople > 0 ? (b.freeCount / totalPeople) * 100 : 0;
                    const isBest = max > 0 && b.freeCount === max;

                    return (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="w-24 text-xs text-zinc-400">
                                {minsToHHmm(b.startMins)}–{minsToHHmm(b.endMins)}
                            </div>

                            <div className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950/40 p-1">
                                <div
                                    className={[
                                        "h-4 rounded-md",
                                        isBest ? "bg-zinc-200" : "bg-zinc-500/60",
                                    ].join(" ")}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>

                            <div className={["w-12 text-right text-xs", isBest ? "text-zinc-100" : "text-zinc-400"].join(" ")}>
                                {b.freeCount}/{totalPeople}
                            </div>
                        </div>
                    );
                })}
            </div>

            {max > 0 ? (
                <div className="mt-3 text-xs text-zinc-500">
                    Best bucket count: <span className="text-zinc-200">{max}/{totalPeople}</span>
                </div>
            ) : (
                <div className="mt-3 text-xs text-zinc-500">No availability found for this day.</div>
            )}
        </div>
    );
}
