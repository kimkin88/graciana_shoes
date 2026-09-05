import type { Locale } from "@/i18n/config";

export type StoreCategory = {
  key: string;
  ru: string;
  en: string;
};

export const STORE_CATEGORIES: StoreCategory[] = [
  { key: "sapogi", ru: "Сапоги", en: "Boots" },
  { key: "botinki", ru: "Ботинки", en: "Ankle boots" },
  { key: "botilony", ru: "Ботильоны", en: "Booties" },
  { key: "loafers", ru: "Лоферы", en: "Loafers" },
  { key: "tufii", ru: "Туфли", en: "Pumps" },
  { key: "krossovki", ru: "Кроссовки", en: "Sneakers" },
  { key: "kedy", ru: "Кеды", en: "Keds" },
  { key: "balletki", ru: "Балетки", en: "Ballet flats" },
  { key: "sabo", ru: "Сабо", en: "Clogs" },
  { key: "bosonozhki", ru: "Босоножки", en: "Heeled sandals" },
  { key: "sandali", ru: "Сандалии", en: "Sandals" },
];

export function categoryLabel(key: string | null | undefined, locale: Locale) {
  if (!key) return "";
  const row = STORE_CATEGORIES.find(
    (item) => item.key === key || item.ru === key || item.en.toLowerCase() === key.toLowerCase(),
  );
  if (!row) return key;
  return locale === "en" ? row.en : row.ru;
}

export function categoryAliases(raw: string) {
  const row = STORE_CATEGORIES.find(
    (item) => item.key === raw || item.ru === raw || item.en.toLowerCase() === raw.toLowerCase(),
  );
  if (!row) return [raw];
  return [row.key, row.ru, row.en];
}

export function categoryImage(key: string) {
  return `/home/categories/${key}.jpg`;
}
