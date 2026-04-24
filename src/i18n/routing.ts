import type { Locale } from "./config";

/** Prefix internal paths with the active locale for `<Link href>`. */
export function localizedPath(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}
