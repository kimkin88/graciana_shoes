"use client";

import { useEffect } from "react";

const KEY = "graciana-recent-product-ids";

export function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      const next = [productId, ...parsed.filter((id) => id !== productId)].slice(0, 12);
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // ignore storage issues
    }
  }, [productId]);

  return null;
}
