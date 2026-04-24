"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { AdminButton } from "@/components/admin/AdminButtons";

const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 720;
const TARGET_ASPECT = TARGET_WIDTH / TARGET_HEIGHT;

type Area = { x: number; y: number; width: number; height: number };

function readImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image load failed"));
    image.src = url;
  });
}

async function cropToBlob(src: string, crop: Area): Promise<Blob> {
  const image = await readImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    TARGET_WIDTH,
    TARGET_HEIGHT,
  );
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Crop failed"));
      resolve(blob);
    }, "image/jpeg", 0.92);
  });
}

export function HomeHeroImageEditor({
  existingUrl,
  labels,
}: {
  existingUrl: string;
  labels: {
    title: string;
    urlPlaceholder: string;
    sizeHint: string;
    cropApply: string;
    previewTitle: string;
  };
}) {
  const [imageUrl, setImageUrl] = useState(existingUrl);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [preview, setPreview] = useState(existingUrl);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixelCrop, setPixelCrop] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isCropping = useMemo(() => Boolean(cropImageSrc), [cropImageSrc]);

  const onFileChange = useCallback((file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropImageSrc(url);
    setPreview(url);
  }, []);

  const applyCrop = useCallback(async () => {
    if (!cropImageSrc || !pixelCrop || !fileInputRef.current) return;
    setBusy(true);
    try {
      const blob = await cropToBlob(cropImageSrc, pixelCrop);
      const file = new File([blob], `hero-${Date.now()}.jpg`, { type: "image/jpeg" });
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      const finalUrl = URL.createObjectURL(file);
      setPreview(finalUrl);
      setCropImageSrc(null);
      setImageUrl("");
    } finally {
      setBusy(false);
    }
  }, [cropImageSrc, pixelCrop]);

  return (
    <div style={{ display: "grid", gap: 10, maxWidth: 760 }}>
      <h2 style={{ margin: 0 }}>{labels.title}</h2>
      <input
        name="hero_image_url"
        value={imageUrl}
        onChange={(e) => {
          setImageUrl(e.target.value);
          if (e.target.value.trim()) setPreview(e.target.value);
        }}
        placeholder={labels.urlPlaceholder}
        style={{ padding: "10px 12px", border: "1px solid #cbbeb0", borderRadius: 10 }}
      />
      <input
        ref={fileInputRef}
        name="hero_image_file"
        type="file"
        accept="image/*"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
      <p style={{ margin: 0, color: "#7a6f66", fontSize: 13 }}>{labels.sizeHint}</p>

      {isCropping && cropImageSrc ? (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ position: "relative", width: "100%", height: 300, borderRadius: 12, overflow: "hidden" }}>
            <Cropper
              image={cropImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={TARGET_ASPECT}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, areaPixels) => setPixelCrop(areaPixels as Area)}
            />
          </div>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13 }}>Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </label>
          <AdminButton
            type="button"
            onClick={() => void applyCrop()}
            disabled={busy}
            style={{ width: "fit-content" }}
          >
            {labels.cropApply}
          </AdminButton>
        </div>
      ) : null}

      {preview ? (
        <div style={{ display: "grid", gap: 6 }}>
          <strong style={{ fontSize: 13 }}>{labels.previewTitle}</strong>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt=""
            width={768}
            height={288}
            style={{ width: "100%", maxWidth: 560, height: "auto", borderRadius: 12, border: "1px solid #d8ccc0" }}
          />
        </div>
      ) : null}
    </div>
  );
}
