import type { Locale } from "./config";

/** Prefix internal paths with the active locale for `<Link href>`. */
export function localizedPath(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}

/** Locale-prefix an internal path while leaving absolute and mailto links as-is. */
export function localizeHref(href: string, locale: Locale): string {
  const raw = href.trim() || "/products";
  if (/^[a-z]+:/i.test(raw)) return raw;
  const [path, query] = raw.split("?");
  const loc = localizedPath(path || "/products", locale);
  return query ? `${loc}?${query}` : loc;
}
