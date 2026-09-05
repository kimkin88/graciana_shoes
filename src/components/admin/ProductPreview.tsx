"use client";

import styled from "styled-components";
import type { Locale } from "@/i18n/config";
import type { ProductRow } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";
import { Money } from "@/components/money/Money";
import { categoryLabel } from "@/lib/catalog/categories";
import { discountPercent, productShortText } from "@/lib/products/commerce";
import { productTitle } from "@/lib/products/display";

const Frame = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 16px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
`;

const Tab = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.text};
  background: ${({ theme, $active }) => ($active ? theme.colors.text : "transparent")};
  color: ${({ theme, $active }) => ($active ? theme.colors.background : theme.colors.text)};
  padding: 8px 12px;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
`;

type Draft = {
  name_ru: string;
  name_en: string;
  slug: string;
  category: string;
  price_cents: number;
  compare_at_cents: number | null;
  currency: string;
  stock: number;
  active: boolean;
  featured: boolean;
  image_url: string | null;
  short_description_ru: string;
  short_description_en: string;
  description_ru: string;
  description_en: string;
  tags: string[];
  colors: string[];
  sizes: string[];
  sku: string;
  gallery?: string[];
};

type Props = {
  locale: Locale;
  mode: "card" | "page";
  onModeChange: (mode: "card" | "page") => void;
  labels: { preview: string; card: string; page: string; outOfStock: string; addToCart: string };
  draft: Draft;
};

function asProduct(draft: Draft): ProductRow {
  const cover = draft.image_url;
  const extras = (draft.gallery ?? []).filter((url) => url && url !== cover);
  return {
    id: "preview",
    slug: draft.slug || "preview",
    name_ru: draft.name_ru || "Название",
    name_en: draft.name_en || "Title",
    description_ru: draft.description_ru || null,
    description_en: draft.description_en || null,
    short_description_ru: draft.short_description_ru || null,
    short_description_en: draft.short_description_en || null,
    price_cents: Number.isFinite(draft.price_cents) ? draft.price_cents : 0,
    compare_at_cents: draft.compare_at_cents,
    currency: draft.currency || "byn",
    sku: draft.sku || null,
    image_url: cover,
    video_url: null,
    category: draft.category || null,
    group_key: null,
    tags: draft.tags,
    colors: draft.colors,
    sizes: draft.sizes,
    featured: draft.featured,
    active: draft.active,
    stock: draft.stock,
    gallery: extras.map((url) => ({ url })),
    specs: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function ProductPreview({ locale, mode, onModeChange, labels, draft }: Props) {
  const product = asProduct(draft);
  const title = productTitle(product, locale);
  const short = productShortText(product, locale);
  const sale = discountPercent(product);

  return (
    <Frame>
      <div style={{ marginBottom: 8, fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
        {labels.preview}
      </div>
      <Tabs>
        <Tab type="button" $active={mode === "card"} onClick={() => onModeChange("card")}>
          {labels.card}
        </Tab>
        <Tab type="button" $active={mode === "page"} onClick={() => onModeChange("page")}>
          {labels.page}
        </Tab>
      </Tabs>
      {mode === "card" ? (
        <div style={{ maxWidth: 260 }}>
          <ProductCard
            product={product}
            locale={locale}
            dict={{ addToCart: labels.addToCart, outOfStock: labels.outOfStock }}
          />
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={title}
              style={{ width: "100%", aspectRatio: "4 / 5", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div style={{ aspectRatio: "4 / 5", background: "var(--page-text-muted, #ddd)" }} />
          )}
          <div style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            {categoryLabel(product.category, locale) || "GRACIANA"}
          </div>
          <h3 style={{ margin: 0, fontSize: "1.4rem" }}>{title}</h3>
          <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
            <strong>
              <Money cents={product.price_cents} currency={product.currency} locale={locale} />
            </strong>
            {sale && product.compare_at_cents ? (
              <span style={{ textDecoration: "line-through", opacity: 0.65 }}>
                <Money cents={product.compare_at_cents} currency={product.currency} locale={locale} />
              </span>
            ) : null}
          </div>
          {product.tags?.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {product.tags.map((tag) => (
                <span key={tag} style={{ fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          {short ? <p style={{ margin: 0, lineHeight: 1.5 }}>{short}</p> : null}
          <p style={{ margin: 0, fontSize: "0.85rem" }}>
            {product.stock > 0 ? product.stock : labels.outOfStock}
          </p>
        </div>
      )}
    </Frame>
  );
}
