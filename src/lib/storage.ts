export type ThemeMode = "light" | "dark" | "auto";
export type NumberFormatMode = "fa" | "en";

export interface AppSettings {
  theme: ThemeMode;
  numberFormat: NumberFormatMode;
  currency: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  numberFormat: "fa",
  currency: "تومان",
};

const KEYS = {
  favorites: "favorites",
  recentTools: "recentTools",
  settings: "settings",
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export const Storage = {
  getFavorites(): string[] {
    return safeGet<string[]>(KEYS.favorites, []);
  },
  setFavorites(list: string[]) {
    safeSet(KEYS.favorites, list);
  },
  getRecentTools(): string[] {
    return safeGet<string[]>(KEYS.recentTools, []);
  },
  setRecentTools(list: string[]) {
    safeSet(KEYS.recentTools, list.slice(0, 5));
  },
  getSettings(): AppSettings {
    return { ...DEFAULT_SETTINGS, ...safeGet<Partial<AppSettings>>(KEYS.settings, {}) };
  },
  setSettings(settings: AppSettings) {
    safeSet(KEYS.settings, settings);
  },
};
