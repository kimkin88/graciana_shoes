/** Money stored as integer minor units (e.g. cents). */
export type MoneyCents = number;

export type GalleryItem = {
  url: string;
  path?: string | null;
  kind?: "image" | "video";
};

export type ProductRow = {
  id: string;
  slug: string;
  name_ru: string;
  name_en: string;
  description_ru: string | null;
  description_en: string | null;
  short_description_ru?: string | null;
  short_description_en?: string | null;
  price_cents: MoneyCents;
  compare_at_cents?: number | null;
  currency: string;
  sku?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  source_url?: string | null;
  image_url: string | null;
  image_original_path?: string | null;
  image_optimized_path?: string | null;
  video_url: string | null;
  video_path?: string | null;
  gallery?: GalleryItem[] | string[] | null;
  specs?: Record<string, string> | null;
  seo_title_ru?: string | null;
  seo_title_en?: string | null;
  seo_description_ru?: string | null;
  seo_description_en?: string | null;
  category: string | null;
  group_key: string | null;
  tags?: string[];
  colors: string[];
  sizes: string[];
  featured: boolean;
  active: boolean;
  stock: number;
  created_at: string;
  updated_at: string;
};

export type OrderRow = {
  id: string;
  user_id: string | null;
  stripe_session_id: string | null;
  status: "pending" | "paid" | "cancelled";
  total_cents: number;
  currency: string;
  customer_email: string | null;
  created_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  unit_price_cents: number;
  created_at: string;
};

export type CartLine = {
  productId: string;
  quantity: number;
};
