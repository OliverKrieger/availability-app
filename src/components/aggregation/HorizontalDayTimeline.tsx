import { useLayoutEffect, useRef, useState } from "react";
import type { Interval } from "../../features/aggregate/lib/intervals";
import { intersectAll } from "../../features/aggregate/lib/intervals";
import { minsToHHmm } from "../../utility/lib/time";
import { ZoomControls } from "../../components/ui/ZoomControls";

type Row = {
    id: string;
    name: string;
    intervals: Interval[]; // free intervals
};

type Props = {
    rows: Row[];
};

const MINUTES = 24 * 60;

// Zoom limits (px per minute)
const MIN_PX_PER_MIN = 0.5; // 1440 * 0.5 = 720px (fits on many screens)
const MAX_PX_PER_MIN = 3;   // 4320px
const STEP_PX_PER_MIN = 0.25;

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

    // px-per-minute is your zoom knob
    const [pxPerMin, setPxPerMin] = useState(1);

    // single scroll container ref
    const scrollerRef = useRef<HTMLDivElement | null>(null);

    // ---- scroll anchoring ----
    // We keep the *center time* stable when zoom changes
    const anchorRef = useRef<{
        centerMinute: number;
        viewportW: number;
        prevPxPerMin: number;
    } | null>(null);

    const trackW = MINUTES * pxPerMin;

    const leftPx = (min: number) => min * pxPerMin;
    const widthPx = (iv: Interval) => Math.max(2, (iv.end - iv.start) * pxPerMin);

    // capture anchor BEFORE changing zoom
    const setZoomAnchored = (next: number) => {
        const el = scrollerRef.current;
        if (el) {
            const viewportW = el.clientWidth;
            const scrollLeft = el.scrollLeft;

            // current center minute under the viewport center
            const centerPx = scrollLeft + viewportW / 2;
            const centerMinute = centerPx / pxPerMin;

            anchorRef.current = { centerMinute, viewportW, prevPxPerMin: pxPerMin };
        }
        setPxPerMin(next);
    };

    // restore scroll AFTER zoom changes
    useLayoutEffect(() => {
        const el = scrollerRef.current;
        const anchor = anchorRef.current;
        if (!el || !anchor) return;

        // Compute new scrollLeft so that the same centerMinute stays centered
        const newCenterPx = anchor.centerMinute * pxPerMin;
        const newScrollLeft = newCenterPx - anchor.viewportW / 2;

        el.scrollLeft = Math.max(0, newScrollLeft);

        // clear anchor
        anchorRef.current = null;
    }, [pxPerMin]);

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-3 py-2">
                <div className="text-xs text-zinc-400">
                    Timeline (00:00–24:00)
                </div>

                <ZoomControls
                    value={pxPerMin}
                    min={MIN_PX_PER_MIN}
                    max={MAX_PX_PER_MIN}
                    step={STEP_PX_PER_MIN}
                    onChange={setZoomAnchored}
                    label="Zoom"
                />
            </div>

            {/* SINGLE SCROLLER FOR ALL TIMELINE CONTENT */}
            <div ref={scrollerRef} className="overflow-x-auto">
                {/* The inner width defines the scrollable area */}
                <div className="min-w-225">
                    {/* Header row */}
                    <div className="flex border-b border-zinc-800">
                        <StickyNameCell>People</StickyNameCell>
                        <div className="relative h-12" style={{ width: trackW }}>
                            <HourRuler leftPx={leftPx} />
                        </div>
                    </div>

                    {/* Everyone row */}
                    <div className="flex border-b border-zinc-800">
                        <StickyNameCell>Everyone</StickyNameCell>
                        <div className="relative h-10" style={{ width: trackW }}>
                            <GridLines leftPx={leftPx} />
                            {everyone.map((iv, i) => (
                                <Bar key={i} iv={iv} tone="everyone" leftPx={leftPx} widthPx={widthPx} />
                            ))}
                        </div>
                    </div>

                    {/* People rows */}
                    <div className="divide-y divide-zinc-800">
                        {rows.map((r) => (
                            <div key={r.id} className="flex">
                                <StickyNameCell>{r.name}</StickyNameCell>

                                <div className="relative h-12" style={{ width: trackW }}>
                                    <GridLines leftPx={leftPx} />

                                    {/* faint “everyone overlap” hint */}
                                    {everyone.map((iv, i) => (
                                        <Bar key={`bg-${i}`} iv={iv} tone="everyoneDim" leftPx={leftPx} widthPx={widthPx} />
                                    ))}

                                    {/* user's free intervals */}
                                    {r.intervals.map((iv, i) => (
                                        <Bar key={i} iv={iv} tone="person" leftPx={leftPx} widthPx={widthPx} />
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

function HourRuler({ leftPx }: { leftPx: (m: number) => number }) {
    const hours = Array.from({ length: 25 }, (_, i) => i);

    return (
        <>
            {hours.map((h) => (
                <div
                    key={h}
                    className="absolute top-0 bottom-0 border-l border-zinc-800"
                    style={{ left: leftPx(h * 60) }}
                />
            ))}

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

function GridLines({ leftPx }: { leftPx: (m: number) => number }) {
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

function Bar({
    iv,
    tone,
    leftPx,
    widthPx,
}: {
    iv: Interval;
    tone: "person" | "everyone" | "everyoneDim";
    leftPx: (m: number) => number;
    widthPx: (iv: Interval) => number;
}) {
    return (
        <div
            className={["absolute top-2 h-8 rounded-lg", barClass(tone)].join(" ")}
            style={{ left: leftPx(iv.start), width: widthPx(iv) }}
            title={`${minsToHHmm(iv.start)} - ${minsToHHmm(iv.end)}`}
        />
    );
}
