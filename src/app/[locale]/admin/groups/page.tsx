import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import type { ProductRow } from "@/types";
import { productTitle } from "@/lib/products/display";
import { updateProductGroup } from "@/app/actions/admin-groups";
import { AdminButton } from "@/components/admin/AdminButtons";

export default async function AdminGroupsPage({
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
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) console.error(error);
  const products = (data ?? []) as ProductRow[];

  const counts = new Map<string, number>();
  for (const p of products) {
    const key = p.group_key?.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section style={{ display: "grid", gap: 8 }}>
        <h2 style={{ margin: 0 }}>{dict.admin.groups}</h2>
        {!counts.size ? (
          <p style={{ margin: 0, color: "#7b736c" }}>{dict.admin.groupsEmpty}</p>
        ) : (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[...counts.entries()].map(([key, count]) => (
              <span
                key={key}
                style={{
                  border: "1px solid #d8ccc0",
                  borderRadius: 999,
                  padding: "4px 10px",
                  fontSize: 13,
                }}
              >
                {key} ({count})
              </span>
            ))}
          </div>
        )}
      </section>

      <section style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e3d8cd" }}>
              <th style={{ padding: "8px 4px" }}>{dict.admin.nameRu}</th>
              <th>{dict.admin.slug}</th>
              <th>{dict.admin.groupKey}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #f1e8df" }}>
                <td style={{ padding: "8px 4px" }}>{productTitle(p, locale)}</td>
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{p.slug}</td>
                <td>
                  <form action={updateProductGroup} style={{ display: "flex", gap: 8 }}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="id" value={p.id} />
                    <input
                      name="group_key"
                      defaultValue={p.group_key ?? ""}
                      placeholder={dict.admin.groupKeyHint}
                      style={{
                        minWidth: 220,
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid #cbbeb0",
                      }}
                    />
                    <AdminButton type="submit">
                      {dict.admin.updateGroup}
                    </AdminButton>
                  </form>
                </td>
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
