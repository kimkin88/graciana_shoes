"use client";

import { createClient } from "@/lib/supabase/client";
import { isImageTooLarge, isVideoTooLarge } from "@/lib/storage/media-limits";
import { PRODUCT_IMAGES_BUCKET, publicStorageUrl } from "@/lib/storage/urls";
import type { GalleryItem } from "@/types";

function assertImageSize(file: File | Blob) {
  if (isImageTooLarge(file.size)) throw new Error("image_too_large");
}

function assertVideoSize(file: File | Blob) {
  if (isVideoTooLarge(file.size)) throw new Error("video_too_large");
}

type UploadKind = "image-original" | "image-optimized" | "video" | "gallery-image" | "gallery-video";

type PendingUpload = {
  key: string;
  kind: UploadKind;
  file: File | Blob;
  name: string;
  index?: number;
  contentType: string;
};

type SignedUpload = { key: string; path: string; token: string };

async function optimizedJpeg(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1400 / bitmap.width, 1750 / bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("image_process");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.78));
  if (!blob) throw new Error("image_process");
  return blob;
}

/** Storefront copy: shrink when possible; keep the original file if the browser cannot decode it. */
async function storefrontImage(file: File): Promise<{ blob: Blob; contentType: string; name: string }> {
  try {
    const blob = await optimizedJpeg(file);
    return { blob, contentType: "image/jpeg", name: "optimized.jpg" };
  } catch (error) {
    console.warn("[product-media:optimize]", error);
    return {
      blob: file,
      contentType: file.type || "application/octet-stream",
      name: file.name || "original",
    };
  }
}

async function sign(productId: string, uploads: PendingUpload[]) {
  const response = await fetch("/api/admin/product-media/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId,
      uploads: uploads.map(({ key, kind, name, index, file }) => ({
        key,
        kind,
        name,
        index,
        size: file.size,
      })),
    }),
  });
  if (!response.ok) throw new Error("media_sign");
  const payload = (await response.json()) as { uploads?: SignedUpload[] };
  if (!payload.uploads || payload.uploads.length !== uploads.length) throw new Error("media_sign");
  return payload.uploads;
}

export type ProductMediaUploadResult = {
  image?: { originalPath: string; optimizedPath: string; url: string };
  video?: { path: string; url: string };
  gallery: GalleryItem[];
};

export async function uploadProductMedia(input: {
  productId: string;
  image?: File | null;
  video?: File | null;
  galleryImages: File[];
  galleryVideos: File[];
  keptGallery: GalleryItem[];
}): Promise<ProductMediaUploadResult> {
  const pending: PendingUpload[] = [];

  if (input.image) {
    assertImageSize(input.image);
    const optimized = await storefrontImage(input.image);
    pending.push({
      key: "primary-original",
      kind: "image-original",
      file: input.image,
      name: input.image.name,
      contentType: input.image.type || "application/octet-stream",
    });
    pending.push({
      key: "primary-optimized",
      kind: "image-optimized",
      file: optimized.blob,
      name: optimized.name,
      contentType: optimized.contentType,
    });
  }
  if (input.video) {
    assertVideoSize(input.video);
    pending.push({
      key: "primary-video",
      kind: "video",
      file: input.video,
      name: input.video.name,
      contentType: input.video.type || "video/mp4",
    });
  }

  let imageIndex = input.keptGallery.filter((item) => (item.kind ?? "image") !== "video").length;
  const galleryImageFiles = input.galleryImages.slice(0, 16);
  for (const [offset, file] of galleryImageFiles.entries()) {
    assertImageSize(file);
    const optimized = await storefrontImage(file);
    pending.push({
      key: `gallery-image-${offset}`,
      kind: "gallery-image",
      file: optimized.blob,
      name: optimized.name,
      index: imageIndex + offset,
      contentType: optimized.contentType,
    });
  }

  let videoIndex = input.keptGallery.filter((item) => item.kind === "video").length;
  input.galleryVideos.slice(0, 8).forEach((file, offset) => {
    assertVideoSize(file);
    pending.push({
      key: `gallery-video-${offset}`,
      kind: "gallery-video",
      file,
      name: file.name,
      index: videoIndex + offset,
      contentType: file.type || "video/mp4",
    });
  });

  if (!pending.length) return { gallery: input.keptGallery };

  const signed = await sign(input.productId, pending);
  const signedByKey = new Map(signed.map((item) => [item.key, item]));
  const supabase = createClient();

  await Promise.all(
    pending.map(async (item) => {
      const target = signedByKey.get(item.key);
      if (!target) throw new Error("media_sign");
      const result = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .uploadToSignedUrl(target.path, target.token, item.file, {
          contentType: item.contentType,
          cacheControl: "3600",
        });
      if (result.error) throw new Error("media_upload");
    }),
  );

  const original = signedByKey.get("primary-original");
  const optimized = signedByKey.get("primary-optimized");
  const primaryVideo = signedByKey.get("primary-video");
  const gallery: GalleryItem[] = [...input.keptGallery];

  input.galleryImages.slice(0, 16).forEach((_, offset) => {
    const target = signedByKey.get(`gallery-image-${offset}`);
    if (target) gallery.push({ kind: "image", path: target.path, url: publicStorageUrl(target.path) ?? "" });
  });
  input.galleryVideos.slice(0, 8).forEach((_, offset) => {
    const target = signedByKey.get(`gallery-video-${offset}`);
    if (target) gallery.push({ kind: "video", path: target.path, url: publicStorageUrl(target.path) ?? "" });
  });

  return {
    image:
      original && optimized
        ? {
            originalPath: original.path,
            optimizedPath: optimized.path,
            url: publicStorageUrl(optimized.path) ?? "",
          }
        : undefined,
    video: primaryVideo
      ? { path: primaryVideo.path, url: publicStorageUrl(primaryVideo.path) ?? "" }
      : undefined,
    gallery,
  };
}
