import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { fetchCategories, fetchProductOptions, fetchProducts } from "@/lib/products/queries";
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
  const color = typeof sp.color === "string" ? sp.color : undefined;
  const size = typeof sp.size === "string" ? sp.size : undefined;
  const minRaw =
    typeof sp.min === "string" ? Number.parseInt(sp.min, 10) : undefined;
  const maxRaw =
    typeof sp.max === "string" ? Number.parseInt(sp.max, 10) : undefined;
  const min = minRaw !== undefined && !Number.isNaN(minRaw) ? minRaw : undefined;
  const max = maxRaw !== undefined && !Number.isNaN(maxRaw) ? maxRaw : undefined;

  const dict = await getDictionary(locale);
  const supabase = await createClient();
  const [products, categories, options] = await Promise.all([
    fetchProducts(supabase, {
      search: q,
      category,
      color,
      size,
      minCents: min,
      maxCents: max,
    }),
    fetchCategories(supabase),
    fetchProductOptions(supabase),
  ]);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h1 style={{ margin: 0 }}>{dict.products.title}</h1>

      <ProductFilters
        key={`${q ?? ""}-${category ?? ""}-${color ?? ""}-${size ?? ""}-${min ?? ""}-${max ?? ""}`}
        locale={locale}
        dict={dict}
        categories={categories}
        colors={options.colors}
        sizes={options.sizes}
        initialQ={q}
        initialCategory={category}
        initialColor={color}
        initialSize={size}
        initialMin={typeof sp.min === "string" ? sp.min : ""}
        initialMax={typeof sp.max === "string" ? sp.max : ""}
      />

      {!products.length ? (
        <p>{dict.products.noResults}</p>
      ) : (
        <ProductGridMotion products={products} locale={locale} />
      )}
    </div>
  );
}
