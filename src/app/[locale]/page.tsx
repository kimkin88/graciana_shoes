import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { fetchProducts } from "@/lib/products/queries";
import { ProductGridMotion } from "@/components/motion/ProductGridMotion";
import { RecentlyViewedStory } from "@/components/product/RecentlyViewedStory";

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
  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select("hero_image_url")
    .eq("id", 1)
    .maybeSingle();
  const { data: groupedRows } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .not("group_key", "is", null)
    .order("created_at", { ascending: false })
    .limit(100);
  const groupedProducts = new Map<string, typeof featured>();
  for (const row of (groupedRows ?? []) as typeof featured) {
    const key = row.group_key?.trim();
    if (!key) continue;
    const list = groupedProducts.get(key) ?? [];
    if (list.length < 8) list.push(row);
    groupedProducts.set(key, list);
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {siteSettings?.hero_image_url ? (
        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #dacfc4" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={siteSettings.hero_image_url}
            alt={dict.home.heroAlt}
            width={1200}
            height={500}
            style={{ width: "100%", height: "min(46vw, 460px)", objectFit: "cover", display: "block" }}
          />
        </div>
      ) : null}

      <RecentlyViewedStory locale={locale} dict={dict} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{dict.home.featured}</h1>
        <Link href={localizedPath("/products", locale)}>{dict.home.viewAll}</Link>
      </div>
      {!featured.length ? (
        <p style={{ color: "#64748b" }}>{dict.home.empty}</p>
      ) : (
        <ProductGridMotion products={featured} locale={locale} />
      )}

      {[...groupedProducts.entries()].map(([groupKey, products]) => (
        <section key={groupKey} style={{ display: "grid", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", textTransform: "capitalize" }}>{groupKey.replace(/-/g, " ")}</h2>
          <ProductGridMotion products={products} locale={locale} minColumnPx={200} />
        </section>
      ))}
    </div>
  );
}
