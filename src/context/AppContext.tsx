import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Storage, DEFAULT_SETTINGS, type AppSettings } from "../lib/storage";
import { formatNumber, formatDecimal } from "../lib/format";

interface ToastState {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface AppContextValue {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
  resolvedTheme: "light" | "dark";
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  recentTools: string[];
  addRecentTool: (id: string) => void;
  toast: ToastState | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  fmt: (value: number, decimals?: number) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => Storage.getSettings());
  const [favorites, setFavorites] = useState<string[]>(() => Storage.getFavorites());
  const [recentTools, setRecentTools] = useState<string[]>(() => Storage.getRecentTools());
  const [toast, setToast] = useState<ToastState | null>(null);
  const [systemDark, setSystemDark] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const resolvedTheme: "light" | "dark" = useMemo(() => {
    if (settings.theme === "auto") return systemDark ? "dark" : "light";
    return settings.theme;
  }, [settings.theme, systemDark]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      Storage.setSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    Storage.setSettings(DEFAULT_SETTINGS);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      Storage.setFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const addRecentTool = useCallback((id: string) => {
    setRecentTools((prev) => {
      const next = [id, ...prev.filter((t) => t !== id)].slice(0, 5);
      Storage.setRecentTools(next);
      return next;
    });
  }, []);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now();
    setToast({ id, message, type });
    window.setTimeout(() => {
      setToast((cur) => (cur && cur.id === id ? null : cur));
    }, 2600);
  }, []);

  const fmt = useCallback(
    (value: number, decimals = 0) => {
      return decimals > 0 ? formatDecimal(value, settings.numberFormat, decimals) : formatNumber(value, settings.numberFormat);
    },
    [settings.numberFormat]
  );

  const value: AppContextValue = {
    settings,
    updateSettings,
    resetSettings,
    resolvedTheme,
    favorites,
    toggleFavorite,
    isFavorite,
    recentTools,
    addRecentTool,
    toast,
    showToast,
    fmt,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
