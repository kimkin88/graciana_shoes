import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/roles";
import { AdminTabs } from "@/components/admin/AdminTabs";

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
    redirect(localizedPath("/", locale));
  }
  const dict = await getDictionary(locale);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <h1
          style={{
            margin: 0,
            color: "var(--page-heading, inherit)",
            fontSize: "clamp(1.5rem, 2.4vw, 2rem)",
            letterSpacing: "0.02em",
          }}
        >
          {dict.admin.title}
        </h1>
        <AdminTabs
          locale={locale}
          labels={{
            stats: dict.admin.stats,
            products: dict.admin.products,
            groups: dict.admin.groups,
            orders: dict.admin.orders,
            mainPageConstructor: dict.admin.mainPageConstructor,
          }}
        />
      </div>
      {children}
    </div>
  );
}
