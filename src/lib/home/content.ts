import type { Locale } from "@/i18n/config";
import { HOME_CATEGORY_TILES, HOME_HERO_PANELS, HOME_LOOKS } from "@/lib/home/editorial";

export type BiText = { ru: string; en: string };

export type HomeMediaAsset = {
  id: string;
  kind: "image" | "video";
  src: string;
};

export type HomeMediaTile = {
  id: string;
  src: string;
  video?: string;
  labelRu: string;
  labelEn: string;
  href: string;
  category?: string;
  /** Library for this slot. The storefront shows the selected asset. */
  media?: HomeMediaAsset[];
  selectedMediaId?: string;
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

export const HERO_LAYOUTS = ["current", "grid", "carousel", "strip"] as const;
export type HeroLayout = (typeof HERO_LAYOUTS)[number];

export function isHeroLayout(value: unknown): value is HeroLayout {
  return typeof value === "string" && (HERO_LAYOUTS as readonly string[]).includes(value);
}

export const CATEGORY_LAYOUTS = ["row", "mosaic", "columns", "cards"] as const;
export type CategoryLayout = (typeof CATEGORY_LAYOUTS)[number];

export function isCategoryLayout(value: unknown): value is CategoryLayout {
  return typeof value === "string" && (CATEGORY_LAYOUTS as readonly string[]).includes(value);
}

export type HeroCount = 1 | 2 | 3;

export function isHeroCount(value: unknown): value is HeroCount {
  return value === 1 || value === 2 || value === 3;
}

export type HomePageContent = {
  v: 2;
  texts: HomePageTexts;
  marquee: BiText;
  heroLayout: HeroLayout;
  /** How many of the saved hero tiles the storefront shows. The rest stay in the editor. */
  heroCount: HeroCount;
  hero: HomeMediaTile[];
  categoryLayout: CategoryLayout;
  categories: HomeMediaTile[];
  looks: HomeMediaTile[];
};

export const HERO_SLOT_MAX = 3;

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
    heroLayout: "current",
    heroCount: 3,
    categoryLayout: "row",
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

function safeId(value: string, fallback: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || fallback;
}

function asAssetList(value: unknown): HomeMediaAsset[] {
  if (!Array.isArray(value)) return [];
  const assets: HomeMediaAsset[] = [];
  for (const [index, item] of value.entries()) {
    const row = asRecord(item);
    if (!row) continue;
    const src = typeof row.src === "string" ? row.src.trim() : "";
    const kind = row.kind === "video" || row.kind === "image" ? row.kind : "";
    if (!src || !kind) continue;
    const id = safeId(typeof row.id === "string" ? row.id.trim() : "", `asset-${index + 1}`);
    assets.push({ id, kind, src });
  }
  return assets;
}

/** Copy the chosen library item into the fields the storefront reads. */
export function applyTileSelection(tile: HomeMediaTile): HomeMediaTile {
  const selected = tile.media?.find((asset) => asset.id === tile.selectedMediaId);
  if (!selected) return { ...tile, src: "", video: "" };
  if (selected.kind === "video") return { ...tile, src: "", video: selected.src };
  return { ...tile, src: selected.src, video: "" };
}

/** Keep older single image/video fields and the newer library in sync. */
export function ensureTileLibrary(tile: HomeMediaTile): HomeMediaTile {
  const media: HomeMediaAsset[] = [];
  const seen = new Set<string>();
  const push = (asset: HomeMediaAsset) => {
    if (!asset.src) return;
    const key = `${asset.kind}:${asset.src}`;
    if (seen.has(key)) return;
    seen.add(key);
    media.push(asset);
  };
  for (const asset of tile.media ?? []) push(asset);
  if (tile.src) push({ id: `${tile.id}-image`, kind: "image", src: tile.src });
  if (tile.video) push({ id: `${tile.id}-video`, kind: "video", src: tile.video });
  const selected =
    media.find((asset) => asset.id === tile.selectedMediaId) ??
    (tile.video ? media.find((asset) => asset.kind === "video" && asset.src === tile.video) : undefined) ??
    (tile.src ? media.find((asset) => asset.kind === "image" && asset.src === tile.src) : undefined) ??
    media[0];
  return applyTileSelection({ ...tile, media, selectedMediaId: selected?.id ?? "" });
}

/** Keep every saved tile. Raise the count by adding empty slots, never by deleting. */
export function withHeroCount(hero: HomeMediaTile[], count: number): { hero: HomeMediaTile[]; heroCount: HeroCount } {
  const heroCount: HeroCount = isHeroCount(count) ? count : 3;
  const tiles = hero.map(ensureTileLibrary);
  while (tiles.length < heroCount) tiles.push(ensureTileLibrary(newHomeTile()));
  return { hero: tiles, heroCount };
}

function asTile(value: unknown, fallbackId: string): HomeMediaTile | null {
  const row = asRecord(value);
  if (!row) return null;
  const src = typeof row.src === "string" ? row.src.trim() : "";
  const video = typeof row.video === "string" ? row.video.trim() : "";
  const id = safeId(typeof row.id === "string" ? row.id.trim() : "", fallbackId);
  const media = asAssetList(row.media);
  const selectedMediaId = safeId(typeof row.selectedMediaId === "string" ? row.selectedMediaId.trim() : "", "");
  return {
    id,
    src,
    video,
    labelRu: typeof row.labelRu === "string" ? row.labelRu : "",
    labelEn: typeof row.labelEn === "string" ? row.labelEn : "",
    href: typeof row.href === "string" && row.href.trim() ? row.href.trim() : "/products",
    category: typeof row.category === "string" ? row.category.trim() : "",
    media: media.length ? media : undefined,
    selectedMediaId: selectedMediaId || undefined,
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

  const savedHero = asTileList(row.hero, defaults.hero).slice(0, HERO_SLOT_MAX).map(ensureTileLibrary);
  const hero = savedHero.length ? savedHero : defaults.hero.map(ensureTileLibrary);

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
    heroLayout: isHeroLayout(row.heroLayout) ? row.heroLayout : "current",
    heroCount: isHeroCount(row.heroCount) ? row.heroCount : hero.length === 1 || hero.length === 2 ? hero.length : 3,
    hero,
    categoryLayout: isCategoryLayout(row.categoryLayout) ? row.categoryLayout : "row",
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
