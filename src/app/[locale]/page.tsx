import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { fetchProducts } from "@/lib/products/queries";
import { fetchHomePage } from "@/lib/home/load";
import { HomeView } from "@/components/home/HomeView";
import type { ProductRow } from "@/types";

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
  const [products, featured, content] = await Promise.all([
    fetchProducts(supabase),
    fetchProducts(supabase, { featuredOnly: true }),
    fetchHomePage(supabase),
  ]);

  const grouped = new Map<string, ProductRow[]>();
  for (const product of products) {
    const key = product.group_key?.trim();
    if (!key) continue;
    const list = grouped.get(key) ?? [];
    if (list.length < 8) list.push(product);
    grouped.set(key, list);
  }

  return (
    <HomeView
      locale={locale}
      dict={dict}
      content={content}
      products={products}
      featured={featured}
      groups={[...grouped.entries()].map(([key, items]) => ({ key, products: items }))}
    />
  );
}
