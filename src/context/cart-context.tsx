"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine } from "@/types";

const STORAGE_KEY = "graciana-cart-v1";

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  addToCart: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clear: () => void;
  totalQuantity: number;
  quantityOf: (productId: string) => number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (row): row is CartLine =>
          row &&
          typeof row === "object" &&
          "productId" in row &&
          "quantity" in row &&
          typeof (row as CartLine).productId === "string" &&
          typeof (row as CartLine).quantity === "number",
      )
      .map((row) => ({
        productId: row.productId,
        quantity: Math.max(1, Math.floor(row.quantity)),
      }));
  } catch {
    return [];
  }
}

/** Client-side cart persisted in localStorage + slide-over drawer state. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    /* Hydrate cart after mount — avoids SSR/client HTML mismatch for localStorage. */
    /* eslint-disable react-hooks/set-state-in-effect */
    setLines(readStorage());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore quota / private mode */
    }
  }, [lines, ready]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  const addToCart = useCallback((productId: string, quantity = 1) => {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.productId === productId);
      if (idx === -1) return [...prev, { productId, quantity }];
      const next = [...prev];
      next[idx] = {
        productId,
        quantity: next[idx].quantity + quantity,
      };
      return next;
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const q = Math.max(1, Math.floor(quantity));
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.productId === productId);
      if (idx === -1) return [...prev, { productId, quantity: q }];
      const next = [...prev];
      next[idx] = { productId, quantity: q };
      return next;
    });
  }, []);

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const totalQuantity = useMemo(
    () => lines.reduce((acc, l) => acc + l.quantity, 0),
    [lines],
  );

  const quantityOf = useCallback(
    (productId: string) => lines.find((l) => l.productId === productId)?.quantity ?? 0,
    [lines],
  );

  const value = useMemo(
    () => ({
      lines,
      ready,
      addToCart,
      setQuantity,
      removeLine,
      clear,
      totalQuantity,
      quantityOf,
      drawerOpen,
      openDrawer,
      closeDrawer,
    }),
    [
      lines,
      ready,
      addToCart,
      setQuantity,
      removeLine,
      clear,
      totalQuantity,
      quantityOf,
      drawerOpen,
      openDrawer,
      closeDrawer,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
