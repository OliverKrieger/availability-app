import { create } from "zustand";

export type AlertType = "info" | "success" | "warning" | "error";

export type AlertItem = {
    id: string;
    type: AlertType;
    title?: string;
    message: string;
    createdAt: number;
    ttlMs?: number; // auto-dismiss if set
};

export type ConfirmState = {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    tone?: AlertType; // controls styling (e.g., warning/error)
    onConfirm?: () => void;
};

type UIState = {
    alerts: AlertItem[];
    confirm: ConfirmState | null;

    pushAlert: (a: Omit<AlertItem, "id" | "createdAt">) => void;
    dismissAlert: (id: string) => void;
    clearAlerts: () => void;

    openConfirm: (c: Omit<ConfirmState, "isOpen">) => void;
    closeConfirm: () => void;
    confirmAccept: () => void;
};

export const useUIStore = create<UIState>((set, get) => ({
    alerts: [],
    confirm: null,

    pushAlert: (a) => {
        const id = crypto.randomUUID();
        const createdAt = Date.now();

        const item: AlertItem = { id, createdAt, ...a };

        set((s) => ({ alerts: [item, ...s.alerts].slice(0, 5) })); // keep last 5

        if (item.ttlMs && item.ttlMs > 0) {
            window.setTimeout(() => {
                // Safe: only dismiss if still present
                get().dismissAlert(id);
            }, item.ttlMs);
        }
    },

    dismissAlert: (id) =>
        set((s) => ({ alerts: s.alerts.filter((x) => x.id !== id) })),

    clearAlerts: () => set({ alerts: [] }),

    openConfirm: (c) =>
        set({
            confirm: { isOpen: true, ...c },
        }),

    closeConfirm: () => set({ confirm: null }),

    confirmAccept: () => {
        const c = get().confirm;
        set({ confirm: null });
        c?.onConfirm?.();
    },
}));
