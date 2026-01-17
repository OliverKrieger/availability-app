import React, { createContext, useContext, useMemo, useState } from "react";
import { loadLocalSettings, saveLocalSettings } from "../../utility/storage/localSettingsStore";
import type { LocalSettings } from "../../features/settings/model/types";

type LocalSettingsContextValue = {
    settings: LocalSettings;
    updateSettings: (updater: (curr: LocalSettings) => LocalSettings) => void;
};

const LocalSettingsContext = createContext<LocalSettingsContextValue | null>(null);

export function useLocalSettings() {
    const ctx = useContext(LocalSettingsContext);
    if (!ctx) throw new Error("useLocalSettings must be used within LocalSettingsProvider");
    return ctx;
}

export function LocalSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<LocalSettings>(() => loadLocalSettings());

    const updateSettings = (updater: (curr: LocalSettings) => LocalSettings) => {
        setSettings((curr) => {
            const next = updater(curr);
            saveLocalSettings(next);
            return next;
        });
    };

    const value = useMemo(() => ({ settings, updateSettings }), [settings]);

    return <LocalSettingsContext.Provider value={value}>{children}</LocalSettingsContext.Provider>;
}
