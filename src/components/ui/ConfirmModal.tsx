import { useUIStore } from "../../stores/state/uiStore";

function toneClasses(tone?: string) {
    switch (tone) {
        case "error":
            return {
                header: "text-red-100",
                accept: "bg-red-200 text-red-950 hover:bg-red-100",
            };
        case "warning":
            return {
                header: "text-yellow-100",
                accept: "bg-yellow-200 text-yellow-950 hover:bg-yellow-100",
            };
        case "success":
            return {
                header: "text-green-100",
                accept: "bg-green-200 text-green-950 hover:bg-green-100",
            };
        default:
            return {
                header: "text-zinc-100",
                accept: "bg-zinc-100 text-zinc-950 hover:bg-white",
            };
    }
}

export function ConfirmModal() {
    const confirm = useUIStore((s) => s.confirm);
    const close = useUIStore((s) => s.closeConfirm);
    const accept = useUIStore((s) => s.confirmAccept);

    if (!confirm?.isOpen) return null;

    const t = toneClasses(confirm.tone);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close"
                onClick={close}
                className="absolute inset-0 bg-black/60"
            />

            {/* Dialog */}
            <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
                <div className="space-y-2">
                    <div className={["text-lg font-semibold", t.header].join(" ")}>
                        {confirm.title ?? "Confirm"}
                    </div>
                    <div className="text-sm text-zinc-300">{confirm.message}</div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={close}
                        className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                    >
                        {confirm.cancelText ?? "Cancel"}
                    </button>

                    <button
                        type="button"
                        onClick={accept}
                        className={["cursor-pointer rounded-xl px-4 py-2 text-sm font-medium", t.accept].join(" ")}
                    >
                        {confirm.confirmText ?? "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
}
