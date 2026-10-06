import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/app/actions/delete-product";
import { duplicateProduct } from "@/app/actions/duplicate-product";
import { formatMoney } from "@/lib/format/money";
import { productTitle } from "@/lib/products/display";
import { productCardImageCandidates } from "@/lib/products/media";
import type { ProductRow } from "@/types";
import {
  AdminButton,
  AdminButtonLink,
  AdminSectionHead,
  AdminSectionTitle,
  AdminTable,
  AdminTableWrap,
} from "@/components/admin/AdminButtons";
import { AdminProductThumb } from "@/components/admin/AdminProductThumb";
import { AdminProductsToolbar } from "@/components/admin/AdminProductsToolbar";
import { TableScroll } from "@/components/ui/ScrollArea";
import { Trash2 } from "lucide-react";

function matchesQuery(product: ProductRow, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    product.name_ru,
    product.name_en,
    product.slug,
    product.sku ?? "",
    product.category ?? "",
    product.group_key ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function formatCreatedAt(value: string, locale: Locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function AdminProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ saved?: string; q?: string; status?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const sp = await searchParams;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const query = (sp.q ?? "").trim();
  const status = sp.status === "active" || sp.status === "draft" ? sp.status : "all";

  let request = supabase.from("products").select("*").order("created_at", { ascending: false });
  if (status === "active") request = request.eq("active", true);
  if (status === "draft") request = request.eq("active", false);

  const { data, error } = await request;
  if (error) console.error(error);

  const products = ((data ?? []) as ProductRow[]).filter((product) => matchesQuery(product, query));
  const savedText =
    sp.saved === "draft"
      ? dict.admin.productDraftSaved
      : sp.saved === "1"
        ? dict.admin.productSaved
        : null;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <AdminSectionHead>
        <AdminSectionTitle>{dict.admin.products}</AdminSectionTitle>
        <AdminButtonLink href={localizedPath("/admin/products/new", locale)}>
          {dict.admin.addProduct}
        </AdminButtonLink>
      </AdminSectionHead>
      {savedText ? (
        <p
          role="status"
          style={{
            margin: 0,
            padding: "12px 14px",
            border: "1px solid #bbf7d0",
            background: "#f0fdf4",
            color: "#166534",
          }}
        >
          {savedText}
        </p>
      ) : null}

      <AdminProductsToolbar
        locale={locale}
        actionPath={localizedPath("/admin/products", locale)}
        initialQuery={query}
        initialStatus={status}
        labels={{
          search: dict.admin.productsSearch,
          searchPlaceholder: dict.admin.productsSearchPlaceholder,
          status: dict.admin.productsFilterStatus,
          all: dict.admin.productsFilterAll,
          active: dict.admin.productsFilterActive,
          draft: dict.admin.productsFilterDraft,
          apply: dict.admin.productsApply,
          reset: dict.admin.productsReset,
        }}
      />

      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--page-text-muted, #666)" }}>
        {dict.admin.productsCount.replace("{count}", String(products.length))}
      </p>

      <AdminTableWrap>
        <TableScroll>
          <AdminTable>
            <thead>
              <tr>
                <th>{dict.admin.productsImage}</th>
                <th>{dict.admin.nameRu}</th>
                <th>{dict.admin.slug}</th>
                <th>{dict.admin.price}</th>
                <th>{dict.admin.stock}</th>
                <th>{dict.admin.active}</th>
                <th>{dict.admin.productsCreated}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 28, color: "var(--page-text-muted, #666)" }}>
                    {dict.admin.productsEmpty}
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const imageSources = productCardImageCandidates(p);
                  return (
                    <tr key={p.id}>
                      <td>
                        <AdminProductThumb sources={imageSources} />
                      </td>
                      <td>
                        <div style={{ display: "grid", gap: 2 }}>
                          <span>{productTitle(p, locale)}</span>
                          {p.name_ru && locale === "en" ? (
                            <span style={{ fontSize: "0.75rem", color: "var(--page-text-muted, #666)" }}>
                              {p.name_ru}
                            </span>
                          ) : null}
                          {p.name_en && locale === "ru" ? (
                            <span style={{ fontSize: "0.75rem", color: "var(--page-text-muted, #666)" }}>
                              {p.name_en}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)", fontSize: "0.8rem" }}>
                        {p.slug}
                      </td>
                      <td>{formatMoney(p.price_cents, p.currency, locale)}</td>
                      <td>{p.stock}</td>
                      <td>{p.active ? "✓" : "—"}</td>
                      <td style={{ whiteSpace: "nowrap", fontSize: "0.85rem" }}>
                        {formatCreatedAt(p.created_at, locale)}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <AdminButtonLink
                            href={localizedPath(`/admin/products/${p.id}/edit`, locale)}
                            $variant="ghost"
                          >
                            {dict.admin.edit}
                          </AdminButtonLink>
                          <form action={duplicateProduct}>
                            <input type="hidden" name="locale" value={locale} />
                            <input type="hidden" name="id" value={p.id} />
                            <AdminButton type="submit" $variant="ghost">
                              {dict.admin.duplicate}
                            </AdminButton>
                          </form>
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
                  );
                })
              )}
            </tbody>
          </AdminTable>
        </TableScroll>
      </AdminTableWrap>
    </div>
  );
}
