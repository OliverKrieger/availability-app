export type LocalSettings = {
    schemaVersion: 1;
    user: {
        id: string;       // generated once
        fullName: string; // REQUIRED
    };
    prefs: {
        eveningStartMins: number; // e.g. 17:30 = 1050
    };
};

export const DEFAULT_LOCAL_SETTINGS: LocalSettings = {
    schemaVersion: 1,
    user: {
        id: "",
        fullName: "",
    },
    prefs: {
        eveningStartMins: 17 * 60 + 30,
    },
};

export const STORAGE_KEY = "availability-app.settings.v1";
