import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { loadTaxonomyHints } from "@/lib/products/taxonomy";
import { ProductForm } from "@/components/admin/ProductForm";
import type { ProductRow } from "@/types";

const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function AdminEditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw) || !uuidRe.test(id)) notFound();
  const locale = raw as Locale;
  const sp = await searchParams;
  const dict = await getDictionary(locale);
  const supabase = await createClient();
  const [{ data, error }, taxonomy] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    loadTaxonomyHints(supabase),
  ]);

  if (error || !data) notFound();
  const product = data as ProductRow;

  const errorText =
    sp.error === "media" || sp.error === "image_upload" || sp.error === "video_upload"
      ? dict.admin.mediaUploadError
      : sp.error === "image_too_large" || sp.error === "video_too_large"
        ? dict.admin.mediaTooLarge
        : sp.error === "fields" || sp.error === "slug"
          ? dict.admin.fieldsError
          : sp.error
            ? dict.admin.saveError
            : null;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>
        {dict.admin.edit}: {product.name_ru}
      </h2>
      {errorText ? (
        <p style={{ color: "var(--page-danger, #b42318)", marginTop: 0 }}>{errorText}</p>
      ) : null}
      <ProductForm
        mode="edit"
        locale={locale}
        dict={dict}
        product={product}
        knownTags={taxonomy.knownTags}
        knownGroups={taxonomy.knownGroups}
      />
    </div>
  );
}
