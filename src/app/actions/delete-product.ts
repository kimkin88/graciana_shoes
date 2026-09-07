"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdmin } from "@/lib/auth/roles";
import { isLocale, type Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";
import { deleteProductFolder } from "@/lib/storage/media";

function readLocale(formData: FormData): Locale {
  const raw = String(formData.get("locale") ?? "ru");
  return isLocale(raw) ? raw : "ru";
}

/** Delete a catalog product + its storage folder (no image-processing imports). */
export async function deleteProduct(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) redirect(localizedPath("/", locale));
  const service = createServiceClient();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect(localizedPath("/admin/products", locale));

  const { error } = await service.from("products").delete().eq("id", id);
  if (error) console.error(error);
  await deleteProductFolder(service, id);

  revalidatePath(`/${locale}`, "layout");
  revalidatePath(`/${locale}/products`, "page");
  revalidatePath(`/${locale}/admin/products`, "page");
  redirect(localizedPath("/admin/products", locale));
}
