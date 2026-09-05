import type { SupabaseClient } from "@supabase/supabase-js";

/** Collect tag / group suggestions for admin autocomplete. Tolerates missing commerce tables. */
export async function loadTaxonomyHints(supabase: SupabaseClient) {
  const knownTags = new Set<string>();
  const knownGroups = new Set<string>();

  const [tagsRes, groupsRes, catalogTags, catalogGroups] = await Promise.all([
    supabase.from("products").select("tags"),
    supabase.from("products").select("group_key").not("group_key", "is", null),
    supabase.from("catalog_tags").select("slug"),
    supabase.from("catalog_groups").select("key"),
  ]);

  if (!tagsRes.error) {
    for (const row of tagsRes.data ?? []) {
      for (const tag of row.tags ?? []) if (tag) knownTags.add(String(tag));
    }
  }
  if (!groupsRes.error) {
    for (const row of groupsRes.data ?? []) {
      if (row.group_key) knownGroups.add(String(row.group_key));
    }
  }
  if (!catalogTags.error) {
    for (const row of catalogTags.data ?? []) {
      if (row.slug) knownTags.add(String(row.slug));
    }
  }
  if (!catalogGroups.error) {
    for (const row of catalogGroups.data ?? []) {
      if (row.key) knownGroups.add(String(row.key));
    }
  }

  return {
    knownTags: [...knownTags].sort(),
    knownGroups: [...knownGroups].sort(),
  };
}
