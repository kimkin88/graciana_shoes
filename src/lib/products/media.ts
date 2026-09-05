import { publicStorageUrl } from "@/lib/storage/urls";
import type { ProductRow } from "@/types";

export function productCardImage(product: Pick<ProductRow, "image_optimized_path" | "image_url" | "updated_at">) {
  return (
    publicStorageUrl(product.image_optimized_path, product.updated_at) ??
    product.image_url ??
    null
  );
}

export function productOriginalImage(product: Pick<ProductRow, "image_original_path" | "image_url" | "updated_at">) {
  return (
    publicStorageUrl(product.image_original_path, product.updated_at) ??
    product.image_url ??
    null
  );
}

export function productVideoSrc(product: Pick<ProductRow, "video_path" | "video_url" | "updated_at">) {
  return publicStorageUrl(product.video_path, product.updated_at) ?? product.video_url ?? null;
}
