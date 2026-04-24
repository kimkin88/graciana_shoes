import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n/get-dictionary";
import { isAdmin } from "@/lib/auth/roles";
import { HeaderBar } from "@/components/layout/HeaderBar";
import type { Locale } from "@/i18n/config";

/** Loads session + dictionary on the server, then renders the interactive client header. */
export async function SiteHeader({ locale }: { locale: Locale }) {
  const supabase = await createClient();
  const [{ data: { user } }, dict] = await Promise.all([
    supabase.auth.getUser(),
    getDictionary(locale),
  ]);
  const admin = user ? await isAdmin(supabase) : false;

  return (
    <HeaderBar
      locale={locale}
      dict={dict}
      userEmail={user?.email ?? null}
      isAdmin={admin}
    />
  );
}
