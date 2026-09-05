import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductRow } from "@/types";
import { categoryAliases } from "@/lib/catalog/categories";
import { isUuid } from "@/lib/products/slugify";

export type ProductFilters = {
  search?: string;
  category?: string;
  color?: string;
  size?: string;
  minCents?: number;
  maxCents?: number;
  featuredOnly?: boolean;
};

/** Escape `%` / `_` for Postgres `ilike` patterns. */
function escapeIlike(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function logProductsQueryError(
  context: "fetchProducts" | "fetchProductBySlug" | "fetchCategories" | "fetchProductOptions",
  error: { code?: string | null; message?: string; details?: string | null; hint?: string | null },
) {
  console.error(`[products:${context}] ${error.code ?? "unknown"} ${error.message ?? "Unknown error"}`, {
    code: error.code ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null,
  });
  if (error.code === "42P17") {
    console.error(
      "[products] Detected Postgres RLS policy recursion. Apply migration `003_fix_profiles_rls_recursion.sql` to your Supabase database.",
    );
  }
}

/** Public catalog query — respects `active` via RLS for anonymous users. */
export async function fetchProducts(
  supabase: SupabaseClient,
  filters: ProductFilters = {},
): Promise<ProductRow[]> {
  let q = supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (filters.featuredOnly) {
    q = q.eq("featured", true);
  }

  if (filters.category) {
    const aliases = categoryAliases(filters.category);
    q = q.in("category", aliases);
  }
  if (filters.color) {
    q = q.contains("colors", [filters.color.toLowerCase()]);
  }
  if (filters.size) {
    q = q.contains("sizes", [filters.size.toLowerCase()]);
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
    logProductsQueryError("fetchProducts", error);
    return [];
  }
  return (data ?? []) as ProductRow[];
}

export async function fetchProductBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<ProductRow | null> {
  const key = slug.trim();
  if (!key) return null;

  const bySlug = await supabase
    .from("products")
    .select("*")
    .eq("slug", key)
    .eq("active", true)
    .maybeSingle();

  if (bySlug.error) {
    logProductsQueryError("fetchProductBySlug", bySlug.error);
    return null;
  }
  if (bySlug.data) return bySlug.data as ProductRow;

  // Allow /products/<uuid> when slug was set to the product id.
  if (!isUuid(key)) return null;

  const byId = await supabase
    .from("products")
    .select("*")
    .eq("id", key)
    .eq("active", true)
    .maybeSingle();

  if (byId.error) {
    logProductsQueryError("fetchProductBySlug", byId.error);
    return null;
  }
  return (byId.data as ProductRow | null) ?? null;
}

export async function fetchCategories(
  supabase: SupabaseClient,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .eq("active", true)
    .not("category", "is", null);
  if (error) {
    logProductsQueryError("fetchCategories", error);
    return [];
  }
  const set = new Set<string>();
  for (const row of data ?? []) {
    if (row.category) set.add(row.category);
  }
  return [...set].sort();
}

export async function fetchProductOptions(
  supabase: SupabaseClient,
): Promise<{ colors: string[]; sizes: string[] }> {
  const { data, error } = await supabase.from("products").select("colors,sizes").eq("active", true);
  if (error) {
    logProductsQueryError("fetchProductOptions", error);
    return { colors: [], sizes: [] };
  }
  const colors = new Set<string>();
  const sizes = new Set<string>();
  for (const row of data ?? []) {
    for (const color of row.colors ?? []) {
      if (color) colors.add(String(color));
    }
    for (const size of row.sizes ?? []) {
      if (size) sizes.add(String(size));
    }
  }
  return {
    colors: [...colors].sort(),
    sizes: [...sizes].sort(),
  };
}
