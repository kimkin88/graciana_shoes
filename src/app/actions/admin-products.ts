"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdmin } from "@/lib/auth/roles";
import { isLocale, type Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";
import { deleteProductFolder } from "@/lib/storage/media";
import { centsFromMajor, parseGallery, textToSpecs } from "@/lib/products/commerce";
import { isNumericSlug, isUuid, nextAvailableSlug } from "@/lib/products/slugify";
import type { GalleryItem } from "@/types";

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isValidProductSlug(slug: string) {
  if (isUuid(slug)) return true;
  // Numeric slugs are rewritten to the product UUID on create/update.
  if (isNumericSlug(slug)) return true;
  return slugRe.test(slug) && slug.length >= 2;
}

function readLocale(formData: FormData): Locale {
  const raw = String(formData.get("locale") ?? "ru");
  return isLocale(raw) ? raw : "ru";
}

function isMissingColumn(error: { message?: string; code?: string } | null) {
  const message = error?.message ?? "";
  return error?.code === "PGRST204" || error?.code === "42703" || /does not exist/i.test(message);
}

function withoutExtendedFields<T extends Record<string, unknown>>(row: T) {
  const {
    image_original_path: _o,
    image_optimized_path: _p,
    video_path: _v,
    compare_at_cents: _c,
    short_description_ru: _sr,
    short_description_en: _se,
    manufacturer: _m,
    model: _mo,
    source_url: _su,
    tags: _t,
    gallery: _g,
    specs: _sp,
    seo_title_ru: _str,
    seo_title_en: _ste,
    seo_description_ru: _sdr,
    seo_description_en: _sde,
    sku: _sku,
    ...rest
  } = row;
  void _o;
  void _p;
  void _v;
  void _c;
  void _sr;
  void _se;
  void _m;
  void _mo;
  void _su;
  void _t;
  void _g;
  void _sp;
  void _str;
  void _ste;
  void _sdr;
  void _sde;
  void _sku;
  return rest;
}

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
  const description_ru = String(formData.get("description_ru") ?? "").trim() || null;
  const description_en = String(formData.get("description_en") ?? "").trim() || null;
  const short_description_ru = String(formData.get("short_description_ru") ?? "").trim() || null;
  const short_description_en = String(formData.get("short_description_en") ?? "").trim() || null;
  const priceRaw = String(formData.get("price_major") ?? formData.get("price_cents") ?? "");
  const compareRaw = String(formData.get("compare_at_major") ?? "");
  const price_cents = priceRaw.includes(".") || formData.get("price_major")
    ? centsFromMajor(priceRaw)
    : Number.parseInt(priceRaw, 10);
  const compare_at_cents = compareRaw.trim() ? centsFromMajor(compareRaw) : null;
  const currency =
    String(formData.get("currency") ?? "byn")
      .trim()
      .toLowerCase() || "byn";
  const category = String(formData.get("category") ?? "").trim() || null;
  const group_key = String(formData.get("group_key") ?? "").trim().toLowerCase() || null;
  const stock = Number.parseInt(String(formData.get("stock") ?? "0"), 10);
  const featured = formData.get("featured") === "on";
  const intent = String(formData.get("intent") ?? "");
  const active =
    intent === "publish" ? true : intent === "draft" ? false : formData.get("active") === "on";
  const image_url = String(formData.get("image_url") ?? "").trim() || null;
  const video_url = String(formData.get("video_url") ?? "").trim() || null;
  const sku = String(formData.get("sku") ?? "").trim() || null;
  const manufacturer = String(formData.get("manufacturer") ?? "").trim() || null;
  const model = String(formData.get("model") ?? "").trim() || null;
  const source_url = String(formData.get("source_url") ?? "").trim() || null;
  const colors = parseCsvValues(String(formData.get("colors") ?? ""));
  const sizes = parseCsvValues(String(formData.get("sizes") ?? ""));
  const tags = parseCsvValues(String(formData.get("tags") ?? ""));
  const specs = textToSpecs(String(formData.get("specs") ?? ""));
  const sizesMinsk = String(formData.get("sizes_minsk") ?? "").trim();
  const sizesBrest = String(formData.get("sizes_brest") ?? "").trim();
  delete specs.sizes_minsk;
  delete specs.sizes_brest;
  if (sizesMinsk) specs.sizes_minsk = sizesMinsk;
  if (sizesBrest) specs.sizes_brest = sizesBrest;
  let galleryRaw: unknown = [];
  try {
    galleryRaw = JSON.parse(String(formData.get("gallery_json") ?? "[]"));
  } catch {
    galleryRaw = [];
  }
  const gallery = parseGallery(galleryRaw);
  const seo_title_ru = String(formData.get("seo_title_ru") ?? "").trim() || null;
  const seo_title_en = String(formData.get("seo_title_en") ?? "").trim() || null;
  const seo_description_ru = String(formData.get("seo_description_ru") ?? "").trim() || null;
  const seo_description_en = String(formData.get("seo_description_en") ?? "").trim() || null;

  return {
    slug,
    name_ru,
    name_en,
    description_ru,
    description_en,
    short_description_ru,
    short_description_en,
    price_cents,
    compare_at_cents: compare_at_cents != null && !Number.isNaN(compare_at_cents) ? compare_at_cents : null,
    currency,
    category,
    group_key,
    stock: Number.isNaN(stock) ? 0 : Math.max(0, stock),
    featured,
    active,
    image_url,
    video_url,
    sku,
    manufacturer,
    model,
    source_url,
    colors,
    sizes,
    tags,
    specs,
    gallery,
    seo_title_ru,
    seo_title_en,
    seo_description_ru,
    seo_description_en,
  };
}

function uploadedPath(formData: FormData, key: string, productId: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.startsWith(`${productId}/`) && !value.includes("..") ? value : null;
}

function uploadedMedia(formData: FormData, productId: string) {
  return {
    image_original_path: uploadedPath(formData, "image_original_path", productId),
    image_optimized_path: uploadedPath(formData, "image_optimized_path", productId),
    video_path: uploadedPath(formData, "video_path", productId),
  };
}

function fail(locale: Locale, path: string, code: string): never {
  redirect(`${localizedPath(path, locale)}?error=${code}`);
}

type ServiceClient = ReturnType<typeof createServiceClient>;

async function allocateUniqueSlug(service: ServiceClient, desired: string, excludeId?: string) {
  const base = desired.trim().toLowerCase() || "product";
  const { data, error } = await service
    .from("products")
    .select("id, slug")
    .or(`slug.eq.${base},slug.like.${base}-%`);
  if (error) {
    console.error("[allocateUniqueSlug]", error);
    return nextAvailableSlug(base, []);
  }
  const taken = (data ?? [])
    .filter((row) => row.id !== excludeId)
    .map((row) => String(row.slug ?? ""));
  return nextAvailableSlug(base, taken);
}

async function upsertTaxonomy(
  service: ReturnType<typeof createServiceClient>,
  fields: { category: string | null; group_key: string | null; tags: string[] },
) {
  try {
    if (fields.category) {
      await service.from("catalog_categories").upsert(
        {
          slug: fields.category,
          name_ru: fields.category,
          name_en: fields.category,
        },
        { onConflict: "slug" },
      );
    }
    if (fields.group_key) {
      await service.from("catalog_groups").upsert(
        {
          key: fields.group_key,
          name_ru: fields.group_key,
          name_en: fields.group_key,
        },
        { onConflict: "key" },
      );
    }
    for (const tag of fields.tags) {
      await service.from("catalog_tags").upsert({ slug: tag }, { onConflict: "slug" });
    }
  } catch (err) {
    console.error("[taxonomy]", err);
  }
}

function keptGallery(existing: GalleryItem[]): GalleryItem[] {
  return existing.filter(
    (item) => item.url && !item.url.startsWith("blob:") && !item.url.startsWith("data:"),
  );
}

function syncPrimaryVideo(gallery: GalleryItem[], fields: { video_url: string | null }) {
  const firstVideo = gallery.find((item) => item.kind === "video");
  if (firstVideo) {
    return {
      video_url: firstVideo.url,
      video_path: firstVideo.path ?? null,
    };
  }
  if (fields.video_url && !fields.video_url.startsWith("blob:") && !fields.video_url.startsWith("data:")) {
    return { video_url: fields.video_url, video_path: null as string | null };
  }
  return { video_url: null as string | null, video_path: null as string | null };
}

export async function createProduct(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) redirect(localizedPath("/", locale));
  const service = createServiceClient();
  const fields = parseProductFields(formData);
  const requestedId = String(formData.get("product_id") ?? "");
  const productIdForMedia = isUuid(requestedId) ? requestedId : crypto.randomUUID();
  const directMedia = uploadedMedia(formData, productIdForMedia);
  if (!isValidProductSlug(fields.slug)) fail(locale, "/admin/products/new", "slug");
  if (!fields.name_ru || !fields.name_en || !Number.isFinite(fields.price_cents) || fields.price_cents < 1) {
    fail(locale, "/admin/products/new", "fields");
  }
  if (fields.compare_at_cents != null && fields.compare_at_cents <= fields.price_cents) {
    fail(locale, "/admin/products/new", "price");
  }

  // Never persist a bare numeric slug — replace with UUID after insert if needed.
  const wantsUuidSlug = isNumericSlug(fields.slug) || fields.slug === "product";
  const slug = wantsUuidSlug ? `tmp-${Date.now()}` : await allocateUniqueSlug(service, fields.slug);
  const insertPayload = {
    ...fields,
    id: productIdForMedia,
    slug,
    image_original_path: directMedia.image_original_path,
    image_optimized_path: directMedia.image_optimized_path,
    video_path: directMedia.video_path,
  };

  let productId: string | undefined;
  let first = await service.from("products").insert(insertPayload).select("id").single();
  if (first.error?.code === "23505" && !wantsUuidSlug) {
    insertPayload.slug = await allocateUniqueSlug(service, fields.slug);
    first = await service.from("products").insert(insertPayload).select("id").single();
  }
  if (first.error && isMissingColumn(first.error)) {
    const retryPayload = { ...withoutExtendedFields(fields), id: productIdForMedia, slug: insertPayload.slug };
    let retry = await service.from("products").insert(retryPayload).select("id").single();
    if (retry.error?.code === "23505") {
      retryPayload.slug = await allocateUniqueSlug(service, fields.slug);
      retry = await service.from("products").insert(retryPayload).select("id").single();
    }
    if (retry.error || !retry.data?.id) {
      console.error(retry.error);
      fail(locale, "/admin/products/new", "db");
    }
    productId = retry.data.id;
  } else if (first.error || !first.data?.id) {
    console.error(first.error);
    fail(locale, "/admin/products/new", "db");
  } else {
    productId = first.data.id;
  }
  if (!productId) fail(locale, "/admin/products/new", "db");

  if (wantsUuidSlug || isNumericSlug(fields.slug)) {
    const { error: slugErr } = await service.from("products").update({ slug: productId }).eq("id", productId);
    if (slugErr) console.error("[createProduct:slug]", slugErr);
  }

  const mediaPatch: Record<string, unknown> = {};
  const gallery = keptGallery(fields.gallery);

  if (directMedia.image_original_path && directMedia.image_optimized_path) {
    mediaPatch.image_original_path = directMedia.image_original_path;
    mediaPatch.image_optimized_path = directMedia.image_optimized_path;
    mediaPatch.image_url =
      fields.image_url && !fields.image_url.startsWith("blob:") && !fields.image_url.startsWith("data:")
        ? fields.image_url
        : null;
  } else if (fields.image_url?.startsWith("blob:") || fields.image_url?.startsWith("data:")) {
    mediaPatch.image_url = null;
  }

  if (directMedia.video_path) {
    mediaPatch.video_path = directMedia.video_path;
    mediaPatch.video_url =
      fields.video_url && !fields.video_url.startsWith("blob:") && !fields.video_url.startsWith("data:")
        ? fields.video_url
        : null;
  }

  mediaPatch.gallery = gallery;
  if (!directMedia.video_path) {
    Object.assign(mediaPatch, syncPrimaryVideo(gallery, fields));
  }

  if (Object.keys(mediaPatch).length) {
    const upd = await service.from("products").update(mediaPatch).eq("id", productId);
    if (upd.error && isMissingColumn(upd.error)) {
      await service
        .from("products")
        .update({
          image_url: mediaPatch.image_url ?? fields.image_url,
          video_url: mediaPatch.video_url ?? fields.video_url,
        })
        .eq("id", productId);
    } else if (upd.error) {
      console.error(upd.error);
      await service.from("products").delete().eq("id", productId);
      await deleteProductFolder(service, productId);
      fail(locale, "/admin/products/new", "db");
    }
  }

  await upsertTaxonomy(service, fields);
  revalidatePath(`/${locale}`, "layout");
  revalidatePath(`/${locale}/products`, "page");
  revalidatePath(`/${locale}/admin/products`, "page");
  redirect(`${localizedPath("/admin/products", locale)}?saved=${fields.active ? "1" : "draft"}`);
}

export async function updateProduct(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) redirect(localizedPath("/", locale));
  const service = createServiceClient();
  const id = String(formData.get("id") ?? "");
  const fields = parseProductFields(formData);
  if (!id || !isValidProductSlug(fields.slug)) fail(locale, "/admin/products", "slug");
  if (!fields.name_ru || !fields.name_en || !Number.isFinite(fields.price_cents) || fields.price_cents < 1) {
    fail(locale, `/admin/products/${id || "new"}/edit`, "fields");
  }
  if (fields.compare_at_cents != null && fields.compare_at_cents <= fields.price_cents) {
    fail(locale, `/admin/products/${id}/edit`, "price");
  }

  const slug =
    isNumericSlug(fields.slug) || fields.slug === "product" || !fields.slug
      ? id
      : await allocateUniqueSlug(service, fields.slug, id);
  const patch: Record<string, unknown> = { ...fields, slug };
  const directMedia = uploadedMedia(formData, id);
  const gallery = keptGallery(fields.gallery);

  if (directMedia.image_original_path && directMedia.image_optimized_path) {
    patch.image_original_path = directMedia.image_original_path;
    patch.image_optimized_path = directMedia.image_optimized_path;
    patch.image_url =
      fields.image_url && !fields.image_url.startsWith("blob:") && !fields.image_url.startsWith("data:")
        ? fields.image_url
        : null;
  } else if (typeof patch.image_url === "string" && (patch.image_url.startsWith("blob:") || patch.image_url.startsWith("data:"))) {
    patch.image_url = null;
  }

  if (directMedia.video_path) {
    patch.video_path = directMedia.video_path;
    patch.video_url =
      fields.video_url && !fields.video_url.startsWith("blob:") && !fields.video_url.startsWith("data:")
        ? fields.video_url
        : null;
  }

  patch.gallery = gallery;
  if (!directMedia.video_path) {
    Object.assign(patch, syncPrimaryVideo(gallery, fields));
  }

  const { error } = await service.from("products").update(patch).eq("id", id);
  if (error && isMissingColumn(error)) {
    const retry = await service.from("products").update(withoutExtendedFields(patch)).eq("id", id);
    if (retry.error) {
      console.error(retry.error);
      fail(locale, `/admin/products/${id}/edit`, "db");
    }
  } else if (error?.code === "23505") {
    patch.slug = await allocateUniqueSlug(service, String(patch.slug ?? fields.slug), id);
    const again = await service.from("products").update(patch).eq("id", id);
    if (again.error) {
      console.error(again.error);
      fail(locale, `/admin/products/${id}/edit`, "db");
    }
  } else if (error) {
    console.error(error);
    fail(locale, `/admin/products/${id}/edit`, "db");
  }

  await upsertTaxonomy(service, fields);
  revalidatePath(`/${locale}`, "layout");
  revalidatePath(`/${locale}/products`, "page");
  revalidatePath(`/${locale}/admin/products`, "page");
  redirect(`${localizedPath("/admin/products", locale)}?saved=${fields.active ? "1" : "draft"}`);
}

export async function deleteProduct(formData: FormData) {
  // Re-export kept for older call sites; prefer `@/app/actions/delete-product`.
  const { deleteProduct: run } = await import("@/app/actions/delete-product");
  return run(formData);
}
