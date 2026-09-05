import type { Locale } from "@/i18n/config";
import { HOME_CATEGORY_TILES, HOME_HERO_PANELS, HOME_LOOKS } from "@/lib/home/editorial";

export type BiText = { ru: string; en: string };

export type HomeMediaTile = {
  id: string;
  src: string;
  video?: string;
  labelRu: string;
  labelEn: string;
  href: string;
  category?: string;
};

export type HomePageTexts = {
  popularCategories: BiText;
  catalog: BiText;
  best: BiText;
  newIn: BiText;
  viewAll: BiText;
  recentlyViewed: BiText;
  newsletterTitle: BiText;
  newsletterCta: BiText;
};

export type HomePageContent = {
  v: 2;
  texts: HomePageTexts;
  marquee: BiText;
  hero: HomeMediaTile[];
  categories: HomeMediaTile[];
  looks: HomeMediaTile[];
};

const HERO_COUNT = 3;

function tileFromEditorial(
  id: string,
  tile: { src: string; video?: string; labelRu: string; labelEn: string; category?: string },
): HomeMediaTile {
  const category = tile.category ?? "";
  return {
    id,
    src: tile.src,
    video: tile.video ?? "",
    labelRu: tile.labelRu,
    labelEn: tile.labelEn,
    href: category ? `/products?category=${encodeURIComponent(category)}` : "/products",
    category,
  };
}

export function defaultHomePage(): HomePageContent {
  return {
    v: 2,
    texts: {
      popularCategories: { ru: "Популярные категории", en: "Popular categories" },
      catalog: { ru: "Каталог", en: "Catalog" },
      best: { ru: "Бест", en: "Best" },
      newIn: { ru: "Новинки", en: "New in" },
      viewAll: { ru: "Смотреть всё", en: "Shop all" },
      recentlyViewed: { ru: "Вы смотрели", en: "Recently viewed" },
      newsletterTitle: {
        ru: "Хотите быть в курсе акций и закрытых продаж",
        en: "Want news on drops, codes, and private sales",
      },
      newsletterCta: { ru: "Написать нам", en: "Write to us" },
    },
    marquee: {
      ru: "Бесплатная доставка при заказе от 250 BYN\nМодная женская обувь с доставкой по Беларуси.\nGRACIANA Женская Обувь",
      en: "Free shipping on orders over 250 BYN\nFashion footwear with delivery across Belarus.\nGRACIANA Women's Shoes",
    },
    hero: HOME_HERO_PANELS.map((tile, i) => tileFromEditorial(`hero-${i + 1}`, tile)),
    categories: HOME_CATEGORY_TILES.map((tile, i) => tileFromEditorial(`cat-${i + 1}`, tile)),
    looks: HOME_LOOKS.map((tile, i) => tileFromEditorial(`look-${i + 1}`, tile)),
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asBiText(value: unknown, fallback: BiText): BiText {
  const row = asRecord(value);
  return {
    ru: typeof row?.ru === "string" ? row.ru : fallback.ru,
    en: typeof row?.en === "string" ? row.en : fallback.en,
  };
}

function asTile(value: unknown, fallbackId: string): HomeMediaTile | null {
  const row = asRecord(value);
  if (!row) return null;
  const src = typeof row.src === "string" ? row.src.trim() : "";
  const video = typeof row.video === "string" ? row.video.trim() : "";
  const idRaw = typeof row.id === "string" ? row.id.trim() : fallbackId;
  const id = idRaw.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || fallbackId;
  return {
    id,
    src,
    video,
    labelRu: typeof row.labelRu === "string" ? row.labelRu : "",
    labelEn: typeof row.labelEn === "string" ? row.labelEn : "",
    href: typeof row.href === "string" && row.href.trim() ? row.href.trim() : "/products",
    category: typeof row.category === "string" ? row.category.trim() : "",
  };
}

function asTileList(value: unknown, fallback: HomeMediaTile[]): HomeMediaTile[] {
  if (!Array.isArray(value)) return fallback.map((tile) => ({ ...tile }));
  const tiles = value
    .map((item, i) => asTile(item, `tile-${i + 1}`))
    .filter((tile): tile is HomeMediaTile => Boolean(tile));
  return tiles;
}

function useSavedCategories(saved: HomeMediaTile[], fallback: HomeMediaTile[]) {
  const hasStoreCats = saved.some((tile) => tile.category === "sapogi" || tile.labelRu === "Сапоги");
  return hasStoreCats ? saved : fallback.map((tile) => ({ ...tile }));
}

export function parseHomePage(raw: unknown): HomePageContent {
  const defaults = defaultHomePage();
  const row = asRecord(raw);
  if (!row || row.v !== 2) return defaults;

  const hero = asTileList(row.hero, defaults.hero);
  while (hero.length < HERO_COUNT) {
    const next = defaults.hero[hero.length];
    hero.push(next ? { ...next, id: `hero-${hero.length + 1}` } : newHomeTile(`hero-${hero.length + 1}`));
  }

  return {
    v: 2,
    texts: {
      popularCategories: asBiText(asRecord(row.texts)?.popularCategories, defaults.texts.popularCategories),
      catalog: asBiText(asRecord(row.texts)?.catalog, defaults.texts.catalog),
      best: asBiText(asRecord(row.texts)?.best, defaults.texts.best),
      newIn: asBiText(asRecord(row.texts)?.newIn, defaults.texts.newIn),
      viewAll: asBiText(asRecord(row.texts)?.viewAll, defaults.texts.viewAll),
      recentlyViewed: asBiText(asRecord(row.texts)?.recentlyViewed, defaults.texts.recentlyViewed),
      newsletterTitle: asBiText(asRecord(row.texts)?.newsletterTitle, defaults.texts.newsletterTitle),
      newsletterCta: asBiText(asRecord(row.texts)?.newsletterCta, defaults.texts.newsletterCta),
    },
    marquee: asBiText(row.marquee, defaults.marquee),
    hero: hero.slice(0, HERO_COUNT),
    categories: useSavedCategories(asTileList(row.categories, defaults.categories), defaults.categories),
    looks: asTileList(row.looks, defaults.looks),
  };
}

export function newHomeTile(id?: string): HomeMediaTile {
  return {
    id: id ?? `tile-${Math.random().toString(36).slice(2, 10)}`,
    src: "",
    video: "",
    labelRu: "",
    labelEn: "",
    href: "/products",
    category: "",
  };
}

export function homeCopy(text: BiText, locale: Locale) {
  return locale === "en" ? text.en : text.ru;
}

export function homeTileLabel(tile: HomeMediaTile, locale: Locale) {
  return locale === "en" ? tile.labelEn || tile.labelRu : tile.labelRu || tile.labelEn;
}

export function marqueeLines(text: BiText, locale: Locale) {
  return homeCopy(text, locale)
    .split(/\n+/g)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function visibleTiles(tiles: HomeMediaTile[]) {
  return tiles.filter((tile) => tile.src || tile.video);
}
