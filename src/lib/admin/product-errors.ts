import type { Messages } from "@/i18n/get-dictionary";

/** Map server/client product-form error codes to admin copy. */
export function productFormErrorMessage(code: string | null | undefined, dict: Messages): string | null {
  if (!code) return null;
  switch (code) {
    case "slug":
      return dict.admin.slugError;
    case "fields":
      return dict.admin.fieldsError;
    case "price":
      return dict.admin.priceError;
    case "db":
    case "duplicate":
      return dict.admin.dbError;
    case "media":
    case "media_upload":
    case "media_sign":
    case "image_upload":
    case "video_upload":
    case "image_type":
    case "video_type":
    case "image_process":
      return dict.admin.mediaUploadError;
    case "image_too_large":
    case "video_too_large":
    case "invalid_media":
      return dict.admin.mediaTooLarge;
    default:
      return dict.admin.saveError;
  }
}
