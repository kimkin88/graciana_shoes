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
