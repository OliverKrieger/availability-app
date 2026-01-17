export type Tint = "busy" | "some" | "free";

export function entryTint(hasFree: boolean): Tint {
    return hasFree ? "free" : "busy";
}

export function aggregateTint(ratio: number): Tint {
    if (ratio <= 0) return "busy";     // red
    if (ratio >= 1) return "free";     // green
    return "some";                     // yellow
}

export function tintClass(tint: Tint, opts?: { dim?: boolean }) {

    // Dim = darker + less saturated, and also slightly lower contrast borders
    if (opts?.dim) {
        switch (tint) {
            case "busy":
                return "bg-red-950/35 border-red-950/40 hover:bg-red-950/40";
            case "some":
                return "bg-yellow-950/35 border-yellow-950/40 hover:bg-yellow-950/35";
            case "free":
                return "bg-green-950/35 border-green-950/40 hover:bg-green-950/35";
        }
    }

    // Normal (in-month)
    // Dark-mode friendly translucent overlays
    switch (tint) {
        case "busy":
            return "bg-red-950/60 border-red-900/70 hover:bg-red-950/70";
        case "some":
            return "bg-yellow-950/55 border-yellow-900/70 hover:bg-yellow-950/65";
        case "free":
            return "bg-green-950/55 border-green-900/70 hover:bg-green-950/65";
    }
}

export function badgeClass(tint: Tint) {
    switch (tint) {
        case "busy":
            return "border-red-900/70 bg-red-950/60 text-red-100";
        case "some":
            return "border-yellow-900/70 bg-yellow-950/55 text-yellow-100";
        case "free":
            return "border-green-900/70 bg-green-950/55 text-green-100";
    }
}
