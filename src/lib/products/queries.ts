import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductRow } from "@/types";

export type ProductFilters = {
  search?: string;
  category?: string;
  minCents?: number;
  maxCents?: number;
  featuredOnly?: boolean;
};

/** Escape `%` / `_` for Postgres `ilike` patterns. */
function escapeIlike(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/** Public catalog query — respects `active` via RLS for anonymous users. */
export async function fetchProducts(
  supabase: SupabaseClient,
  filters: ProductFilters = {},
): Promise<ProductRow[]> {
  let q = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.featuredOnly) {
    q = q.eq("featured", true);
  }

  if (filters.category) {
    q = q.eq("category", filters.category);
  }

  if (filters.search && filters.search.trim()) {
    const s = escapeIlike(filters.search.trim());
    q = q.or(`name_ru.ilike.%${s}%,name_en.ilike.%${s}%`);
  }

  if (filters.minCents != null && !Number.isNaN(filters.minCents)) {
    q = q.gte("price_cents", filters.minCents);
  }
  if (filters.maxCents != null && !Number.isNaN(filters.maxCents)) {
    q = q.lte("price_cents", filters.maxCents);
  }

  const { data, error } = await q;
  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []) as ProductRow[];
}

export async function fetchProductBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<ProductRow | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error(error);
    return null;
  }
  return data as ProductRow | null;
}

export async function fetchCategories(
  supabase: SupabaseClient,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .not("category", "is", null);
  if (error) {
    console.error(error);
    return [];
  }
  const set = new Set<string>();
  for (const row of data ?? []) {
    if (row.category) set.add(row.category);
  }
  return [...set].sort();
}
