"use client";

import styled from "styled-components";
import { Heart } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { productTitle } from "@/lib/products/display";
import { productVideoSrc } from "@/lib/products/media";
import { discountPercent, productHoverImage, productGallery } from "@/lib/products/commerce";
import type { ProductRow } from "@/types";
import { Card, CardBody, CardMedia } from "@/components/ui/Card";
import { ProductCardMedia } from "@/components/product/ProductCardMedia";
import { Money } from "@/components/money/Money";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import { useI18nOptional } from "@/context/locale-context";
import { useProductQuickViewOptional } from "@/context/product-quickview-context";
import { useToast } from "@/context/toast-context";

const Open = styled.button`
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
`;

const Fav = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: #fff;
  color: #111;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 1px 4px rgb(0 0 0 / 8%);
  transition: transform 0.18s ease;
  &:hover {
    transform: scale(1.05);
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const InCartPill = styled.span`
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 2;
  padding: 5px 8px;
  background: #111;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const Meta = styled.div`
  display: grid;
  gap: 10px;
  padding: 12px 0 0;
  align-content: start;
`;

const TitleBtn = styled.button`
  margin: 0;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.84rem;
  font-weight: 400;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.text};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: pointer;
  text-align: left;
  background: none;
  border: 0;
  padding: 0;
  width: 100%;
  min-height: 2.8em;
`;

const PriceRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
`;

const Price = styled.p`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.01em;
`;

const OldPrice = styled.p`
  margin: 0;
  font-size: 0.84rem;
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: line-through;
  font-weight: 400;
`;

const CartBtn = styled.button<{ $inCart?: boolean }>`
  width: 100%;
  margin-top: 2px;
  min-height: 44px;
  padding: 12px 14px;
  border: 1px solid ${({ theme, $inCart }) => ($inCart ? theme.colors.text : "transparent")};
  background: ${({ theme, $inCart }) => ($inCart ? "transparent" : theme.colors.buttonPrimaryBg)};
  color: ${({ theme, $inCart }) => ($inCart ? theme.colors.text : theme.colors.buttonPrimaryText)};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: none;
  cursor: pointer;
  transition: opacity 0.18s ease, background 0.18s ease, color 0.18s ease;
  &:hover:not(:disabled) {
    opacity: 0.88;
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

type Props = {
  product: ProductRow;
  locale: Locale;
  dict?: {
    addToCart: string;
    outOfStock: string;
    sale?: string;
    newIn?: string;
    addedToCart?: string;
    favorite?: string;
    unfavorite?: string;
    inCart?: string;
  };
  priority?: boolean;
  loud?: boolean;
};

/** WYSH-like card: media, heart, title, price, full-width add-to-cart / in-cart. */
export function ProductCard({ product, locale: localeProp, dict: dictProp, priority }: Props) {
  const i18n = useI18nOptional();
  const locale = i18n?.locale ?? localeProp;
  const dict = {
    addToCart: i18n?.dict.products.addToCart ?? dictProp?.addToCart ?? "Add to cart",
    outOfStock: i18n?.dict.products.outOfStock ?? dictProp?.outOfStock ?? "Out of stock",
    newIn: i18n?.dict.products.newBadge ?? dictProp?.newIn,
    sale: i18n?.dict.products.sale ?? dictProp?.sale,
    addedToCart: i18n?.dict.products.addedToCart ?? dictProp?.addedToCart,
    favorite: i18n?.dict.products.favorite ?? dictProp?.favorite,
    unfavorite: i18n?.dict.products.unfavorite ?? dictProp?.unfavorite,
    inCart: i18n?.dict.cart.inCart ?? dictProp?.inCart ?? "In cart",
  };
  const title = productTitle(product, locale);
  const images = productGallery(product);
  const sale = discountPercent(product);
  const { has, toggle } = useFavorites();
  const { addToCart, quantityOf, openDrawer } = useCart();
  const toast = useToast();
  const quick = useProductQuickViewOptional();
  const loved = has(product.id);
  const inStock = product.stock > 0;
  const qty = quantityOf(product.id);
  const inCart = qty > 0;

  function openCard() {
    quick?.open(product);
  }

  function onAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (!inStock) return;
    if (inCart) {
      openDrawer();
      return;
    }
    addToCart(product.id, 1);
    toast({ title: dict?.addedToCart ?? dict?.addToCart ?? "Added" });
    openDrawer();
  }

  const cartLabel = !inStock
    ? (dict?.outOfStock ?? "Out of stock")
    : inCart
      ? `${dict?.inCart ?? "In cart"}${qty > 1 ? ` · ${qty}` : ""}`
      : (dict?.addToCart ?? "Add to cart");

  return (
    <Card $plain>
      <CardMedia>
        <Open type="button" onClick={openCard} aria-label={title}>
          <ProductCardMedia
            imageUrl={images[0] ?? null}
            hoverImageUrl={productHoverImage(product)}
            videoUrl={productVideoSrc(product)}
            alt={title}
            sizes="(max-width: 700px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            priority={priority}
            zoom
          />
        </Open>
        {inCart ? <InCartPill>{dict?.inCart ?? "In cart"}</InCartPill> : null}
        <Fav
          type="button"
          aria-pressed={loved}
          aria-label={loved ? (dict?.unfavorite ?? "Remove from favorites") : (dict?.favorite ?? "Add to favorites")}
          onClick={() => toggle(product.id)}
        >
          <Heart size={15} fill={loved ? "currentColor" : "none"} strokeWidth={1.6} />
        </Fav>
      </CardMedia>
      <CardBody style={{ padding: 0 }}>
        <Meta>
          <TitleBtn type="button" onClick={openCard}>
            {title}
          </TitleBtn>
          <PriceRow>
            <Price>
              <Money cents={product.price_cents} currency={product.currency} locale={locale} />
            </Price>
            {sale && product.compare_at_cents ? (
              <OldPrice>
                <Money cents={product.compare_at_cents} currency={product.currency} locale={locale} />
              </OldPrice>
            ) : null}
          </PriceRow>
          <CartBtn type="button" disabled={!inStock} $inCart={inCart} onClick={onAdd}>
            {cartLabel}
          </CartBtn>
        </Meta>
      </CardBody>
    </Card>
  );
}
