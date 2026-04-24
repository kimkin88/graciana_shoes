"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";

export default function LocaleNotFound() {
  const pathname = usePathname() ?? "/ru";
  const seg = pathname.split("/")[1];
  const locale: Locale = isLocale(seg) ? seg : "ru";

  return (
    <div style={{ padding: "48px 0", textAlign: "center" }}>
      <h1 style={{ fontSize: "1.5rem" }}>404</h1>
      <p>
        {locale === "ru" ? "Страница не найдена." : "Page not found."}
      </p>
      <Link href={`/${locale}`}>
        {locale === "ru" ? "На главную" : "Back to home"}
      </Link>
    </div>
  );
}
