"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ProductRow } from "@/types";

type QuickViewContextValue = {
  product: ProductRow | null;
  open: (product: ProductRow) => void;
  close: () => void;
};

const QuickViewContext = createContext<QuickViewContextValue | null>(null);

export function ProductQuickViewProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<ProductRow | null>(null);

  useEffect(() => {
    if (!product) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setProduct(null);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [product]);

  const value = useMemo(
    () => ({
      product,
      open: (next: ProductRow) => {
        if (!next?.id || next.id === "preview") return;
        setProduct(next);
      },
      close: () => setProduct(null),
    }),
    [product],
  );

  return <QuickViewContext.Provider value={value}>{children}</QuickViewContext.Provider>;
}

export function useProductQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error("useProductQuickView must be used within ProductQuickViewProvider");
  return ctx;
}

export function useProductQuickViewOptional() {
  return useContext(QuickViewContext);
}
