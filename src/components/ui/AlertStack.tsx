import { useUIStore } from "../../stores/state/uiStore";

function alertClasses(type: string) {
    switch (type) {
        case "success":
            return "border-green-900/40 bg-green-950/25 text-green-50";
        case "warning":
            return "border-yellow-900/40 bg-yellow-950/25 text-yellow-50";
        case "error":
            return "border-red-900/40 bg-red-950/25 text-red-50";
        default:
            return "border-zinc-800 bg-zinc-900/30 text-zinc-100";
    }
}

export function AlertStack() {
    const alerts = useUIStore((s) => s.alerts);
    const dismiss = useUIStore((s) => s.dismissAlert);

    if (alerts.length === 0) return null;

    return (
        <div className="space-y-2 fixed top-4 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4">
            {alerts.map((a) => (
                <div
                    key={a.id}
                    className={[
                        "flex items-start justify-between gap-3 rounded-2xl border p-3",
                        alertClasses(a.type),
                    ].join(" ")}
                >
                    <div>
                        {a.title ? (
                            <div className="text-sm font-semibold">{a.title}</div>
                        ) : null}
                        <div className="text-sm opacity-90">{a.message}</div>
                    </div>

                    <button
                        type="button"
                        onClick={() => dismiss(a.id)}
                        className="cursor-pointer rounded-xl border border-white/10 bg-black/10 px-2 py-1 text-xs hover:bg-black/20"
                    >
                        Dismiss
                    </button>
                </div>
            ))}
        </div>
    );
}
