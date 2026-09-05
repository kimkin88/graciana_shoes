import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { fetchProductBySlug } from "@/lib/products/queries";
import { productSeoDescription, productSeoTitle } from "@/lib/products/display";
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
  return {
    title: productSeoTitle(product, locale),
    description: productSeoDescription(product, locale) ?? undefined,
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

  return (
    <>
      <ProductViewTracker productId={product.id} />
      <ProductDetailView locale={locale} dict={dict} product={product} related={related} />
    </>
  );
}
