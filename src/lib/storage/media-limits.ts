/**
 * Images upload browser → Supabase (signed URL), so they are not bound to Vercel’s ~4.5MB
 * Server Action limit. `null` means we do not reject by file size; the Storage bucket
 * file-size setting is the remaining ceiling.
 */
export const MAX_IMAGE_BYTES: number | null = null;

/** Primary + gallery videos: browser → Supabase signed upload. */
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
export const MAX_VIDEO_MB = Math.round(MAX_VIDEO_BYTES / (1024 * 1024));

export function isImageTooLarge(size: number) {
  return MAX_IMAGE_BYTES != null && size > MAX_IMAGE_BYTES;
}

export function isVideoTooLarge(size: number) {
  return size > MAX_VIDEO_BYTES;
}
