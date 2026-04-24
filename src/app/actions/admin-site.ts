"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdmin } from "@/lib/auth/roles";
import { isLocale, type Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";

function readLocale(formData: FormData): Locale {
  const raw = String(formData.get("locale") ?? "ru");
  return isLocale(raw) ? raw : "ru";
}

type MainPageSection = {
  key: string;
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
};
type IntroLayout = {
  titleX?: number;
  titleY?: number;
  bodyX?: number;
  bodyY?: number;
  titleXMobile?: number;
  titleYMobile?: number;
  bodyXMobile?: number;
  bodyYMobile?: number;
};
type HomeBuilderElement = {
  id: string;
  type:
    | "text"
    | "image"
    | "video"
    | "icon"
    | "product-group"
    | "story-viewed"
    | "story-searched"
    | "comments";
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  href?: string;
  imageUrl?: string;
  videoUrl?: string;
  icon?: string;
  color?: string;
  background?: string;
  fontSize?: number;
  fontWeight?: number;
};

function normalizeBuilderElementType(
  value: unknown,
): HomeBuilderElement["type"] {
  return value === "image" ||
    value === "video" ||
    value === "icon" ||
    value === "product-group" ||
    value === "story-viewed" ||
    value === "story-searched" ||
    value === "comments"
    ? value
    : "text";
}

function clamp(input: unknown, min: number, max: number, fallback: number) {
  const value = Number(input);
  if (Number.isNaN(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function extensionFromMime(mime: string) {
  if (mime.includes("jpeg")) return "jpg";
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("webm")) return "webm";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("quicktime")) return "mov";
  return "jpg";
}

export async function updateHomeHeroImage(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) {
    redirect(localizedPath("/", locale));
  }
  const service = createServiceClient();

  let heroImageUrl = String(formData.get("hero_image_url") ?? "").trim() || null;
  const rawFile = formData.get("hero_image_file");
  if (rawFile instanceof File && rawFile.size > 0) {
    const extension = rawFile.name.includes(".")
      ? rawFile.name.split(".").pop()?.toLowerCase() ?? "jpg"
      : "jpg";
    const filePath = `site/hero-${Date.now()}.${extension}`;
    const { error } = await service.storage
      .from("product-images")
      .upload(filePath, rawFile, { contentType: rawFile.type, upsert: false });
    if (error) {
      console.error("[admin-site:hero-upload]", error);
      redirect(`${localizedPath("/admin", locale)}?error=hero_upload`);
    }
    const { data } = service.storage.from("product-images").getPublicUrl(filePath);
    heroImageUrl = data.publicUrl;
  }

  const { error } = await service
    .from("site_settings")
    .upsert({ id: 1, hero_image_url: heroImageUrl }, { onConflict: "id" });
  if (error) {
    console.error("[admin-site:upsert]", error);
    redirect(`${localizedPath("/admin", locale)}?error=hero_db`);
  }

  revalidatePath(`/${locale}`, "page");
  revalidatePath(`/${locale}/admin`, "page");
  redirect(localizedPath("/admin", locale));
}

export async function updateMainPageConstructor(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) {
    redirect(localizedPath("/", locale));
  }
  const service = createServiceClient();

  let heroImageUrl = String(formData.get("hero_image_url") ?? "").trim() || null;
  const rawFile = formData.get("hero_image_file");
  if (rawFile instanceof File && rawFile.size > 0) {
    const extension = rawFile.name.includes(".")
      ? rawFile.name.split(".").pop()?.toLowerCase() ?? "jpg"
      : "jpg";
    const filePath = `site/hero-${Date.now()}.${extension}`;
    const { error } = await service.storage
      .from("product-images")
      .upload(filePath, rawFile, { contentType: rawFile.type, upsert: false });
    if (error) {
      console.error("[admin-site:constructor-hero-upload]", error);
      redirect(`${localizedPath("/admin/main-page-constructor", locale)}?error=hero_upload`);
    }
    const { data } = service.storage.from("product-images").getPublicUrl(filePath);
    heroImageUrl = data.publicUrl;
  }

  const introTitle = String(formData.get("home_intro_title") ?? "").trim() || null;
  const introBody = String(formData.get("home_intro_body") ?? "").trim() || null;
  let introLayout: IntroLayout = {};
  try {
    const raw = String(formData.get("home_intro_layout_json") ?? "{}");
    const parsed = JSON.parse(raw) as IntroLayout;
    introLayout = {
      titleX: clamp(parsed.titleX, 0, 100, 8),
      titleY: clamp(parsed.titleY, 0, 100, 14),
      bodyX: clamp(parsed.bodyX, 0, 100, 8),
      bodyY: clamp(parsed.bodyY, 0, 100, 24),
      titleXMobile: clamp(parsed.titleXMobile, 0, 100, 6),
      titleYMobile: clamp(parsed.titleYMobile, 0, 100, 12),
      bodyXMobile: clamp(parsed.bodyXMobile, 0, 100, 6),
      bodyYMobile: clamp(parsed.bodyYMobile, 0, 100, 24),
    };
  } catch {
    introLayout = {};
  }
  let homeBuilder: {
    canvasHeight: number;
    canvasBackground: string;
    elements: HomeBuilderElement[];
  } = {
    canvasHeight: 1200,
    canvasBackground: "#f7f2ec",
    elements: [],
  };
  try {
    const raw = String(formData.get("home_builder_json") ?? "{}");
    const parsed = JSON.parse(raw) as {
      canvasHeight?: number;
      canvasBackground?: string;
      elements?: HomeBuilderElement[];
    };
    const normalizedElements: HomeBuilderElement[] = Array.isArray(parsed.elements)
      ? parsed.elements
          .map((item) => ({
            id: String(item.id ?? `el-${Date.now()}`),
            type: normalizeBuilderElementType(item.type),
            x: clamp(item.x, 0, 100, 0),
            y: clamp(item.y, 0, 100, 0),
            width: clamp(item.width, 4, 100, 20),
            height: clamp(item.height, 4, 100, 12),
            content: String(item.content ?? "").trim() || undefined,
            href: String(item.href ?? "").trim() || undefined,
            imageUrl: String(item.imageUrl ?? "").trim() || undefined,
            videoUrl: String(item.videoUrl ?? "").trim() || undefined,
            icon: String(item.icon ?? "").trim() || undefined,
            color: String(item.color ?? "").trim() || undefined,
            background: String(item.background ?? "").trim() || undefined,
            fontSize: clamp(item.fontSize, 10, 72, 18),
            fontWeight: clamp(item.fontWeight, 300, 900, 600),
          }))
          .filter((item) => Boolean(item.id))
      : [];

    const uploadedElements: HomeBuilderElement[] = [];
    for (const item of normalizedElements) {
      if (item.type === "image" && item.imageUrl?.startsWith("data:")) {
        try {
          const mime = item.imageUrl.slice(5, item.imageUrl.indexOf(";")).toLowerCase();
          const extension = extensionFromMime(mime);
          const response = await fetch(item.imageUrl);
          const bytes = await response.arrayBuffer();
          const filePath = `site/home-builder/${Date.now()}-${item.id}.${extension}`;
          const { error: uploadError } = await service.storage
            .from("product-images")
            .upload(filePath, bytes, { contentType: mime || "image/jpeg", upsert: false });
          if (!uploadError) {
            const { data } = service.storage.from("product-images").getPublicUrl(filePath);
            uploadedElements.push({ ...item, imageUrl: data.publicUrl });
            continue;
          }
          console.error("[admin-site:home-builder-image-upload]", uploadError);
        } catch (error) {
          console.error("[admin-site:home-builder-image-convert]", error);
        }
      }
      if (item.type === "video" && item.videoUrl?.startsWith("data:")) {
        try {
          const mime = item.videoUrl.slice(5, item.videoUrl.indexOf(";")).toLowerCase();
          const extension = extensionFromMime(mime);
          const response = await fetch(item.videoUrl);
          const bytes = await response.arrayBuffer();
          const filePath = `site/home-builder/${Date.now()}-${item.id}.${extension}`;
          const { error: uploadError } = await service.storage
            .from("product-images")
            .upload(filePath, bytes, { contentType: mime || "video/mp4", upsert: false });
          if (!uploadError) {
            const { data } = service.storage.from("product-images").getPublicUrl(filePath);
            uploadedElements.push({ ...item, videoUrl: data.publicUrl });
            continue;
          }
          console.error("[admin-site:home-builder-video-upload]", uploadError);
        } catch (error) {
          console.error("[admin-site:home-builder-video-convert]", error);
        }
      }
      uploadedElements.push(item);
    }

    homeBuilder = {
      canvasHeight: clamp(parsed.canvasHeight, 800, 5000, 1200),
      canvasBackground: String(parsed.canvasBackground ?? "#f7f2ec").trim() || "#f7f2ec",
      elements: uploadedElements,
    };
  } catch {
    homeBuilder = {
      canvasHeight: 1200,
      canvasBackground: "#f7f2ec",
      elements: [],
    };
  }

  let homeSections: MainPageSection[] = [];
  try {
    const raw = String(formData.get("home_sections_json") ?? "[]");
    const parsed = JSON.parse(raw) as MainPageSection[];
    if (Array.isArray(parsed)) {
      homeSections = parsed
        .map((s): MainPageSection => {
          const titleFont: "display" | "sans" =
            s.titleFont === "sans" ? "sans" : "display";
          const subtitleFont: "display" | "sans" =
            s.subtitleFont === "display" ? "display" : "sans";
          return {
            key: String(s.key ?? "").trim().toLowerCase(),
            title: String(s.title ?? "").trim() || undefined,
            subtitle: String(s.subtitle ?? "").trim() || undefined,
            ctaLabel: String(s.ctaLabel ?? "").trim() || undefined,
            ctaUrl: String(s.ctaUrl ?? "").trim() || undefined,
            enabled: s.enabled !== false,
            x: clamp(s.x, 0, 2000, 0),
            y: clamp(s.y, 0, 8000, 0),
            widthPx: clamp(
              s.widthPx ?? (s.width === "compact" ? 720 : s.width === "wide" ? 1200 : 1080),
              320,
              1280,
              1080,
            ),
            heightPx: clamp(
              s.heightPx ??
                (s.height === "small"
                  ? 220
                  : s.height === "medium"
                    ? 300
                    : s.height === "large"
                      ? 380
                      : 260),
              140,
              900,
              260,
            ),
            titleSize: clamp(s.titleSize, 14, 64, 24),
            subtitleSize: clamp(s.subtitleSize, 12, 40, 16),
            titleWeight:
              s.titleWeight === "400" ||
              s.titleWeight === "500" ||
              s.titleWeight === "600" ||
              s.titleWeight === "700" ||
              s.titleWeight === "800"
                ? s.titleWeight
                : "700",
            subtitleWeight:
              s.subtitleWeight === "400" ||
              s.subtitleWeight === "500" ||
              s.subtitleWeight === "600" ||
              s.subtitleWeight === "700"
                ? s.subtitleWeight
                : "400",
            titleFont,
            subtitleFont,
          };
        })
        .filter((s) => s.key);
    }
  } catch {
    redirect(`${localizedPath("/admin/main-page-constructor", locale)}?error=sections`);
  }

  const { error } = await service.from("site_settings").upsert(
    {
      id: 1,
      hero_image_url: heroImageUrl,
      home_intro_title: introTitle,
      home_intro_body: introBody,
      home_intro_layout: introLayout,
      home_sections: homeSections,
      home_builder: homeBuilder,
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("[admin-site:update-constructor]", error);
    redirect(`${localizedPath("/admin/main-page-constructor", locale)}?error=db`);
  }

  revalidatePath(`/${locale}`, "page");
  revalidatePath(`/${locale}/admin/main-page-constructor`, "page");
  redirect(localizedPath("/admin/main-page-constructor", locale));
}
