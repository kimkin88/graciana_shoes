export const PRODUCT_IMAGES_BUCKET = "product-images";

export function publicStorageUrl(path: string | null | undefined, version?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  const url = `${base}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${path.replace(/^\/+/, "")}`;
  if (!version) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(version)}`;
}
