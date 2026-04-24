"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/format/money";
import { productTitle } from "@/lib/products/display";
import type { Messages } from "@/i18n/get-dictionary";
import type { ProductRow } from "@/types";
import { useToast } from "@/context/toast-context";

type CartProduct = Pick<
  ProductRow,
  | "id"
  | "slug"
  | "name_ru"
  | "name_en"
  | "price_cents"
  | "currency"
  | "stock"
>;

const EMPTY_PRODUCT_MAP: Record<string, CartProduct> = {};

type Props = { locale: Locale; dict: Messages };

/** Hydrates line names/prices from the server using verified catalog data. */
export function CartView({ locale, dict }: Props) {
  const { lines, ready, setQuantity, removeLine, clear } = useCart();
  const [map, setMap] = useState<Record<string, CartProduct>>({});
  const [loading, setLoading] = useState(false);
  const reduceMotion = useReducedMotion();

  const idsKey = useMemo(
    () =>
      [...lines]
        .map((l) => l.productId)
        .sort()
        .join(","),
    [lines],
  );

  useEffect(() => {
    if (!ready || !lines.length) {
      return;
    }
    let cancelled = false;
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag for async fetch */
    setLoading(true);
    fetch("/api/products/for-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: lines.map((l) => l.productId) }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setMap(data as Record<string, CartProduct>);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lines, ready, idsKey]);

  const effectiveMap = lines.length === 0 ? EMPTY_PRODUCT_MAP : map;

  const total = useMemo(() => {
    let sum = 0;
    let currency = "usd";
    for (const line of lines) {
      const p = effectiveMap[line.productId];
      if (!p) continue;
      sum += p.price_cents * line.quantity;
      currency = p.currency;
    }
    return { sum, currency };
  }, [lines, effectiveMap]);

  if (!ready || (loading && lines.length > 0)) {
    return <p>{dict.common.loading}</p>;
  }

  if (!lines.length) {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? false : { opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <p>{dict.cart.empty}</p>
        <Link href={localizedPath("/products", locale)}>{dict.cart.continue}</Link>
      </motion.div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {lines.map((line) => {
        const p = effectiveMap[line.productId];
        if (!p) {
          return (
            <motion.div
              key={line.productId}
              layout={!reduceMotion}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={reduceMotion ? false : { opacity: 1 }}
            >
              {dict.common.error}{" "}
              <Button type="button" $variant="ghost" onClick={() => removeLine(line.productId)}>
                {dict.cart.remove}
              </Button>
            </motion.div>
          );
        }
        const title = productTitle(p as ProductRow, locale);
        const href = localizedPath(`/products/${p.slug}`, locale);
        return (
          <motion.div
            key={line.productId}
            layout={!reduceMotion}
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
            animate={reduceMotion ? false : { opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: 12,
            }}
          >
            <div style={{ flex: "1 1 200px" }}>
              <Link href={href}>{title}</Link>
              <div style={{ fontSize: "0.85rem", color: "inherit" }}>
                {formatMoney(p.price_cents, p.currency, locale)} {dict.cart.each}
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="sr-only">qty</span>
              <input
                type="number"
                min={1}
                max={p.stock}
                value={line.quantity}
                onChange={(e) =>
                  setQuantity(line.productId, Number(e.target.value))
                }
                style={{ width: 72, padding: 6 }}
              />
            </label>
            <Button type="button" $variant="ghost" onClick={() => removeLine(line.productId)}>
              {dict.cart.remove}
            </Button>
          </motion.div>
        );
      })}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>
          {dict.cart.total}: {formatMoney(total.sum, total.currency, locale)}
        </strong>
        <div style={{ display: "flex", gap: 8 }}>
          <Button type="button" $variant="ghost" onClick={clear}>
            {dict.cart.clearAll}
          </Button>
          <CheckoutButton locale={locale} dict={dict} lines={lines} />
        </div>
      </div>
    </div>
  );
}

function CheckoutButton({
  locale,
  dict,
  lines,
}: {
  locale: Locale;
  dict: Messages;
  lines: { productId: string; quantity: number }[];
}) {
  const [pending, setPending] = useState(false);
  const toast = useToast();

  return (
    <Button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locale, items: lines }),
          });
          const data = (await res.json()) as { url?: string; error?: string };
          if (!res.ok) {
            const stock = res.status === 409 || data.error === "stock";
            toast({
              variant: "error",
              title: dict.toast.checkoutFailed,
              description: stock
                ? dict.toast.checkoutStock
                : dict.toast.checkoutGeneric,
            });
            return;
          }
          if (data.url) window.location.href = data.url;
        } catch {
          toast({
            variant: "error",
            title: dict.toast.checkoutFailed,
            description: dict.toast.checkoutGeneric,
          });
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? dict.common.loading : dict.cart.checkout}
    </Button>
  );
}
