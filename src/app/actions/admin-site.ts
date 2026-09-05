"use server";

import { readFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdmin } from "@/lib/auth/roles";
import { isLocale, type Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";
import { parseHomePage, type HomeMediaTile, type HomePageContent } from "@/lib/home/content";
import { PRODUCT_IMAGES_BUCKET, uploadHomeImage, uploadHomeVideo } from "@/lib/storage/media";

function readLocale(formData: FormData): Locale {
  const raw = String(formData.get("locale") ?? "ru");
  return isLocale(raw) ? raw : "ru";
}

function fail(locale: Locale, code: string): never {
  redirect(`${localizedPath("/admin/content", locale)}?error=${code}`);
}

function isBucketUrl(url: string) {
  return new RegExp(`/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`, "i").test(url);
}

function mimeFromName(name: string, fallback: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "mp4") return "video/mp4";
  if (ext === "webm") return "video/webm";
  if (ext === "mov") return "video/quicktime";
  return fallback;
}

async function fileFromExistingSrc(src: string, kind: "image" | "video"): Promise<File | null> {
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith("blob:") || trimmed.startsWith("data:") || isBucketUrl(trimmed)) {
    return null;
  }

  try {
    if (trimmed.startsWith("/")) {
      const relative = trimmed.replace(/^\/+/, "");
      const filePath = path.join(process.cwd(), "public", relative);
      const bytes = await readFile(filePath);
      const name = path.basename(filePath) || (kind === "image" ? "image.jpg" : "video.mp4");
      return new File([new Uint8Array(bytes)], name, {
        type: mimeFromName(name, kind === "image" ? "image/jpeg" : "video/mp4"),
      });
    }

    if (/^https?:\/\//i.test(trimmed)) {
      const res = await fetch(trimmed);
      if (!res.ok) return null;
      const bytes = Buffer.from(await res.arrayBuffer());
      const name =
        trimmed.split("/").pop()?.split("?")[0] || (kind === "image" ? "image.jpg" : "video.mp4");
      return new File([new Uint8Array(bytes)], name, {
        type: res.headers.get("content-type") || mimeFromName(name, kind === "image" ? "image/jpeg" : "video/mp4"),
      });
    }
  } catch (err) {
    console.error("[fileFromExistingSrc]", trimmed, err);
  }
  return null;
}

async function applyTileUploads(formData: FormData, tiles: HomeMediaTile[]) {
  const service = createServiceClient();
  for (const tile of tiles) {
    const image = formData.get(`image_${tile.id}`);
    const video = formData.get(`video_${tile.id}`);

    if (image instanceof File && image.size > 0) {
      const uploaded = await uploadHomeImage(service, tile.id, image);
      tile.src = uploaded.optimizedUrl;
    } else if (tile.src.startsWith("blob:") || tile.src.startsWith("data:")) {
      tile.src = "";
    } else {
      const fromSrc = await fileFromExistingSrc(tile.src, "image");
      if (fromSrc) {
        const uploaded = await uploadHomeImage(service, tile.id, fromSrc);
        tile.src = uploaded.optimizedUrl;
      }
    }

    if (video instanceof File && video.size > 0) {
      const uploaded = await uploadHomeVideo(service, tile.id, video);
      tile.video = uploaded.url;
    } else if (tile.video?.startsWith("blob:") || tile.video?.startsWith("data:")) {
      tile.video = "";
    } else if (tile.video) {
      const fromSrc = await fileFromExistingSrc(tile.video, "video");
      if (fromSrc) {
        const uploaded = await uploadHomeVideo(service, tile.id, fromSrc);
        tile.video = uploaded.url;
      }
    }

    if (tile.category) {
      tile.href = `/products?category=${encodeURIComponent(tile.category)}`;
    }
  }
}

async function saveHomePageRow(page: HomePageContent) {
  const service = createServiceClient();
  const full = await service.from("site_settings").upsert({ id: 1, home_page: page, home_builder: page });
  if (!full.error) return;
  if (/home_page|schema cache|does not exist/i.test(full.error.message ?? "")) {
    const fallback = await service.from("site_settings").upsert({ id: 1, home_builder: page });
    if (fallback.error) throw fallback.error;
    return;
  }
  throw full.error;
}

export async function updateSiteContent(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) {
    redirect(localizedPath("/", locale));
  }

  let parsed: HomePageContent;
  try {
    parsed = parseHomePage(JSON.parse(String(formData.get("home_page") ?? "{}")));
  } catch {
    fail(locale, "json");
  }

  try {
    await applyTileUploads(formData, [...parsed.hero, ...parsed.categories, ...parsed.looks]);
    await saveHomePageRow(parsed);
  } catch (err) {
    console.error("[updateSiteContent]", err);
    fail(locale, "save");
  }

  revalidatePath(`/${locale}`, "layout");
  revalidatePath(`/${locale}/admin/content`, "page");
  redirect(`${localizedPath("/admin/content", locale)}?saved=1`);
}
