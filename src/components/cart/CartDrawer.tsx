"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { useCart } from "@/context/cart-context";
import { useCurrency } from "@/context/currency-context";
import { useToast } from "@/context/toast-context";
import { productTitle } from "@/lib/products/display";
import { productCardImage } from "@/lib/products/media";
import { AppScrollArea } from "@/components/ui/ScrollArea";
import type { ProductRow } from "@/types";

type CartProduct = Pick<
  ProductRow,
  | "id"
  | "slug"
  | "name_ru"
  | "name_en"
  | "price_cents"
  | "currency"
  | "stock"
  | "image_url"
  | "image_optimized_path"
  | "updated_at"
  | "colors"
  | "sizes"
  | "sku"
  | "manufacturer"
  | "specs"
> & { active?: boolean };

const Overlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgb(0 0 0 / 36%);
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition: opacity 0.28s ease;
`;

const Panel = styled.aside<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  z-index: 91;
  width: min(420px, 100%);
  height: 100dvh;
  max-height: 100dvh;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  transform: translateX(${({ $open }) => ($open ? "0" : "104%")});
  transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
`;

const Head = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  @media (min-width: 760px) {
    padding: 20px 22px 16px;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

const CloseBtn = styled.button`
  width: 44px;
  height: 44px;
  border: 0;
  background: transparent;
  color: inherit;
  display: grid;
  place-items: center;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radii.md};
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
`;

const Body = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Empty = styled.div`
  padding: 28px 22px;
  display: grid;
  gap: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Line = styled.div`
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  @media (min-width: 760px) {
    padding: 14px 22px;
  }
`;

const Thumb = styled(Link)`
  width: 72px;
  height: 72px;
  background: color-mix(in srgb, ${({ theme }) => theme.colors.text} 5%, ${({ theme }) => theme.colors.surface});
  overflow: hidden;
  display: grid;
  place-items: center;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const Meta = styled.div`
  min-width: 0;
  display: grid;
  gap: 4px;
  align-content: start;
`;

const Name = styled(Link)`
  font-size: 0.88rem;
  line-height: 1.35;
  color: inherit;
  &:hover {
    opacity: 0.7;
  }
`;

const Detail = styled.p`
  margin: 0;
  font-size: 0.72rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Side = styled.div`
  display: grid;
  gap: 8px;
  justify-items: end;
  align-content: start;
`;

const Price = styled.p`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
`;

const Remove = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: inherit;
  display: grid;
  place-items: center;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
`;

const Foot = styled.div`
  flex: 0 0 auto;
  padding: 16px 16px calc(16px + env(safe-area-inset-bottom));
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: grid;
  gap: 14px;
  @media (min-width: 760px) {
    padding: 16px 22px 22px;
  }
`;

const SumRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.95rem;
  font-weight: 600;
`;

const OrderBtn = styled.button`
  width: 100%;
  min-height: 48px;
  border: 0;
  background: ${({ theme }) => theme.colors.buttonPrimaryBg};
  color: ${({ theme }) => theme.colors.buttonPrimaryText};
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    opacity: 0.9;
  }
`;

function metaLines(p: CartProduct, locale: Locale, dict: Messages) {
  const lines: string[] = [];
  const specs = p.specs ?? {};
  const material = specs.Material || specs.material || specs.Материал;
  if (material) lines.push(`${locale === "ru" ? "Материал" : "Material"}: ${material}`);
  if (p.sizes?.[0]) lines.push(`${dict.products.size}: ${p.sizes[0]}`);
  const season = specs.Season || specs.season || specs.Сезон;
  if (season) lines.push(`${locale === "ru" ? "Сезон" : "Season"}: ${season}`);
  if (p.manufacturer) {
    lines.push(`${locale === "ru" ? "Страна" : "Country"}: ${p.manufacturer}`);
  }
  if (p.colors?.[0]) lines.push(`${dict.products.color}: ${p.colors[0]}`);
  if (p.sku) lines.push(`${locale === "ru" ? "Артикул" : "SKU"}: ${p.sku}`);
  return lines;
}

/** WYSH-style right cart drawer driven by cart context. */
export function CartDrawer({ locale, dict }: { locale: Locale; dict: Messages }) {
  const { lines, ready, drawerOpen, closeDrawer, removeLine } = useCart();
  const { convert, displayCurrency, format } = useCurrency();
  const toast = useToast();
  const [map, setMap] = useState<Record<string, CartProduct>>({});
  const [hydrated, setHydrated] = useState(false);
  const [pending, setPending] = useState(false);

  const idsKey = useMemo(
    () =>
      [...lines]
        .map((l) => l.productId)
        .sort()
        .join(","),
    [lines],
  );

  useEffect(() => {
    if (!ready) return;
    if (!lines.length) {
      setMap({});
      setHydrated(true);
      return;
    }
    let cancelled = false;
    setHydrated(false);
    fetch("/api/products/for-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: lines.map((l) => l.productId) }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setMap(data as Record<string, CartProduct>);
        setHydrated(true);
      })
      .catch(() => {
        if (cancelled) return;
        setMap({});
        setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [lines, ready, idsKey]);

  const hasUnavailable = useMemo(() => {
    if (!hydrated) return false;
    return lines.some((line) => {
      const p = map[line.productId];
      return !p || p.active === false;
    });
  }, [hydrated, lines, map]);

  const total = useMemo(() => {
    let sum = 0;
    for (const line of lines) {
      const p = map[line.productId];
      if (!p || p.active === false) continue;
      sum += convert(p.price_cents * line.quantity, p.currency);
    }
    return sum;
  }, [lines, map, convert]);

  async function checkout() {
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
        const unavailable =
          data.error === "inactive" ||
          data.error === "unknown" ||
          data.error === "products" ||
          data.error === "price";
        toast({
          variant: "error",
          title: dict.toast.checkoutFailed,
          description: stock
            ? dict.toast.checkoutStock
            : unavailable
              ? dict.toast.checkoutUnavailable
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
  }

  return (
    <>
      <Overlay $open={drawerOpen} onClick={closeDrawer} aria-hidden={!drawerOpen} />
      <Panel $open={drawerOpen} aria-hidden={!drawerOpen} role="dialog" aria-label={dict.cart.yourOrder}>
        <Head>
          <Title>{dict.cart.yourOrder}</Title>
          <CloseBtn type="button" aria-label={dict.common.closeMenu} onClick={closeDrawer}>
            <X size={18} strokeWidth={1.5} />
          </CloseBtn>
        </Head>
        <Body>
          <AppScrollArea style={{ flex: 1, minHeight: 0, height: "100%" }}>
            {!lines.length ? (
              <Empty>
                <p style={{ margin: 0 }}>{dict.cart.empty}</p>
                <Link href={localizedPath("/products", locale)} onClick={closeDrawer}>
                  {dict.cart.continue}
                </Link>
              </Empty>
            ) : (
              lines.map((line) => {
                const p = map[line.productId];
                if (!hydrated && !p) {
                  return (
                    <Line key={line.productId}>
                      <div />
                      <Meta>
                        <Detail>{dict.common.loading}</Detail>
                      </Meta>
                      <Side>
                        <Remove type="button" aria-label={dict.cart.remove} onClick={() => removeLine(line.productId)}>
                          <X size={12} strokeWidth={1.8} />
                        </Remove>
                      </Side>
                    </Line>
                  );
                }
                if (!p || p.active === false) {
                  return (
                    <Line key={line.productId}>
                      <div
                        style={{
                          width: 72,
                          height: 72,
                          background: "color-mix(in srgb, currentColor 6%, transparent)",
                        }}
                      />
                      <Meta>
                        <Detail style={{ fontWeight: 600, color: "inherit" }}>{dict.cart.unavailable}</Detail>
                        <Detail>{p ? productTitle(p as ProductRow, locale) : line.productId.slice(0, 8)}</Detail>
                        <Detail>{dict.cart.unavailableHint}</Detail>
                      </Meta>
                      <Side>
                        <Remove type="button" aria-label={dict.cart.remove} onClick={() => removeLine(line.productId)}>
                          <X size={12} strokeWidth={1.8} />
                        </Remove>
                      </Side>
                    </Line>
                  );
                }
                const href = localizedPath(`/products/${p.slug}`, locale);
                const img = productCardImage(p);
                const details = metaLines(p, locale, dict);
                return (
                  <Line key={line.productId}>
                    <Thumb href={href} onClick={closeDrawer}>
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" />
                      ) : null}
                    </Thumb>
                    <Meta>
                      <Name href={href} onClick={closeDrawer}>
                        {productTitle(p as ProductRow, locale)}
                      </Name>
                      {details.map((d) => (
                        <Detail key={d}>{d}</Detail>
                      ))}
                      {line.quantity > 1 ? (
                        <Detail>
                          {dict.cart.qty}: {line.quantity}
                        </Detail>
                      ) : null}
                    </Meta>
                    <Side>
                      <Price>{format(p.price_cents * line.quantity, p.currency, locale)}</Price>
                      <Remove type="button" aria-label={dict.cart.remove} onClick={() => removeLine(line.productId)}>
                        <X size={12} strokeWidth={1.8} />
                      </Remove>
                    </Side>
                  </Line>
                );
              })
            )}
          </AppScrollArea>
        </Body>
        {lines.length ? (
          <Foot>
            <SumRow>
              <span>{dict.cart.total}</span>
              <span>{format(total, displayCurrency, locale)}</span>
            </SumRow>
            <OrderBtn type="button" disabled={pending || hasUnavailable || !hydrated} onClick={checkout}>
              {pending ? dict.common.loading : dict.cart.checkout}
            </OrderBtn>
          </Foot>
        ) : null}
      </Panel>
    </>
  );
}
