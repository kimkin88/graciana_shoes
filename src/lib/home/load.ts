import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { parseHomePage, type HomePageContent } from "@/lib/home/content";

export async function fetchHomePage(supabase: SupabaseClient): Promise<HomePageContent> {
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  const row = (data ?? null) as Record<string, unknown> | null;
  return parseHomePage(row?.home_page ?? row?.home_builder);
}
