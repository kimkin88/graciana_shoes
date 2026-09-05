import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { fetchProductOptions, fetchProducts } from "@/lib/products/queries";
import { ProductGridMotion } from "@/components/motion/ProductGridMotion";
import { ProductFilters } from "@/components/catalog/ProductFilters";
import { PageShell } from "@/components/layout/PageShell";
import { STORE_CATEGORIES } from "@/lib/catalog/categories";

export const revalidate = 60;

function majorToCents(raw: string | undefined) {
  if (!raw) return undefined;
  const n = Number.parseFloat(raw.replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.round(n * 100);
}

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
  const sort = typeof sp.sort === "string" ? sp.sort : "default";
  const min = majorToCents(typeof sp.min === "string" ? sp.min : undefined);
  const max = majorToCents(typeof sp.max === "string" ? sp.max : undefined);

  const dict = await getDictionary(locale);
  const supabase = await createClient();
  const [productsRaw, options] = await Promise.all([
    fetchProducts(supabase, { search: q, category, color, size, minCents: min, maxCents: max }),
    fetchProductOptions(supabase),
  ]);
  const categories = STORE_CATEGORIES.map((item) => item.key);

  const products = [...productsRaw].sort((a, b) => {
    if (sort === "price-asc") return a.price_cents - b.price_cents;
    if (sort === "price-desc") return b.price_cents - a.price_cents;
    if (sort === "new") return Date.parse(b.created_at) - Date.parse(a.created_at);
    return 0;
  });

  return (
    <PageShell width="wide">
      <p style={{ margin: "0 0 8px", letterSpacing: "0.18em", textTransform: "uppercase", fontSize: "0.7rem" }}>
        GRACIANA
      </p>
      <h1 style={{ margin: "0 0 28px", fontSize: "clamp(2.4rem, 6vw, 5rem)" }}>{dict.products.title}</h1>
      <ProductFilters
        key={`${q ?? ""}-${category ?? ""}-${color ?? ""}-${size ?? ""}-${sp.min ?? ""}-${sp.max ?? ""}-${sort}`}
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
        initialSort={sort}
      >
        {!products.length ? (
          <p>{dict.products.noResults}</p>
        ) : (
          <ProductGridMotion
            products={products}
            locale={locale}
            cardDict={{
              addToCart: dict.products.addToCart,
              outOfStock: dict.products.outOfStock,
              newIn: dict.products.newBadge,
              sale: dict.products.sale,
              addedToCart: dict.products.addedToCart,
              favorite: dict.products.favorite,
              unfavorite: dict.products.unfavorite,
              inCart: dict.cart.inCart,
            }}
          />
        )}
      </ProductFilters>
    </PageShell>
  );
}
