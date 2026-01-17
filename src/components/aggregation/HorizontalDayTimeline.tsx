import type { Interval } from "../../features/aggregate/lib/intervals";
import { intersectAll } from "../../features/aggregate/lib/intervals";
import { minsToHHmm } from "../../utility/lib/time";

type Row = {
    id: string;
    name: string;
    intervals: Interval[]; // free intervals
};

type Props = {
    rows: Row[];
};

const MINUTES = 24 * 60;
// 1px per minute is 1440px wide (fine; scroll horizontally)
const PX_PER_MIN = 1;
const TRACK_W = MINUTES * PX_PER_MIN;

function leftPx(min: number) {
    return min * PX_PER_MIN;
}
function widthPx(a: Interval) {
    return Math.max(1, (a.end - a.start) * PX_PER_MIN);
}

export function HorizontalDayTimeline({ rows }: Props) {
    const everyone = intersectAll(rows.map(r => r.intervals));

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20">
            {/* Header: hour ruler */}
            <div className="flex border-b border-zinc-800">
                <div className="w-44 shrink-0 p-3 text-xs text-zinc-400">People</div>
                <div className="relative overflow-x-auto overflow-y-hidden">
                    <div className="relative h-12" style={{ width: TRACK_W }}>
                        <HourRuler />
                    </div>
                </div>
            </div>

            {/* Everyone overlap band */}
            <div className="flex border-b border-zinc-800">
                <div className="w-44 shrink-0 p-3 text-xs text-zinc-400">Everyone</div>
                <div className="relative overflow-x-auto overflow-y-hidden">
                    <div className="relative h-10" style={{ width: TRACK_W }}>
                        <GridLines />
                        {everyone.map((iv, i) => (
                            <Bar key={i} iv={iv} tone="everyone" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-zinc-800">
                {rows.map((r) => (
                    <div key={r.id} className="flex">
                        <div className="w-44 shrink-0 p-3 text-sm text-zinc-200 sticky left-0 bg-zinc-950/30">
                            {r.name}
                        </div>

                        <div className="relative overflow-x-auto overflow-y-hidden">
                            <div className="relative h-12" style={{ width: TRACK_W }}>
                                <GridLines />

                                {/* faint “everyone overlap” background hint on each row */}
                                {everyone.map((iv, i) => (
                                    <Bar key={`bg-${i}`} iv={iv} tone="everyoneDim" />
                                ))}

                                {/* person's free intervals */}
                                {r.intervals.map((iv, i) => (
                                    <Bar key={i} iv={iv} tone="person" />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 text-xs text-zinc-500">
                Tip: Scroll horizontally to view the full day. Green = free. Bright green = everyone overlaps.
            </div>
        </div>
    );
}

function HourRuler() {
    const hours = Array.from({ length: 25 }, (_, i) => i);
    return (
        <>
            {/* vertical lines */}
            {hours.map((h) => (
                <div
                    key={h}
                    className="absolute top-0 bottom-0 border-l border-zinc-800"
                    style={{ left: leftPx(h * 60) }}
                />
            ))}
            {/* labels */}
            {hours.slice(0, 24).map((h) => (
                <div
                    key={`t-${h}`}
                    className="absolute top-2 text-[10px] text-zinc-400"
                    style={{ left: leftPx(h * 60) + 4 }}
                >
                    {String(h).padStart(2, "0")}:00
                </div>
            ))}
        </>
    );
}

function GridLines() {
    const hours = Array.from({ length: 25 }, (_, i) => i);
    return (
        <>
            {hours.map((h) => (
                <div
                    key={h}
                    className="absolute top-0 bottom-0 border-l border-zinc-900"
                    style={{ left: leftPx(h * 60) }}
                />
            ))}
        </>
    );
}

function Bar({ iv, tone }: { iv: Interval; tone: "person" | "everyone" | "everyoneDim" }) {
    const cls =
        tone === "person"
            ? "bg-green-500/25 border border-green-400/30"
            : tone === "everyone"
                ? "bg-green-400/45 border border-green-200/50 shadow-[0_0_0_1px_rgba(34,197,94,0.2)]"
                : "bg-green-400/15 border border-green-200/15";

    return (
        <div
            className={`absolute top-2 h-8 rounded-lg ${cls}`}
            style={{ left: leftPx(iv.start), width: widthPx(iv) }}
            title={`${minsToHHmm(iv.start)} - ${minsToHHmm(iv.end)}`}
        />
    );
}
