export type Settings = {
    eveningStartMins: number; // e.g. 17:30 => 1050
};

export const DEFAULT_SETTINGS: Settings = {
    eveningStartMins: 17 * 60 + 30,
};
