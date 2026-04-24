import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { fetchProducts } from "@/lib/products/queries";
import { updateMainPageConstructor } from "@/app/actions/admin-site";
import { MainPageConstructorForm } from "@/components/admin/MainPageConstructorForm";

type HomeBuilderData = {
  canvasHeight?: number;
  canvasBackground?: string;
  elements?: Array<{
    id?: string;
    type?:
      | "text"
      | "image"
      | "video"
      | "icon"
      | "product-group"
      | "story-viewed"
      | "story-searched"
      | "comments";
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    content?: string;
    href?: string;
    imageUrl?: string;
    videoUrl?: string;
    icon?: string;
    color?: string;
    background?: string;
    fontSize?: number;
    fontWeight?: number;
  }>;
};

export default async function MainPageConstructorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const { data } = await supabase
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
  const featured = await fetchProducts(supabase, { featuredOnly: true });
  const groupedProducts = new Map<string, typeof featured>();
  for (const row of (groupedRows ?? []) as typeof featured) {
    const key = row.group_key?.trim();
    if (!key) continue;
    const list = groupedProducts.get(key) ?? [];
    if (list.length < 8) list.push(row);
    groupedProducts.set(key, list);
  }
  const builder = (data?.home_builder ?? {}) as HomeBuilderData;


  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h2
        style={{
          margin: 0,
          color: "var(--page-heading, inherit)",
          fontSize: "clamp(1.2rem, 2vw, 1.6rem)",
          letterSpacing: "0.02em",
        }}
      >
        {dict.admin.mainPageConstructor}
      </h2>
      <MainPageConstructorForm
        locale={locale}
        action={updateMainPageConstructor}
        existing={{
          heroImageUrl: data?.hero_image_url ?? "",
          introTitle: data?.home_intro_title ?? "",
          introBody: data?.home_intro_body ?? "",
          canvasHeight: Math.min(5000, Math.max(800, Number(builder.canvasHeight ?? 1200))),
          canvasBackground: String(builder.canvasBackground ?? "#f7f2ec"),
          elements: Array.isArray(builder.elements)
            ? builder.elements.map((item, idx) => ({
                id: String(item.id ?? `el-${idx}`),
                type:
                  item.type === "image" ||
                  item.type === "video" ||
                  item.type === "icon" ||
                  item.type === "product-group" ||
                  item.type === "story-viewed" ||
                  item.type === "story-searched" ||
                  item.type === "comments"
                    ? item.type
                    : "text",
                x: Math.min(100, Math.max(0, Number(item.x ?? 8))),
                y: Math.min(100, Math.max(0, Number(item.y ?? 10))),
                width: Math.min(100, Math.max(4, Number(item.width ?? 30))),
                height: Math.min(100, Math.max(4, Number(item.height ?? 12))),
                content: String(item.content ?? ""),
                href: String(item.href ?? ""),
                imageUrl: String(item.imageUrl ?? ""),
                videoUrl: String(item.videoUrl ?? ""),
                icon: String(item.icon ?? "star"),
                color: String(item.color ?? "#ffffff"),
                background: String(item.background ?? "rgba(0,0,0,0.28)"),
                fontSize: Math.min(72, Math.max(10, Number(item.fontSize ?? 18))),
                fontWeight: Math.min(900, Math.max(300, Number(item.fontWeight ?? 600))),
              }))
            : [],
        }}
        productGroups={Object.fromEntries(
          [...groupedProducts.entries()].map(([groupKey, rows]) => [
            groupKey,
            rows.map((row) => ({
              id: row.id,
              title: locale === "en" ? row.name_en || row.name_ru : row.name_ru,
              href: localizedPath(`/products/${row.slug}`, locale),
              imageUrl: row.image_url,
            })),
          ]),
        )}
        labels={{
          constructorTitle: dict.admin.mainPageConstructor,
          introTitle: dict.admin.homeIntroTitle,
          introBody: dict.admin.homeIntroBody,
          sectionsTitle: dict.admin.homeSections,
          sectionKey: dict.admin.sectionKey,
          sectionTitle: dict.admin.sectionTitle,
          sectionSubtitle: dict.admin.sectionSubtitle,
          sectionCtaLabel: dict.admin.sectionCtaLabel,
          sectionCtaUrl: dict.admin.sectionCtaUrl,
          sectionEnabled: dict.admin.sectionEnabled,
          sectionWidth: dict.admin.sectionWidth,
          sectionHeight: dict.admin.sectionHeight,
          previewTitle: dict.admin.previewTitle,
          openPreview: dict.admin.openPreview,
          closePreview: dict.admin.closePreview,
          mobilePreview: dict.admin.mobilePreview,
          desktopPreview: dict.admin.desktopPreview,
          resizeHint: dict.admin.resizeHint,
          titleSize: dict.admin.titleSize,
          subtitleSize: dict.admin.subtitleSize,
          titleWeight: dict.admin.titleWeight,
          subtitleWeight: dict.admin.subtitleWeight,
          titleFont: dict.admin.titleFont,
          subtitleFont: dict.admin.subtitleFont,
          addText: dict.admin.addText,
          addImageBlock: dict.admin.addImageBlock,
          addVideoBlock: (dict.admin as Record<string, string>).addVideoBlock ?? "Add video block",
          addIconBlock: dict.admin.addIconBlock,
          selectedElement: dict.admin.selectedElement,
          selectElement: dict.admin.selectElement,
          content: dict.admin.content,
          imageUrl: dict.admin.imageUrl,
          icon: dict.admin.icon,
          textColor: dict.admin.textColor,
          background: dict.admin.background,
          fontSize: dict.admin.titleSize,
          fontWeight: dict.admin.titleWeight,
          previewHeight: dict.admin.previewHeight,
          previewBackgroundColor: dict.admin.previewBackgroundColor,
          transparentBackground: dict.admin.transparentBackground,
          addSection: dict.admin.addSection,
          removeSection: dict.admin.removeSection,
          reorderHint: dict.admin.reorderHint,
          save: dict.admin.save,
          homeHero: dict.admin.homeHero,
          homeHeroUrl: dict.admin.homeHeroUrl,
          homeHeroSizeHint: dict.admin.homeHeroSizeHint,
          cropApply: dict.admin.cropApply,
          imagePreview: dict.admin.imagePreview,
          constructorTools: dict.admin.constructorTools,
          addProductGroupBlock: dict.admin.addProductGroupBlock,
          addViewedStoryBlock: dict.admin.addViewedStoryBlock,
          addSearchedStoryBlock: dict.admin.addSearchedStoryBlock,
          addCommentsBlock: dict.admin.addCommentsBlock,
          productGroupHint: dict.admin.productGroupHint,
          commentsHint: dict.admin.commentsHint,
          linkUrl: dict.admin.linkUrl,
          dragOrUploadImage: dict.admin.dragOrUploadImage,
          noImagePreview: dict.admin.noImagePreview,
          horizontalPositionPercent: dict.admin.horizontalPositionPercent,
          verticalPositionPercent: dict.admin.verticalPositionPercent,
          blockWidthPercent: dict.admin.blockWidthPercent,
          blockHeightPercent: dict.admin.blockHeightPercent,
          canvasHeader: dict.admin.canvasHeader,
          canvasFooter: dict.admin.canvasFooter,
          heroMissing: dict.admin.heroMissing,
          imageUrlEmpty: dict.admin.imageUrlEmpty,
          videoUrlEmpty: (dict.admin as Record<string, string>).videoUrlEmpty ?? "Video URL is empty",
          productGroupFallback: dict.admin.productGroupFallback,
          productGroupEmpty: dict.admin.productGroupEmpty,
          noViewedItems: dict.admin.noViewedItems,
          noSearchHistory: dict.admin.noSearchHistory,
          commentsFallbackName: dict.admin.commentsFallbackName,
          commentsFallbackText: dict.admin.commentsFallbackText,
          toolsCollapse: dict.admin.toolsCollapse,
          toolsExpand: dict.admin.toolsExpand,
          commentName: dict.admin.commentName,
          commentRating: dict.admin.commentRating,
          commentText: dict.admin.commentText,
          addComment: dict.admin.addComment,
          removeComment: dict.admin.removeComment,
        }}
      />
    </div>
  );
}
