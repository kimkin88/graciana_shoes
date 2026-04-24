import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format/money";
import { Card, CardBody } from "@/components/ui/Card";
import { updateHomeHeroImage } from "@/app/actions/admin-site";
import { AdminButton } from "@/components/admin/AdminButtons";
import { HomeHeroImageEditor } from "@/components/admin/HomeHeroImageEditor";

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

  const [{ count: productCount }, { data: paidOrders }, { count: orderCount }] =
    await Promise.all([
      supabase
        .from("products")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("total_cents, currency")
        .eq("status", "paid")
        .gte("created_at", iso),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "paid")
        .gte("created_at", iso),
    ]);
  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select("hero_image_url")
    .eq("id", 1)
    .maybeSingle();

  const revenueByCurrency = new Map<string, number>();
  for (const row of paidOrders ?? []) {
    const c = row.currency ?? "usd";
    revenueByCurrency.set(
      c,
      (revenueByCurrency.get(c) ?? 0) + (row.total_cents ?? 0),
    );
  }
  const primaryCurrency = paidOrders?.[0]?.currency ?? "usd";
  const revenue = revenueByCurrency.get(primaryCurrency) ?? 0;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <form action={updateHomeHeroImage} style={{ display: "grid", gap: 10, maxWidth: 560 }}>
        <input type="hidden" name="locale" value={locale} />
        <HomeHeroImageEditor
          existingUrl={siteSettings?.hero_image_url ?? ""}
          labels={{
            title: dict.admin.homeHero,
            urlPlaceholder: dict.admin.homeHeroUrl,
            sizeHint: dict.admin.homeHeroSizeHint,
            cropApply: dict.admin.cropApply,
            previewTitle: dict.admin.imagePreview,
          }}
        />
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <AdminButton type="submit">{dict.admin.save}</AdminButton>
          {siteSettings?.hero_image_url ? (
            <a href={siteSettings.hero_image_url} download>
              {dict.admin.downloadImage}
            </a>
          ) : null}
        </div>
      </form>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
      <Card>
        <CardBody>
          <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
            {dict.admin.revenue30d}
          </div>
          <div style={{ fontSize: "1.35rem", fontWeight: 700, marginTop: 8 }}>
            {formatMoney(revenue, primaryCurrency, locale)}
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
            {dict.admin.orders30d}
          </div>
          <div style={{ fontSize: "1.35rem", fontWeight: 700, marginTop: 8 }}>
            {orderCount ?? 0}
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
            {dict.admin.productCount}
          </div>
          <div style={{ fontSize: "1.35rem", fontWeight: 700, marginTop: 8 }}>
            {productCount ?? 0}
          </div>
        </CardBody>
      </Card>
      </div>
    </div>
  );
}
