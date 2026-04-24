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

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseCsvValues(raw: string): string[] {
  return raw
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

function parseProductFields(formData: FormData) {
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const name_ru = String(formData.get("name_ru") ?? "").trim();
  const name_en = String(formData.get("name_en") ?? "").trim();
  const description_ru =
    String(formData.get("description_ru") ?? "").trim() || null;
  const description_en =
    String(formData.get("description_en") ?? "").trim() || null;
  const price_cents = Number.parseInt(String(formData.get("price_cents") ?? ""), 10);
  const currency = String(formData.get("currency") ?? "usd")
    .trim()
    .toLowerCase();
  const category =
    String(formData.get("category") ?? "").trim() || null;
  const group_key =
    String(formData.get("group_key") ?? "").trim().toLowerCase() || null;
  const stock = Number.parseInt(String(formData.get("stock") ?? "0"), 10);
  const featured = formData.get("featured") === "on";
  const active = formData.get("active") === "on";
  const image_url =
    String(formData.get("image_url") ?? "").trim() || null;
  const video_url =
    String(formData.get("video_url") ?? "").trim() || null;
  const colors = parseCsvValues(String(formData.get("colors") ?? ""));
  const sizes = parseCsvValues(String(formData.get("sizes") ?? ""));

  return {
    slug,
    name_ru,
    name_en,
    description_ru,
    description_en,
    price_cents,
    currency,
    category,
    group_key,
    stock,
    featured,
    active,
    image_url,
    video_url,
    colors,
    sizes,
  };
}

async function resolveImageUrl(
  service: ReturnType<typeof createServiceClient>,
  locale: Locale,
  formData: FormData,
  fallbackUrl: string | null,
) {
  const rawFile = formData.get("image_file");
  if (!(rawFile instanceof File) || rawFile.size === 0) {
    return fallbackUrl;
  }
  const extension = rawFile.name.includes(".")
    ? rawFile.name.split(".").pop()?.toLowerCase() ?? "jpg"
    : "jpg";
  const filePath = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const { error } = await service.storage
    .from("product-images")
    .upload(filePath, rawFile, { contentType: rawFile.type, upsert: false });
  if (error) {
    console.error("[admin-products:image-upload]", error);
    redirect(`${localizedPath("/admin/products/new", locale)}?error=image_upload`);
  }
  const { data } = service.storage.from("product-images").getPublicUrl(filePath);
  return data.publicUrl;
}

async function resolveVideoUrl(
  service: ReturnType<typeof createServiceClient>,
  locale: Locale,
  formData: FormData,
  fallbackUrl: string | null,
) {
  const rawFile = formData.get("video_file");
  if (!(rawFile instanceof File) || rawFile.size === 0) {
    return fallbackUrl;
  }
  const extension = rawFile.name.includes(".")
    ? rawFile.name.split(".").pop()?.toLowerCase() ?? "mp4"
    : "mp4";
  const filePath = `videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const { error } = await service.storage
    .from("product-images")
    .upload(filePath, rawFile, { contentType: rawFile.type, upsert: false });
  if (error) {
    console.error("[admin-products:video-upload]", error);
    redirect(`${localizedPath("/admin/products/new", locale)}?error=video_upload`);
  }
  const { data } = service.storage.from("product-images").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function createProduct(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) {
    redirect(localizedPath("/", locale));
  }
  const service = createServiceClient();

  const fields = parseProductFields(formData);
  if (!slugRe.test(fields.slug)) {
    redirect(`${localizedPath("/admin/products/new", locale)}?error=slug`);
  }
  if (!fields.name_ru || !fields.name_en || Number.isNaN(fields.price_cents)) {
    redirect(`${localizedPath("/admin/products/new", locale)}?error=fields`);
  }

  const imageUrl = await resolveImageUrl(service, locale, formData, fields.image_url);
  const videoUrl = await resolveVideoUrl(service, locale, formData, fields.video_url);

  const { error } = await service.from("products").insert({
    ...fields,
    image_url: imageUrl,
    video_url: videoUrl,
    stock: Number.isNaN(fields.stock) ? 0 : Math.max(0, fields.stock),
  });
  if (error) {
    console.error(error);
    redirect(`${localizedPath("/admin/products/new", locale)}?error=db`);
  }

  revalidatePath(`/${locale}`, "layout");
  revalidatePath(`/${locale}/products`, "page");
  revalidatePath(`/${locale}/admin/products`, "page");
  redirect(localizedPath("/admin/products", locale));
}

export async function updateProduct(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) {
    redirect(localizedPath("/", locale));
  }
  const service = createServiceClient();

  const id = String(formData.get("id") ?? "");
  const fields = parseProductFields(formData);
  if (!id || !slugRe.test(fields.slug)) {
    redirect(`${localizedPath("/admin/products", locale)}?error=slug`);
  }

  const imageUrl = await resolveImageUrl(service, locale, formData, fields.image_url);
  const videoUrl = await resolveVideoUrl(service, locale, formData, fields.video_url);

  const { error } = await service
    .from("products")
    .update({
      ...fields,
      image_url: imageUrl,
      video_url: videoUrl,
      stock: Number.isNaN(fields.stock) ? 0 : Math.max(0, fields.stock),
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    redirect(`${localizedPath(`/admin/products/${id}/edit`, locale)}?error=db`);
  }

  revalidatePath(`/${locale}`, "layout");
  revalidatePath(`/${locale}/products`, "page");
  revalidatePath(`/${locale}/admin/products`, "page");
  redirect(localizedPath("/admin/products", locale));
}

export async function deleteProduct(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) {
    redirect(localizedPath("/", locale));
  }
  const service = createServiceClient();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect(localizedPath("/admin/products", locale));

  const { error } = await service.from("products").delete().eq("id", id);
  if (error) console.error(error);

  revalidatePath(`/${locale}`, "layout");
  revalidatePath(`/${locale}/products`, "page");
  revalidatePath(`/${locale}/admin/products`, "page");
  redirect(localizedPath("/admin/products", locale));
}
