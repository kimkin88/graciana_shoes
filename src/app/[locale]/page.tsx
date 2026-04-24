import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { fetchProducts } from "@/lib/products/queries";
import { ProductGridMotion } from "@/components/motion/ProductGridMotion";
import { RecentlyViewedStory } from "@/components/product/RecentlyViewedStory";

export const revalidate = 60;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();
  const featured = await fetchProducts(supabase, { featuredOnly: true });
  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select("hero_image_url, home_intro_title, home_intro_body, home_intro_layout, home_sections, home_builder")
    .eq("id", 1)
    .maybeSingle();
  const { data: groupedRows } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .not("group_key", "is", null)
    .order("created_at", { ascending: false })
    .limit(100);
  const groupedProducts = new Map<string, typeof featured>();
  for (const row of (groupedRows ?? []) as typeof featured) {
    const key = row.group_key?.trim();
    if (!key) continue;
    const list = groupedProducts.get(key) ?? [];
    if (list.length < 8) list.push(row);
    groupedProducts.set(key, list);
  }
  const homeSections = Array.isArray(siteSettings?.home_sections)
    ? (siteSettings.home_sections as Array<{
        key?: string;
        title?: string;
        subtitle?: string;
        ctaLabel?: string;
        ctaUrl?: string;
        enabled?: boolean;
        x?: number;
        y?: number;
        widthPx?: number;
        heightPx?: number;
        width?: "full" | "wide" | "compact";
        height?: "auto" | "small" | "medium" | "large";
        titleSize?: number;
        subtitleSize?: number;
        titleWeight?: "400" | "500" | "600" | "700" | "800";
        subtitleWeight?: "400" | "500" | "600" | "700";
        titleFont?: "display" | "sans";
        subtitleFont?: "display" | "sans";
      }>)
    : [];
  const hasHomeBuilder =
    Array.isArray(
      (siteSettings?.home_builder as { elements?: unknown[] } | null)?.elements,
    ) &&
    ((siteSettings?.home_builder as { elements?: unknown[] } | null)?.elements?.length ?? 0) > 0;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {!hasHomeBuilder && siteSettings?.hero_image_url ? (
        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #dacfc4", position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={siteSettings.hero_image_url}
            alt={dict.home.heroAlt}
            width={1200}
            height={500}
            style={{ width: "100%", height: "min(46vw, 460px)", objectFit: "cover", display: "block" }}
          />
          {(siteSettings.home_intro_title || siteSettings.home_intro_body) && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: `${Math.min(100, Math.max(0, Number((siteSettings.home_intro_layout as { titleX?: number } | null)?.titleX ?? 8)))}%`,
                  top: `${Math.min(100, Math.max(0, Number((siteSettings.home_intro_layout as { titleY?: number } | null)?.titleY ?? 14)))}%`,
                  color: "#fff",
                  textShadow: "0 2px 10px rgba(0,0,0,0.35)",
                  fontSize: "clamp(1.2rem, 2.2vw, 2.1rem)",
                  fontWeight: 700,
                }}
                className="hero-intro-title"
              >
                {siteSettings.home_intro_title}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: `${Math.min(100, Math.max(0, Number((siteSettings.home_intro_layout as { bodyX?: number } | null)?.bodyX ?? 8)))}%`,
                  top: `${Math.min(100, Math.max(0, Number((siteSettings.home_intro_layout as { bodyY?: number } | null)?.bodyY ?? 24)))}%`,
                  color: "#fff",
                  textShadow: "0 2px 10px rgba(0,0,0,0.35)",
                  maxWidth: "70%",
                  lineHeight: 1.35,
                }}
                className="hero-intro-body"
              >
                {siteSettings.home_intro_body}
              </div>
              <style>
                {`
                  @media (max-width: 768px) {
                    .hero-intro-title {
                      left: ${Math.min(100, Math.max(0, Number((siteSettings.home_intro_layout as { titleXMobile?: number } | null)?.titleXMobile ?? 6)))}% !important;
                      top: ${Math.min(100, Math.max(0, Number((siteSettings.home_intro_layout as { titleYMobile?: number } | null)?.titleYMobile ?? 12)))}% !important;
                    }
                    .hero-intro-body {
                      left: ${Math.min(100, Math.max(0, Number((siteSettings.home_intro_layout as { bodyXMobile?: number } | null)?.bodyXMobile ?? 6)))}% !important;
                      top: ${Math.min(100, Math.max(0, Number((siteSettings.home_intro_layout as { bodyYMobile?: number } | null)?.bodyYMobile ?? 24)))}% !important;
                      max-width: 88% !important;
                      font-size: 0.92rem;
                    }
                  }
                `}
              </style>
            </>
          )}
        </div>
      ) : null}

      {!hasHomeBuilder ? (
        <>
          <RecentlyViewedStory locale={locale} dict={dict} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{dict.home.featured}</h1>
            <Link href={localizedPath("/products", locale)}>{dict.home.viewAll}</Link>
          </div>
          {!featured.length ? (
            <p style={{ color: "#64748b" }}>{dict.home.empty}</p>
          ) : (
            <ProductGridMotion products={featured} locale={locale} />
          )}
        </>
      ) : null}

      {hasHomeBuilder ? (
        (() => {
          const builder = siteSettings?.home_builder as {
            canvasHeight?: number;
            elements?: Array<{
              id?: string;
              type?: "text" | "image" | "icon";
              x?: number;
              y?: number;
              width?: number;
              height?: number;
              content?: string;
              href?: string;
              imageUrl?: string;
              icon?: string;
              color?: string;
              background?: string;
              fontSize?: number;
              fontWeight?: number;
            }>;
          };
          const canvasHeight = Math.min(5000, Math.max(800, Number(builder.canvasHeight ?? 1200)));
          return (
            <section
              style={{
                position: "relative",
                height: canvasHeight,
                width: "100%",
                overflow: "hidden",
                borderRadius: 12,
                border: "1px solid #dacfc4",
                background: "#f7f2ec",
              }}
            >
              {siteSettings?.hero_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={siteSettings.hero_image_url}
                  alt={dict.home.heroAlt}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: 340,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : null}
              {builder.elements?.map((item, index) => {
                const x = Math.min(100, Math.max(0, Number(item.x ?? 0)));
                const y = Math.min(100, Math.max(0, Number(item.y ?? 0)));
                const width = Math.min(100, Math.max(4, Number(item.width ?? 20)));
                const height = Math.min(100, Math.max(4, Number(item.height ?? 12)));
                const style = {
                  position: "absolute",
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${width}%`,
                  minHeight: `${height}%`,
                  padding: 10,
                  borderRadius: 10,
                  background: item.background || "rgba(0,0,0,0.2)",
                  color: item.color || "#fff",
                  overflow: "hidden",
                };
                const body =
                  item.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : item.type === "icon" ? (
                    <div style={{ fontSize: Number(item.fontSize ?? 18), fontWeight: Number(item.fontWeight ?? 600) }}>
                      {item.icon === "truck"
                        ? "🚚"
                        : item.icon === "gift"
                          ? "🎁"
                          : item.icon === "credit-card"
                            ? "💳"
                            : item.icon === "phone"
                              ? "📞"
                              : "⭐"}{" "}
                      {item.content}
                    </div>
                  ) : (
                    <div style={{ fontSize: Number(item.fontSize ?? 18), fontWeight: Number(item.fontWeight ?? 600) }}>
                      {item.content}
                    </div>
                  );
                return item.href ? (
                  <Link key={item.id ?? `el-${index}`} href={item.href} style={style}>
                    {body}
                  </Link>
                ) : (
                  <div key={item.id ?? `el-${index}`} style={style}>
                    {body}
                  </div>
                );
              })}
            </section>
          );
        })()
      ) : homeSections.length ? (
        (() => {
          const positioned = homeSections
            .filter((s) => s.enabled !== false && s.key)
            .map((section) => {
              const key = String(section.key).trim().toLowerCase();
              const products = groupedProducts.get(key) ?? [];
              if (!products.length) return null;
              const x = Math.max(0, Number(section.x ?? 0));
              const y = Math.max(0, Number(section.y ?? 0));
              const widthPx = Math.min(
                1280,
                Math.max(
                  320,
                  Number(section.widthPx ?? (section.width === "compact" ? 720 : section.width === "wide" ? 1200 : 1080)),
                ),
              );
              const heightPx = Math.min(
                900,
                Math.max(
                  140,
                  Number(
                    section.heightPx ??
                      (section.height === "small"
                        ? 220
                        : section.height === "medium"
                          ? 300
                          : section.height === "large"
                            ? 380
                            : 260),
                  ),
                ),
              );
              const titleSize = Math.min(64, Math.max(14, Number(section.titleSize ?? 24)));
              const subtitleSize = Math.min(40, Math.max(12, Number(section.subtitleSize ?? 16)));
              const titleWeight =
                section.titleWeight === "400" ||
                section.titleWeight === "500" ||
                section.titleWeight === "600" ||
                section.titleWeight === "700" ||
                section.titleWeight === "800"
                  ? section.titleWeight
                  : "700";
              const subtitleWeight =
                section.subtitleWeight === "400" ||
                section.subtitleWeight === "500" ||
                section.subtitleWeight === "600" ||
                section.subtitleWeight === "700"
                  ? section.subtitleWeight
                  : "400";
              const titleFont = section.titleFont === "sans" ? "var(--font-manrope)" : "var(--font-cormorant)";
              const subtitleFont =
                section.subtitleFont === "display" ? "var(--font-cormorant)" : "var(--font-manrope)";
              const minColumnPx = widthPx < 760 ? 170 : widthPx > 1080 ? 240 : 200;
              return {
                key,
                x,
                y,
                widthPx,
                heightPx,
                minColumnPx,
                title: section.title,
                subtitle: section.subtitle,
                ctaLabel: section.ctaLabel,
                ctaUrl: section.ctaUrl,
                titleSize,
                subtitleSize,
                titleWeight,
                subtitleWeight,
                titleFont,
                subtitleFont,
                products,
              };
            })
            .filter(Boolean) as Array<{
            key: string;
            x: number;
            y: number;
            widthPx: number;
            heightPx: number;
            minColumnPx: number;
            title?: string;
            subtitle?: string;
            ctaLabel?: string;
            ctaUrl?: string;
            titleSize: number;
            subtitleSize: number;
            titleWeight: "400" | "500" | "600" | "700" | "800";
            subtitleWeight: "400" | "500" | "600" | "700";
            titleFont: string;
            subtitleFont: string;
            products: typeof featured;
          }>;

          if (!positioned.length) return null;
          const maxBottom = positioned.reduce((max, item) => Math.max(max, item.y + item.heightPx), 0);
          return (
            <section style={{ position: "relative", minHeight: maxBottom, width: "100%", overflow: "hidden" }}>
              {positioned.map((section) => (
                <div
                  key={section.key}
                  style={{
                    position: "absolute",
                    left: section.x,
                    top: section.y,
                    width: `min(100%, ${section.widthPx}px)`,
                    minHeight: section.heightPx,
                    border: "1px solid #d9cec3",
                    borderRadius: 12,
                    padding: 14,
                    background: "rgba(255,255,255,0.88)",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ display: "grid", gap: 4 }}>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: `${section.titleSize}px`,
                          fontWeight: Number(section.titleWeight),
                          fontFamily: section.titleFont,
                        }}
                      >
                        {section.title?.trim() || section.key.replace(/-/g, " ")}
                      </h2>
                      {section.subtitle ? (
                        <p
                          style={{
                            margin: 0,
                            color: "#64748b",
                            fontSize: `${section.subtitleSize}px`,
                            fontWeight: Number(section.subtitleWeight),
                            fontFamily: section.subtitleFont,
                          }}
                        >
                          {section.subtitle}
                        </p>
                      ) : null}
                    </div>
                    {section.ctaLabel && section.ctaUrl ? (
                      <Link href={section.ctaUrl}>{section.ctaLabel}</Link>
                    ) : null}
                  </div>
                  <ProductGridMotion products={section.products} locale={locale} minColumnPx={section.minColumnPx} />
                </div>
              ))}
            </section>
          );
        })()
      ) : (
        [...groupedProducts.entries()].map(([groupKey, products]) => (
            <section key={groupKey} style={{ display: "grid", gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem", textTransform: "capitalize" }}>{groupKey.replace(/-/g, " ")}</h2>
              <ProductGridMotion products={products} locale={locale} minColumnPx={200} />
            </section>
          ))
      )}
    </div>
  );
}
