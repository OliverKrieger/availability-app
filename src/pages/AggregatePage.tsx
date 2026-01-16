export function AggregatePage() {
    return (
        <div className="space-y-3">
            <div>
                <h1 className="text-xl font-semibold tracking-tight">Aggregate</h1>
                <p className="mt-1 text-sm text-zinc-400">
                    Import multiple exported files and compare overlap across a month.
                </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4">
                <div className="text-sm text-zinc-200">Coming next:</div>
                <ul className="mt-2 list-disc pl-5 text-sm text-zinc-400">
                    <li>Import panel (multiple JSON files)</li>
                    <li>People list (include/exclude)</li>
                    <li>Month heatmap (overlap strength)</li>
                    <li>Day timeline (who is free when)</li>
                </ul>
            </div>
        </div>
    );
}
