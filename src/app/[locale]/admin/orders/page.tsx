import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format/money";
import type { OrderRow } from "@/types";

export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) console.error(error);
  const orders = (data ?? []) as OrderRow[];

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{dict.admin.orderList}</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "8px 4px" }}>{dict.orders.id}</th>
              <th>{dict.admin.customer}</th>
              <th>{dict.orders.date}</th>
              <th>{dict.orders.status}</th>
              <th>{dict.orders.total}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 4px", fontFamily: "monospace", fontSize: "0.75rem" }}>
                  {o.id}
                </td>
                <td>{o.customer_email ?? "—"}</td>
                <td>{new Date(o.created_at).toLocaleString(locale === "ru" ? "ru-RU" : "en-US")}</td>
                <td>{o.status}</td>
                <td>{formatMoney(o.total_cents, o.currency, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
