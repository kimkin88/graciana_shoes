import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { fetchProductBySlug } from "@/lib/products/queries";
import { productDescription, productTitle } from "@/lib/products/display";
import { formatMoney } from "@/lib/format/money";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductMediaGallery } from "@/components/product/ProductMediaGallery";
import { ProductViewTracker } from "@/components/product/ProductViewTracker";
import { ProductGridMotion } from "@/components/motion/ProductGridMotion";
import type { ProductRow } from "@/types";

export const revalidate = 120;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const supabase = await createClient();
  const product = await fetchProductBySlug(supabase, slug);
  if (!product) return {};
  return {
    title: productTitle(product, locale),
    description: productDescription(product, locale) ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();
  const product = await fetchProductBySlug(supabase, slug);
  if (!product) notFound();

  const title = productTitle(product, locale);
  const description = productDescription(product, locale);
  const inStock = product.stock > 0;

  let related: ProductRow[] = [];
  if (product.category) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("category", product.category)
      .eq("active", true)
      .neq("id", product.id)
      .limit(4);
    related = (data ?? []) as ProductRow[];
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <ProductViewTracker productId={product.id} />
      <Link href={localizedPath("/products", locale)}>
        ← {dict.nav.catalog}
      </Link>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24,
        }}
      >
        <div>
          <ProductMediaGallery
            imageUrl={product.image_url}
            videoUrl={product.video_url}
            title={title}
          />
        </div>
        <div>
          <h1 style={{ marginTop: 0 }}>{title}</h1>
          <p style={{ fontSize: "1.25rem", fontWeight: 600 }}>
            {formatMoney(product.price_cents, product.currency, locale)}
          </p>
          <p>
            {dict.product.stock}: {product.stock}
          </p>
          <div style={{ marginTop: 16 }}>
            <AddToCartButton
              productId={product.id}
              disabled={!inStock}
              label={dict.products.addToCart}
              outLabel={dict.products.outOfStock}
            />
          </div>
        </div>
      </div>
      {description ? (
        <section>
          <h2 style={{ fontSize: "1.1rem" }}>{dict.product.description}</h2>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{description}</p>
        </section>
      ) : null}
      {related.length ? (
        <section>
          <h2 style={{ fontSize: "1.1rem" }}>{dict.product.related}</h2>
          <ProductGridMotion
            products={related}
            locale={locale}
            minColumnPx={200}
          />
        </section>
      ) : null}
    </div>
  );
}
