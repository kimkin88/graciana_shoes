"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdmin } from "@/lib/auth/roles";
import { isLocale, type Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";
import {
  applyTileSelection,
  parseHomePage,
  type HomeMediaTile,
  type HomePageContent,
} from "@/lib/home/content";

function readLocale(formData: FormData): Locale {
  const raw = String(formData.get("locale") ?? "ru");
  return isLocale(raw) ? raw : "ru";
}

function fail(locale: Locale, code: string): never {
  redirect(`${localizedPath("/admin/content", locale)}?error=${code}`);
}

function isTransientMediaUrl(src: string) {
  return src.startsWith("blob:") || src.startsWith("data:");
}

/** Client uploads media first; Server Action only persists final URLs in JSON. */
function finalizeTiles(tiles: HomeMediaTile[]) {
  for (const tile of tiles) {
    if (tile.media?.length) {
      tile.media = tile.media.filter((asset) => asset.src && !isTransientMediaUrl(asset.src));
      if (!tile.media.some((asset) => asset.id === tile.selectedMediaId)) {
        tile.selectedMediaId = tile.media[0]?.id ?? "";
      }
      const selected = applyTileSelection(tile);
      tile.src = selected.src;
      tile.video = selected.video;
    } else {
      if (isTransientMediaUrl(tile.src)) tile.src = "";
      if (tile.video && isTransientMediaUrl(tile.video)) tile.video = "";
    }

    if (tile.category) {
      tile.href = `/products?category=${encodeURIComponent(tile.category)}`;
    }
  }
}

async function saveHomePageRow(page: HomePageContent) {
  const service = createServiceClient();
  const full = await service.from("site_settings").upsert({ id: 1, home_page: page, home_builder: page });
  if (!full.error) return;
  if (/home_page|schema cache|does not exist/i.test(full.error.message ?? "")) {
    const fallback = await service.from("site_settings").upsert({ id: 1, home_builder: page });
    if (fallback.error) throw fallback.error;
    return;
  }
  throw full.error;
}

export async function updateSiteContent(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) {
    redirect(localizedPath("/", locale));
  }

  let parsed: HomePageContent;
  try {
    parsed = parseHomePage(JSON.parse(String(formData.get("home_page") ?? "{}")));
  } catch {
    fail(locale, "json");
  }

  try {
    finalizeTiles([...parsed.hero, ...parsed.categories, ...parsed.looks]);
    await saveHomePageRow(parsed);
  } catch (err) {
    console.error("[updateSiteContent]", err);
    fail(locale, "save");
  }

  revalidatePath(`/${locale}`, "layout");
  revalidatePath(`/${locale}/admin/content`, "page");
  redirect(`${localizedPath("/admin/content", locale)}?saved=1`);
}
