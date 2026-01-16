export function SettingsPage() {
    return (
        <div className="space-y-3">
            <div>
                <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
                <p className="mt-1 text-sm text-zinc-400">
                    Defaults like evening start time, workdays, and display preferences.
                </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 text-sm text-zinc-400">
                Placeholder — we’ll add:
                <ul className="mt-2 list-disc pl-5">
                    <li>Evening starts at (default 17:30)</li>
                    <li>Workdays (Mon–Fri)</li>
                    <li>Start of week (Mon/Sun)</li>
                    <li>24h vs 12h time</li>
                </ul>
            </div>
        </div>
    );
}
