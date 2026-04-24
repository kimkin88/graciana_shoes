/** Money stored as integer minor units (e.g. cents). */
export type MoneyCents = number;

export type ProductRow = {
  id: string;
  slug: string;
  name_ru: string;
  name_en: string;
  description_ru: string | null;
  description_en: string | null;
  price_cents: MoneyCents;
  currency: string;
  image_url: string | null;
  category: string | null;
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
