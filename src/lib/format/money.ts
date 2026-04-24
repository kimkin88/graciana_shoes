import type { Locale } from "@/i18n/config";

export function formatMoney(
  cents: number,
  currency: string,
  locale: Locale,
): string {
  const tag = locale === "ru" ? "ru-RU" : "en-US";
  try {
    return new Intl.NumberFormat(tag, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}
