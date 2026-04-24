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

export async function updateHomeHeroImage(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) {
    redirect(localizedPath("/", locale));
  }
  const service = createServiceClient();

  let heroImageUrl = String(formData.get("hero_image_url") ?? "").trim() || null;
  const rawFile = formData.get("hero_image_file");
  if (rawFile instanceof File && rawFile.size > 0) {
    const extension = rawFile.name.includes(".")
      ? rawFile.name.split(".").pop()?.toLowerCase() ?? "jpg"
      : "jpg";
    const filePath = `site/hero-${Date.now()}.${extension}`;
    const { error } = await service.storage
      .from("product-images")
      .upload(filePath, rawFile, { contentType: rawFile.type, upsert: false });
    if (error) {
      console.error("[admin-site:hero-upload]", error);
      redirect(`${localizedPath("/admin", locale)}?error=hero_upload`);
    }
    const { data } = service.storage.from("product-images").getPublicUrl(filePath);
    heroImageUrl = data.publicUrl;
  }

  const { error } = await service
    .from("site_settings")
    .upsert({ id: 1, hero_image_url: heroImageUrl }, { onConflict: "id" });
  if (error) {
    console.error("[admin-site:upsert]", error);
    redirect(`${localizedPath("/admin", locale)}?error=hero_db`);
  }

  revalidatePath(`/${locale}`, "page");
  revalidatePath(`/${locale}/admin`, "page");
  redirect(localizedPath("/admin", locale));
}
