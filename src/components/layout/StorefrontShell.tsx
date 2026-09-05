"use client";

import { ProductQuickViewProvider } from "@/context/product-quickview-context";
import { ProductQuickView } from "@/components/product/ProductQuickView";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FloatingCurrencyRail } from "@/components/layout/FloatingCurrencyRail";
import { useI18n } from "@/context/locale-context";

/** Locale shell that owns quick-view, cart drawer, and storefront overlays. */
export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const { locale, dict } = useI18n();

  return (
    <ProductQuickViewProvider>
      {children}
      <ProductQuickView locale={locale} dict={dict} />
      <CartDrawer locale={locale} dict={dict} />
      <FloatingCurrencyRail />
    </ProductQuickViewProvider>
  );
}
