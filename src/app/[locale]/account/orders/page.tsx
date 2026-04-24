import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format/money";
import type { OrderRow } from "@/types";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(localizedPath("/login", locale));
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  const rows = (orders ?? []) as OrderRow[];

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>{dict.orders.title}</h1>
      {!rows.length ? (
        <p style={{ color: "#64748b" }}>{dict.orders.empty}</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "8px 0" }}>{dict.orders.id}</th>
              <th>{dict.orders.date}</th>
              <th>{dict.orders.status}</th>
              <th>{dict.orders.total}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 0", fontFamily: "monospace", fontSize: "0.8rem" }}>
                  {o.id.slice(0, 8)}…
                </td>
                <td>{new Date(o.created_at).toLocaleString(locale === "ru" ? "ru-RU" : "en-US")}</td>
                <td>
                  {o.status === "paid"
                    ? dict.status.paid
                    : o.status === "pending"
                      ? dict.status.pending
                      : dict.status.cancelled}
                </td>
                <td>{formatMoney(o.total_cents, o.currency, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p style={{ marginTop: 16 }}>
        <Link href={localizedPath("/", locale)}>{dict.checkout.backHome}</Link>
      </p>
    </div>
  );
}
