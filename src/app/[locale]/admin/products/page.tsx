import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/app/actions/admin-products";
import { formatMoney } from "@/lib/format/money";
import { productTitle } from "@/lib/products/display";
import type { ProductRow } from "@/types";
import { Button } from "@/components/ui/Button";
import { AdminButtonLink } from "@/components/admin/AdminButtons";

export default async function AdminProductsPage({
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
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) console.error(error);
  const products = (data ?? []) as ProductRow[];

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>{dict.admin.products}</h2>
        <AdminButtonLink href={localizedPath("/admin/products/new", locale)}>
          {dict.admin.addProduct}
        </AdminButtonLink>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "8px 4px" }}>{dict.admin.nameRu}</th>
              <th>{dict.admin.slug}</th>
              <th>{dict.admin.price}</th>
              <th>{dict.admin.stock}</th>
              <th>{dict.admin.active}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 4px" }}>{productTitle(p, locale)}</td>
                <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{p.slug}</td>
                <td>{formatMoney(p.price_cents, p.currency, locale)}</td>
                <td>{p.stock}</td>
                <td>{p.active ? "✓" : "—"}</td>
                <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <AdminButtonLink
                    href={localizedPath(`/admin/products/${p.id}/edit`, locale)}
                    $variant="ghost"
                  >
                    {dict.admin.edit}
                  </AdminButtonLink>
                  <form action={deleteProduct}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="id" value={p.id} />
                    <Button type="submit" $variant="danger">
                      {dict.admin.delete}
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
