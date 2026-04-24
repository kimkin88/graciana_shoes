import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/roles";

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
  const base = localizedPath("/admin", locale);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <h1 style={{ margin: 0 }}>{dict.admin.title}</h1>
        <nav style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          <Link href={base}>{dict.admin.stats}</Link>
          <Link href={localizedPath("/admin/products", locale)}>
            {dict.admin.products}
          </Link>
          <Link href={localizedPath("/admin/orders", locale)}>
            {dict.admin.orders}
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
