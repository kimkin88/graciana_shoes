import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format/money";
import type { OrderRow } from "@/types";
import {
  AdminSectionHead,
  AdminSectionTitle,
  AdminTable,
  AdminTableWrap,
} from "@/components/admin/AdminButtons";
import { TableScroll } from "@/components/ui/ScrollArea";

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
    <div style={{ display: "grid", gap: 18 }}>
      <AdminSectionHead>
        <AdminSectionTitle>{dict.admin.orderList}</AdminSectionTitle>
      </AdminSectionHead>
      <AdminTableWrap>
        <TableScroll>
          <AdminTable>
            <thead>
              <tr>
                <th>{dict.orders.id}</th>
                <th>{dict.admin.customer}</th>
                <th>{dict.orders.date}</th>
                <th>{dict.orders.status}</th>
                <th>{dict.orders.total}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.75rem" }}>{o.id}</td>
                  <td>{o.customer_email ?? "—"}</td>
                  <td>{new Date(o.created_at).toLocaleString(locale === "ru" ? "ru-RU" : "en-US")}</td>
                  <td>{o.status}</td>
                  <td>{formatMoney(o.total_cents, o.currency, locale)}</td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </TableScroll>
      </AdminTableWrap>
    </div>
  );
}
