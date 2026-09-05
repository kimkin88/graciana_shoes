"use client";

import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";
import { Heart } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { categoryLabel } from "@/lib/catalog/categories";
import {
  discountPercent,
  parseSpecs,
  productGallery,
  productShortText,
  productTags,
  productVideos,
} from "@/lib/products/commerce";
import { productDescription, productTitle } from "@/lib/products/display";
import { productVideoSrc } from "@/lib/products/media";
import type { ProductRow } from "@/types";
import { Money } from "@/components/money/Money";
import { ProductBadge } from "@/components/product/ProductBadge";
import { ProductMediaGallery } from "@/components/product/ProductMediaGallery";
import { ProductGridMotion } from "@/components/motion/ProductGridMotion";
import { PageShell } from "@/components/layout/PageShell";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import { useI18nOptional } from "@/context/locale-context";
import { useToast } from "@/context/toast-context";

const Crumbs = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 8px;
  align-items: center;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 22px;
  a {
    color: inherit;
    transition: color 0.16s ease;
    &:hover {
      color: ${({ theme }) => theme.colors.text};
    }
  }
`;

const Sep = styled.span`
  opacity: 0.55;
`;

const Layout = styled.div`
  display: grid;
  gap: clamp(24px, 4vw, 56px);
  align-items: start;
  @media (min-width: 760px) {
    grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr);
  }
  @media (min-width: 1100px) {
    grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
  }
`;

const Info = styled.div`
  display: grid;
  gap: 16px;
  @media (min-width: 760px) {
    position: sticky;
    top: calc(var(--header-h, 72px) + 16px);
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(1.55rem, 3.2vw, 2.15rem);
  font-weight: 500;
  line-height: 1.15;
`;

const PriceRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 12px;
`;

const Price = styled.p`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const OldPrice = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: line-through;
  font-size: 1rem;
`;

const FieldLabel = styled.p`
  margin: 0 0 8px;
  font-size: 0.84rem;
  color: ${({ theme }) => theme.colors.text};
`;

const SizeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  align-items: center;
`;

const SizeBtn = styled.button<{ $active?: boolean }>`
  border: 0;
  background: transparent;
  min-width: 44px;
  min-height: 44px;
  padding: 8px 10px;
  font-size: 0.95rem;
  color: ${({ theme, $active }) => ($active ? theme.colors.text : theme.colors.textMuted)};
  text-decoration: ${({ $active }) => ($active ? "underline" : "none")};
  text-underline-offset: 4px;
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const BuyRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: stretch;
`;

const Qty = styled.div`
  display: inline-grid;
  grid-template-columns: 44px 48px 44px;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  min-height: 48px;
  background: ${({ theme }) => theme.colors.surface};
`;

const QtyBtn = styled.button`
  height: 100%;
  min-height: 48px;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 1.05rem;
  line-height: 1;
  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

const QtyVal = styled.span`
  text-align: center;
  font-size: 0.92rem;
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  min-height: 48px;
  display: grid;
  place-items: center;
`;

const CartBtn = styled.button`
  flex: 1;
  min-width: min(100%, 160px);
  min-height: 48px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease;
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.text};
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const PayLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
  border-bottom: 1px solid transparent;
  padding-bottom: 2px;
  transition: color 0.16s ease, border-color 0.16s ease;
  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-bottom-color: currentColor;
  }
`;

const Meta = styled.div`
  display: grid;
  gap: 8px;
  font-size: 0.86rem;
  color: ${({ theme }) => theme.colors.textMuted};
  a {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const FavBtn = styled.button<{ $on?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  min-height: 44px;
  border: 0;
  background: transparent;
  padding: 8px 0;
  color: ${({ theme, $on }) => ($on ? theme.colors.text : theme.colors.textMuted)};
  font-size: 0.86rem;
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Section = styled.section`
  margin-top: clamp(40px, 8vw, 72px);
`;

const SectionTitle = styled.h2`
  margin: 0 0 22px;
  font-size: clamp(1.35rem, 2.6vw, 1.85rem);
  font-weight: 500;
`;

type Related = {
  sameCollection: ProductRow[];
  sameCategory: ProductRow[];
  related: ProductRow[];
};

type Props = {
  locale: Locale;
  dict: Messages;
  product: ProductRow;
  related: Related;
};

export function ProductDetailView({ locale: localeProp, dict: dictProp, product, related }: Props) {
  const i18n = useI18nOptional();
  const locale = i18n?.locale ?? localeProp;
  const dict = i18n?.dict ?? dictProp;
  const title = productTitle(product, locale);
  const description = productDescription(product, locale);
  const shortText = productShortText(product, locale);
  const inStock = product.stock > 0;
  const sale = discountPercent(product);
  const tags = productTags(product);
  const specs = parseSpecs(product.specs);
  const images = productGallery(product);
  const category = categoryLabel(product.category, locale);
  const { addToCart, openDrawer } = useCart();
  const { has, toggle } = useFavorites();
  const toast = useToast();
  const loved = has(product.id);
  const [size, setSize] = useState(product.sizes?.[0] ?? null);
  const [qty, setQty] = useState(1);
  const maxQty = Math.min(99, Math.max(1, product.stock || 1));

  const cardDict = {
    addToCart: dict.products.addToCart,
    outOfStock: dict.products.outOfStock,
    newIn: dict.products.newBadge,
    sale: dict.products.sale,
    addedToCart: dict.products.addedToCart,
    favorite: dict.products.favorite,
    unfavorite: dict.products.unfavorite,
    inCart: dict.cart.inCart,
  };

  const interest =
    related.sameCollection.length > 0
      ? related.sameCollection
      : related.sameCategory.length > 0
        ? related.sameCategory
        : related.related;

  return (
    <PageShell width="wide">
      <Crumbs aria-label="Breadcrumb">
        <Link href={localizedPath("/", locale)}>{dict.product.home}</Link>
        <Sep>/</Sep>
        <Link href={localizedPath("/products", locale)}>{dict.nav.catalog}</Link>
        {category ? (
          <>
            <Sep>/</Sep>
            <Link
              href={`${localizedPath("/products", locale)}?category=${encodeURIComponent(product.category || "")}`}
            >
              {category}
            </Link>
          </>
        ) : null}
        <Sep>/</Sep>
        <span style={{ color: "var(--page-text)" }}>{title}</span>
      </Crumbs>

      <Layout>
        <ProductMediaGallery
          images={images}
          videos={productVideos(product)}
          videoUrl={productVideoSrc(product)}
          title={title}
          labels={{
            prev: dict.product.prevImage,
            next: dict.product.nextImage,
            expand: dict.product.expandImage,
          }}
        />

        <Info>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {sale ? <ProductBadge tone="sale">-{sale}%</ProductBadge> : null}
            {!inStock ? <ProductBadge tone="out">{dict.product.soldOut}</ProductBadge> : null}
          </div>

          <Title>{title}</Title>

          <PriceRow>
            {sale && product.compare_at_cents ? (
              <OldPrice>
                <Money cents={product.compare_at_cents} currency={product.currency} locale={locale} />
              </OldPrice>
            ) : null}
            <Price>
              <Money cents={product.price_cents} currency={product.currency} locale={locale} />
            </Price>
          </PriceRow>

          {shortText ? <p style={{ margin: 0, lineHeight: 1.6 }}>{shortText}</p> : null}

          {product.sizes?.length ? (
            <div>
              <FieldLabel>
                {dict.products.size}:
              </FieldLabel>
              <SizeRow>
                {product.sizes.map((item) => (
                  <SizeBtn
                    key={item}
                    type="button"
                    $active={size === item}
                    onClick={() => setSize(item)}
                  >
                    {item}
                  </SizeBtn>
                ))}
              </SizeRow>
            </div>
          ) : null}

          {product.colors?.length ? (
            <div>
              <FieldLabel>{dict.products.color}:</FieldLabel>
              <SizeRow>
                {product.colors.map((item) => (
                  <span key={item} style={{ fontSize: "0.95rem" }}>
                    {item}
                  </span>
                ))}
              </SizeRow>
            </div>
          ) : null}

          <BuyRow>
            {!inStock ? null : (
              <Qty>
                <QtyBtn
                  type="button"
                  aria-label="-"
                  disabled={qty <= 1}
                  onClick={() => setQty((v) => Math.max(1, v - 1))}
                >
                  −
                </QtyBtn>
                <QtyVal>{qty}</QtyVal>
                <QtyBtn
                  type="button"
                  aria-label="+"
                  disabled={qty >= maxQty}
                  onClick={() => setQty((v) => Math.min(maxQty, v + 1))}
                >
                  +
                </QtyBtn>
              </Qty>
            )}
            <CartBtn
              type="button"
              disabled={!inStock}
              onClick={() => {
                if (!inStock) return;
                addToCart(product.id, qty);
                toast({ title: dict.products.addedToCart });
                openDrawer();
              }}
            >
              {inStock ? dict.products.addToCart : dict.products.outOfStock}
            </CartBtn>
          </BuyRow>

          <PayLink href={localizedPath("/delivery-payment", locale)}>
            {dict.product.paymentDelivery}
          </PayLink>

          <Meta>
            {product.sku ? (
              <div>
                {dict.product.sku}: {product.sku}
              </div>
            ) : null}
            {category ? (
              <div>
                {dict.product.categories}:{" "}
                <Link
                  href={`${localizedPath("/products", locale)}?category=${encodeURIComponent(product.category || "")}`}
                >
                  {category}
                </Link>
                {tags.length
                  ? tags.slice(0, 2).map((tag) => (
                      <span key={tag}>
                        {", "}
                        {tag}
                      </span>
                    ))
                  : null}
              </div>
            ) : null}
            <div>
              {dict.product.stock}: {inStock ? product.stock : dict.product.soldOut}
            </div>
          </Meta>

          <FavBtn type="button" $on={loved} onClick={() => toggle(product.id)}>
            <Heart size={16} fill={loved ? "currentColor" : "none"} strokeWidth={1.6} />
            {loved ? dict.products.unfavorite : dict.products.favorite}
          </FavBtn>

          {description ? (
            <details open style={{ marginTop: 6 }}>
              <summary style={{ cursor: "pointer", fontSize: "0.95rem", fontWeight: 600 }}>
                {dict.product.description}
              </summary>
              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, margin: "12px 0 0" }}>{description}</p>
            </details>
          ) : null}

          {Object.keys(specs).length ? (
            <details>
              <summary style={{ cursor: "pointer", fontSize: "0.95rem", fontWeight: 600 }}>
                {dict.product.specs}
              </summary>
              <dl style={{ margin: "12px 0 0", display: "grid", gap: 8 }}>
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 12 }}>
                    <dt style={{ color: "var(--page-text-muted)", margin: 0 }}>{key}</dt>
                    <dd style={{ margin: 0 }}>{value}</dd>
                  </div>
                ))}
              </dl>
            </details>
          ) : null}
        </Info>
      </Layout>

      {interest.length ? (
        <Section>
          <SectionTitle>{dict.product.alsoInterested}</SectionTitle>
          <ProductGridMotion products={interest} locale={locale} cardDict={cardDict} />
        </Section>
      ) : null}
    </PageShell>
  );
}
