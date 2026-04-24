import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/service";

/** Returns true if the signed-in user has admin role in `profiles`. */
export async function isAdmin(
  supabase: SupabaseClient,
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (error) {
    // Fallback for environments where profile RLS policies are temporarily misconfigured.
    const service = createServiceClient();
    const { data: bypassData, error: bypassError } = await service
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (bypassError) {
      console.error("[auth:isAdmin] failed to resolve role", {
        code: bypassError.code ?? null,
        message: bypassError.message,
      });
      return false;
    }
    return bypassData?.role === "admin";
  }

  return data?.role === "admin";
}
