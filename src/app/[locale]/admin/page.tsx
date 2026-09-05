import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format/money";
import { AdminStatGrid, type AdminStatItem } from "@/components/admin/AdminStatGrid";

export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const iso = since.toISOString();

  const [{ count: productCount }, { data: paidOrders }, { count: orderCount }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total_cents, currency").eq("status", "paid").gte("created_at", iso),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid")
      .gte("created_at", iso),
  ]);

  const revenueByCurrency = new Map<string, number>();
  for (const row of paidOrders ?? []) {
    const c = row.currency ?? "usd";
    revenueByCurrency.set(c, (revenueByCurrency.get(c) ?? 0) + (row.total_cents ?? 0));
  }
  const primaryCurrency = paidOrders?.[0]?.currency ?? "usd";
  const revenue = revenueByCurrency.get(primaryCurrency) ?? 0;

  const items: AdminStatItem[] = [
    {
      label: dict.admin.revenue30d,
      value: formatMoney(revenue, primaryCurrency, locale),
      icon: "banknote",
    },
    {
      label: dict.admin.orders30d,
      value: String(orderCount ?? 0),
      icon: "bag",
    },
    {
      label: dict.admin.productCount,
      value: String(productCount ?? 0),
      icon: "package",
    },
  ];

  return <AdminStatGrid items={items} />;
}
