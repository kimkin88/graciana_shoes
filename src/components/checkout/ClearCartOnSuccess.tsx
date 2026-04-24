"use client";

import { useEffect } from "react";
import { useCart } from "@/context/cart-context";

/** Stripe returns to our success URL after payment — drop local cart to avoid stale lines. */
export function ClearCartOnSuccess() {
  const { clear, ready } = useCart();
  useEffect(() => {
    if (!ready) return;
    clear();
  }, [clear, ready]);
  return null;
}
