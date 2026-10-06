"use client";

import { useMemo, useState, type CSSProperties } from "react";
import styled from "styled-components";
import { useFormStatus } from "react-dom";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import type { ProductRow } from "@/types";
import { AdminButton } from "@/components/admin/AdminButtons";
import { HomePagePreview } from "@/components/admin/HomePagePreview";
import { AppSelect } from "@/components/ui/AppSelect";
import { Field, Input, Label, TextArea } from "@/components/ui/Input";
import { STORE_CATEGORIES } from "@/lib/catalog/categories";
import {
  applyTileSelection,
  CATEGORY_LAYOUTS,
  ensureTileLibrary,
  HERO_LAYOUTS,
  newHomeTile,
  withHeroCount,
  type BiText,
  type CategoryLayout,
  type HeroLayout,
  type HomeMediaAsset,
  type HomeMediaTile,
  type HomePageContent,
  type HomePageTexts,
} from "@/lib/home/content";
import {
  registerSitePendingFile,
  resolveHomePageMedia,
  siteAssetPendingKey,
  siteTileImagePendingKey,
  siteTileVideoPendingKey,
  unregisterSitePendingFile,
} from "@/lib/storage/client-site-media";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { isImageTooLarge, isVideoTooLarge } from "@/lib/storage/media-limits";

type Props = {
  locale: Locale;
  dict: Messages;
  action: (formData: FormData) => void | Promise<void>;
  initial: HomePageContent;
  categories: string[];
  products: ProductRow[];
  featured: ProductRow[];
  groups: Array<{ key: string; products: ProductRow[] }>;
};

type SectionId =
  | "texts"
  | "marquee"
  | "newsletter"
  | "hero"
  | "popular"
  | "catalog"
  | "best"
  | "newin"
  | "recent";

const BiGrid = styled.div`
  display: grid;
  gap: 10px;
  @media (min-width: 720px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const TileHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
`;

const MediaRow = styled.div`
  display: grid;
  gap: 12px;
  align-items: start;
  @media (min-width: 560px) {
    grid-template-columns: auto minmax(0, 1fr);
  }
`;

function SaveButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <AdminButton type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
    </AdminButton>
  );
}

function BiFields({
  id,
  label,
  value,
  onChange,
  multiline,
}: {
  id: string;
  label: string;
  value: BiText;
  onChange: (next: BiText) => void;
  multiline?: boolean;
}) {
  return (
    <BiGrid>
      <Field>
        <Label htmlFor={`${id}_ru`}>{label} (RU)</Label>
        {multiline ? (
          <TextArea
            id={`${id}_ru`}
            value={value.ru}
            onChange={(e) => onChange({ ...value, ru: e.target.value })}
          />
        ) : (
          <Input
            id={`${id}_ru`}
            value={value.ru}
            onChange={(e) => onChange({ ...value, ru: e.target.value })}
          />
        )}
      </Field>
      <Field>
        <Label htmlFor={`${id}_en`}>{label} (EN)</Label>
        {multiline ? (
          <TextArea
            id={`${id}_en`}
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
          />
        ) : (
          <Input
            id={`${id}_en`}
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
          />
        )}
      </Field>
    </BiGrid>
  );
}

function moveItem<T>(list: T[], index: number, dir: -1 | 1) {
  const next = index + dir;
  if (next < 0 || next >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(index, 1);
  if (!item) return list;
  copy.splice(next, 0, item);
  return copy;
}

const TileBody = styled.div<{ $split?: boolean }>`
  display: grid;
  gap: 18px;
  align-items: start;
  @media (min-width: 960px) {
    grid-template-columns: ${({ $split }) => ($split ? "minmax(320px, 460px) minmax(0, 1fr)" : "1fr")};
  }
`;

const previewBox: CSSProperties = {
  width: 132,
  height: 132,
  objectFit: "contain",
  background: "color-mix(in srgb, var(--page-text-muted, #999) 12%, transparent)",
  border: "1px solid var(--page-border, #d6d1c8)",
  display: "block",
};

function MediaPreview({
  src,
  kind,
  style,
  controls = true,
}: {
  src: string;
  kind: "image" | "video";
  style?: CSSProperties;
  controls?: boolean;
}) {
  if (!src) return null;
  const box = { ...previewBox, ...style };
  if (kind === "video") {
    return <video src={src} muted playsInline controls={controls} style={box} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" style={box} />;
}

const thumbBox: CSSProperties = {
  width: 104,
  height: 138,
  objectFit: "cover",
};

function HeroSchematic({ layout }: { layout: HeroLayout }) {
  const fill = "currentColor";
  const soft = "color-mix(in srgb, currentColor 35%, transparent)";
  if (layout === "grid") {
    return (
      <svg viewBox="0 0 120 72" width="100%" height="72" aria-hidden>
        <rect x="2" y="2" width="36" height="68" fill={fill} />
        <rect x="42" y="2" width="36" height="68" fill={fill} />
        <rect x="82" y="2" width="36" height="68" fill={fill} />
      </svg>
    );
  }
  if (layout === "carousel") {
    return (
      <svg viewBox="0 0 120 72" width="100%" height="72" aria-hidden>
        <rect x="2" y="2" width="116" height="68" fill={fill} />
        <circle cx="52" cy="62" r="3" fill="#fff" />
        <circle cx="60" cy="62" r="3" fill="#fff" opacity="0.45" />
        <circle cx="68" cy="62" r="3" fill="#fff" opacity="0.45" />
      </svg>
    );
  }
  if (layout === "strip") {
    return (
      <svg viewBox="0 0 120 72" width="100%" height="72" aria-hidden>
        <rect x="2" y="2" width="70" height="68" fill={fill} />
        <rect x="76" y="2" width="70" height="68" fill={soft} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 72" width="100%" height="72" aria-hidden>
      <rect x="2" y="2" width="24" height="68" fill={soft} />
      <rect x="30" y="2" width="28" height="68" fill={fill} />
      <rect x="62" y="2" width="28" height="68" fill={fill} />
      <rect x="94" y="2" width="24" height="68" fill={soft} />
    </svg>
  );
}

function CategorySchematic({ layout }: { layout: CategoryLayout }) {
  const fill = "currentColor";
  const soft = "color-mix(in srgb, currentColor 40%, transparent)";
  if (layout === "mosaic") {
    return (
      <svg viewBox="0 0 120 72" width="100%" height="72" aria-hidden>
        <rect x="2" y="2" width="58" height="68" fill={fill} />
        <rect x="64" y="2" width="25" height="32" fill={soft} />
        <rect x="93" y="2" width="25" height="32" fill={soft} />
        <rect x="64" y="38" width="25" height="32" fill={soft} />
        <rect x="93" y="38" width="25" height="32" fill={soft} />
      </svg>
    );
  }
  if (layout === "columns") {
    return (
      <svg viewBox="0 0 120 72" width="100%" height="72" aria-hidden>
        <rect x="2" y="2" width="26" height="32" fill={fill} />
        <rect x="32" y="2" width="26" height="32" fill={fill} />
        <rect x="62" y="2" width="26" height="32" fill={fill} />
        <rect x="92" y="2" width="26" height="32" fill={fill} />
        <rect x="2" y="38" width="26" height="32" fill={soft} />
        <rect x="32" y="38" width="26" height="32" fill={soft} />
        <rect x="62" y="38" width="26" height="32" fill={soft} />
        <rect x="92" y="38" width="26" height="32" fill={soft} />
      </svg>
    );
  }
  if (layout === "cards") {
    return (
      <svg viewBox="0 0 120 72" width="100%" height="72" aria-hidden>
        <rect x="2" y="4" width="116" height="18" fill={fill} />
        <rect x="2" y="27" width="116" height="18" fill={soft} />
        <rect x="2" y="50" width="116" height="18" fill={soft} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 72" width="100%" height="72" aria-hidden>
      <rect x="2" y="8" width="28" height="56" fill={fill} />
      <rect x="34" y="8" width="28" height="56" fill={fill} />
      <rect x="66" y="8" width="28" height="56" fill={fill} />
      <rect x="98" y="8" width="28" height="56" fill={soft} />
    </svg>
  );
}

function TileLibrary({
  tile,
  dict,
  onChange,
}: {
  tile: HomeMediaTile;
  dict: Messages;
  onChange: (next: HomeMediaTile) => void;
}) {
  const [link, setLink] = useState("");
  const [linkKind, setLinkKind] = useState<"image" | "video">("image");
  const media = tile.media ?? [];
  const selected = media.find((asset) => asset.id === tile.selectedMediaId) ?? null;

  function commit(nextMedia: HomeMediaAsset[], selectedMediaId: string) {
    onChange(applyTileSelection({ ...tile, media: nextMedia, selectedMediaId }));
  }

  function addFiles(list: FileList | null, kind: "image" | "video") {
    if (!list?.length) return;
    const next = [...media];
    let selectedMediaId = tile.selectedMediaId ?? "";
    for (const file of Array.from(list)) {
      const tooLarge = kind === "image" ? isImageTooLarge(file.size) : isVideoTooLarge(file.size);
      if (tooLarge) continue;
      const id = crypto.randomUUID();
      registerSitePendingFile(siteAssetPendingKey(tile.id, id), file, kind);
      next.push({ id, kind, src: URL.createObjectURL(file) });
      if (!selectedMediaId) selectedMediaId = id;
    }
    commit(next, selectedMediaId);
  }

  function addLink() {
    const src = link.trim();
    if (!src) return;
    const id = crypto.randomUUID();
    const next = [...media, { id, kind: linkKind, src }];
    commit(next, tile.selectedMediaId || id);
    setLink("");
  }

  function removeAsset(id: string) {
    unregisterSitePendingFile(siteAssetPendingKey(tile.id, id));
    const next = media.filter((asset) => asset.id !== id);
    const selectedMediaId = tile.selectedMediaId === id ? (next[0]?.id ?? "") : (tile.selectedMediaId ?? "");
    commit(next, selectedMediaId);
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {dict.admin.homeHeroChosen}
        </span>
        {selected ? (
          <MediaPreview
            src={selected.src}
            kind={selected.kind}
            style={{ width: "100%", maxWidth: 280, height: 360, objectFit: "cover" }}
          />
        ) : (
          <p style={{ margin: 0, color: "var(--page-text-muted)" }}>{dict.admin.homeHeroEmpty}</p>
        )}
      </div>

      {media.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {media.map((asset) => {
            const active = asset.id === tile.selectedMediaId;
            return (
              <div key={asset.id} style={{ display: "grid", gap: 6, width: 104 }}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => commit(media, asset.id)}
                  style={{
                    padding: 0,
                    border: active
                      ? "2px solid var(--page-text, #111)"
                      : "1px solid var(--page-border, #d6d1c8)",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  <MediaPreview src={asset.src} kind={asset.kind} controls={false} style={thumbBox} />
                </button>
                <span style={{ fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {active ? dict.admin.homeHeroChosen : asset.kind === "video" ? dict.admin.homeHeroVideo : dict.admin.homeHeroImage}
                </span>
                <button
                  type="button"
                  onClick={() => removeAsset(asset.id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    textAlign: "left",
                    cursor: "pointer",
                    color: "var(--page-text-muted)",
                    fontSize: "0.75rem",
                  }}
                >
                  {dict.admin.homeRemoveTile}
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
          {dict.admin.homeHeroAddImages}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              addFiles(event.target.files, "image");
              event.target.value = "";
            }}
          />
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: "0.78rem" }}>
          {dict.admin.homeHeroAddVideos}
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            multiple
            onChange={(event) => {
              addFiles(event.target.files, "video");
              event.target.value = "";
            }}
          />
        </label>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "end" }}>
        <Field>
          <Label htmlFor={`link_kind_${tile.id}`}>{dict.admin.homeHeroLinkKind}</Label>
          <AppSelect
            id={`link_kind_${tile.id}`}
            ariaLabel={dict.admin.homeHeroLinkKind}
            value={linkKind}
            onValueChange={(value) => setLinkKind(value === "video" ? "video" : "image")}
            options={[
              { value: "image", label: dict.admin.homeHeroImage },
              { value: "video", label: dict.admin.homeHeroVideo },
            ]}
          />
        </Field>
        <Field>
          <Label htmlFor={`link_${tile.id}`}>{dict.admin.homeHeroAddUrl}</Label>
          <Input id={`link_${tile.id}`} value={link} onChange={(event) => setLink(event.target.value)} />
        </Field>
        <AdminButton type="button" $variant="ghost" onClick={addLink}>
          {dict.admin.homeHeroAddUrl}
        </AdminButton>
      </div>
    </div>
  );
}

function TileEditor({
  tile,
  dict,
  categories,
  onChange,
  onRemove,
  onMove,
  canRemove,
  index,
  total,
  library = false,
}: {
  tile: HomeMediaTile;
  dict: Messages;
  categories: string[];
  onChange: (next: HomeMediaTile) => void;
  onRemove?: () => void;
  onMove: (dir: -1 | 1) => void;
  canRemove: boolean;
  index: number;
  total: number;
  library?: boolean;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--page-border, #d6d1c8)",
        padding: 16,
        display: "grid",
        gap: 10,
      }}
    >
      <TileHead>
        <strong style={{ fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {index + 1} / {total}
        </strong>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <AdminButton type="button" $variant="ghost" onClick={() => onMove(-1)} disabled={index === 0}>
            ↑
          </AdminButton>
          <AdminButton type="button" $variant="ghost" onClick={() => onMove(1)} disabled={index === total - 1}>
            ↓
          </AdminButton>
          {canRemove ? (
            <AdminButton type="button" $variant="ghost" onClick={onRemove}>
              {dict.admin.homeRemoveTile}
            </AdminButton>
          ) : null}
        </div>
      </TileHead>

      <TileBody $split={library}>
        {library ? <TileLibrary tile={tile} dict={dict} onChange={onChange} /> : null}
        <div style={{ display: "grid", gap: 10, minWidth: 0 }}>
      <BiGrid>
        <Field>
          <Label htmlFor={`label_ru_${tile.id}`}>{dict.admin.nameRu}</Label>
          <Input
            id={`label_ru_${tile.id}`}
            value={tile.labelRu}
            onChange={(e) => onChange({ ...tile, labelRu: e.target.value })}
          />
        </Field>
        <Field>
          <Label htmlFor={`label_en_${tile.id}`}>{dict.admin.nameEn}</Label>
          <Input
            id={`label_en_${tile.id}`}
            value={tile.labelEn}
            onChange={(e) => onChange({ ...tile, labelEn: e.target.value })}
          />
        </Field>
      </BiGrid>

      <Field>
        <Label htmlFor={`category_${tile.id}`}>{dict.admin.homeTileCategory}</Label>
        <Input
          id={`category_${tile.id}`}
          list="home-product-categories"
          value={tile.category ?? ""}
          placeholder={categories[0] ?? ""}
          onChange={(e) => {
            const category = e.target.value;
            onChange({
              ...tile,
              category,
              href: category.trim() ? `/products?category=${encodeURIComponent(category.trim())}` : tile.href,
            });
          }}
        />
      </Field>
      <Field>
        <Label htmlFor={`href_${tile.id}`}>{dict.admin.homeTileHref}</Label>
        <Input
          id={`href_${tile.id}`}
          value={tile.href}
          onChange={(e) => onChange({ ...tile, href: e.target.value })}
        />
      </Field>

      {library ? null : (
        <>
          <MediaRow>
            <MediaPreview src={tile.src} kind="image" />
            <Field>
              <Label htmlFor={`src_${tile.id}`}>{dict.admin.homeTileImage}</Label>
              <Input
                id={`src_${tile.id}`}
                value={tile.src.startsWith("blob:") ? "" : tile.src}
                placeholder={tile.src.startsWith("blob:") ? dict.admin.homeMediaPendingUpload : undefined}
                onChange={(e) => onChange({ ...tile, src: e.target.value })}
              />
              <Input
                type="file"
                accept="image/*"
                style={{ marginTop: 8 }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file || isImageTooLarge(file.size)) return;
                  registerSitePendingFile(siteTileImagePendingKey(tile.id), file, "image");
                  onChange({ ...tile, src: URL.createObjectURL(file) });
                  e.target.value = "";
                }}
              />
              <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: "var(--page-text-muted)" }}>
                {dict.admin.homeMediaBucketHint}
              </p>
            </Field>
          </MediaRow>

          <MediaRow>
            <MediaPreview src={tile.video ?? ""} kind="video" />
            <Field>
              <Label htmlFor={`video_${tile.id}`}>{dict.admin.homeTileVideo}</Label>
              <Input
                id={`video_${tile.id}`}
                value={(tile.video ?? "").startsWith("blob:") ? "" : (tile.video ?? "")}
                placeholder={(tile.video ?? "").startsWith("blob:") ? dict.admin.homeMediaPendingUpload : undefined}
                onChange={(e) => onChange({ ...tile, video: e.target.value })}
              />
              <Input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                style={{ marginTop: 8 }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file || isVideoTooLarge(file.size)) return;
                  registerSitePendingFile(siteTileVideoPendingKey(tile.id), file, "video");
                  onChange({ ...tile, video: URL.createObjectURL(file) });
                  e.target.value = "";
                }}
              />
            </Field>
          </MediaRow>
        </>
      )}
        </div>
      </TileBody>
    </div>
  );
}

export function SiteContentForm({
  locale,
  dict,
  action,
  initial,
  categories,
  products,
  featured,
  groups,
}: Props) {
  const [page, setPage] = useState<HomePageContent>(() => ({
    ...initial,
    hero: initial.hero.map(ensureTileLibrary),
  }));
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [payloadError, setPayloadError] = useState("");
  const [saving, setSaving] = useState(false);
  const payload = useMemo(() => JSON.stringify(page), [page]);

  async function submitContent(formData: FormData) {
    setPayloadError("");
    setSaving(true);
    try {
      const resolved = await resolveHomePageMedia(page);
      setPage(resolved);
      formData.set("home_page", JSON.stringify(resolved));
      const fileKeys = new Set<string>();
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) fileKeys.add(key);
      }
      for (const key of fileKeys) formData.delete(key);
      await action(formData);
    } catch (error) {
      if (isRedirectError(error)) throw error;
      console.error("[SiteContentForm:submit]", error);
      setPayloadError(dict.admin.mediaUploadError);
    } finally {
      setSaving(false);
    }
  }

  function shownName(text: BiText, fallback: string) {
    const value = (locale === "en" ? text.en : text.ru).trim();
    return value || fallback;
  }

  const sections: Array<{ id: SectionId; label: string }> = [
    { id: "texts", label: dict.admin.homeTexts },
    { id: "marquee", label: dict.admin.homeMarquee },
    { id: "hero", label: dict.admin.homeHeroSection },
    { id: "popular", label: shownName(page.texts.popularCategories, dict.admin.homePopularSection) },
    { id: "catalog", label: shownName(page.texts.catalog, dict.nav.catalog) },
    { id: "best", label: shownName(page.texts.best, dict.admin.homeBestSection) },
    { id: "newin", label: shownName(page.texts.newIn, dict.home.newIn) },
    { id: "recent", label: shownName(page.texts.recentlyViewed, dict.home.recentlyViewed) },
    { id: "newsletter", label: shownName(page.texts.newsletterTitle, dict.admin.homeNewsletter) },
  ];

  function setTexts<K extends keyof HomePageTexts>(key: K, value: BiText) {
    setPage((prev) => ({ ...prev, texts: { ...prev.texts, [key]: value } }));
  }

  function setTiles(key: "hero" | "categories" | "looks", tiles: HomeMediaTile[]) {
    setPage((prev) => ({ ...prev, [key]: tiles }));
  }

  function jumpTo(id: SectionId) {
    document.getElementById(`content-section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <form action={submitContent} style={{ display: "grid", gap: 28, width: "100%" }} aria-busy={saving}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="home_page" value={payload} />
        {payloadError ? (
          <p
            role="alert"
            style={{
              margin: 0,
              padding: "12px 14px",
              border: "1px solid #fecaca",
              background: "#fef2f2",
              color: "#b42318",
            }}
          >
            {payloadError}
          </p>
        ) : null}
        {saving ? (
          <p role="status" style={{ margin: 0, color: "var(--page-text-muted)" }}>
            {dict.admin.formUploading}
          </p>
        ) : null}
        <datalist id="home-product-categories">
          {STORE_CATEGORIES.map((item) => (
            <option key={item.key} value={item.key}>
              {locale === "en" ? item.en : item.ru}
            </option>
          ))}
          {categories
            .filter((item) => !STORE_CATEGORIES.some((row) => row.key === item || row.ru === item))
            .map((item) => (
              <option key={item} value={item} />
            ))}
        </datalist>

        <nav
          aria-label={dict.admin.contentSectionsNav}
          style={{
            position: "sticky",
            top: "calc(var(--header-h, 72px) + 8px)",
            zIndex: 5,
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            padding: 8,
            background: "color-mix(in srgb, var(--page-bg, #fff) 92%, transparent)",
            border: "1px solid var(--page-border, #d6d1c8)",
            backdropFilter: "blur(10px)",
          }}
        >
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => jumpTo(section.id)}
              style={{
                border: "1px solid var(--page-border, #d6d1c8)",
                background: "transparent",
                color: "inherit",
                padding: "8px 10px",
                fontSize: "0.64rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {section.label}
            </button>
          ))}
          <AdminButton type="button" $variant="ghost" onClick={() => setPreviewOpen(true)} style={{ marginLeft: "auto" }}>
            {dict.admin.openPreview}
          </AdminButton>
        </nav>

        <section id="content-section-texts" style={{ scrollMarginTop: 120 }}>
          <h3 style={{ margin: "0 0 8px" }}>{dict.admin.homeTexts}</h3>
          <p style={{ margin: "0 0 12px", color: "var(--page-text-muted)" }}>{dict.admin.homeTextsHint}</p>
          <BiFields
            id="viewall"
            label={dict.home.viewAll}
            value={page.texts.viewAll}
            onChange={(value) => setTexts("viewAll", value)}
          />
        </section>

        <section id="content-section-marquee" style={{ scrollMarginTop: 120 }}>
          <h3 style={{ margin: "0 0 12px" }}>{dict.admin.homeMarquee}</h3>
          <p style={{ margin: "0 0 12px", color: "var(--page-text-muted)" }}>{dict.admin.homeMarqueeHint}</p>
          <BiFields
            id="marquee"
            label={dict.admin.homeMarquee}
            value={page.marquee}
            onChange={(value) => setPage((prev) => ({ ...prev, marquee: value }))}
            multiline
          />
        </section>

        <section id="content-section-newsletter" style={{ scrollMarginTop: 120 }}>
          <h3 style={{ margin: "0 0 8px" }}>
            {shownName(page.texts.newsletterTitle, dict.admin.homeNewsletter)}
          </h3>
          <div style={{ display: "grid", gap: 12 }}>
            <BiFields
              id="news_title"
              label={dict.admin.homeSectionName}
              value={page.texts.newsletterTitle}
              onChange={(value) => setTexts("newsletterTitle", value)}
              multiline
            />
            <BiFields
              id="news_cta"
              label={dict.home.newsletterCta}
              value={page.texts.newsletterCta}
              onChange={(value) => setTexts("newsletterCta", value)}
            />
          </div>
        </section>

        <section id="content-section-hero" style={{ scrollMarginTop: 120 }}>
          <h3 style={{ margin: "0 0 8px" }}>{dict.admin.homeHeroSection}</h3>
          <p style={{ margin: "0 0 12px", color: "var(--page-text-muted)" }}>{dict.admin.homeHeroHint}</p>
          <p style={{ margin: "0 0 8px", fontSize: "0.78rem" }}>{dict.admin.homeHeroLayout}</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {HERO_LAYOUTS.map((layout) => {
              const active = (page.heroLayout || "current") === layout;
              const label =
                layout === "grid"
                  ? dict.admin.homeHeroLayoutGrid
                  : layout === "carousel"
                    ? dict.admin.homeHeroLayoutCarousel
                    : layout === "strip"
                      ? dict.admin.homeHeroLayoutStrip
                      : dict.admin.homeHeroLayoutCurrent;
              return (
                <button
                  key={layout}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setPage((prev) => ({ ...prev, heroLayout: layout }))}
                  style={{
                    display: "grid",
                    gap: 8,
                    padding: 10,
                    textAlign: "left",
                    cursor: "pointer",
                    color: "inherit",
                    border: active ? "2px solid var(--page-text, #111)" : "1px solid var(--page-border, #d6d1c8)",
                    background: active ? "color-mix(in srgb, var(--page-text, #111) 6%, transparent)" : "transparent",
                  }}
                >
                  <span style={{ display: "block", height: 72, color: "var(--page-text, #111)" }}>
                    <HeroSchematic layout={layout} />
                  </span>
                  <span style={{ fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: "0.78rem" }}>{dict.admin.homeHeroCount}</span>
            {([1, 2, 3] as const).map((count) => (
              <button
                key={count}
                type="button"
                aria-pressed={(page.heroCount ?? 3) === count}
                onClick={() =>
                  setPage((prev) => {
                    const next = withHeroCount(prev.hero, count);
                    return { ...prev, hero: next.hero, heroCount: next.heroCount };
                  })
                }
                style={{
                  minWidth: 42,
                  border: "1px solid var(--page-text, #111)",
                  background: (page.heroCount ?? 3) === count ? "var(--page-text, #111)" : "transparent",
                  color: (page.heroCount ?? 3) === count ? "var(--page-bg, #fff)" : "inherit",
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                {count}
              </button>
            ))}
          </div>
          <p style={{ margin: "0 0 14px", color: "var(--page-text-muted)" }}>{dict.admin.homeHeroCountHint}</p>
          <div style={{ display: "grid", gap: 14 }}>
            {page.hero.map((tile, index) => (
              <div key={tile.id} style={{ display: "grid", gap: 8 }}>
                {index >= (page.heroCount ?? page.hero.length) ? (
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--page-text-muted)" }}>{dict.admin.homeHeroKept}</p>
                ) : null}
              <TileEditor
                key={tile.id}
                tile={tile}
                dict={dict}
                categories={categories}
                index={index}
                total={page.hero.length}
                library
                canRemove={page.hero.length > 1}
                onRemove={() => setTiles("hero", page.hero.filter((item) => item.id !== tile.id))}
                onMove={(dir) => setTiles("hero", moveItem(page.hero, index, dir))}
                onChange={(next) =>
                  setTiles(
                    "hero",
                    page.hero.map((item) => (item.id === next.id ? next : item)),
                  )
                }
              />
              </div>
            ))}
          </div>
        </section>

        <section id="content-section-popular" style={{ scrollMarginTop: 120 }}>
          <h3 style={{ margin: "0 0 8px" }}>
            {shownName(page.texts.popularCategories, dict.admin.homePopularSection)}
          </h3>
          <p style={{ margin: "0 0 12px", color: "var(--page-text-muted)" }}>{dict.admin.homeTilesHint}</p>
          <div style={{ marginBottom: 16 }}>
            <BiFields
              id="popular_section"
              label={dict.admin.homeSectionName}
              value={page.texts.popularCategories}
              onChange={(value) => setTexts("popularCategories", value)}
            />
          </div>
          <p style={{ margin: "0 0 8px", fontSize: "0.78rem" }}>{dict.admin.homeCategoryLayout}</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {CATEGORY_LAYOUTS.map((layout) => {
              const active = (page.categoryLayout || "row") === layout;
              const label =
                layout === "mosaic"
                  ? dict.admin.homeCategoryMosaic
                  : layout === "columns"
                    ? dict.admin.homeCategoryColumns
                    : layout === "cards"
                      ? dict.admin.homeCategoryCards
                      : dict.admin.homeCategoryRow;
              return (
                <button
                  key={layout}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setPage((prev) => ({ ...prev, categoryLayout: layout }))}
                  style={{
                    display: "grid",
                    gap: 8,
                    padding: 10,
                    textAlign: "left",
                    cursor: "pointer",
                    color: "inherit",
                    border: active ? "2px solid var(--page-text, #111)" : "1px solid var(--page-border, #d6d1c8)",
                    background: active ? "color-mix(in srgb, var(--page-text, #111) 6%, transparent)" : "transparent",
                  }}
                >
                  <CategorySchematic layout={layout} />
                  <span style={{ fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            {page.categories.map((tile, index) => (
              <TileEditor
                key={tile.id}
                tile={tile}
                dict={dict}
                categories={categories}
                index={index}
                total={page.categories.length}
                canRemove
                onRemove={() => setTiles("categories", page.categories.filter((item) => item.id !== tile.id))}
                onMove={(dir) => setTiles("categories", moveItem(page.categories, index, dir))}
                onChange={(next) =>
                  setTiles(
                    "categories",
                    page.categories.map((item) => (item.id === next.id ? next : item)),
                  )
                }
              />
            ))}
          </div>
          <AdminButton
            type="button"
            $variant="ghost"
            onClick={() => setTiles("categories", [...page.categories, newHomeTile(crypto.randomUUID())])}
            style={{ marginTop: 12 }}
          >
            {dict.admin.homeAddTile}
          </AdminButton>
        </section>

        <section id="content-section-catalog" style={{ scrollMarginTop: 120 }}>
          <h3 style={{ margin: "0 0 8px" }}>{shownName(page.texts.catalog, dict.nav.catalog)}</h3>
          <p style={{ margin: "0 0 12px", color: "var(--page-text-muted)" }}>{dict.admin.homeCatalogHint}</p>
          <BiFields
            id="catalog_section"
            label={dict.admin.homeSectionName}
            value={page.texts.catalog}
            onChange={(value) => setTexts("catalog", value)}
          />
        </section>

        <section id="content-section-best" style={{ scrollMarginTop: 120 }}>
          <h3 style={{ margin: "0 0 8px" }}>{shownName(page.texts.best, dict.admin.homeBestSection)}</h3>
          <p style={{ margin: "0 0 12px", color: "var(--page-text-muted)" }}>{dict.admin.homeTilesHint}</p>
          <div style={{ marginBottom: 16 }}>
            <BiFields
              id="best_section"
              label={dict.admin.homeSectionName}
              value={page.texts.best}
              onChange={(value) => setTexts("best", value)}
            />
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            {page.looks.map((tile, index) => (
              <TileEditor
                key={tile.id}
                tile={tile}
                dict={dict}
                categories={categories}
                index={index}
                total={page.looks.length}
                canRemove
                onRemove={() => setTiles("looks", page.looks.filter((item) => item.id !== tile.id))}
                onMove={(dir) => setTiles("looks", moveItem(page.looks, index, dir))}
                onChange={(next) =>
                  setTiles(
                    "looks",
                    page.looks.map((item) => (item.id === next.id ? next : item)),
                  )
                }
              />
            ))}
          </div>
          <AdminButton
            type="button"
            $variant="ghost"
            onClick={() => setTiles("looks", [...page.looks, newHomeTile(crypto.randomUUID())])}
            style={{ marginTop: 12 }}
          >
            {dict.admin.homeAddTile}
          </AdminButton>
        </section>

        <section id="content-section-newin" style={{ scrollMarginTop: 120 }}>
          <h3 style={{ margin: "0 0 8px" }}>{shownName(page.texts.newIn, dict.home.newIn)}</h3>
          <p style={{ margin: "0 0 12px", color: "var(--page-text-muted)" }}>{dict.admin.homeNewInHint}</p>
          <BiFields
            id="newin_section"
            label={dict.admin.homeSectionName}
            value={page.texts.newIn}
            onChange={(value) => setTexts("newIn", value)}
          />
        </section>

        <section id="content-section-recent" style={{ scrollMarginTop: 120 }}>
          <h3 style={{ margin: "0 0 8px" }}>
            {shownName(page.texts.recentlyViewed, dict.home.recentlyViewed)}
          </h3>
          <BiFields
            id="recent_section"
            label={dict.admin.homeSectionName}
            value={page.texts.recentlyViewed}
            onChange={(value) => setTexts("recentlyViewed", value)}
          />
        </section>

        <div
          style={{
            position: "sticky",
            bottom: 12,
            zIndex: 4,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            padding: 12,
            border: "1px solid var(--page-border, #d6d1c8)",
            background: "color-mix(in srgb, var(--page-bg, #fff) 94%, transparent)",
            backdropFilter: "blur(10px)",
          }}
        >
          <SaveButton label={dict.admin.save} pendingLabel={dict.admin.saving} />
          <AdminButton type="button" $variant="ghost" onClick={() => setPreviewOpen(true)}>
            {dict.admin.openPreview}
          </AdminButton>
        </div>
      </form>

      <HomePagePreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        locale={locale}
        dict={dict}
        content={page}
        products={products}
        featured={featured}
        groups={groups}
        mode={previewMode}
        onModeChange={setPreviewMode}
        labels={{
          title: dict.admin.previewTitle,
          close: dict.admin.closePreview,
          mobile: dict.admin.mobilePreview,
          desktop: dict.admin.desktopPreview,
          draftHint: dict.admin.homePreviewDraftHint,
        }}
      />
    </>
  );
}
