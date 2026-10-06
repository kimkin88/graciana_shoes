"use client";

import { createClient } from "@/lib/supabase/client";
import {
  applyTileSelection,
  type HomeMediaTile,
  type HomePageContent,
} from "@/lib/home/content";
import { isImageTooLarge, isVideoTooLarge } from "@/lib/storage/media-limits";
import { PRODUCT_IMAGES_BUCKET, publicStorageUrl } from "@/lib/storage/urls";

type PendingKind = "image" | "video";

const pendingFiles = new Map<string, { file: File; kind: PendingKind }>();

export function registerSitePendingFile(key: string, file: File, kind: PendingKind) {
  pendingFiles.set(key, { file, kind });
}

export function unregisterSitePendingFile(key: string) {
  pendingFiles.delete(key);
}

export function siteAssetPendingKey(tileId: string, assetId: string) {
  return `asset:${tileId}:${assetId}`;
}

export function siteTileImagePendingKey(tileId: string) {
  return `tile-image:${tileId}`;
}

export function siteTileVideoPendingKey(tileId: string) {
  return `tile-video:${tileId}`;
}

async function storefrontImage(file: File): Promise<{ blob: Blob; contentType: string; name: string }> {
  try {
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
    return { blob, contentType: "image/jpeg", name: "optimized.jpg" };
  } catch (error) {
    console.warn("[site-media:optimize]", error);
    return {
      blob: file,
      contentType: file.type || "application/octet-stream",
      name: file.name || "original",
    };
  }
}

type PendingUpload = {
  key: string;
  kind: "site-image" | "site-video";
  folder: string;
  file: Blob;
  name: string;
  contentType: string;
};

async function signAndUpload(uploads: PendingUpload[]) {
  if (!uploads.length) return new Map<string, string>();

  const response = await fetch("/api/admin/product-media/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uploads: uploads.map(({ key, kind, folder, file, name }) => ({
        key,
        kind,
        folder,
        name,
        size: file.size,
      })),
    }),
  });
  if (!response.ok) throw new Error("media_sign");
  const payload = (await response.json()) as { uploads?: Array<{ key: string; path: string; token: string }> };
  if (!payload.uploads || payload.uploads.length !== uploads.length) throw new Error("media_sign");

  const supabase = createClient();
  const urls = new Map<string, string>();
  await Promise.all(
    uploads.map(async (item) => {
      const target = payload.uploads!.find((row) => row.key === item.key);
      if (!target) throw new Error("media_sign");
      const result = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .uploadToSignedUrl(target.path, target.token, item.file, {
          contentType: item.contentType,
          cacheControl: "3600",
        });
      if (result.error) throw new Error("media_upload");
      const url = publicStorageUrl(target.path);
      if (!url) throw new Error("media_upload");
      urls.set(item.key, url);
    }),
  );
  return urls;
}

function isBlobUrl(src: string) {
  return src.startsWith("blob:") || src.startsWith("data:");
}

async function finalizeTile(tile: HomeMediaTile): Promise<HomeMediaTile> {
  const next: HomeMediaTile = {
    ...tile,
    media: tile.media ? tile.media.map((asset) => ({ ...asset })) : tile.media,
  };

  const uploads: PendingUpload[] = [];

  if (next.media?.length) {
    for (const asset of next.media) {
      if (!isBlobUrl(asset.src)) continue;
      const pendingKey = siteAssetPendingKey(tile.id, asset.id);
      const pending = pendingFiles.get(pendingKey);
      if (!pending) {
        asset.src = "";
        continue;
      }
      if (pending.kind === "image") {
        if (isImageTooLarge(pending.file.size)) throw new Error("image_too_large");
        const optimized = await storefrontImage(pending.file);
        uploads.push({
          key: pendingKey,
          kind: "site-image",
          folder: `site/home/${tile.id}/${asset.id}`,
          file: optimized.blob,
          name: optimized.name,
          contentType: optimized.contentType,
        });
      } else {
        if (isVideoTooLarge(pending.file.size)) throw new Error("video_too_large");
        uploads.push({
          key: pendingKey,
          kind: "site-video",
          folder: `site/home/${tile.id}/${asset.id}`,
          file: pending.file,
          name: pending.file.name,
          contentType: pending.file.type || "video/mp4",
        });
      }
    }
  } else {
    if (isBlobUrl(next.src)) {
      const pendingKey = siteTileImagePendingKey(tile.id);
      const pending = pendingFiles.get(pendingKey);
      if (!pending || pending.kind !== "image") {
        next.src = "";
      } else {
        if (isImageTooLarge(pending.file.size)) throw new Error("image_too_large");
        const optimized = await storefrontImage(pending.file);
        uploads.push({
          key: pendingKey,
          kind: "site-image",
          folder: `site/home/${tile.id}`,
          file: optimized.blob,
          name: optimized.name,
          contentType: optimized.contentType,
        });
      }
    }
    if (next.video && isBlobUrl(next.video)) {
      const pendingKey = siteTileVideoPendingKey(tile.id);
      const pending = pendingFiles.get(pendingKey);
      if (!pending || pending.kind !== "video") {
        next.video = "";
      } else {
        if (isVideoTooLarge(pending.file.size)) throw new Error("video_too_large");
        uploads.push({
          key: pendingKey,
          kind: "site-video",
          folder: `site/home/${tile.id}`,
          file: pending.file,
          name: pending.file.name,
          contentType: pending.file.type || "video/mp4",
        });
      }
    }
  }

  const urls = await signAndUpload(uploads);

  if (next.media?.length) {
    for (const asset of next.media) {
      const pendingKey = siteAssetPendingKey(tile.id, asset.id);
      const url = urls.get(pendingKey);
      if (url) {
        asset.src = url;
        pendingFiles.delete(pendingKey);
      } else if (isBlobUrl(asset.src)) {
        asset.src = "";
      }
    }
    next.media = next.media.filter((asset) => asset.src);
    if (!next.media.some((asset) => asset.id === next.selectedMediaId)) {
      next.selectedMediaId = next.media[0]?.id ?? "";
    }
    return applyTileSelection(next);
  }

  const imageUrl = urls.get(siteTileImagePendingKey(tile.id));
  if (imageUrl) {
    next.src = imageUrl;
    pendingFiles.delete(siteTileImagePendingKey(tile.id));
  } else if (isBlobUrl(next.src)) {
    next.src = "";
  }

  const videoUrl = urls.get(siteTileVideoPendingKey(tile.id));
  if (videoUrl) {
    next.video = videoUrl;
    pendingFiles.delete(siteTileVideoPendingKey(tile.id));
  } else if (next.video && isBlobUrl(next.video)) {
    next.video = "";
  }

  return next;
}

/** Upload any blob: media to Storage, return page JSON safe for the Server Action. */
export async function resolveHomePageMedia(page: HomePageContent): Promise<HomePageContent> {
  const hero = await Promise.all(page.hero.map((tile) => finalizeTile(tile)));
  const categories = await Promise.all(page.categories.map((tile) => finalizeTile(tile)));
  const looks = await Promise.all(page.looks.map((tile) => finalizeTile(tile)));
  return { ...page, hero, categories, looks };
}
