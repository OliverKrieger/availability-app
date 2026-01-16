export function EntryPage() {
    return (
        <div className="space-y-3">
            <div>
                <h1 className="text-xl font-semibold tracking-tight">My Availability</h1>
                <p className="mt-1 text-sm text-zinc-400">
                    Choose a month, then click a day to mark your free times.
                </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4">
                <div className="text-sm text-zinc-200">Coming next:</div>
                <ul className="mt-2 list-disc pl-5 text-sm text-zinc-400">
                    <li>Month picker</li>
                    <li>Month grid</li>
                    <li>Day editor (all-day, ranges, evenings after 17:30)</li>
                    <li>Export JSON</li>
                </ul>
            </div>
        </div>
    );
}
