"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { isLocale, type Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";

export const LOCALE_COOKIE = "graciana-locale";

type Dictionaries = Record<Locale, Messages>;

type LocaleContextValue = {
  locale: Locale;
  dict: Messages;
  dictionaries: Dictionaries;
  setLocale: (next: Locale) => void;
  path: (href: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function stripLocalePrefix(pathname: string) {
  const rest = pathname.replace(/^\/(en|ru)(?=\/|$)/, "") || "/";
  return rest === "/" ? "/" : rest;
}

function writeLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
}

/** Client locale + both dictionaries — switch language without a document reload. */
export function LocaleProvider({
  initialLocale,
  dictionaries,
  children,
}: {
  initialLocale: Locale;
  dictionaries: Dictionaries;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLocaleState(initialLocale);
  }, [initialLocale]);

  const setLocale = useCallback((next: Locale) => {
    if (!isLocale(next)) return;
    startTransition(() => {
      setLocaleState((prev) => (prev === next ? prev : next));
    });
    document.documentElement.lang = next;
    writeLocaleCookie(next);
    const current = window.location.pathname || "/";
    const rest = stripLocalePrefix(current);
    const nextPath = rest === "/" ? `/${next}` : `/${next}${rest}`;
    const url = `${nextPath}${window.location.search}${window.location.hash}`;
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, "", url);
    }
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dict: dictionaries[locale],
      dictionaries,
      setLocale,
      path: (href: string) => localizedPath(href, locale),
    }),
    [locale, dictionaries, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useI18n must be used within LocaleProvider");
  return ctx;
}

export function useI18nOptional() {
  return useContext(LocaleContext);
}
