"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdmin } from "@/lib/auth/roles";
import { isLocale, type Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";

function readLocale(formData: FormData): Locale {
  const raw = String(formData.get("locale") ?? "ru");
  return isLocale(raw) ? raw : "ru";
}

/** Copies a product as an unpublished draft and opens the editor. */
export async function duplicateProduct(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) redirect(localizedPath("/", locale));

  const id = String(formData.get("id") ?? "");
  if (!id) redirect(localizedPath("/admin/products", locale));

  const service = createServiceClient();
  const { data: source, error } = await service.from("products").select("*").eq("id", id).maybeSingle();
  if (error || !source) {
    console.error(error);
    redirect(localizedPath("/admin/products", locale));
  }

  const { id: _id, created_at: _created, updated_at: _updated, slug: _slug, ...rest } = source;
  const { data: created, error: insertError } = await service
    .from("products")
    .insert({
      ...rest,
      active: false,
      sku: null,
      slug: `copy-${crypto.randomUUID()}`,
      name_ru: `${source.name_ru} (копия)`.slice(0, 180),
      name_en: `${source.name_en || source.name_ru} (copy)`.slice(0, 180),
    })
    .select("id")
    .single();

  if (insertError || !created) {
    console.error(insertError);
    redirect(localizedPath("/admin/products", locale));
  }

  await service.from("products").update({ slug: created.id }).eq("id", created.id);

  revalidatePath(`/${locale}/admin/products`, "page");
  redirect(localizedPath(`/admin/products/${created.id}/edit`, locale));
}
