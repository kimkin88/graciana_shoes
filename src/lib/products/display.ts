import type { Locale } from "@/i18n/config";
import type { ProductRow } from "@/types";

/** Pick localized product fields — Russian is the canonical fallback. */
export function productTitle(p: ProductRow, locale: Locale): string {
  return locale === "en" ? p.name_en || p.name_ru : p.name_ru;
}

export function productDescription(
  p: ProductRow,
  locale: Locale,
): string | null {
  if (locale === "en") {
    return p.description_en ?? p.description_ru ?? null;
  }
  return p.description_ru ?? p.description_en ?? null;
}

export function productSeoTitle(p: ProductRow, locale: Locale) {
  if (locale === "en") return p.seo_title_en || p.seo_title_ru || productTitle(p, locale);
  return p.seo_title_ru || p.seo_title_en || productTitle(p, locale);
}

export function productSeoDescription(p: ProductRow, locale: Locale) {
  if (locale === "en") {
    return p.seo_description_en || p.seo_description_ru || p.short_description_en || productDescription(p, locale);
  }
  return p.seo_description_ru || p.seo_description_en || p.short_description_ru || productDescription(p, locale);
}
