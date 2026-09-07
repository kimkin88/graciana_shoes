import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/storage/urls";

export { PRODUCT_IMAGES_BUCKET, publicStorageUrl } from "@/lib/storage/urls";

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const VIDEO_EXTS = new Set(["mp4", "mov", "webm", "m4v"]);
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 28 * 1024 * 1024;
const OPTIMIZED_MAX_WIDTH = 1400;
const OPTIMIZED_MAX_HEIGHT = 1750;

export type UploadedImageAssets = {
  originalPath: string;
  optimizedPath: string;
  originalUrl: string;
  optimizedUrl: string;
};

export type UploadedVideoAsset = {
  path: string;
  url: string;
};

function normalizeExt(name: string, fallback: string) {
  const raw = name.includes(".") ? name.split(".").pop()?.toLowerCase() ?? fallback : fallback;
  if (raw === "jpeg") return "jpg";
  return raw.replace(/[^a-z0-9]/g, "") || fallback;
}

function publicUrl(service: SupabaseClient, path: string) {
  return service.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function listFolder(service: SupabaseClient, folder: string) {
  const { data, error } = await service.storage.from(PRODUCT_IMAGES_BUCKET).list(folder, {
    limit: 100,
  });
  if (error) {
    console.error("[storage:list]", folder, error);
    return [];
  }
  return data ?? [];
}

async function removePaths(service: SupabaseClient, paths: string[]) {
  if (!paths.length) return;
  const { error } = await service.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
  if (error) console.error("[storage:remove]", error);
}

async function cleanupFolderExcept(
  service: SupabaseClient,
  folder: string,
  keepNames: Set<string>,
) {
  const entries = await listFolder(service, folder);
  const stale = entries
    .filter((entry) => entry.id && !keepNames.has(entry.name))
    .map((entry) => `${folder}/${entry.name}`);
  await removePaths(service, stale);
}

export async function createOptimizedJpeg(input: Buffer) {
  // Lazy-load sharp so admin list/delete routes don't crash if native bindings fail at module init.
  const sharp = (await import("sharp")).default;
  return sharp(input)
    .rotate()
    .resize({
      width: OPTIMIZED_MAX_WIDTH,
      height: OPTIMIZED_MAX_HEIGHT,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 78, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();
}

export async function uploadProductImage(
  service: SupabaseClient,
  productId: string,
  file: File,
): Promise<UploadedImageAssets> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("image_too_large");
  }
  const ext = normalizeExt(file.name, "jpg");
  if (!IMAGE_EXTS.has(ext) && !IMAGE_EXTS.has(file.type.replace("image/", ""))) {
    throw new Error("image_type");
  }
  const originalPath = `${productId}/original.${ext}`;
  const optimizedPath = `${productId}/optimized.jpg`;
  const originalBytes = Buffer.from(await file.arrayBuffer());
  const optimizedBytes = await createOptimizedJpeg(originalBytes);

  const originalUpload = await service.storage.from(PRODUCT_IMAGES_BUCKET).upload(originalPath, originalBytes, {
    contentType: file.type || `image/${ext}`,
    upsert: true,
    cacheControl: "3600",
  });
  if (originalUpload.error) {
    console.error("[storage:original]", originalUpload.error);
    throw new Error("image_upload");
  }

  const optimizedUpload = await service.storage.from(PRODUCT_IMAGES_BUCKET).upload(optimizedPath, optimizedBytes, {
    contentType: "image/jpeg",
    upsert: true,
    cacheControl: "3600",
  });
  if (optimizedUpload.error) {
    console.error("[storage:optimized]", optimizedUpload.error);
    await removePaths(service, [originalPath]);
    throw new Error("image_upload");
  }

  const existing = await listFolder(service, productId);
  await cleanupFolderExcept(
    service,
    productId,
    new Set([
      originalPath.split("/").pop()!,
      optimizedPath.split("/").pop()!,
      ...existing.filter((entry) => entry.name.startsWith("video.")).map((entry) => entry.name),
      ...existing.filter((entry) => entry.name.startsWith("g-")).map((entry) => entry.name),
      ...existing.filter((entry) => entry.name.startsWith("gv-")).map((entry) => entry.name),
    ]),
  );

  return {
    originalPath,
    optimizedPath,
    originalUrl: publicUrl(service, originalPath),
    optimizedUrl: publicUrl(service, optimizedPath),
  };
}

export async function uploadProductVideo(
  service: SupabaseClient,
  productId: string,
  file: File,
): Promise<UploadedVideoAsset> {
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("video_too_large");
  }
  const ext = normalizeExt(file.name, "mp4");
  if (!VIDEO_EXTS.has(ext)) {
    throw new Error("video_type");
  }
  const path = `${productId}/video.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await service.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, bytes, {
    contentType: file.type || `video/${ext}`,
    upsert: true,
    cacheControl: "3600",
  });
  if (error) {
    console.error("[storage:video]", error);
    throw new Error("video_upload");
  }

  const entries = await listFolder(service, productId);
  const stale = entries
    .filter((entry) => entry.name.startsWith("video.") && entry.name !== `video.${ext}`)
    .map((entry) => `${productId}/${entry.name}`);
  await removePaths(service, stale);

  return { path, url: publicUrl(service, path) };
}

export async function uploadGalleryImage(
  service: SupabaseClient,
  productId: string,
  file: File,
  index: number,
): Promise<UploadedImageAssets> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("image_too_large");
  }
  const originalBytes = Buffer.from(await file.arrayBuffer());
  const optimizedBytes = await createOptimizedJpeg(originalBytes);
  const path = `${productId}/g-${index}.jpg`;
  const { error } = await service.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, optimizedBytes, {
    contentType: "image/jpeg",
    upsert: true,
    cacheControl: "3600",
  });
  if (error) {
    console.error("[storage:gallery]", error);
    throw new Error("image_upload");
  }
  const url = publicUrl(service, path);
  return {
    originalPath: path,
    optimizedPath: path,
    originalUrl: url,
    optimizedUrl: url,
  };
}

export async function uploadGalleryVideo(
  service: SupabaseClient,
  productId: string,
  file: File,
  index: number,
): Promise<UploadedVideoAsset> {
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("video_too_large");
  }
  const ext = normalizeExt(file.name, "mp4");
  if (!VIDEO_EXTS.has(ext)) {
    throw new Error("video_type");
  }
  const path = `${productId}/gv-${index}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await service.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, bytes, {
    contentType: file.type || `video/${ext}`,
    upsert: true,
    cacheControl: "3600",
  });
  if (error) {
    console.error("[storage:gallery-video]", error);
    throw new Error("video_upload");
  }
  return { path, url: publicUrl(service, path) };
}

export async function uploadHeroImage(service: SupabaseClient, file: File): Promise<UploadedImageAssets> {
  return uploadProductImage(service, "site/hero", file);
}

export async function uploadHomeImage(
  service: SupabaseClient,
  tileId: string,
  file: File,
): Promise<UploadedImageAssets> {
  return uploadProductImage(service, `site/home/${tileId}`, file);
}

export async function uploadHomeVideo(
  service: SupabaseClient,
  tileId: string,
  file: File,
): Promise<UploadedVideoAsset> {
  return uploadProductVideo(service, `site/home/${tileId}`, file);
}

export async function deleteProductFolder(service: SupabaseClient, productId: string) {
  const entries = await listFolder(service, productId);
  await removePaths(
    service,
    entries.filter((entry) => entry.id).map((entry) => `${productId}/${entry.name}`),
  );
}
