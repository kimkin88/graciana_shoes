import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { loadTaxonomyHints } from "@/lib/products/taxonomy";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function AdminNewProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();
  const { knownTags, knownGroups } = await loadTaxonomyHints(supabase);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{dict.admin.addProduct}</h2>
      <ProductForm
        mode="create"
        locale={locale}
        dict={dict}
        knownTags={knownTags}
        knownGroups={knownGroups}
      />
    </div>
  );
}
