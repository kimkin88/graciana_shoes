import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/app/actions/admin-products";
import { formatMoney } from "@/lib/format/money";
import { productTitle } from "@/lib/products/display";
import type { ProductRow } from "@/types";
import {
  AdminButton,
  AdminButtonLink,
  AdminSectionHead,
  AdminSectionTitle,
  AdminTable,
  AdminTableWrap,
} from "@/components/admin/AdminButtons";
import { TableScroll } from "@/components/ui/ScrollArea";
import { Trash2 } from "lucide-react";

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
    <div style={{ display: "grid", gap: 18 }}>
      <AdminSectionHead>
        <AdminSectionTitle>{dict.admin.products}</AdminSectionTitle>
        <AdminButtonLink href={localizedPath("/admin/products/new", locale)}>
          {dict.admin.addProduct}
        </AdminButtonLink>
      </AdminSectionHead>
      <AdminTableWrap>
        <TableScroll>
          <AdminTable>
            <thead>
              <tr>
                <th>{dict.admin.nameRu}</th>
                <th>{dict.admin.slug}</th>
                <th>{dict.admin.price}</th>
                <th>{dict.admin.stock}</th>
                <th>{dict.admin.active}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{productTitle(p, locale)}</td>
                  <td style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)", fontSize: "0.8rem" }}>
                    {p.slug}
                  </td>
                  <td>{formatMoney(p.price_cents, p.currency, locale)}</td>
                  <td>{p.stock}</td>
                  <td>{p.active ? "✓" : "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <AdminButtonLink
                        href={localizedPath(`/admin/products/${p.id}/edit`, locale)}
                        $variant="ghost"
                      >
                        {dict.admin.edit}
                      </AdminButtonLink>
                      <form action={deleteProduct}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={p.id} />
                        <AdminButton
                          type="submit"
                          $variant="ghost"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            paddingInline: 14,
                            color: "#9f2f2f",
                            borderColor: "#9f2f2f",
                          }}
                        >
                          <Trash2 size={14} />
                          {dict.admin.delete}
                        </AdminButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </TableScroll>
      </AdminTableWrap>
    </div>
  );
}
