import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { updateMainPageConstructor } from "@/app/actions/admin-site";
import { MainPageConstructorForm } from "@/components/admin/MainPageConstructorForm";

type HomeBuilderData = {
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
  const builder = (data?.home_builder ?? {}) as HomeBuilderData;


  return (
    <MainPageConstructorForm
      locale={locale}
      action={updateMainPageConstructor}
      existing={{
        heroImageUrl: data?.hero_image_url ?? "",
        introTitle: data?.home_intro_title ?? "",
        introBody: data?.home_intro_body ?? "",
        canvasHeight: Math.min(5000, Math.max(800, Number(builder.canvasHeight ?? 1200))),
        elements: Array.isArray(builder.elements)
          ? builder.elements.map((item, idx) => ({
              id: String(item.id ?? `el-${idx}`),
              type: item.type === "image" || item.type === "icon" ? item.type : "text",
              x: Math.min(100, Math.max(0, Number(item.x ?? 8))),
              y: Math.min(100, Math.max(0, Number(item.y ?? 10))),
              width: Math.min(100, Math.max(4, Number(item.width ?? 30))),
              height: Math.min(100, Math.max(4, Number(item.height ?? 12))),
              content: String(item.content ?? ""),
              href: String(item.href ?? ""),
              imageUrl: String(item.imageUrl ?? ""),
              icon: String(item.icon ?? "star"),
              color: String(item.color ?? "#ffffff"),
              background: String(item.background ?? "rgba(0,0,0,0.28)"),
              fontSize: Math.min(72, Math.max(10, Number(item.fontSize ?? 18))),
              fontWeight: Math.min(900, Math.max(300, Number(item.fontWeight ?? 600))),
            }))
          : [],
      }}
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
        addSection: dict.admin.addSection,
        removeSection: dict.admin.removeSection,
        reorderHint: dict.admin.reorderHint,
        save: dict.admin.save,
        homeHero: dict.admin.homeHero,
        homeHeroUrl: dict.admin.homeHeroUrl,
        homeHeroSizeHint: dict.admin.homeHeroSizeHint,
        cropApply: dict.admin.cropApply,
        imagePreview: dict.admin.imagePreview,
      }}
    />
  );
}
