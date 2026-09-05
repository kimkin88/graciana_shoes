import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { updateSiteContent } from "@/app/actions/admin-site";
import { SiteContentForm } from "@/components/admin/SiteContentForm";
import { fetchHomePage } from "@/lib/home/load";
import { fetchCategories, fetchProducts } from "@/lib/products/queries";
import type { ProductRow } from "@/types";

export const dynamic = "force-dynamic";

export default async function SiteContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const sp = await searchParams;
  const dict = await getDictionary(locale);
  const supabase = await createClient();
  const [content, categories, products, featured] = await Promise.all([
    fetchHomePage(supabase),
    fetchCategories(supabase),
    fetchProducts(supabase),
    fetchProducts(supabase, { featuredOnly: true }),
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
    <div style={{ display: "grid", gap: 16, maxWidth: 980 }}>
      <h2 style={{ margin: 0 }}>{dict.admin.siteContent}</h2>
      <p style={{ margin: 0, color: "var(--page-text-muted)" }}>{dict.admin.siteContentHint}</p>
      {sp.saved ? <p style={{ margin: 0, color: "var(--page-text)" }}>{dict.admin.saved}</p> : null}
      {sp.error ? <p style={{ margin: 0, color: "var(--page-danger, #b42318)" }}>{dict.admin.saveError}</p> : null}
      <SiteContentForm
        locale={locale}
        dict={dict}
        action={updateSiteContent}
        initial={content}
        categories={categories}
        products={products}
        featured={featured}
        groups={[...grouped.entries()].map(([key, items]) => ({ key, products: items }))}
      />
    </div>
  );
}
