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

export async function updateProductGroup(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) {
    redirect(localizedPath("/", locale));
  }

  const id = String(formData.get("id") ?? "");
  const group_key = String(formData.get("group_key") ?? "").trim().toLowerCase() || null;
  if (!id) {
    redirect(localizedPath("/admin/groups", locale));
  }

  const service = createServiceClient();
  const { error } = await service
    .from("products")
    .update({ group_key })
    .eq("id", id);
  if (error) {
    console.error("[admin-groups:update]", error);
    redirect(`${localizedPath("/admin/groups", locale)}?error=db`);
  }

  revalidatePath(`/${locale}`, "page");
  revalidatePath(`/${locale}/admin/groups`, "page");
  revalidatePath(`/${locale}/admin/products`, "page");
  redirect(localizedPath("/admin/groups", locale));
}
