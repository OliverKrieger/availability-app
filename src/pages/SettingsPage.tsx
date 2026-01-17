import { useLocalSettings } from "../components/core/LocalSettingsProvider";
import { hhmmToMins, minsToHHmm } from "../utility/lib/time";

export function SettingsPage() {
    const { settings, updateSettings } = useLocalSettings();

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold tracking-tight">Settings</h1>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4">
                <label className="text-xs text-zinc-400">Workday end time (Evening starts)</label>

                <div className="mt-2 flex items-center gap-3">
                    <input
                        type="time"
                        className="w-40 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                        value={minsToHHmm(settings.prefs.eveningStartMins)}
                        onChange={(e) => {
                            const mins = hhmmToMins(e.target.value);
                            if (mins == null) return;
                            updateSettings((curr) => ({
                                ...curr,
                                prefs: { ...curr.prefs, eveningStartMins: mins },
                            }));
                        }}
                    />

                    <span className="text-sm text-zinc-400">
                        Current: <span className="text-zinc-200">{minsToHHmm(settings.prefs.eveningStartMins)}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
