import { useMemo, useState } from "react";
import { useLocalSettings } from "../components/core/LocalSettingsProvider";

function normalizeName(first: string, last: string) {
    const f = first.trim();
    const l = last.trim();
    return f && l ? `${f} ${l}` : "";
}

export function OnboardingPage() {
    const { updateSettings } = useLocalSettings();

    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");

    const fullName = useMemo(() => normalizeName(first, last), [first, last]);
    const canSave = fullName.length > 0;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                <h1 className="text-xl font-semibold tracking-tight">Welcome</h1>
                <p className="mt-1 text-sm text-zinc-400">
                    Please add your <span className="text-zinc-200">First</span> and{" "}
                    <span className="text-zinc-200">Last</span> name.
                </p>

                <div className="mt-5 space-y-3">
                    <input
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                        placeholder="First name"
                        value={first}
                        onChange={(e) => setFirst(e.target.value)}
                    />
                    <input
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                        placeholder="Last name"
                        value={last}
                        onChange={(e) => setLast(e.target.value)}
                    />

                    <button
                        type="button"
                        disabled={!canSave}
                        onClick={() =>
                            updateSettings((curr) => ({
                                ...curr,
                                user: { ...curr.user, fullName },
                            }))
                        }
                        className="mt-2 w-full rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-50"
                    >
                        Save & continue
                    </button>
                </div>
            </div>
        </div>
    );
}
