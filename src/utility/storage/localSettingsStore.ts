import { DEFAULT_LOCAL_SETTINGS, type LocalSettings } from "../../features/settings/model/types";

function generateId() {
    return crypto.randomUUID();
}

export function loadLocalSettings(): LocalSettings {
    try {
        const raw = localStorage.getItem("availability-app.settings.v1");
        if (!raw) {
            const initial = {
                ...DEFAULT_LOCAL_SETTINGS,
                user: { ...DEFAULT_LOCAL_SETTINGS.user, id: generateId() },
            };
            localStorage.setItem("availability-app.settings.v1", JSON.stringify(initial));
            return initial;
        }

        const parsed = JSON.parse(raw) as Partial<LocalSettings>;

        const fixed: LocalSettings = {
            schemaVersion: 1,
            user: {
                id: parsed.user?.id || generateId(),
                fullName: typeof parsed.user?.fullName === "string" ? parsed.user.fullName : "",
            },
            prefs: {
                eveningStartMins:
                    typeof parsed.prefs?.eveningStartMins === "number"
                        ? parsed.prefs.eveningStartMins
                        : DEFAULT_LOCAL_SETTINGS.prefs.eveningStartMins,
            },
        };

        localStorage.setItem("availability-app.settings.v1", JSON.stringify(fixed));
        return fixed;
    } catch {
        localStorage.removeItem("availability-app.settings.v1");
        return loadLocalSettings();
    }
}

export function saveLocalSettings(next: LocalSettings) {
    localStorage.setItem("availability-app.settings.v1", JSON.stringify(next));
}
