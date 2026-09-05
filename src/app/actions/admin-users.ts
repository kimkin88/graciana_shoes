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

export async function updateUserRole(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) {
    redirect(localizedPath("/", locale));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = String(formData.get("user_id") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "").trim();
  const role = roleRaw === "admin" ? "admin" : "customer";

  if (!userId) {
    redirect(`${localizedPath("/admin/users", locale)}?error=missing`);
  }

  if (user?.id === userId && role !== "admin") {
    redirect(`${localizedPath("/admin/users", locale)}?error=self`);
  }

  const service = createServiceClient();
  const email = String(formData.get("email") ?? "").trim() || null;
  const updated = await service.from("profiles").update({ role }).eq("id", userId).select("id");
  if (updated.error) {
    console.error("[updateUserRole]", updated.error);
    redirect(`${localizedPath("/admin/users", locale)}?error=save`);
  }
  if (!updated.data?.length) {
    const inserted = await service.from("profiles").insert({ id: userId, role, email });
    if (inserted.error) {
      console.error("[updateUserRole:insert]", inserted.error);
      redirect(`${localizedPath("/admin/users", locale)}?error=save`);
    }
  }

  revalidatePath(`/${locale}/admin/users`, "page");
  redirect(`${localizedPath("/admin/users", locale)}?saved=1`);
}
