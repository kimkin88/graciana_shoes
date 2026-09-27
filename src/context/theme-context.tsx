"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "graciana-theme";

function isThemeMode(value: string | undefined): value is ThemeMode {
  return value === "light" || value === "dark";
}

export function ThemeModeProvider({
  children,
  initialMode = "light",
}: {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  useEffect(() => {
    if (document.cookie.includes(`${STORAGE_KEY}=`)) return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && isThemeMode(stored) && stored !== mode) setMode(stored);
    } catch {
      /* ignore */
    }
    // Apply a saved theme only after hydration so the first paint matches the server.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
    document.cookie = `${STORAGE_KEY}=${mode}; Path=/; Max-Age=31536000; SameSite=Lax`;
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      toggleMode: () => setMode((current) => (current === "dark" ? "light" : "dark")),
      setMode,
    }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within ThemeModeProvider");
  }
  return context;
}
