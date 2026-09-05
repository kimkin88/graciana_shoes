"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import { localizeHref } from "@/i18n/routing";
import type { ProductRow } from "@/types";
import { ProductGridMotion } from "@/components/motion/ProductGridMotion";
import { RecentlyViewedStory } from "@/components/product/RecentlyViewedStory";
import { LookTile } from "@/components/home/LookTile";
import { WheelLockHScroll } from "@/components/ui/ScrollArea";
import {
  homeCopy,
  homeTileLabel,
  marqueeLines,
  visibleTiles,
  type HomeMediaTile,
  type HomePageContent,
} from "@/lib/home/content";
import { useI18nOptional } from "@/context/locale-context";

type Props = {
  locale: Locale;
  dict: Messages;
  content: HomePageContent;
  products: ProductRow[];
  featured: ProductRow[];
  groups: Array<{ key: string; products: ProductRow[] }>;
};

function formatGroupTitle(key: string) {
  return key
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function Tiles({
  tiles,
  locale,
  className,
}: {
  tiles: HomeMediaTile[];
  locale: Locale;
  className: string;
}) {
  return (
    <>
      {visibleTiles(tiles).map((tile) => (
        <LookTile
          key={tile.id}
          href={localizeHref(tile.href || "/products", locale)}
          src={tile.src}
          video={tile.video || undefined}
          label={homeTileLabel(tile, locale)}
          className={className}
          objectPosition={className.includes("hero") ? "center bottom" : "center"}
        />
      ))}
    </>
  );
}

export function HomeView({ locale: localeProp, dict: dictProp, content, products, featured, groups }: Props) {
  const i18n = useI18nOptional();
  const locale = i18n?.locale ?? localeProp;
  const dict = i18n?.dict ?? dictProp;
  const catalog = localizeHref("/products", locale);
  const lookbook = featured.length ? featured : products.slice(0, 8);
  const featuredIds = new Set(lookbook.map((p) => p.id));
  const rest = products.filter((p) => !featuredIds.has(p.id)).slice(0, 8);
  const ticker = marqueeLines(content.marquee, locale);
  const viewAll = homeCopy(content.texts.viewAll, locale);
  const hero = visibleTiles(content.hero);
  const categories = visibleTiles(content.categories);
  const looks = visibleTiles(content.looks);

  return (
    <div>
      <section className="home-first">
        <div className="home-hero-fill">
          <Tiles tiles={hero} locale={locale} className="home-hero-panel" />
        </div>
        {ticker.length ? (
          <div className="home-marquee" aria-hidden>
            <div className="home-marquee-track">
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i}>{ticker[i % ticker.length]}</span>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <div className="home-rest">
        {categories.length ? (
          <section className="home-section">
            <WheelLockHScroll
              className="home-hrow"
              lockOnHover
              lead={
                <SectionHead
                  title={homeCopy(content.texts.popularCategories, locale)}
                  href={catalog}
                  label={viewAll}
                />
              }
            >
              <Tiles tiles={categories} locale={locale} className="home-cat-tile" />
            </WheelLockHScroll>
          </section>
        ) : null}

        {lookbook.length ? (
          <section className="home-section">
            <SectionHead title={homeCopy(content.texts.catalog, locale)} href={catalog} label={viewAll} />
            <ProductGridMotion
              products={lookbook}
              locale={locale}
              loud
              cardDict={{
                addToCart: dict.products.addToCart,
                outOfStock: dict.products.outOfStock,
                newIn: dict.products.newBadge,
                sale: dict.products.sale,
                addedToCart: dict.products.addedToCart,
                favorite: dict.products.favorite,
                unfavorite: dict.products.unfavorite,
                inCart: dict.cart.inCart,
              }}
            />
          </section>
        ) : null}

        {looks.length ? (
          <section className="home-section">
            <SectionHead title={homeCopy(content.texts.best, locale)} href={catalog} label={viewAll} />
            <div className="home-tile-grid">
              <Tiles tiles={looks} locale={locale} className="home-look-tile" />
            </div>
          </section>
        ) : null}

        {groups.map((group) => (
          <section className="home-section" key={group.key}>
            <SectionHead title={formatGroupTitle(group.key)} href={catalog} label={viewAll} />
            <ProductGridMotion
              products={group.products}
              locale={locale}
              loud
              cardDict={{
                addToCart: dict.products.addToCart,
                outOfStock: dict.products.outOfStock,
                newIn: dict.products.newBadge,
                sale: dict.products.sale,
                addedToCart: dict.products.addedToCart,
                favorite: dict.products.favorite,
                unfavorite: dict.products.unfavorite,
                inCart: dict.cart.inCart,
              }}
            />
          </section>
        ))}

        {rest.length ? (
          <section className="home-section">
            <SectionHead title={homeCopy(content.texts.newIn, locale)} href={catalog} label={viewAll} />
            <ProductGridMotion
              products={rest}
              locale={locale}
              loud
              cardDict={{
                addToCart: dict.products.addToCart,
                outOfStock: dict.products.outOfStock,
                newIn: dict.products.newBadge,
                sale: dict.products.sale,
                addedToCart: dict.products.addedToCart,
                favorite: dict.products.favorite,
                unfavorite: dict.products.unfavorite,
                inCart: dict.cart.inCart,
              }}
            />
          </section>
        ) : null}

        <section className="home-section">
          <RecentlyViewedStory
            locale={locale}
            dict={dict}
            title={homeCopy(content.texts.recentlyViewed, locale)}
          />
        </section>
      </div>

      <section className="home-news">
        <h2>{homeCopy(content.texts.newsletterTitle, locale)}</h2>
        <Link href={`mailto:${dict.info.email}?subject=${encodeURIComponent(homeCopy(content.texts.newsletterTitle, locale))}`}>
          {homeCopy(content.texts.newsletterCta, locale)}
        </Link>
      </section>
    </div>
  );
}

function SectionHead({ title, href, label }: { title: string; href: string; label: string }) {
  return (
    <div className="home-section-head">
      <h2>{title}</h2>
      <Link href={href}>{label}</Link>
    </div>
  );
}
