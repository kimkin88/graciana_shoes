"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useFormStatus } from "react-dom";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import type { ProductRow } from "@/types";
import { AdminButton } from "@/components/admin/AdminButtons";
import { HomePagePreview } from "@/components/admin/HomePagePreview";
import { Field, Input, Label, TextArea } from "@/components/ui/Input";
import { STORE_CATEGORIES } from "@/lib/catalog/categories";
import {
  newHomeTile,
  type BiText,
  type HomeMediaTile,
  type HomePageContent,
  type HomePageTexts,
} from "@/lib/home/content";

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

type SectionId = "texts" | "marquee" | "newsletter" | "hero" | "popular" | "best";

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
    <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
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
    </div>
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

const previewBox: CSSProperties = {
  width: 132,
  height: 132,
  objectFit: "contain",
  background: "color-mix(in srgb, var(--page-text-muted, #999) 12%, transparent)",
  border: "1px solid var(--page-border, #d6d1c8)",
  display: "block",
};

function MediaPreview({ src, kind }: { src: string; kind: "image" | "video" }) {
  if (!src) return null;
  if (kind === "video") {
    return <video src={src} muted playsInline controls style={previewBox} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" style={previewBox} />;
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
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
        <strong style={{ fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {index + 1} / {total}
        </strong>
        <div style={{ display: "flex", gap: 8 }}>
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
      </div>

      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
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
      </div>

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

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "auto 1fr", alignItems: "start" }}>
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
            name={`image_${tile.id}`}
            type="file"
            accept="image/*"
            style={{ marginTop: 8 }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange({ ...tile, src: URL.createObjectURL(file) });
            }}
          />
          <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: "var(--page-text-muted)" }}>
            {dict.admin.homeMediaBucketHint}
          </p>
        </Field>
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "auto 1fr", alignItems: "start" }}>
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
            name={`video_${tile.id}`}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            style={{ marginTop: 8 }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange({ ...tile, video: URL.createObjectURL(file) });
            }}
          />
        </Field>
      </div>
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
  const [page, setPage] = useState<HomePageContent>(initial);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const payload = useMemo(() => JSON.stringify(page), [page]);

  const sections: Array<{ id: SectionId; label: string }> = [
    { id: "texts", label: dict.admin.homeTexts },
    { id: "marquee", label: dict.admin.homeMarquee },
    { id: "newsletter", label: dict.admin.homeNewsletter },
    { id: "hero", label: dict.admin.homeHeroSection },
    { id: "popular", label: dict.admin.homePopularSection },
    { id: "best", label: dict.admin.homeBestSection },
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
      <form action={action} style={{ display: "grid", gap: 22 }}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="home_page" value={payload} />
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
          <h3 style={{ margin: "0 0 12px" }}>{dict.admin.homeTexts}</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <BiFields
              id="popular"
              label={dict.home.popularCategories}
              value={page.texts.popularCategories}
              onChange={(value) => setTexts("popularCategories", value)}
            />
            <BiFields
              id="catalog"
              label={dict.nav.catalog}
              value={page.texts.catalog}
              onChange={(value) => setTexts("catalog", value)}
            />
            <BiFields
              id="best"
              label={dict.home.best}
              value={page.texts.best}
              onChange={(value) => setTexts("best", value)}
            />
            <BiFields
              id="newin"
              label={dict.home.newIn}
              value={page.texts.newIn}
              onChange={(value) => setTexts("newIn", value)}
            />
            <BiFields
              id="viewall"
              label={dict.home.viewAll}
              value={page.texts.viewAll}
              onChange={(value) => setTexts("viewAll", value)}
            />
            <BiFields
              id="recent"
              label={dict.home.recentlyViewed}
              value={page.texts.recentlyViewed}
              onChange={(value) => setTexts("recentlyViewed", value)}
            />
          </div>
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
          <h3 style={{ margin: "0 0 12px" }}>{dict.admin.homeNewsletter}</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <BiFields
              id="news_title"
              label={dict.home.newsletterTitle}
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
          <div style={{ display: "grid", gap: 14 }}>
            {page.hero.map((tile, index) => (
              <TileEditor
                key={tile.id}
                tile={tile}
                dict={dict}
                categories={categories}
                index={index}
                total={page.hero.length}
                canRemove={false}
                onMove={(dir) => setTiles("hero", moveItem(page.hero, index, dir))}
                onChange={(next) =>
                  setTiles(
                    "hero",
                    page.hero.map((item) => (item.id === next.id ? next : item)),
                  )
                }
              />
            ))}
          </div>
        </section>

        <section id="content-section-popular" style={{ scrollMarginTop: 120 }}>
          <h3 style={{ margin: "0 0 8px" }}>{dict.admin.homePopularSection}</h3>
          <p style={{ margin: "0 0 12px", color: "var(--page-text-muted)" }}>{dict.admin.homeTilesHint}</p>
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

        <section id="content-section-best" style={{ scrollMarginTop: 120 }}>
          <h3 style={{ margin: "0 0 8px" }}>{dict.admin.homeBestSection}</h3>
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
