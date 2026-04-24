import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { fetchProducts } from "@/lib/products/queries";
import { ProductGridMotion } from "@/components/motion/ProductGridMotion";

export const revalidate = 60;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();
  const featured = await fetchProducts(supabase, { featuredOnly: true });

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{dict.home.featured}</h1>
        <Link href={localizedPath("/products", locale)}>{dict.home.viewAll}</Link>
      </div>
      {!featured.length ? (
        <p style={{ color: "#64748b" }}>{dict.home.empty}</p>
      ) : (
        <ProductGridMotion products={featured} locale={locale} />
      )}
    </div>
  );
}
