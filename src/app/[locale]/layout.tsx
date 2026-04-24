import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SyncHtmlLang } from "@/components/i18n/SyncHtmlLang";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function generateStaticParams() {
  return [{ locale: "ru" }, { locale: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = await getDictionary(raw);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SyncHtmlLang locale={locale} />
      <SiteHeader locale={locale} />
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 12px 36px",
          width: "100%",
          flex: 1,
        }}
      >
        {children}
      </div>
      <SiteFooter locale={locale} dict={dict} />
    </div>
  );
}
