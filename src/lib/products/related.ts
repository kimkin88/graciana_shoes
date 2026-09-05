import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductRow } from "@/types";

export async function fetchRelatedProducts(
  supabase: SupabaseClient,
  product: ProductRow,
  limit = 8,
): Promise<{ sameCollection: ProductRow[]; sameCategory: ProductRow[]; related: ProductRow[] }> {
  const exclude = product.id;
  const seen = new Set<string>([exclude]);

  async function load(filters: {
    group?: string | null;
    category?: string | null;
    tag?: string | null;
  }) {
    let q = supabase.from("products").select("*").eq("active", true).neq("id", exclude).limit(limit);
    if (filters.group) q = q.eq("group_key", filters.group);
    if (filters.category) q = q.eq("category", filters.category);
    if (filters.tag) q = q.contains("tags", [filters.tag]);
    const { data } = await q;
    return ((data ?? []) as ProductRow[]).filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    });
  }

  const sameCollection = product.group_key ? await load({ group: product.group_key }) : [];
  const sameCategory = product.category ? await load({ category: product.category }) : [];
  const tagHits: ProductRow[] = [];
  for (const tag of (product.tags ?? []).slice(0, 2)) {
    const rows = await load({ tag });
    tagHits.push(...rows);
  }

  const related = [...sameCollection, ...sameCategory, ...tagHits].slice(0, limit);
  return {
    sameCollection: sameCollection.slice(0, 4),
    sameCategory: sameCategory.slice(0, 4),
    related,
  };
}
