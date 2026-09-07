import type { Locale } from "@/i18n/config";

export function formatMoney(
  cents: number,
  currency: string | null | undefined,
  locale: Locale,
): string {
  const code = (currency ?? "BYN").toString().trim().toUpperCase() || "BYN";
  const amount = Number.isFinite(cents) ? cents / 100 : 0;
  const tag = locale === "ru" ? "ru-RU" : "en-US";
  try {
    return new Intl.NumberFormat(tag, {
      style: "currency",
      currency: code,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${code}`;
  }
}
