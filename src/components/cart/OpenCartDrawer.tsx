"use client";

import { useEffect } from "react";
import { useCart } from "@/context/cart-context";

/** Opens the cart drawer when visiting /cart. */
export function OpenCartDrawer() {
  const { openDrawer } = useCart();
  useEffect(() => {
    openDrawer();
  }, [openDrawer]);
  return null;
}
