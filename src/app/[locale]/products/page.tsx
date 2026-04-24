import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { fetchCategories, fetchProducts } from "@/lib/products/queries";
import { ProductGridMotion } from "@/components/motion/ProductGridMotion";
import { ProductFilters } from "@/components/catalog/ProductFilters";

export const revalidate = 60;

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const minRaw =
    typeof sp.min === "string" ? Number.parseInt(sp.min, 10) : undefined;
  const maxRaw =
    typeof sp.max === "string" ? Number.parseInt(sp.max, 10) : undefined;
  const min = minRaw !== undefined && !Number.isNaN(minRaw) ? minRaw : undefined;
  const max = maxRaw !== undefined && !Number.isNaN(maxRaw) ? maxRaw : undefined;

  const dict = await getDictionary(locale);
  const supabase = await createClient();
  const [products, categories] = await Promise.all([
    fetchProducts(supabase, {
      search: q,
      category,
      minCents: min,
      maxCents: max,
    }),
    fetchCategories(supabase),
  ]);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h1 style={{ margin: 0 }}>{dict.products.title}</h1>

      <ProductFilters
        key={`${q ?? ""}-${category ?? ""}-${min ?? ""}-${max ?? ""}`}
        locale={locale}
        dict={dict}
        categories={categories}
        initialQ={q}
        initialCategory={category}
        initialMin={typeof sp.min === "string" ? sp.min : ""}
        initialMax={typeof sp.max === "string" ? sp.max : ""}
      />

      {!products.length ? (
        <p style={{ color: "#64748b" }}>{dict.products.noResults}</p>
      ) : (
        <ProductGridMotion products={products} locale={locale} />
      )}
    </div>
  );
}
