import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { LocaleProvider } from "@/context/locale-context";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SyncHtmlLang } from "@/components/i18n/SyncHtmlLang";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StorefrontShell } from "@/components/layout/StorefrontShell";
import { PageScrollShell } from "@/components/ui/ScrollArea";

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
  const [ru, en] = await Promise.all([getDictionary("ru"), getDictionary("en")]);

  return (
    <LocaleProvider initialLocale={locale} dictionaries={{ ru, en }}>
      <PageScrollShell>
        <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
          <SyncHtmlLang />
          <SiteHeader locale={locale} />
          <StorefrontShell>
            <main style={{ flex: 1, width: "100%" }}>{children}</main>
          </StorefrontShell>
          <SiteFooter />
        </div>
      </PageScrollShell>
    </LocaleProvider>
  );
}
