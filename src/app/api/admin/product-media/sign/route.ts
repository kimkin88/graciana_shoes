import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/storage/urls";
import { isUuid } from "@/lib/products/slugify";

type UploadKind = "image-original" | "image-optimized" | "video" | "gallery-image" | "gallery-video";

type UploadRequest = {
  key: string;
  kind: UploadKind;
  name?: string;
  index?: number;
  size: number;
};

const IMAGE_MAX = 20 * 1024 * 1024;
const VIDEO_MAX = 28 * 1024 * 1024;
const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const VIDEO_EXTS = new Set(["mp4", "mov", "webm", "m4v"]);

function extension(name: string | undefined, fallback: string) {
  const raw = name?.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || fallback;
  return raw === "jpeg" ? "jpg" : raw;
}

function uploadPath(productId: string, item: UploadRequest) {
  if (!item.key || item.key.length > 100 || !Number.isFinite(item.size) || item.size <= 0) return null;

  if (item.kind === "image-optimized") {
    if (item.size > IMAGE_MAX) return null;
    return `${productId}/optimized.jpg`;
  }

  if (item.kind === "gallery-image") {
    if (item.size > IMAGE_MAX || !Number.isInteger(item.index) || item.index! < 0 || item.index! > 99) return null;
    return `${productId}/g-${item.index}.jpg`;
  }

  if (item.kind === "image-original") {
    const ext = extension(item.name, "jpg");
    if (item.size > IMAGE_MAX || !IMAGE_EXTS.has(ext)) return null;
    return `${productId}/original.${ext}`;
  }

  const ext = extension(item.name, "mp4");
  if (item.size > VIDEO_MAX || !VIDEO_EXTS.has(ext)) return null;
  if (item.kind === "video") return `${productId}/video.${ext}`;
  if (item.kind === "gallery-video" && Number.isInteger(item.index) && item.index! >= 0 && item.index! <= 99) {
    return `${productId}/gv-${item.index}.${ext}`;
  }
  return null;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | { productId?: string; uploads?: UploadRequest[] }
    | null;
  const productId = body?.productId ?? "";
  const uploads = body?.uploads ?? [];
  if (!isUuid(productId) || !uploads.length || uploads.length > 26) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const service = createServiceClient();
  const signed = [];
  for (const item of uploads) {
    const path = uploadPath(productId, item);
    if (!path) return NextResponse.json({ error: "invalid_media" }, { status: 400 });
    const result = await service.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .createSignedUploadUrl(path, { upsert: true });
    if (result.error || !result.data) {
      console.error("[product-media:sign]", result.error);
      return NextResponse.json({ error: "storage" }, { status: 500 });
    }
    signed.push({ key: item.key, path, token: result.data.token });
  }

  return NextResponse.json({ uploads: signed });
}
