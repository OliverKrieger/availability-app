import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DayAvailabilityOverride } from "../../components/availability/DayEditorModal";

type OverridesByDay = Record<string, DayAvailabilityOverride>; // key: YYYY-MM-DD

type AvailabilityState = {
    overrides: OverridesByDay;

    getOverride: (dayKey: string) => DayAvailabilityOverride;
    setOverride: (dayKey: string, next: DayAvailabilityOverride) => void;
    setOverridesBulk: (updates: Record<string, DayAvailabilityOverride>) => void;
    clearOverride: (dayKey: string) => void;
    clearMonth: (monthKey: string) => void;
    clearAll: () => void;
};

export const useAvailabilityStore = create<AvailabilityState>()(
    persist(
        (set, get) => ({
            overrides: {},

            getOverride: (dayKey) => get().overrides[dayKey] ?? { kind: "none" },

            setOverride: (dayKey, next) =>
                set((state) => {
                    const copy = { ...state.overrides };
                    if (next.kind === "none") delete copy[dayKey];
                    else copy[dayKey] = next;
                    return { overrides: copy };
                }),

            setOverridesBulk: (updates) =>
                set((state) => {
                    const copy = { ...state.overrides };

                    for (const [dayKey, next] of Object.entries(updates)) {
                        if (!next || next.kind === "none") delete copy[dayKey];
                        else copy[dayKey] = next;
                    }

                    return { overrides: copy };
                }),

            clearOverride: (dayKey) =>
                set((state) => {
                    const copy = { ...state.overrides };
                    delete copy[dayKey];
                    return { overrides: copy };
                }),

            clearMonth: (monthKey) =>
                set((state) => {
                    const copy = { ...state.overrides };
                    for (const k of Object.keys(copy)) {
                        if (k.startsWith(monthKey + "-")) delete copy[k];
                    }
                    return { overrides: copy };
                }),

            clearAll: () => set({ overrides: {} }),
        }),
        {
            name: "availability-app.overrides.v1", // localStorage key
            version: 1,
        }
    )
);
