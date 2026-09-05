"use client";

import type { Locale } from "@/i18n/config";
import { useCurrency } from "@/context/currency-context";
import { useI18nOptional } from "@/context/locale-context";

export function Money({
  cents,
  currency,
  locale,
}: {
  cents: number;
  currency: string;
  locale?: Locale;
}) {
  const i18n = useI18nOptional();
  const liveLocale = i18n?.locale ?? locale ?? "ru";
  const { format } = useCurrency();
  return <>{format(cents, currency, liveLocale)}</>;
}
