"use client";

import { useLayoutEffect } from "react";
import type { Locale } from "@/i18n/config";

/** Keeps `<html lang>` in sync with the URL locale (root layout defaults to Russian). */
export function SyncHtmlLang({ locale }: { locale: Locale }) {
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
