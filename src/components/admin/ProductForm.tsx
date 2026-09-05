"use client";

import { createProduct, updateProduct } from "@/app/actions/admin-products";
import { DownloadIcon, FilePlusIcon, VideoIcon } from "@radix-ui/react-icons";
import { useMemo, useRef, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import ReactPlayer from "react-player";
import styled from "styled-components";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import type { ProductRow } from "@/types";
import { AdminButton } from "@/components/admin/AdminButtons";
import { ProductPreview } from "@/components/admin/ProductPreview";
import { Field, Input, Label, TextArea } from "@/components/ui/Input";
import { productCardImage, productOriginalImage } from "@/lib/products/media";
import { STORE_CATEGORIES } from "@/lib/catalog/categories";
import { ADMIN_CURRENCIES } from "@/lib/money/fx";
import { centsFromMajor, majorFromCents, parseGallery } from "@/lib/products/commerce";
import { buildProductPrefill } from "@/lib/products/prefill";
import { slugify } from "@/lib/products/slugify";
import { httpClient } from "@/lib/http/client";

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  locale: Locale;
  dict: Messages;
  product?: ProductRow;
  knownTags?: string[];
  knownGroups?: string[];
};

const Layout = styled.div`
  display: grid;
  gap: 24px;
  @media (min-width: 1100px) {
    grid-template-columns: minmax(0, 1fr) 320px;
    align-items: start;
  }
`;

const Section = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 16px;
  margin-bottom: 16px;
  background: ${({ theme }) => theme.colors.surface};
`;

const SectionTitle = styled.h3`
  margin: 0 0 14px;
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

const Hint = styled.p`
  margin: 0 0 12px;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.45;
`;

const Row = styled.div`
  display: grid;
  gap: 12px;
  @media (min-width: 720px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  position: sticky;
  bottom: 0;
  z-index: 3;
  padding: 12px 0;
  background: linear-gradient(to top, ${({ theme }) => theme.colors.background} 70%, transparent);
  @media (min-width: 1100px) {
    position: static;
    background: none;
    padding: 0;
  }
`;

/** Shared bilingual admin form — posts to the matching server action. */
export function ProductForm({ mode, locale, dict, product, knownTags = [], knownGroups = [] }: Props) {
  const action = mode === "create" ? createProduct : updateProduct;
  const initialImage = product ? productCardImage(product) ?? "" : "";
  const originalImage = product ? productOriginalImage(product) ?? "" : "";
  const initialVideo = product?.video_url ?? "";
  const initialGallery = parseGallery(product?.gallery);

  const [nameRu, setNameRu] = useState(product?.name_ru ?? "");
  const [nameEn, setNameEn] = useState(product?.name_en ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product?.slug));
  const [shortRu, setShortRu] = useState(product?.short_description_ru ?? "");
  const [shortEn, setShortEn] = useState(product?.short_description_en ?? "");
  const [descRu, setDescRu] = useState(product?.description_ru ?? "");
  const [descEn, setDescEn] = useState(product?.description_en ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [manufacturer, setManufacturer] = useState(product?.manufacturer ?? "");
  const [model, setModel] = useState(product?.model ?? "");
  const [sourceUrl, setSourceUrl] = useState(product?.source_url ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [groupKey, setGroupKey] = useState(product?.group_key ?? "");
  const [tags, setTags] = useState((product?.tags ?? []).join(", "));
  const [priceMajor, setPriceMajor] = useState(majorFromCents(product?.price_cents ?? 0));
  const [compareMajor, setCompareMajor] = useState(majorFromCents(product?.compare_at_cents));
  const [currency, setCurrency] = useState((product?.currency ?? "byn").toUpperCase());
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [colors, setColors] = useState((product?.colors ?? []).join(", "));
  const [sizes, setSizes] = useState((product?.sizes ?? []).join(", "));
  const [specs, setSpecs] = useState(
    Object.entries(product?.specs ?? {})
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n"),
  );
  const [seoTitleRu, setSeoTitleRu] = useState(product?.seo_title_ru ?? "");
  const [seoTitleEn, setSeoTitleEn] = useState(product?.seo_title_en ?? "");
  const [seoDescRu, setSeoDescRu] = useState(product?.seo_description_ru ?? "");
  const [seoDescEn, setSeoDescEn] = useState(product?.seo_description_en ?? "");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [imagePreview, setImagePreview] = useState(initialImage);
  const [videoUrl, setVideoUrl] = useState(product?.video_url ?? "");
  const [videoPreview, setVideoPreview] = useState(initialVideo);
  const [galleryPreviews, setGalleryPreviews] = useState(
    initialGallery.map((g) => ({
      id: `${g.kind ?? "image"}-${g.url}`,
      kind: (g.kind ?? "image") as "image" | "video",
      url: g.url,
      path: g.path ?? null,
    })),
  );
  const [featured, setFeatured] = useState(Boolean(product?.featured));
  const [active, setActive] = useState(product?.active ?? true);
  const [previewMode, setPreviewMode] = useState<"card" | "page">("card");
  const [prefillNote, setPrefillNote] = useState("");
  const [mediaHint, setMediaHint] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const galleryVideosRef = useRef<HTMLInputElement | null>(null);
  const pendingGalleryImages = useRef<File[]>([]);
  const pendingGalleryVideos = useRef<File[]>([]);

  const galleryJson = useMemo(
    () =>
      JSON.stringify(
        galleryPreviews
          .filter((item) => !item.url.startsWith("blob:") && !item.url.startsWith("data:"))
          .map((item) => ({ url: item.url, path: item.path, kind: item.kind })),
      ),
    [galleryPreviews],
  );

  const priceCents = useMemo(() => centsFromMajor(priceMajor || "0"), [priceMajor]);
  const compareCents = useMemo(
    () => (compareMajor.trim() ? centsFromMajor(compareMajor) : null),
    [compareMajor],
  );
  const discount =
    compareCents != null && compareCents > priceCents && priceCents >= 0
      ? Math.round((1 - priceCents / compareCents) * 100)
      : null;

  function syncFileInput(input: HTMLInputElement | null, files: File[]) {
    if (!input) return;
    const dt = new DataTransfer();
    files.forEach((file) => dt.items.add(file));
    input.files = dt.files;
  }

  function setFileToInput(file: File, input: HTMLInputElement | null) {
    syncFileInput(input, [file]);
  }

  function onImageFileChange(file: File | null) {
    if (!file) {
      setImagePreview(initialImage);
      return;
    }
    setFileToInput(file, imageInputRef.current);
    setImagePreview(URL.createObjectURL(file));
  }

  function onVideoFileChange(file: File | null) {
    if (!file) {
      setVideoPreview(initialVideo);
      return;
    }
    setFileToInput(file, videoInputRef.current);
    setVideoPreview(URL.createObjectURL(file));
    setVideoUrl("");
  }

  function onGalleryImages(files: FileList | File[] | null) {
    if (!files) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    pendingGalleryImages.current = [...pendingGalleryImages.current, ...list].slice(0, 16);
    syncFileInput(galleryInputRef.current, pendingGalleryImages.current);
    setGalleryPreviews((prev) => [
      ...prev,
      ...list.map((file) => ({
        id: `pending-image-${file.name}-${file.size}-${file.lastModified}`,
        kind: "image" as const,
        url: URL.createObjectURL(file),
        path: null,
      })),
    ]);
  }

  function onGalleryVideos(files: FileList | File[] | null) {
    if (!files) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(f.name));
    if (!list.length) return;
    pendingGalleryVideos.current = [...pendingGalleryVideos.current, ...list].slice(0, 8);
    syncFileInput(galleryVideosRef.current, pendingGalleryVideos.current);
    setGalleryPreviews((prev) => [
      ...prev,
      ...list.map((file) => ({
        id: `pending-video-${file.name}-${file.size}-${file.lastModified}`,
        kind: "video" as const,
        url: URL.createObjectURL(file),
        path: null,
      })),
    ]);
  }

  function removeGalleryItem(id: string) {
    setGalleryPreviews((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.url.startsWith("blob:")) {
        if (target.kind === "image") {
          pendingGalleryImages.current = pendingGalleryImages.current.filter((file) => {
            const key = `pending-image-${file.name}-${file.size}-${file.lastModified}`;
            return key !== id;
          });
          syncFileInput(galleryInputRef.current, pendingGalleryImages.current);
        } else {
          pendingGalleryVideos.current = pendingGalleryVideos.current.filter((file) => {
            const key = `pending-video-${file.name}-${file.size}-${file.lastModified}`;
            return key !== id;
          });
          syncFileInput(galleryVideosRef.current, pendingGalleryVideos.current);
        }
      }
      return prev.filter((item) => item.id !== id);
    });
  }

  function clearGallery() {
    pendingGalleryImages.current = [];
    pendingGalleryVideos.current = [];
    syncFileInput(galleryInputRef.current, []);
    syncFileInput(galleryVideosRef.current, []);
    setGalleryPreviews([]);
  }

  async function validateMediaUrl(url: string, label: string) {
    if (!url.trim()) return;
    try {
      const res = await httpClient.head(url);
      setMediaHint(`${label}: ${res.status}`);
    } catch {
      setMediaHint(`${label}: unavailable`);
    }
  }

  function runPrefill() {
    const draft = buildProductPrefill({
      nameRu,
      nameEn,
      manufacturer,
      model,
      sku,
      sourceUrl,
      notes,
      locale,
    });
    setNameRu(draft.name_ru);
    setNameEn(draft.name_en);
    if (!slugTouched) setSlug(draft.slug);
    setShortRu(draft.short_description_ru);
    setShortEn(draft.short_description_en);
    setDescRu(draft.description_ru);
    setDescEn(draft.description_en);
    setCategory(draft.category);
    setGroupKey(draft.group_key);
    setTags(draft.tags);
    setColors(draft.colors);
    setSizes(draft.sizes);
    setSpecs(draft.specs);
    setSeoTitleRu(draft.seo_title_ru);
    setSeoTitleEn(draft.seo_title_en);
    setSeoDescRu(draft.seo_description_ru);
    setSeoDescEn(draft.seo_description_en);
    setManufacturer(draft.manufacturer);
    setModel(draft.model);
    setSku(draft.sku);
    setSourceUrl(draft.source_url);
    setPrefillNote(dict.admin.prefillDone);
  }

  const previewDraft = {
    name_ru: nameRu,
    name_en: nameEn,
    slug,
    category,
    price_cents: Number.isFinite(priceCents) ? priceCents : 0,
    compare_at_cents: compareCents != null && !Number.isNaN(compareCents) ? compareCents : null,
    currency: currency.toLowerCase(),
    stock: Number.parseInt(stock, 10) || 0,
    active,
    featured,
    image_url: imagePreview || imageUrl || null,
    short_description_ru: shortRu,
    short_description_en: shortEn,
    description_ru: descRu,
    description_en: descEn,
    tags: tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    colors: colors
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    sizes: sizes
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    sku,
    gallery: galleryPreviews.filter((item) => item.kind === "image").map((item) => item.url),
  };

  return (
    <Layout>
      <form
        action={action}
        onSubmit={() => {
          setPending(true);
          syncFileInput(galleryInputRef.current, pendingGalleryImages.current);
          syncFileInput(galleryVideosRef.current, pendingGalleryVideos.current);
        }}
      >
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="gallery_json" value={galleryJson} />
        {mode === "edit" && product ? <input type="hidden" name="id" value={product.id} /> : null}

        <Section>
          <SectionTitle>{dict.admin.sectionPrefill}</SectionTitle>
          <Hint>{dict.admin.prefillHint}</Hint>
          <Row>
            <Field>
              <Label htmlFor="prefill_manufacturer">{dict.admin.manufacturer}</Label>
              <Input
                id="prefill_manufacturer"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="prefill_model">{dict.admin.model}</Label>
              <Input id="prefill_model" value={model} onChange={(e) => setModel(e.target.value)} />
            </Field>
          </Row>
            <Field>
              <Label htmlFor="prefill_notes">{dict.admin.prefillNotes}</Label>
              <TextArea id="prefill_notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
          <AdminButton type="button" $variant="ghost" onClick={runPrefill}>
            {dict.admin.prefillButton}
          </AdminButton>
          {prefillNote ? <Hint style={{ marginTop: 12, marginBottom: 0 }}>{prefillNote}</Hint> : null}
        </Section>

        <Section>
          <SectionTitle>{dict.admin.sectionBasic}</SectionTitle>
          <Row>
            <Field>
              <Label htmlFor="name_ru">
                {dict.admin.nameRu} <span>*</span>
              </Label>
              <Input
                id="name_ru"
                name="name_ru"
                required
                value={nameRu}
                onChange={(e) => {
                  setNameRu(e.target.value);
                  if (!slugTouched) {
                    setSlug(slugify(e.target.value, product?.id ?? "product"));
                  }
                }}
              />
            </Field>
            <Field>
              <Label htmlFor="name_en">
                {dict.admin.nameEn} <span>*</span>
              </Label>
              <Input id="name_en" name="name_en" required value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
            </Field>
          </Row>
          <Field>
            <Label htmlFor="slug">
              {dict.admin.slug} <span>*</span>
            </Label>
            <Input
              id="slug"
              name="slug"
              required
              value={slug}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
            <Hint style={{ marginTop: 6, marginBottom: 0 }}>{dict.admin.slugHint}</Hint>
          </Field>
          <Row>
            <Field>
              <Label htmlFor="sku">{dict.admin.sku}</Label>
              <Input id="sku" name="sku" value={sku} onChange={(e) => setSku(e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="source_url">{dict.admin.sourceUrl}</Label>
              <Input
                id="source_url"
                name="source_url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
            </Field>
          </Row>
          <input type="hidden" name="manufacturer" value={manufacturer} />
          <input type="hidden" name="model" value={model} />
          <Row>
            <Field>
              <Label htmlFor="short_description_ru">{dict.admin.shortDescRu}</Label>
              <TextArea
                id="short_description_ru"
                name="short_description_ru"
                value={shortRu}
                onChange={(e) => setShortRu(e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="short_description_en">{dict.admin.shortDescEn}</Label>
              <TextArea
                id="short_description_en"
                name="short_description_en"
                value={shortEn}
                onChange={(e) => setShortEn(e.target.value)}
              />
            </Field>
          </Row>
          <Row>
            <Field>
              <Label htmlFor="description_ru">{dict.admin.descRu}</Label>
              <TextArea
                id="description_ru"
                name="description_ru"
                value={descRu}
                onChange={(e) => setDescRu(e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="description_en">{dict.admin.descEn}</Label>
              <TextArea
                id="description_en"
                name="description_en"
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
              />
            </Field>
          </Row>
        </Section>

        <Section>
          <SectionTitle>{dict.admin.sectionOrg}</SectionTitle>
          <Row>
            <Field>
              <Label htmlFor="category">{dict.admin.category}</Label>
              <Input
                id="category"
                name="category"
                list="admin-categories"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <datalist id="admin-categories">
                {STORE_CATEGORIES.map((item) => (
                  <option key={item.key} value={item.key}>
                    {locale === "en" ? item.en : item.ru}
                  </option>
                ))}
              </datalist>
              <Hint style={{ marginTop: 6, marginBottom: 0 }}>{dict.admin.categoryHint}</Hint>
            </Field>
            <Field>
              <Label htmlFor="group_key">{dict.admin.groupKey}</Label>
              <Input
                id="group_key"
                name="group_key"
                list="admin-groups"
                value={groupKey}
                onChange={(e) => setGroupKey(e.target.value)}
                placeholder={dict.admin.groupKeyHint}
              />
              <datalist id="admin-groups">
                {knownGroups.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </Field>
          </Row>
          <Field>
            <Label htmlFor="tags">{dict.admin.tags}</Label>
            <Input
              id="tags"
              name="tags"
              list="admin-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={dict.admin.tagsHint}
            />
            <datalist id="admin-tags">
              {knownTags.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </Field>
        </Section>

        <Section>
          <SectionTitle>{dict.admin.sectionPricing}</SectionTitle>
          <Row>
            <Field>
              <Label htmlFor="price_major">
                {dict.admin.price} <span>*</span>
              </Label>
              <Input
                id="price_major"
                name="price_major"
                required
                inputMode="decimal"
                value={priceMajor}
                onChange={(e) => setPriceMajor(e.target.value)}
              />
              <Hint style={{ marginTop: 6, marginBottom: 0 }}>{dict.admin.priceMajorHint}</Hint>
            </Field>
            <Field>
              <Label htmlFor="compare_at_major">{dict.admin.compareAtPrice}</Label>
              <Input
                id="compare_at_major"
                name="compare_at_major"
                inputMode="decimal"
                value={compareMajor}
                onChange={(e) => setCompareMajor(e.target.value)}
              />
              {discount != null ? (
                <Hint style={{ marginTop: 6, marginBottom: 0 }}>
                  {dict.admin.discountPreview}: −{discount}%
                </Hint>
              ) : null}
            </Field>
          </Row>
          <Field>
            <Label htmlFor="currency">{dict.admin.currency}</Label>
            <Input
              id="currency"
              name="currency"
              value={currency}
              list="admin-currencies"
              onChange={(e) => setCurrency(e.target.value)}
            />
            <datalist id="admin-currencies">
              {ADMIN_CURRENCIES.map((code) => (
                <option key={code} value={code} />
              ))}
            </datalist>
            <Hint style={{ marginTop: 6, marginBottom: 0 }}>{dict.admin.currencyHint}</Hint>
          </Field>
        </Section>

        <Section>
          <SectionTitle>{dict.admin.sectionInventory}</SectionTitle>
          <Row>
            <Field>
              <Label htmlFor="stock">{dict.admin.stock}</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="colors">{dict.admin.colors}</Label>
              <Input
                id="colors"
                name="colors"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                placeholder={dict.admin.multiValueHint}
              />
            </Field>
          </Row>
          <Field>
            <Label htmlFor="sizes">{dict.admin.sizes}</Label>
            <Input
              id="sizes"
              name="sizes"
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              placeholder={dict.admin.multiValueHint}
            />
          </Field>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" name="featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              {dict.admin.featured}
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" name="active" checked={active} onChange={(e) => setActive(e.target.checked)} />
              {dict.admin.active}
            </label>
          </div>
        </Section>

        <Section>
          <SectionTitle>{dict.admin.sectionMedia}</SectionTitle>
          <Hint>{dict.admin.mediaSaveHint}</Hint>
          <Field>
            <Label htmlFor="image_url">{dict.admin.imageUrl}</Label>
            <Input
              id="image_url"
              name="image_url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImagePreview(e.target.value);
              }}
              onBlur={(e) => validateMediaUrl(e.target.value, dict.admin.imageUrl)}
            />
          </Field>
          <Field>
            <Label htmlFor="image_file">{dict.admin.imageFile}</Label>
            <FileUploader
              handleChange={(value) => {
                const file = Array.isArray(value) ? value[0] : value;
                onImageFileChange(file ?? null);
              }}
              name="image_drop"
              types={["JPG", "JPEG", "PNG", "WEBP", "GIF"]}
            >
              <div style={{ border: "1px dashed #94a3b8", padding: 14 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <FilePlusIcon />
                  <span>{dict.admin.dropImage}</span>
                </div>
              </div>
            </FileUploader>
            <Input ref={imageInputRef} id="image_file" name="image_file" type="file" accept="image/*" style={{ display: "none" }} />
          </Field>
          {imagePreview ? (
            <div style={{ marginBottom: 16 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt={dict.admin.imagePreview}
                style={{
                  width: "100%",
                  maxWidth: 280,
                  maxHeight: 280,
                  objectFit: "contain",
                  border: "1px solid #cbd5e1",
                  background: "#f4f4f4",
                }}
              />
              <a href={originalImage || imagePreview} download style={{ display: "inline-flex", marginTop: 8, gap: 6 }}>
                <DownloadIcon />
                {dict.admin.downloadImage}
              </a>
            </div>
          ) : null}

          <Field>
            <Label htmlFor="gallery_files">{dict.admin.gallery}</Label>
            <Hint>{dict.admin.galleryHint}</Hint>
            <Input
              ref={galleryInputRef}
              id="gallery_files"
              name="gallery_files"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                onGalleryImages(e.target.files);
                e.target.value = "";
                syncFileInput(galleryInputRef.current, pendingGalleryImages.current);
              }}
            />
          </Field>

          <Field>
            <Label htmlFor="gallery_videos">{dict.admin.galleryVideos}</Label>
            <Hint>{dict.admin.galleryVideosHint}</Hint>
            <Input
              ref={galleryVideosRef}
              id="gallery_videos"
              name="gallery_videos"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              multiple
              onChange={(e) => {
                onGalleryVideos(e.target.files);
                e.target.value = "";
                syncFileInput(galleryVideosRef.current, pendingGalleryVideos.current);
              }}
            />
          </Field>

          {galleryPreviews.length ? (
            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {galleryPreviews.map((item) => (
                  <div key={item.id} style={{ width: 88, display: "grid", gap: 4 }}>
                    {item.kind === "video" ? (
                      <video
                        src={item.url}
                        muted
                        playsInline
                        style={{ width: 88, height: 110, objectFit: "contain", background: "#111" }}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt=""
                        style={{ width: 88, height: 110, objectFit: "contain", background: "#f4f4f4" }}
                      />
                    )}
                    <button type="button" onClick={() => removeGalleryItem(item.id)} style={{ fontSize: 11 }}>
                      {dict.admin.homeRemoveTile}
                    </button>
                    <span style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {item.kind}
                    </span>
                  </div>
                ))}
              </div>
              <button type="button" onClick={clearGallery} style={{ fontSize: 12, width: "fit-content" }}>
                {dict.admin.clearGallery}
              </button>
            </div>
          ) : null}

          <Field>
            <Label htmlFor="video_url">{dict.admin.videoUrl}</Label>
            <Input
              id="video_url"
              name="video_url"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                setVideoPreview(e.target.value);
              }}
              onBlur={(e) => validateMediaUrl(e.target.value, dict.admin.videoUrl)}
            />
          </Field>
          <Field>
            <Label htmlFor="video_file">{dict.admin.videoFile}</Label>
            <FileUploader
              handleChange={(value) => {
                const file = Array.isArray(value) ? value[0] : value;
                onVideoFileChange(file ?? null);
              }}
              name="video_drop"
              types={["MP4", "MOV", "WEBM"]}
            >
              <div style={{ border: "1px dashed #94a3b8", padding: 14 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <VideoIcon />
                  <span>{dict.admin.dropVideo}</span>
                </div>
              </div>
            </FileUploader>
            <Input ref={videoInputRef} id="video_file" name="video_file" type="file" accept="video/*" style={{ display: "none" }} />
          </Field>
          {videoPreview ? (
            <div style={{ marginBottom: 16, maxWidth: 320 }}>
              <ReactPlayer src={videoPreview} controls width="100%" height={200} />
            </div>
          ) : null}
          {mediaHint ? <Hint>{mediaHint}</Hint> : null}
        </Section>

        <Section>
          <SectionTitle>{dict.admin.sectionMore}</SectionTitle>
          <Field>
            <Label htmlFor="specs">{dict.admin.specs}</Label>
            <TextArea id="specs" name="specs" value={specs} onChange={(e) => setSpecs(e.target.value)} />
            <Hint style={{ marginTop: 6, marginBottom: 0 }}>{dict.admin.specsHint}</Hint>
          </Field>
          <Row>
            <Field>
              <Label htmlFor="seo_title_ru">{dict.admin.seoTitleRu}</Label>
              <Input id="seo_title_ru" name="seo_title_ru" value={seoTitleRu} onChange={(e) => setSeoTitleRu(e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="seo_title_en">{dict.admin.seoTitleEn}</Label>
              <Input id="seo_title_en" name="seo_title_en" value={seoTitleEn} onChange={(e) => setSeoTitleEn(e.target.value)} />
            </Field>
          </Row>
          <Row>
            <Field>
              <Label htmlFor="seo_description_ru">{dict.admin.seoDescRu}</Label>
              <TextArea
                id="seo_description_ru"
                name="seo_description_ru"
                value={seoDescRu}
                onChange={(e) => setSeoDescRu(e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="seo_description_en">{dict.admin.seoDescEn}</Label>
              <TextArea
                id="seo_description_en"
                name="seo_description_en"
                value={seoDescEn}
                onChange={(e) => setSeoDescEn(e.target.value)}
              />
            </Field>
          </Row>
        </Section>

        <Actions>
          <AdminButton type="submit" name="intent" value="publish" disabled={pending}>
            {pending ? dict.admin.saving : dict.admin.publish}
          </AdminButton>
          <AdminButton type="submit" name="intent" value="draft" $variant="ghost" disabled={pending}>
            {pending ? dict.admin.saving : dict.admin.saveDraft}
          </AdminButton>
        </Actions>
      </form>

      <div style={{ position: "sticky", top: "calc(var(--header-h) + 16px)" }}>
        <ProductPreview
          locale={locale}
          mode={previewMode}
          onModeChange={setPreviewMode}
          labels={{
            preview: dict.admin.preview,
            card: dict.admin.previewCard,
            page: dict.admin.previewPage,
            outOfStock: dict.products.outOfStock,
            addToCart: dict.products.addToCart,
          }}
          draft={previewDraft}
        />
      </div>
    </Layout>
  );
}
