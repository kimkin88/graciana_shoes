import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { fetchProductBySlug } from "@/lib/products/queries";
import { productSeoDescription, productSeoTitle, productTitle } from "@/lib/products/display";
import { fetchRelatedProducts } from "@/lib/products/related";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { ProductViewTracker } from "@/components/product/ProductViewTracker";

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
  const title = productSeoTitle(product, locale);
  const description = productSeoDescription(product, locale) ?? undefined;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/products/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `/${locale}/products/${product.slug}`,
      images: product.image_url ? [{ url: product.image_url }] : undefined,
    },
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
  const related = await fetchRelatedProducts(supabase, product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productTitle(product, locale),
    description: productSeoDescription(product, locale) ?? undefined,
    image: product.image_url ? [product.image_url] : undefined,
    sku: product.sku ?? undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: (product.currency || "byn").toUpperCase(),
      price: (product.price_cents / 100).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `/${locale}/products/${product.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductViewTracker productId={product.id} />
      <ProductDetailView locale={locale} dict={dict} product={product} related={related} />
    </>
  );
}
