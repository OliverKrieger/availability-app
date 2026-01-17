export function minsToHHmm(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const hh = h < 10 ? `0${h}` : String(h);
    const mm = m < 10 ? `0${m}` : String(m);
    return `${hh}:${mm}`;
}

export function hhmmToMins(hhmm: string): number | null {
    // accepts "HH:mm"
    const m = /^(\d{2}):(\d{2})$/.exec(hhmm.trim());
    if (!m) return null;
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
    if (hh < 0 || hh > 23) return null;
    if (mm < 0 || mm > 59) return null;
    return hh * 60 + mm;
}

export function hhmmToMinsStrict(text: string): number | null {
    const s = text.trim();

    // Require full HH:MM
    if (!/^\d{2}:\d{2}$/.test(s)) return null;

    const [hhStr, mmStr] = s.split(":");
    const hh = Number(hhStr);
    const mm = Number(mmStr);

    if (!Number.isInteger(hh) || !Number.isInteger(mm)) return null;
    if (mm < 0 || mm > 59) return null;

    // Allow 24:00 only (end of day)
    if (hh === 24 && mm === 0) return 24 * 60;
    if (hh < 0 || hh > 23) return null;

    return hh * 60 + mm;
}

export function normalizeRanges(ranges: { startMins: number; endMins: number }[]) {
    // remove invalid, clamp, sort, merge overlaps
    const cleaned = ranges
        .map((r) => ({
            startMins: Math.max(0, Math.min(24 * 60, r.startMins)),
            endMins: Math.max(0, Math.min(24 * 60, r.endMins)),
        }))
        .filter((r) => r.endMins > r.startMins)
        .sort((a, b) => a.startMins - b.startMins);

    const merged: typeof cleaned = [];
    for (const r of cleaned) {
        const last = merged[merged.length - 1];
        if (!last || r.startMins > last.endMins) merged.push({ ...r });
        else last.endMins = Math.max(last.endMins, r.endMins);
    }
    return merged;
}
