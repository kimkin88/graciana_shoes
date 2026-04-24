"use client";

import { createProduct, updateProduct } from "@/app/actions/admin-products";
import { DownloadIcon, FilePlusIcon, ImageIcon, VideoIcon } from "@radix-ui/react-icons";
import { useMemo, useRef, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import ReactPlayer from "react-player";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import type { ProductRow } from "@/types";
import { AdminButton } from "@/components/admin/AdminButtons";
import { Field, Input, Label, TextArea } from "@/components/ui/Input";
import { httpClient } from "@/lib/http/client";

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  locale: Locale;
  dict: Messages;
  product?: ProductRow;
};

/** Shared bilingual admin form — posts to the matching server action. */
export function ProductForm({ mode, locale, dict, product }: Props) {
  const action = mode === "create" ? createProduct : updateProduct;
  const initialImage = product?.image_url ?? "";
  const initialVideo = product?.video_url ?? "";
  const [imagePreview, setImagePreview] = useState(initialImage);
  const [videoPreview, setVideoPreview] = useState(initialVideo);
  const [mediaHint, setMediaHint] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const initialColors = useMemo(() => (product?.colors ?? []).join(", "), [product?.colors]);
  const initialSizes = useMemo(() => (product?.sizes ?? []).join(", "), [product?.sizes]);

  function setFileToInput(file: File, input: HTMLInputElement | null) {
    if (!input) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
  }

  function onImageFileChange(file: File | null) {
    if (!file) {
      setImagePreview(initialImage);
      return;
    }
    setFileToInput(file, imageInputRef.current);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }

  function onVideoFileChange(file: File | null) {
    if (!file) {
      setVideoPreview(initialVideo);
      return;
    }
    setFileToInput(file, videoInputRef.current);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
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

  return (
    <form action={action} style={{ maxWidth: 560 }}>
      <input type="hidden" name="locale" value={locale} />
      {mode === "edit" && product ? (
        <input type="hidden" name="id" value={product.id} />
      ) : null}

      <Field>
        <Label htmlFor="slug">{dict.admin.slug}</Label>
        <Input
          id="slug"
          name="slug"
          required
          defaultValue={product?.slug}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          title="a-z 0-9 hyphen"
        />
      </Field>
      <Field>
        <Label htmlFor="name_ru">{dict.admin.nameRu}</Label>
        <Input
          id="name_ru"
          name="name_ru"
          required
          defaultValue={product?.name_ru}
        />
      </Field>
      <Field>
        <Label htmlFor="name_en">{dict.admin.nameEn}</Label>
        <Input
          id="name_en"
          name="name_en"
          required
          defaultValue={product?.name_en}
        />
      </Field>
      <Field>
        <Label htmlFor="description_ru">{dict.admin.descRu}</Label>
        <TextArea
          id="description_ru"
          name="description_ru"
          defaultValue={product?.description_ru ?? ""}
        />
      </Field>
      <Field>
        <Label htmlFor="description_en">{dict.admin.descEn}</Label>
        <TextArea
          id="description_en"
          name="description_en"
          defaultValue={product?.description_en ?? ""}
        />
      </Field>
      <Field>
        <Label htmlFor="price_cents">{dict.admin.price}</Label>
        <Input
          id="price_cents"
          name="price_cents"
          type="number"
          min={0}
          required
          defaultValue={product?.price_cents ?? 0}
        />
      </Field>
      <Field>
        <Label htmlFor="currency">{dict.admin.currency}</Label>
        <Input
          id="currency"
          name="currency"
          defaultValue={product?.currency ?? "usd"}
        />
      </Field>
      <Field>
        <Label htmlFor="category">{dict.admin.category}</Label>
        <Input
          id="category"
          name="category"
          defaultValue={product?.category ?? ""}
        />
      </Field>
      <Field>
        <Label htmlFor="group_key">{dict.admin.groupKey}</Label>
        <Input
          id="group_key"
          name="group_key"
          defaultValue={product?.group_key ?? ""}
          placeholder={dict.admin.groupKeyHint}
        />
      </Field>
      <Field>
        <Label htmlFor="stock">{dict.admin.stock}</Label>
        <Input
          id="stock"
          name="stock"
          type="number"
          min={0}
          defaultValue={product?.stock ?? 0}
        />
      </Field>
      <Field>
        <Label htmlFor="image_url">{dict.admin.imageUrl}</Label>
        <Input
          id="image_url"
          name="image_url"
          defaultValue={product?.image_url ?? ""}
          onChange={(e) => {
            if (!e.target.value.trim()) {
              setImagePreview("");
            } else {
              setImagePreview(e.target.value);
            }
          }}
          onBlur={(e) => validateMediaUrl(e.target.value, dict.admin.imageUrl)}
        />
      </Field>
      <Field>
        <Label htmlFor="image_file">{dict.admin.imageFile}</Label>
        <FileUploader
          handleChange={(file) => onImageFileChange(file ?? null)}
          name="image_drop"
          types={["JPG", "JPEG", "PNG", "WEBP", "GIF"]}
        >
          <div style={{ border: "1px dashed #94a3b8", borderRadius: 12, padding: 14 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <FilePlusIcon />
              <span>{dict.admin.dropImage}</span>
            </div>
          </div>
        </FileUploader>
        <Input
          ref={imageInputRef}
          id="image_file"
          name="image_file"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
        />
      </Field>
      {imagePreview ? (
        <div style={{ marginBottom: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt={dict.admin.imagePreview}
            style={{
              width: "100%",
              maxWidth: 320,
              maxHeight: 220,
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              objectFit: "cover",
            }}
          />
          <a href={imagePreview} download style={{ display: "inline-flex", marginTop: 8, gap: 6 }}>
            <DownloadIcon />
            {dict.admin.downloadImage}
          </a>
        </div>
      ) : null}
      <Field>
        <Label htmlFor="video_url">{dict.admin.videoUrl}</Label>
        <Input
          id="video_url"
          name="video_url"
          defaultValue={product?.video_url ?? ""}
          onChange={(e) => setVideoPreview(e.target.value)}
          onBlur={(e) => validateMediaUrl(e.target.value, dict.admin.videoUrl)}
        />
      </Field>
      <Field>
        <Label htmlFor="video_file">{dict.admin.videoFile}</Label>
        <FileUploader
          handleChange={(file) => onVideoFileChange(file ?? null)}
          name="video_drop"
          types={["MP4", "MOV", "WEBM"]}
        >
          <div style={{ border: "1px dashed #94a3b8", borderRadius: 12, padding: 14 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <VideoIcon />
              <span>{dict.admin.dropVideo}</span>
            </div>
          </div>
        </FileUploader>
        <Input
          ref={videoInputRef}
          id="video_file"
          name="video_file"
          type="file"
          accept="video/*"
          style={{ display: "none" }}
        />
      </Field>
      {videoPreview ? (
        <div style={{ marginBottom: 16, maxWidth: 320 }}>
          <ReactPlayer url={videoPreview} controls width="100%" height={200} />
          <a href={videoPreview} download style={{ display: "inline-flex", marginTop: 8, gap: 6 }}>
            <DownloadIcon />
            {dict.admin.downloadVideo}
          </a>
        </div>
      ) : null}
      {mediaHint ? (
        <p style={{ display: "flex", alignItems: "center", gap: 6, marginTop: -8, marginBottom: 16, color: "#64748b" }}>
          <ImageIcon />
          {mediaHint}
        </p>
      ) : null}
      <Field>
        <Label htmlFor="colors">{dict.admin.colors}</Label>
        <Input
          id="colors"
          name="colors"
          placeholder={dict.admin.multiValueHint}
          defaultValue={initialColors}
        />
      </Field>
      <Field>
        <Label htmlFor="sizes">{dict.admin.sizes}</Label>
        <Input
          id="sizes"
          name="sizes"
          placeholder={dict.admin.multiValueHint}
          defaultValue={initialSizes}
        />
      </Field>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            name="featured"
            defaultChecked={product?.featured}
          />
          {dict.admin.featured}
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            name="active"
            defaultChecked={product?.active ?? true}
          />
          {dict.admin.active}
        </label>
      </div>
      <AdminButton type="submit">{dict.admin.save}</AdminButton>
    </form>
  );
}
