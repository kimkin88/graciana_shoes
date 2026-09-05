import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/roles";
import { AdminChrome } from "@/components/admin/AdminChrome";
import { PageShell } from "@/components/layout/PageShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    redirect(
      user
        ? localizedPath("/account/orders", locale)
        : `${localizedPath("/login", locale)}?next=${encodeURIComponent(localizedPath("/admin", locale))}`,
    );
  }
  const dict = await getDictionary(locale);

  return (
    <PageShell width="wide">
      <AdminChrome
        locale={locale}
        title={dict.admin.title}
        lead={dict.admin.lead}
        labels={{
          stats: dict.admin.stats,
          products: dict.admin.products,
          groups: dict.admin.groups,
          orders: dict.admin.orders,
          users: dict.admin.users,
          content: dict.admin.siteContent,
        }}
      >
        {children}
      </AdminChrome>
    </PageShell>
  );
}
