import type { Locale } from "@/i18n/config";
import type { GalleryItem, ProductRow } from "@/types";
import { productCardImage } from "@/lib/products/media";
import { publicStorageUrl } from "@/lib/storage/urls";

export function productGallery(product: ProductRow): string[] {
  const main = productCardImage(product);
  const extras = parseGallery(product.gallery)
    .filter((item) => (item.kind ?? "image") !== "video")
    .map((item) => publicStorageUrl(item.path ?? null) ?? item.url)
    .filter(Boolean);
  const urls = [main, ...extras].filter((url): url is string => Boolean(url));
  return [...new Set(urls)];
}

/** All product videos: primary + gallery video items. */
export function productVideos(product: ProductRow): string[] {
  const primary = productVideoSrcCompat(product);
  const extras = parseGallery(product.gallery)
    .filter((item) => item.kind === "video")
    .map((item) => publicStorageUrl(item.path ?? null) ?? item.url)
    .filter(Boolean);
  return [...new Set([primary, ...extras].filter((url): url is string => Boolean(url)))];
}

function productVideoSrcCompat(product: ProductRow) {
  return publicStorageUrl(product.video_path ?? null, product.updated_at) ?? product.video_url ?? null;
}

export function productHoverImage(product: ProductRow) {
  const urls = productGallery(product);
  return urls[1] ?? null;
}

export function productTags(product: ProductRow) {
  return (product.tags ?? []).map((tag) => tag.trim()).filter(Boolean);
}

export function discountPercent(product: Pick<ProductRow, "price_cents" | "compare_at_cents">) {
  const compare = product.compare_at_cents ?? 0;
  if (compare <= product.price_cents || product.price_cents < 0) return null;
  return Math.round((1 - product.price_cents / compare) * 100);
}

export function isNewProduct(product: Pick<ProductRow, "created_at">, days = 21) {
  const created = Date.parse(product.created_at);
  if (!Number.isFinite(created)) return false;
  return Date.now() - created < days * 24 * 60 * 60 * 1000;
}

export function productShortText(product: ProductRow, locale: Locale) {
  if (locale === "en") {
    return product.short_description_en || product.short_description_ru || null;
  }
  return product.short_description_ru || product.short_description_en || null;
}

/** Stored in product specs so the storefront can list sizes per shop. */
export const CITY_SIZE_SPEC = {
  minsk: "sizes_minsk",
  brest: "sizes_brest",
} as const;

export function publicSpecs(specs: Record<string, string>) {
  const hidden = new Set<string>(Object.values(CITY_SIZE_SPEC));
  return Object.fromEntries(Object.entries(specs).filter(([key]) => !hidden.has(key)));
}

/** Per-city sizes. If neither city is set, in-stock products use the shared size list. */
export function cityAvailability(product: {
  stock: number;
  sizes?: string[] | null;
  specs?: Record<string, string> | null;
}) {
  const specs = parseSpecs(product.specs);
  const minsk = specs[CITY_SIZE_SPEC.minsk] ?? "";
  const brest = specs[CITY_SIZE_SPEC.brest] ?? "";
  const custom = Boolean(minsk || brest);
  const fallback = product.stock > 0 ? (product.sizes ?? []).filter(Boolean).join(", ") : "";
  return (
    [
      { id: "minsk" as const, sizes: custom ? minsk : fallback },
      { id: "brest" as const, sizes: custom ? brest : fallback },
    ] as const
  ).filter((row) => row.sizes);
}

export function parseSpecs(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (key.trim() && typeof item === "string" && item.trim()) out[key.trim()] = item.trim();
  }
  return out;
}

export function specsToText(specs: Record<string, string> | null | undefined) {
  return Object.entries(specs ?? {})
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

export function textToSpecs(raw: string) {
  const specs: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const idx = line.indexOf(":");
    if (idx < 1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && value) specs[key] = value;
  }
  return specs;
}

export function centsFromMajor(raw: string) {
  const n = Number.parseFloat(raw.replace(",", ".").trim());
  if (!Number.isFinite(n) || n < 0) return NaN;
  return Math.round(n * 100);
}

export function majorFromCents(cents: number | null | undefined) {
  if (cents == null || Number.isNaN(cents)) return "";
  return (cents / 100).toFixed(2);
}

export function parseGallery(value: unknown): GalleryItem[] {
  if (!Array.isArray(value)) return [];
  const rows: GalleryItem[] = [];
  for (const item of value) {
    if (typeof item === "string" && item.trim()) {
      const url = item.trim();
      if (url.startsWith("blob:") || url.startsWith("data:")) continue;
      const kind = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) ? ("video" as const) : ("image" as const);
      rows.push({ url, kind });
      continue;
    }
    if (item && typeof item === "object" && "url" in item && typeof (item as GalleryItem).url === "string") {
      const row = item as GalleryItem;
      const url = row.url.trim();
      if (!url || url.startsWith("blob:") || url.startsWith("data:")) continue;
      const kind =
        row.kind === "video" || row.kind === "image"
          ? row.kind
          : /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)
            ? ("video" as const)
            : ("image" as const);
      rows.push({ url, path: row.path ?? null, kind });
    }
  }
  return rows;
}
