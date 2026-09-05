"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { formatMoney } from "@/lib/format/money";
import {
  canConvert,
  convertCents,
  DEFAULT_DISPLAY_CURRENCY,
  FX_COOKIE,
  isDisplayCurrency,
  isStorefrontCurrency,
  type FxTable,
} from "@/lib/money/fx";

type CurrencyContextValue = {
  displayCurrency: string;
  setDisplayCurrency: (code: string) => void;
  rates: FxTable;
  convert: (cents: number, fromCurrency: string) => number;
  format: (cents: number, fromCurrency: string, locale: Locale) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function writeCookie(code: string) {
  document.cookie = `${FX_COOKIE}=${encodeURIComponent(code)};path=/;max-age=31536000;samesite=lax`;
}

export function CurrencyProvider({
  children,
  initialCurrency,
  initialRates,
}: {
  children: React.ReactNode;
  initialCurrency?: string;
  initialRates: FxTable;
}) {
  const [displayCurrency, setCurrency] = useState(() =>
    isStorefrontCurrency(initialCurrency)
      ? initialCurrency
      : DEFAULT_DISPLAY_CURRENCY,
  );

  const setDisplayCurrency = useCallback((code: string) => {
    const next = isStorefrontCurrency(code)
      ? code
      : isDisplayCurrency(code)
        ? DEFAULT_DISPLAY_CURRENCY
        : DEFAULT_DISPLAY_CURRENCY;
    setCurrency(next);
    writeCookie(next);
  }, []);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      displayCurrency,
      setDisplayCurrency,
      rates: initialRates,
      convert: (cents, fromCurrency) => convertCents(cents, fromCurrency, displayCurrency, initialRates),
      format: (cents, fromCurrency, locale) => {
        const ready = canConvert(fromCurrency, displayCurrency, initialRates);
        const amount = ready ? convertCents(cents, fromCurrency, displayCurrency, initialRates) : cents;
        const code = ready ? displayCurrency : fromCurrency;
        return formatMoney(amount, code, locale);
      },
    }),
    [displayCurrency, initialRates, setDisplayCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
