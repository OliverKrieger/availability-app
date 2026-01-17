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

// 1px per minute => 1440px wide; easy and readable.
// If you want zoom later, make this a prop.
const PX_PER_MIN = 1;
const TRACK_W = MINUTES * PX_PER_MIN;

function leftPx(min: number) {
    return min * PX_PER_MIN;
}
function widthPx(iv: Interval) {
    return Math.max(1, (iv.end - iv.start) * PX_PER_MIN);
}

function barClass(tone: "person" | "everyone" | "everyoneDim") {
    switch (tone) {
        case "everyone":
            return "bg-green-400/45 border border-green-200/50 shadow-[0_0_0_1px_rgba(34,197,94,0.2)]";
        case "everyoneDim":
            return "bg-green-400/15 border border-green-200/15";
        default:
            return "bg-green-500/25 border border-green-400/30";
    }
}

export function HorizontalDayTimeline({ rows }: Props) {
    const everyone = intersectAll(rows.map((r) => r.intervals));

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 overflow-hidden">
            {/* SINGLE SCROLLER FOR ALL TIMELINE CONTENT */}
            <div className="overflow-x-auto">
                {/* The inner width defines the scrollable area */}
                <div className="min-w-225">
                    {/* Header row */}
                    <div className="flex border-b border-zinc-800">
                        <StickyNameCell>People</StickyNameCell>
                        <div className="relative h-12" style={{ width: TRACK_W }}>
                            <HourRuler />
                        </div>
                    </div>

                    {/* Everyone row */}
                    <div className="flex border-b border-zinc-800">
                        <StickyNameCell>Everyone</StickyNameCell>
                        <div className="relative h-10" style={{ width: TRACK_W }}>
                            <GridLines />
                            {everyone.map((iv, i) => (
                                <Bar key={i} iv={iv} tone="everyone" />
                            ))}
                        </div>
                    </div>

                    {/* People rows */}
                    <div className="divide-y divide-zinc-800">
                        {rows.map((r) => (
                            <div key={r.id} className="flex">
                                <StickyNameCell>{r.name}</StickyNameCell>

                                <div className="relative h-12" style={{ width: TRACK_W }}>
                                    <GridLines />

                                    {/* faint “everyone overlap” hint */}
                                    {everyone.map((iv, i) => (
                                        <Bar key={`bg-${i}`} iv={iv} tone="everyoneDim" />
                                    ))}

                                    {/* user's free intervals */}
                                    {r.intervals.map((iv, i) => (
                                        <Bar key={i} iv={iv} tone="person" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-3 text-xs text-zinc-500">
                Scroll horizontally to view the full day. Green = free. Bright green = everyone overlaps.
            </div>
        </div>
    );
}

function StickyNameCell({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-44 shrink-0 px-3 py-3 text-sm text-zinc-200 sticky left-0 z-10 bg-zinc-950/60 backdrop-blur">
            <div className="truncate">{children}</div>
        </div>
    );
}

function HourRuler() {
    const hours = Array.from({ length: 25 }, (_, i) => i);

    return (
        <>
            {/* lines */}
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
                    className="absolute top-2 text-[10px] text-zinc-400 select-none"
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
    return (
        <div
            className={[
                "absolute top-2 h-8 rounded-lg",
                barClass(tone),
            ].join(" ")}
            style={{ left: leftPx(iv.start), width: widthPx(iv) }}
            title={`${minsToHHmm(iv.start)} - ${minsToHHmm(iv.end)}`}
        />
    );
}
