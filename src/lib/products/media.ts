import { publicStorageUrl } from "@/lib/storage/urls";
import type { GalleryItem, ProductRow } from "@/types";

function firstGalleryImageUrl(
  gallery: ProductRow["gallery"] | undefined,
  version?: string | null,
): string | null {
  if (!Array.isArray(gallery)) return null;
  for (const item of gallery) {
    if (typeof item === "string") {
      const url = item.trim();
      if (!url || url.startsWith("blob:") || url.startsWith("data:")) continue;
      if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) continue;
      return publicStorageUrl(url, version) ?? url;
    }
    if (!item || typeof item !== "object") continue;
    const row = item as GalleryItem;
    if (row.kind === "video") continue;
    const fromPath = publicStorageUrl(row.path ?? null, version);
    if (fromPath) return fromPath;
    const url = typeof row.url === "string" ? row.url.trim() : "";
    if (!url || url.startsWith("blob:") || url.startsWith("data:")) continue;
    if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) continue;
    return publicStorageUrl(url, version) ?? url;
  }
  return null;
}

/** Unique candidate URLs for a product cover (best → fallbacks). */
export function productCardImageCandidates(
  product: Pick<
    ProductRow,
    "image_optimized_path" | "image_original_path" | "image_url" | "gallery" | "updated_at"
  >,
): string[] {
  const version = product.updated_at;
  const out: string[] = [];
  const push = (url: string | null | undefined) => {
    const value = url?.trim();
    if (!value || value.startsWith("blob:") || value.startsWith("data:")) return;
    if (!out.includes(value)) out.push(value);
  };

  push(publicStorageUrl(product.image_optimized_path, version));
  push(publicStorageUrl(product.image_original_path, version));
  // image_url may be a full URL or a storage path left from older rows.
  push(publicStorageUrl(product.image_url, version));
  if (product.image_url?.trim()) push(product.image_url.trim());
  push(firstGalleryImageUrl(product.gallery, version));
  return out;
}

export function productCardImage(
  product: Pick<
    ProductRow,
    "image_optimized_path" | "image_original_path" | "image_url" | "gallery" | "updated_at"
  >,
) {
  return productCardImageCandidates(product)[0] ?? null;
}

export function productOriginalImage(product: Pick<ProductRow, "image_original_path" | "image_url" | "updated_at">) {
  return (
    publicStorageUrl(product.image_original_path, product.updated_at) ??
    publicStorageUrl(product.image_url, product.updated_at) ??
    product.image_url ??
    null
  );
}

export function productVideoSrc(product: Pick<ProductRow, "video_path" | "video_url" | "updated_at">) {
  return publicStorageUrl(product.video_path, product.updated_at) ?? product.video_url ?? null;
}
