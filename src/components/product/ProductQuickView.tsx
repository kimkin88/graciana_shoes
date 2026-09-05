"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cross1Icon } from "@radix-ui/react-icons";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { categoryLabel } from "@/lib/catalog/categories";
import {
  discountPercent,
  productGallery,
  productShortText,
  productTags,
} from "@/lib/products/commerce";
import { productTitle } from "@/lib/products/display";
import { Money } from "@/components/money/Money";
import { ProductBadge } from "@/components/product/ProductBadge";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import { AppScrollArea, HorizontalScroll } from "@/components/ui/ScrollArea";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import { useProductQuickView } from "@/context/product-quickview-context";
import { useToast } from "@/context/toast-context";
import { Heart } from "lucide-react";

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 70;
  background: rgb(0 0 0 / 42%);
`;

const Sheet = styled(motion.aside)`
  position: fixed;
  z-index: 71;
  inset: auto 0 0;
  max-height: min(92dvh, 820px);
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  box-shadow: 0 -18px 40px rgb(0 0 0 / 18%);
  will-change: transform, opacity;
  padding-bottom: env(safe-area-inset-bottom);
  @media (min-width: 860px) {
    inset: 0 0 0 auto;
    width: min(440px, 100%);
    max-height: none;
    height: 100%;
    box-shadow: -18px 0 40px rgb(0 0 0 / 14%);
    padding-bottom: 0;
  }
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Body = styled.div`
  padding: 16px;
  display: grid;
  gap: 14px;
`;

const Foot = styled.div`
  padding: 14px 16px calc(14px + env(safe-area-inset-bottom));
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: grid;
  gap: 10px;
`;

const Gallery = styled.div`
  display: grid;
  gap: 8px;
  justify-items: center;
`;

const Main = styled.div`
  position: relative;
  width: min(100%, 320px);
  aspect-ratio: 3 / 4;
  margin-inline: auto;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.accent};
  @media (min-width: 860px) {
    width: min(100%, 240px);
  }
`;

const Thumb = styled.button<{ $active?: boolean }>`
  width: 52px;
  height: 64px;
  flex: 0 0 52px;
  padding: 0;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.text : theme.colors.border)};
  background: transparent;
  cursor: pointer;
  position: relative;
  overflow: hidden;
`;

const Title = styled.h2`
  margin: 0;
  font-size: clamp(1.25rem, 2.8vw, 1.65rem);
  font-weight: 500;
`;

const Meta = styled.p`
  margin: 0;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const PriceRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 10px;
`;

const Price = styled.p`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
`;

const Old = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: line-through;
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button<{ $active?: boolean }>`
  min-width: 44px;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.text};
  background: ${({ theme, $active }) => ($active ? theme.colors.text : "transparent")};
  color: ${({ theme, $active }) => ($active ? theme.colors.background : theme.colors.text)};
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  cursor: pointer;
`;

const Label = styled.p`
  margin: 0 0 8px;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const Cta = styled.button`
  width: 100%;
  min-height: 48px;
  border: 1px solid ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.background};
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 600;
  cursor: pointer;
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const Ghost = styled(Link)`
  display: inline-flex;
  justify-content: center;
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

const IconBtn = styled.button`
  width: 40px;
  height: 40px;
  border: 0;
  background: transparent;
  color: inherit;
  display: grid;
  place-items: center;
  cursor: pointer;
`;

type Props = {
  locale: Locale;
  dict: Messages;
};

export function ProductQuickView({ locale, dict }: Props) {
  const { product, close } = useProductQuickView();
  const reduceMotion = useReducedMotion();
  const { addToCart, openDrawer } = useCart();
  const { has, toggle } = useFavorites();
  const toast = useToast();
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 860px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!product) return;
    setImageIndex(0);
    setSize(product.sizes?.[0] ?? null);
    setColor(product.colors?.[0] ?? null);
    setAdded(false);
  }, [product?.id]);

  const sheetTransition = reduceMotion
    ? { duration: 0.01 }
    : { type: "spring" as const, stiffness: 380, damping: 34, mass: 0.85 };
  const fadeTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <AnimatePresence>
      {product ? (
        <>
          <Backdrop
            key="qv-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
            onClick={close}
            aria-hidden
          />
          <Sheet
            key="qv-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={productTitle(product, locale)}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : isDesktop
                  ? { x: "100%", opacity: 0.85 }
                  : { y: "110%", opacity: 0.9 }
            }
            animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : isDesktop
                  ? { x: "100%", opacity: 0.85 }
                  : { y: "110%", opacity: 0.9 }
            }
            transition={sheetTransition}
          >
            <QuickViewContent
              product={product}
              locale={locale}
              dict={dict}
              imageIndex={imageIndex}
              setImageIndex={setImageIndex}
              size={size}
              setSize={setSize}
              color={color}
              setColor={setColor}
              added={added}
              setAdded={setAdded}
              close={close}
              addToCart={addToCart}
              openDrawer={openDrawer}
              toast={toast}
              has={has}
              toggle={toggle}
            />
          </Sheet>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function QuickViewContent({
  product,
  locale,
  dict,
  imageIndex,
  setImageIndex,
  size,
  setSize,
  color,
  setColor,
  added,
  setAdded,
  close,
  addToCart,
  openDrawer,
  toast,
  has,
  toggle,
}: {
  product: NonNullable<ReturnType<typeof useProductQuickView>["product"]>;
  locale: Locale;
  dict: Messages;
  imageIndex: number;
  setImageIndex: (n: number) => void;
  size: string | null;
  setSize: (v: string | null) => void;
  color: string | null;
  setColor: (v: string | null) => void;
  added: boolean;
  setAdded: (v: boolean) => void;
  close: () => void;
  addToCart: (id: string, qty: number) => void;
  openDrawer: () => void;
  toast: (opts: { title: string }) => void;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
}) {
  const title = productTitle(product, locale);
  const images = productGallery(product);
  const sale = discountPercent(product);
  const inStock = product.stock > 0;
  const short = productShortText(product, locale);
  const tags = productTags(product);
  const href = localizedPath(`/products/${product.slug}`, locale);
  const loved = has(product.id);
  const current = images[imageIndex] ?? images[0] ?? null;

  return (
    <>
      <Head>
        <Meta>{dict.products.quickView}</Meta>
        <div style={{ display: "flex", gap: 4 }}>
          <IconBtn
            type="button"
            aria-pressed={loved}
            aria-label={loved ? dict.products.unfavorite : dict.products.favorite}
            onClick={() => toggle(product.id)}
          >
            <Heart size={18} fill={loved ? "currentColor" : "none"} />
          </IconBtn>
          <IconBtn type="button" aria-label={dict.common.closeMenu} onClick={close}>
            <Cross1Icon />
          </IconBtn>
        </div>
      </Head>

      <AppScrollArea style={{ minHeight: 0, height: "100%" }}>
        <Body>
          <Gallery>
            <Main>
              {current ? (
                <OptimizedImage src={current} alt={title} sizes="(max-width: 860px) 80vw, 240px" objectFit="contain" />
              ) : null}
              <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 6 }}>
                {sale ? <ProductBadge tone="sale">-{sale}%</ProductBadge> : null}
                {!inStock ? <ProductBadge tone="out">{dict.products.outOfStock}</ProductBadge> : null}
              </div>
            </Main>
            {images.length > 1 ? (
              <div style={{ width: "100%", maxWidth: 220 }}>
                <HorizontalScroll gap={8}>
                  {images.map((src, idx) => (
                    <Thumb
                      key={src}
                      type="button"
                      $active={idx === imageIndex}
                      onClick={() => setImageIndex(idx)}
                    >
                      <OptimizedImage src={src} alt="" sizes="52px" objectFit="contain" />
                    </Thumb>
                  ))}
                </HorizontalScroll>
              </div>
            ) : null}
          </Gallery>

          {product.category ? <Meta>{categoryLabel(product.category, locale)}</Meta> : null}
          <Title>{title}</Title>
          <PriceRow>
            <Price>
              <Money cents={product.price_cents} currency={product.currency} locale={locale} />
            </Price>
            {sale && product.compare_at_cents ? (
              <Old>
                <Money cents={product.compare_at_cents} currency={product.currency} locale={locale} />
              </Old>
            ) : null}
          </PriceRow>
          {short ? <p style={{ margin: 0, lineHeight: 1.55 }}>{short}</p> : null}

          {product.sizes?.length ? (
            <div>
              <Label>{dict.products.size}</Label>
              <Chips>
                {product.sizes.map((item) => (
                  <Chip key={item} type="button" $active={size === item} onClick={() => setSize(item)}>
                    {item}
                  </Chip>
                ))}
              </Chips>
            </div>
          ) : null}

          {product.colors?.length ? (
            <div>
              <Label>{dict.products.color}</Label>
              <Chips>
                {product.colors.map((item) => (
                  <Chip key={item} type="button" $active={color === item} onClick={() => setColor(item)}>
                    {item}
                  </Chip>
                ))}
              </Chips>
            </div>
          ) : null}

          {tags.length ? (
            <Chips>
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    border: "1px solid var(--page-border, #ddd)",
                    padding: "6px 8px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </Chips>
          ) : null}
        </Body>
      </AppScrollArea>

      <Foot>
        <Cta
          type="button"
          disabled={!inStock}
          onClick={() => {
            if (!inStock) return;
            addToCart(product.id, 1);
            setAdded(true);
            toast({ title: dict.products.addedToCart });
            close();
            openDrawer();
          }}
        >
          {!inStock ? dict.products.outOfStock : added ? dict.products.addedToCart : dict.products.addToCart}
        </Cta>
        <Ghost href={href} onClick={close}>
          {dict.products.viewDetails}
        </Ghost>
      </Foot>
    </>
  );
}
