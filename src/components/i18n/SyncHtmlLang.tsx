"use client";

import { useLayoutEffect } from "react";
import { useI18n } from "@/context/locale-context";

/** Keeps `<html lang>` in sync with the live client locale. */
export function SyncHtmlLang() {
  const { locale } = useI18n();
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
