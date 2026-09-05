-- Original + optimized media paths for product cards.
-- image_url / video_url remain the public URLs used by the storefront
-- (optimized image by default; video as uploaded).

alter table public.products
  add column if not exists image_original_path text,
  add column if not exists image_optimized_path text,
  add column if not exists video_path text;

alter table public.site_settings
  add column if not exists hero_image_original_path text,
  add column if not exists hero_image_optimized_path text;
