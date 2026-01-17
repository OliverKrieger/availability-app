export type Interval = { start: number; end: number }; // minutes, [start,end)

export function normalize(intervals: Interval[]): Interval[] {
    const sorted = [...intervals]
        .filter((i) => i.end > i.start)
        .sort((a, b) => a.start - b.start);

    const out: Interval[] = [];
    for (const cur of sorted) {
        const last = out[out.length - 1];
        if (!last || cur.start > last.end) out.push({ ...cur });
        else last.end = Math.max(last.end, cur.end);
    }
    return out;
}

export function intersect2(a: Interval[], b: Interval[]): Interval[] {
    const A = normalize(a);
    const B = normalize(b);
    const out: Interval[] = [];

    let i = 0, j = 0;
    while (i < A.length && j < B.length) {
        const s = Math.max(A[i].start, B[j].start);
        const e = Math.min(A[i].end, B[j].end);
        if (e > s) out.push({ start: s, end: e });

        if (A[i].end < B[j].end) i++;
        else j++;
    }
    return out;
}

export function intersectAll(all: Interval[][]): Interval[] {
    if (all.length === 0) return [];
    return all.reduce((acc, next) => intersect2(acc, next));
}
