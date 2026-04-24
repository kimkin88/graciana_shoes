"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/roles";
import { isLocale, type Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";

function readLocale(formData: FormData): Locale {
  const raw = String(formData.get("locale") ?? "ru");
  return isLocale(raw) ? raw : "ru";
}

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
  const stock = Number.parseInt(String(formData.get("stock") ?? "0"), 10);
  const featured = formData.get("featured") === "on";
  const active = formData.get("active") === "on";
  const image_url =
    String(formData.get("image_url") ?? "").trim() || null;

  return {
    slug,
    name_ru,
    name_en,
    description_ru,
    description_en,
    price_cents,
    currency,
    category,
    stock,
    featured,
    active,
    image_url,
  };
}

export async function createProduct(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) {
    redirect(localizedPath("/", locale));
  }

  const fields = parseProductFields(formData);
  if (!slugRe.test(fields.slug)) {
    redirect(`${localizedPath("/admin/products/new", locale)}?error=slug`);
  }
  if (!fields.name_ru || !fields.name_en || Number.isNaN(fields.price_cents)) {
    redirect(`${localizedPath("/admin/products/new", locale)}?error=fields`);
  }

  const { error } = await supabase.from("products").insert({
    ...fields,
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

  const id = String(formData.get("id") ?? "");
  const fields = parseProductFields(formData);
  if (!id || !slugRe.test(fields.slug)) {
    redirect(`${localizedPath("/admin/products", locale)}?error=slug`);
  }

  const { error } = await supabase
    .from("products")
    .update({
      ...fields,
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
  const id = String(formData.get("id") ?? "");
  if (!id) redirect(localizedPath("/admin/products", locale));

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) console.error(error);

  revalidatePath(`/${locale}`, "layout");
  revalidatePath(`/${locale}/products`, "page");
  revalidatePath(`/${locale}/admin/products`, "page");
  redirect(localizedPath("/admin/products", locale));
}
