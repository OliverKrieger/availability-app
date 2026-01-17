import { useMemo, useState } from "react";
import { useLocalSettings } from "../components/core/LocalSettingsProvider";
import { hhmmToMins, minsToHHmm } from "../utility/lib/time";

function normalizeName(first: string, last: string) {
    const f = first.trim();
    const l = last.trim();
    return f && l ? `${f} ${l}` : "";
}

export function SettingsPage() {
    const { settings, updateSettings } = useLocalSettings();

    // Split existing name into first / last for editing
    const [first, setFirst] = useState(() => settings.user.fullName.split(" ")[0] ?? "");
    const [last, setLast] = useState(() =>
        settings.user.fullName.split(" ").slice(1).join(" ")
    );

    const fullName = useMemo(() => normalizeName(first, last), [first, last]);
    const canSaveName = fullName.length > 0 && fullName !== settings.user.fullName;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
                <p className="mt-1 text-sm text-zinc-400">
                    Personal details and availability defaults.
                </p>
            </div>

            {/* Username section */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4 space-y-3">
                <div>
                    <h2 className="text-sm font-medium text-zinc-200">Your name</h2>
                    <p className="text-xs text-zinc-400">
                        This is included in exported availability files.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className="text-xs text-zinc-400">First name</label>
                        <input
                            className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
                            value={first}
                            onChange={(e) => setFirst(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-xs text-zinc-400">Last name</label>
                        <input
                            className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
                            value={last}
                            onChange={(e) => setLast(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-zinc-500">
                        Current:{" "}
                        <span className="text-zinc-200">{settings.user.fullName}</span>
                    </div>

                    <button
                        type="button"
                        disabled={!canSaveName}
                        onClick={() =>
                            updateSettings((curr) => ({
                                ...curr,
                                user: { ...curr.user, fullName },
                            }))
                        }
                        className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-50"
                    >
                        Save name
                    </button>
                </div>
            </section>

            {/* Evening time section */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4 space-y-2">
                <div>
                    <h2 className="text-sm font-medium text-zinc-200">
                        Evening availability
                    </h2>
                    <p className="text-xs text-zinc-400">
                        Used when selecting “Evening free”.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="time"
                        className="w-40 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
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
                        Currently:{" "}
                        <span className="text-zinc-200">
                            {minsToHHmm(settings.prefs.eveningStartMins)}
                        </span>
                    </span>
                </div>
            </section>
        </div>
    );
}
