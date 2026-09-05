"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const KEY = "graciana-favorites-v1";

type FavoritesValue = {
  ids: string[];
  ready: boolean;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      setIds(Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : []);
    } catch {
      setIds([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [ids, ready]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback((id: string) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  const value = useMemo(() => ({ ids, ready, has, toggle }), [ids, ready, has, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
