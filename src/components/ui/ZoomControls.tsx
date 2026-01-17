type Props = {
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (next: number) => void;
    label?: string;
};

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

export function ZoomControls({
    value,
    min,
    max,
    step,
    onChange,
    label = "Zoom",
}: Props) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">{label}</span>

            <button
                type="button"
                className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-200 hover:bg-zinc-900 disabled:opacity-40"
                disabled={value <= min + 1e-9}
                onClick={() => onChange(clamp(Number((value - step).toFixed(4)), min, max))}
                aria-label="Zoom out"
            >
                −
            </button>

            <div className="w-12 text-center text-xs text-zinc-300 tabular-nums">
                {value.toFixed(2)}×
            </div>

            <button
                type="button"
                className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-200 hover:bg-zinc-900 disabled:opacity-40"
                disabled={value >= max - 1e-9}
                onClick={() => onChange(clamp(Number((value + step).toFixed(4)), min, max))}
                aria-label="Zoom in"
            >
                +
            </button>
        </div>
    );
}
