"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { Cross1Icon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons";
import { AdminButton } from "@/components/admin/AdminButtons";
import { HomeHeroImageEditor } from "@/components/admin/HomeHeroImageEditor";
import {
  HomeBuilderCanvas,
  type HomeBuilderElement,
} from "@/components/home/HomeBuilderCanvas";
import {
  HOME_BUILDER_CONTENT_WIDTH,
  HOME_BUILDER_FOOTER_HEIGHT,
} from "@/components/home/home-builder-constants";

type EditableComment = { name: string; rating: number; text: string };
const TOOLS_STATE_STORAGE_KEY = "graciana:constructor-tools-state:v1";

function parseEditableComments(raw: string): EditableComment[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.includes("|") ? "|" : line.includes(";") ? ";" : null;
      if (!separator) return { name: "", rating: 5, text: line };
      const [name, ratingRaw, ...rest] = line.split(separator);
      const rating = Math.max(1, Math.min(5, Number(ratingRaw ?? 5) || 5));
      return {
        name: name?.trim() || "",
        rating,
        text: rest.join(separator).trim(),
      };
    });
}

function serializeEditableComments(items: EditableComment[]) {
  return items
    .map((item) => `${item.name || "Customer"}|${Math.max(1, Math.min(5, item.rating))}|${item.text || ""}`)
    .join("\n");
}

export function MainPageConstructorForm({
  locale,
  action,
  existing,
  productGroups,
  labels,
}: {
  locale: string;
  action: (formData: FormData) => void | Promise<void>;
  existing: {
    heroImageUrl: string;
    introTitle: string;
    introBody: string;
    canvasHeight: number;
    canvasBackground: string;
    elements: HomeBuilderElement[];
  };
  productGroups: Record<
    string,
    Array<{ id: string; title: string; href: string; imageUrl?: string | null }>
  >;
  labels: Record<string, string>;
}) {
  const [canvasHeight, setCanvasHeight] = useState(existing.canvasHeight || 1200);
  const [canvasBackground, setCanvasBackground] = useState(existing.canvasBackground || "#f7f2ec");
  const [elements, setElements] = useState<HomeBuilderElement[]>(existing.elements);
  const [selectedId, setSelectedId] = useState<string | null>(existing.elements[0]?.id ?? null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toolsPosition, setToolsPosition] = useState(() => {
    if (typeof window === "undefined") return { left: 14, top: 220 };
    try {
      const raw = window.localStorage.getItem(TOOLS_STATE_STORAGE_KEY);
      if (!raw) return { left: 14, top: 220 };
      const parsed = JSON.parse(raw) as { left?: number; top?: number };
      return {
        left: Number.isFinite(parsed.left) ? Number(parsed.left) : 14,
        top: Number.isFinite(parsed.top) ? Number(parsed.top) : 220,
      };
    } catch {
      return { left: 14, top: 220 };
    }
  });
  const [toolsCollapsed, setToolsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const raw = window.localStorage.getItem(TOOLS_STATE_STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as { collapsed?: boolean };
      return Boolean(parsed.collapsed);
    } catch {
      return false;
    }
  });
  const serializedBuilder = useMemo(
    () => JSON.stringify({ canvasHeight, canvasBackground, elements }),
    [canvasHeight, canvasBackground, elements],
  );

  const selected = elements.find((item) => item.id === selectedId) ?? null;
  const inlinePreviewWrapRef = useRef<HTMLDivElement | null>(null);
  const modalPreviewWrapRef = useRef<HTMLDivElement | null>(null);
  const [inlinePreviewScale, setInlinePreviewScale] = useState(1);
  const [modalPreviewScale, setModalPreviewScale] = useState(1);
  const parsedComments = useMemo(
    () => (selected?.type === "comments" ? parseEditableComments(selected.content) : []),
    [selected?.type, selected?.content],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      TOOLS_STATE_STORAGE_KEY,
      JSON.stringify({
        left: toolsPosition.left,
        top: toolsPosition.top,
        collapsed: toolsCollapsed,
      }),
    );
  }, [toolsCollapsed, toolsPosition.left, toolsPosition.top]);

  useEffect(() => {
    const node = inlinePreviewWrapRef.current;
    if (!node) return;
    const obs = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? HOME_BUILDER_CONTENT_WIDTH;
      const next = Math.max(0.45, Math.min(1, width / HOME_BUILDER_CONTENT_WIDTH));
      setInlinePreviewScale(next);
    });
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!previewOpen) return;
    const node = modalPreviewWrapRef.current;
    if (!node) return;
    const obs = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? HOME_BUILDER_CONTENT_WIDTH;
      const next = Math.max(0.45, Math.min(1, width / HOME_BUILDER_CONTENT_WIDTH));
      setModalPreviewScale(next);
    });
    obs.observe(node);
    return () => obs.disconnect();
  }, [previewOpen]);

  const updateElement = useCallback(function updateElement(id: string, patch: Partial<HomeBuilderElement>) {
    setElements((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  function addElement(type: HomeBuilderElement["type"]) {
    const id = `el-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
    const next: HomeBuilderElement = {
      id,
      type,
      x: 8,
      y: 10 + elements.length * 5,
      width:
        type === "text"
          ? 35
          : type === "video"
            ? 42
          : type === "product-group"
            ? 56
            : type === "comments"
              ? 50
              : 22,
      height:
        type === "text"
          ? 12
          : type === "video"
            ? 24
          : type === "product-group"
            ? 24
            : type === "comments"
              ? 28
              : 16,
      content:
        type === "text"
          ? "New text"
          : type === "icon"
            ? "Info block"
            : type === "product-group"
              ? "new-arrivals"
              : type === "comments"
                ? "Anna|5|Great quality and style"
                : "",
      href: "",
      imageUrl: "",
      videoUrl: "",
      icon: "star",
      color: "#ffffff",
      background: "rgba(0,0,0,0)",
      fontSize: 18,
      fontWeight: 600,
    };
    setElements((prev) => [...prev, next]);
    setSelectedId(id);
  }

  function removeElement(id: string) {
    setElements((prev) => prev.filter((item) => item.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  async function handleImageFileSelected(file: File, elementId: string) {
    setIsUploadingMedia(true);
    try {
      const payload = new FormData();
      payload.set("kind", "image");
      payload.set("file", file);
      const response = await fetch("/api/admin/home-builder-upload", {
        method: "POST",
        body: payload,
      });
      if (!response.ok) return;
      const data = (await response.json()) as { url?: string };
      if (!data.url) return;
      updateElement(elementId, { imageUrl: data.url });
    } finally {
      setIsUploadingMedia(false);
    }
  }

  async function handleVideoFileSelected(file: File, elementId: string) {
    setIsUploadingMedia(true);
    try {
      const payload = new FormData();
      payload.set("kind", "video");
      payload.set("file", file);
      const response = await fetch("/api/admin/home-builder-upload", {
        method: "POST",
        body: payload,
      });
      if (!response.ok) return;
      const data = (await response.json()) as { url?: string };
      if (!data.url) return;
      updateElement(elementId, { videoUrl: data.url });
    } finally {
      setIsUploadingMedia(false);
    }
  }

  function startDraggingTools(event: React.MouseEvent) {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const start = toolsPosition;
    function onMove(moveEvent: MouseEvent) {
      const nextLeft = Math.max(8, Math.min(window.innerWidth - 240, start.left + (moveEvent.clientX - startX)));
      const nextTop = Math.max(8, Math.min(window.innerHeight - 240, start.top + (moveEvent.clientY - startY)));
      setToolsPosition({ left: nextLeft, top: nextTop });
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function startResizePreviewHeight(event: React.MouseEvent) {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = canvasHeight;
    const scale = Math.max(0.45, inlinePreviewScale || 1);
    function onMove(moveEvent: MouseEvent) {
      const delta = (moveEvent.clientY - startY) / scale;
      const next = Math.max(800, Math.min(5000, Math.round(startHeight + delta)));
      setCanvasHeight(next);
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <form
      action={action}
      onSubmit={() => setIsSaving(true)}
      style={{ display: "grid", gap: 16 }}
      className="constructor-form"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="home_builder_json" value={serializedBuilder} />
      <input type="hidden" name="home_intro_title" value={existing.introTitle} />
      <input type="hidden" name="home_intro_body" value={existing.introBody} />
      <input type="hidden" name="home_intro_layout_json" value="{}" />

      <div
        style={{
          position: "fixed",
          left: toolsPosition.left,
          top: toolsPosition.top,
          zIndex: 30,
          display: "grid",
          gap: 10,
          background: "linear-gradient(180deg, rgba(255,255,255,0.97), rgba(250,242,233,0.97))",
          border: "1px solid #d6c7b8",
          borderRadius: 14,
          padding: 12,
          boxShadow: "0 16px 36px rgba(33, 25, 18, 0.14)",
          minWidth: toolsCollapsed ? 56 : 210,
          backdropFilter: "blur(4px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          {!toolsCollapsed ? (
            <button
              type="button"
              onMouseDown={startDraggingTools}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                margin: 0,
                fontSize: "0.76rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#000",
                fontWeight: 700,
                cursor: "grab",
                textAlign: "left",
              }}
            >
              {labels.constructorTools}
            </button>
          ) : (
            <button
              type="button"
              onMouseDown={startDraggingTools}
              aria-label={labels.constructorTools}
              title={labels.constructorTools}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                margin: 0,
                width: 22,
                height: 22,
                cursor: "grab",
              }}
            >
              <DoubleArrowRightIcon />
            </button>
          )}
          <button
            type="button"
            onClick={() => setToolsCollapsed((v) => !v)}
            aria-label={toolsCollapsed ? labels.toolsExpand : labels.toolsCollapse}
            title={toolsCollapsed ? labels.toolsExpand : labels.toolsCollapse}
            style={{
              border: "1px solid #c7b8aa",
              background: "#fff",
              width: 24,
              height: 24,
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {toolsCollapsed ? <DoubleArrowRightIcon /> : <DoubleArrowLeftIcon />}
          </button>
        </div>
        {!toolsCollapsed ? (
          <>
            <button
              type="button"
              onClick={() => addElement("text")}
              style={{ borderRadius: 999, border: "1px solid #bca996", padding: "9px 12px", background: "#fff", fontWeight: 600 }}
            >
              {labels.addText}
            </button>
            <button
              type="button"
              onClick={() => addElement("image")}
              style={{ borderRadius: 999, border: "1px solid #bca996", padding: "9px 12px", background: "#fff", fontWeight: 600 }}
            >
              {labels.addImageBlock}
            </button>
            <button
              type="button"
              onClick={() => addElement("video")}
              style={{ borderRadius: 999, border: "1px solid #bca996", padding: "9px 12px", background: "#fff", fontWeight: 600 }}
            >
              {labels.addVideoBlock ?? "Add video block"}
            </button>
            <button
              type="button"
              onClick={() => addElement("icon")}
              style={{ borderRadius: 999, border: "1px solid #bca996", padding: "9px 12px", background: "#fff", fontWeight: 600 }}
            >
              {labels.addIconBlock}
            </button>
            <button
              type="button"
              onClick={() => addElement("product-group")}
              style={{ borderRadius: 999, border: "1px solid #bca996", padding: "9px 12px", background: "#fff", fontWeight: 600 }}
            >
              {labels.addProductGroupBlock}
            </button>
            <button
              type="button"
              onClick={() => addElement("story-viewed")}
              style={{ borderRadius: 999, border: "1px solid #bca996", padding: "9px 12px", background: "#fff", fontWeight: 600 }}
            >
              {labels.addViewedStoryBlock}
            </button>
            <button
              type="button"
              onClick={() => addElement("story-searched")}
              style={{ borderRadius: 999, border: "1px solid #bca996", padding: "9px 12px", background: "#fff", fontWeight: 600 }}
            >
              {labels.addSearchedStoryBlock}
            </button>
            <button
              type="button"
              onClick={() => addElement("comments")}
              style={{ borderRadius: 999, border: "1px solid #bca996", padding: "9px 12px", background: "#fff", fontWeight: 600 }}
            >
              {labels.addCommentsBlock}
            </button>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              style={{ borderRadius: 999, border: "1px solid #2f261f", padding: "10px 12px", background: "#1f1a17", color: "#fff", fontWeight: 700 }}
            >
              {labels.openPreview}
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => addElement("text")} title={labels.addText} style={{ borderRadius: 999, border: "1px solid #bca996", width: 32, height: 32, background: "#fff", fontWeight: 700 }}>T</button>
            <button type="button" onClick={() => addElement("image")} title={labels.addImageBlock} style={{ borderRadius: 999, border: "1px solid #bca996", width: 32, height: 32, background: "#fff", fontWeight: 700 }}>I</button>
            <button type="button" onClick={() => addElement("video")} title={labels.addVideoBlock ?? "Add video block"} style={{ borderRadius: 999, border: "1px solid #bca996", width: 32, height: 32, background: "#fff", fontWeight: 700 }}>V</button>
            <button type="button" onClick={() => addElement("icon")} title={labels.addIconBlock} style={{ borderRadius: 999, border: "1px solid #bca996", width: 32, height: 32, background: "#fff", fontWeight: 700 }}>★</button>
            <button type="button" onClick={() => addElement("comments")} title={labels.addCommentsBlock} style={{ borderRadius: 999, border: "1px solid #bca996", width: 32, height: 32, background: "#fff", fontWeight: 700 }}>C</button>
            <button type="button" onClick={() => setPreviewOpen(true)} title={labels.openPreview} style={{ borderRadius: 999, border: "1px solid #2f261f", width: 32, height: 32, background: "#1f1a17", color: "#fff", fontWeight: 700 }}>▶</button>
          </>
        )}
      </div>

      <HomeHeroImageEditor
        existingUrl={existing.heroImageUrl}
        labels={{
          title: labels.homeHero,
          urlPlaceholder: labels.homeHeroUrl,
          sizeHint: labels.homeHeroSizeHint,
          cropApply: labels.cropApply,
          previewTitle: labels.imagePreview,
        }}
      />

      <div className="constructor-main-grid" style={{ display: "grid", gap: 10, alignItems: "start" }}>
        <div
          ref={inlinePreviewWrapRef}
          style={{
            border: "1px solid var(--builder-border, #cbbeb0)",
            borderRadius: 12,
            padding: 10,
            background: "var(--builder-surface, #fff)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              borderBottom: "1px solid var(--builder-border, #ece4da)",
              paddingBottom: 8,
              marginBottom: 8,
            }}
          >
            {labels.previewTitle}
          </div>
          <div
            style={{
              width: HOME_BUILDER_CONTENT_WIDTH,
              transform: `scale(${inlinePreviewScale})`,
              transformOrigin: "top left",
              height: (canvasHeight + HOME_BUILDER_FOOTER_HEIGHT) * inlinePreviewScale,
            }}
          >
            <HomeBuilderCanvas
              heroImageUrl={existing.heroImageUrl}
              canvasHeight={canvasHeight}
              canvasBackground={canvasBackground}
              elements={elements}
              editable
              selectedId={selectedId}
              onSelect={setSelectedId}
              onUpdateElement={updateElement}
              showFooterOverlay
              locale={locale}
              productGroups={productGroups}
              text={{
                header: labels.canvasHeader,
                footer: labels.canvasFooter,
                heroMissing: labels.heroMissing,
                imageUrlEmpty: labels.imageUrlEmpty,
                videoUrlEmpty: labels.videoUrlEmpty ?? "Video URL is empty",
                productGroupFallback: labels.productGroupFallback,
                productGroupEmpty: labels.productGroupEmpty,
                noViewedItems: labels.noViewedItems,
                noSearchHistory: labels.noSearchHistory,
                commentsFallbackName: labels.commentsFallbackName,
                commentsFallbackText: labels.commentsFallbackText,
              }}
            />
          </div>
          <button
            type="button"
            onMouseDown={startResizePreviewHeight}
            title={labels.resizeHint}
            aria-label={labels.resizeHint}
            style={{
              marginTop: 8,
              width: "100%",
              height: 14,
              borderRadius: 999,
              border: "1px solid var(--builder-border, #cbbeb0)",
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--builder-accent, #f6efe6) 80%, var(--builder-surface, #fff) 20%), color-mix(in srgb, var(--builder-accent, #eadfce) 92%, var(--builder-surface, #fff) 8%))",
              cursor: "ns-resize",
            }}
          />
        </div>

        <div
          className="constructor-settings-panel"
          style={{
            border: "1px solid var(--builder-border, #cbbeb0)",
            borderRadius: 12,
            padding: 12,
            display: "grid",
            gap: 10,
            background: "linear-gradient(180deg, var(--builder-surface, #fff), color-mix(in srgb, var(--builder-accent, #fbf7f2) 55%, var(--builder-surface, #fff) 45%))",
            alignSelf: "start",
            height: "fit-content",
          }}
        >
          <label>{labels.previewHeight}</label>
          <input
            type="number"
            min={700}
            max={5000}
            value={canvasHeight}
            onChange={(e) => setCanvasHeight(Number(e.target.value || 1200))}
          />
          <label>{labels.previewBackgroundColor}</label>
          <div style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 8 }}>
            <input
              type="color"
              value={canvasBackground.startsWith("#") ? canvasBackground : "#f7f2ec"}
              onChange={(e) => setCanvasBackground(e.target.value)}
              style={{ width: 42, height: 38, padding: 2 }}
            />
            <input value={canvasBackground} onChange={(e) => setCanvasBackground(e.target.value)} />
          </div>
          <button type="button" onClick={() => setCanvasBackground("transparent")}>
            {labels.transparentBackground}
          </button>
          {isUploadingMedia ? (
            <div
              style={{
                border: "1px solid var(--builder-border, #cbbeb0)",
                borderRadius: 10,
                padding: "8px 10px",
                fontSize: "0.85rem",
                background: "color-mix(in srgb, var(--builder-accent, #efe5da) 45%, var(--builder-surface, #fff) 55%)",
              }}
            >
              {labels.loading ?? "Loading..."}
            </div>
          ) : null}
          {selected ? (
            <>
              <strong>{labels.selectedElement}</strong>
              <label>{labels.content}</label>
              <input value={selected.content} onChange={(e) => updateElement(selected.id, { content: e.target.value })} />
              {selected.type === "product-group" ? (
                <div style={{ fontSize: "0.78rem", color: "var(--builder-text, inherit)" }}>
                  {labels.productGroupHint}
                </div>
              ) : null}
              {selected.type === "comments" ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ fontSize: "0.78rem", color: "var(--builder-text, inherit)" }}>
                    {labels.commentsHint}
                  </div>
                  {parsedComments.map((comment, idx) => (
                    <div
                      className="constructor-comment-card"
                      key={`${selected.id}-comment-${idx}`}
                      style={{
                        border: "1px solid #dbcfc3",
                        borderRadius: 10,
                        padding: 8,
                        display: "grid",
                        gap: 6,
                        background: "#fff",
                      }}
                    >
                      <label>{labels.commentName}</label>
                      <input
                        value={comment.name}
                        onChange={(e) => {
                          const items = parseEditableComments(selected.content);
                          items[idx] = { ...items[idx], name: e.target.value };
                          updateElement(selected.id, { content: serializeEditableComments(items) });
                        }}
                      />
                      <label>{labels.commentRating}</label>
                      <select
                        value={String(comment.rating)}
                        onChange={(e) => {
                          const items = parseEditableComments(selected.content);
                          items[idx] = { ...items[idx], rating: Number(e.target.value) };
                          updateElement(selected.id, { content: serializeEditableComments(items) });
                        }}
                      >
                        <option value="5">5</option>
                        <option value="4">4</option>
                        <option value="3">3</option>
                        <option value="2">2</option>
                        <option value="1">1</option>
                      </select>
                      <label>{labels.commentText}</label>
                      <textarea
                        rows={3}
                        value={comment.text}
                        onChange={(e) => {
                          const items = parseEditableComments(selected.content);
                          items[idx] = { ...items[idx], text: e.target.value };
                          updateElement(selected.id, { content: serializeEditableComments(items) });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const items = parseEditableComments(selected.content);
                          items.splice(idx, 1);
                          updateElement(selected.id, { content: serializeEditableComments(items) });
                        }}
                      >
                        {labels.removeComment}
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const items = parseEditableComments(selected.content);
                      items.push({ name: "", rating: 5, text: "" });
                      updateElement(selected.id, { content: serializeEditableComments(items) });
                    }}
                  >
                    {labels.addComment}
                  </button>
                </div>
              ) : null}
              <label>{labels.linkUrl}</label>
              <input value={selected.href} onChange={(e) => updateElement(selected.id, { href: e.target.value })} />
              {selected.type === "image" ? (
                <>
                  <label>{labels.imageUrl}</label>
                  <input value={selected.imageUrl} onChange={(e) => updateElement(selected.id, { imageUrl: e.target.value })} />
                  <FileUploader
                    handleChange={(value: File | File[]) => {
                      const file = Array.isArray(value) ? value[0] : value;
                      if (!file) return;
                      void handleImageFileSelected(file, selected.id);
                    }}
                    name="constructor-image-file"
                    types={["JPG", "JPEG", "PNG", "WEBP"]}
                    multiple={false}
                  >
                    <div
                      style={{
                        border: "1px dashed var(--builder-border, #bca996)",
                        borderRadius: 10,
                        padding: "10px 12px",
                        fontSize: "0.88rem",
                        background: "color-mix(in srgb, var(--builder-surface, #fff) 70%, var(--builder-accent, #fffaf5) 30%)",
                        color: "var(--builder-text, inherit)",
                        cursor: "pointer",
                      }}
                    >
                      {labels.dragOrUploadImage}
                    </div>
                  </FileUploader>
                  <div
                    style={{
                      border: "1px solid var(--builder-border, #d7c9bc)",
                      borderRadius: 10,
                      minHeight: 120,
                      overflow: "hidden",
                      background: "color-mix(in srgb, var(--builder-accent, #efe4d9) 70%, var(--builder-surface, #fff) 30%)",
                    }}
                  >
                    {selected.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selected.imageUrl}
                        alt="Selected element preview"
                        style={{ width: "100%", height: 140, objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ height: 120, display: "grid", placeItems: "center", color: "var(--builder-text, inherit)" }}>
                        {labels.noImagePreview}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
              {selected.type === "video" ? (
                <>
                  <label>{labels.videoUrl ?? "Video URL"}</label>
                  <input
                    value={selected.videoUrl}
                    onChange={(e) => updateElement(selected.id, { videoUrl: e.target.value })}
                    placeholder="https://..."
                  />
                  <FileUploader
                    handleChange={(value: File | File[]) => {
                      const file = Array.isArray(value) ? value[0] : value;
                      if (!file) return;
                      void handleVideoFileSelected(file, selected.id);
                    }}
                    name="constructor-video-file"
                    types={["MP4", "WEBM", "MOV", "OGG", "M4V"]}
                    multiple={false}
                  >
                    <div
                      style={{
                        border: "1px dashed var(--builder-border, #bca996)",
                        borderRadius: 10,
                        padding: "10px 12px",
                        fontSize: "0.88rem",
                        background:
                          "color-mix(in srgb, var(--builder-surface, #fff) 70%, var(--builder-accent, #fffaf5) 30%)",
                        color: "var(--builder-text, inherit)",
                        cursor: "pointer",
                      }}
                    >
                      {labels.dropVideo ?? "Drop video file here or click to upload"}
                    </div>
                  </FileUploader>
                  {selected.videoUrl ? (
                    <video
                      src={selected.videoUrl}
                      controls
                      muted
                      playsInline
                      style={{ width: "100%", borderRadius: 10, border: "1px solid var(--builder-border, #d7c9bc)" }}
                    />
                  ) : null}
                </>
              ) : null}
              {selected.type === "icon" ? (
                <>
                  <label>{labels.icon}</label>
                  <select value={selected.icon} onChange={(e) => updateElement(selected.id, { icon: e.target.value })}>
                    <option value="star">Star</option>
                    <option value="truck">Truck</option>
                    <option value="gift">Gift</option>
                    <option value="credit-card">Card</option>
                    <option value="phone">Phone</option>
                  </select>
                </>
              ) : null}
              <label>{labels.horizontalPositionPercent}</label>
              <input type="number" value={Math.round(selected.x)} onChange={(e) => updateElement(selected.id, { x: Number(e.target.value || 0) })} />
              <label>{labels.verticalPositionPercent}</label>
              <input type="number" value={Math.round(selected.y)} onChange={(e) => updateElement(selected.id, { y: Number(e.target.value || 0) })} />
              <label>{labels.blockWidthPercent}</label>
              <input type="number" value={Math.round(selected.width)} onChange={(e) => updateElement(selected.id, { width: Number(e.target.value || 20) })} />
              <label>{labels.blockHeightPercent}</label>
              <input type="number" value={Math.round(selected.height)} onChange={(e) => updateElement(selected.id, { height: Number(e.target.value || 12) })} />
              <label>{labels.fontSize}</label>
              <input type="number" value={selected.fontSize} onChange={(e) => updateElement(selected.id, { fontSize: Number(e.target.value || 18) })} />
              <label>{labels.fontWeight}</label>
              <select
                value={String(selected.fontWeight)}
                onChange={(e) => updateElement(selected.id, { fontWeight: Number(e.target.value) })}
              >
                <option value="300" style={{ fontWeight: 300 }}>Light 300</option>
                <option value="400" style={{ fontWeight: 400 }}>Regular 400</option>
                <option value="500" style={{ fontWeight: 500 }}>Medium 500</option>
                <option value="600" style={{ fontWeight: 600 }}>Semi-bold 600</option>
                <option value="700" style={{ fontWeight: 700 }}>Bold 700</option>
                <option value="800" style={{ fontWeight: 800 }}>Extra-bold 800</option>
              </select>
              <label>{labels.textColor}</label>
              <div style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 8 }}>
                <input
                  type="color"
                  value={selected.color}
                  onChange={(e) => updateElement(selected.id, { color: e.target.value })}
                  style={{ width: 42, height: 38, padding: 2 }}
                />
                <input value={selected.color} onChange={(e) => updateElement(selected.id, { color: e.target.value })} />
              </div>
              <label>{labels.background}</label>
              <div style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 8 }}>
                <input
                  type="color"
                  value={selected.background.startsWith("#") ? selected.background : "#333333"}
                  onChange={(e) => updateElement(selected.id, { background: e.target.value })}
                  style={{ width: 42, height: 38, padding: 2 }}
                />
                <input value={selected.background} onChange={(e) => updateElement(selected.id, { background: e.target.value })} />
              </div>
              <button
                type="button"
                onClick={() => updateElement(selected.id, { background: "transparent" })}
              >
                {labels.transparentBackground}
              </button>
              <button type="button" onClick={() => removeElement(selected.id)}>{labels.removeSection}</button>
            </>
          ) : (
            <p style={{ margin: 0, color: "var(--builder-text, inherit)" }}>{labels.selectElement}</p>
          )}
        </div>
      </div>

      {previewOpen ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, padding: 20 }}>
          <div
            style={{
              background: "var(--builder-surface, #fff)",
              border: "1px solid var(--builder-border, #cbbeb0)",
              borderRadius: 12,
              height: "100%",
              overflow: "auto",
              padding: 14,
              color: "var(--builder-text, inherit)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{labels.previewTitle}</strong>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                aria-label={labels.closePreview}
                title={labels.closePreview}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  border: "1px solid var(--builder-border, #c8b8a8)",
                  background: "var(--builder-surface, #fff)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Cross1Icon />
              </button>
            </div>
            <div
              ref={modalPreviewWrapRef}
              style={{ marginTop: 10, overflow: "hidden" }}
            >
              <div
                style={{
                  width: HOME_BUILDER_CONTENT_WIDTH,
                  transform: `scale(${modalPreviewScale})`,
                  transformOrigin: "top left",
                  height: (canvasHeight + HOME_BUILDER_FOOTER_HEIGHT) * modalPreviewScale,
                }}
              >
                <HomeBuilderCanvas
                  heroImageUrl={existing.heroImageUrl}
                  canvasHeight={canvasHeight}
                  canvasBackground={canvasBackground}
                  elements={elements}
                  showFooterOverlay
                  locale={locale}
                  productGroups={productGroups}
                  text={{
                    header: labels.canvasHeader,
                    footer: labels.canvasFooter,
                    heroMissing: labels.heroMissing,
                    imageUrlEmpty: labels.imageUrlEmpty,
                    videoUrlEmpty: labels.videoUrlEmpty ?? "Video URL is empty",
                    productGroupFallback: labels.productGroupFallback,
                    productGroupEmpty: labels.productGroupEmpty,
                    noViewedItems: labels.noViewedItems,
                    noSearchHistory: labels.noSearchHistory,
                    commentsFallbackName: labels.commentsFallbackName,
                    commentsFallbackText: labels.commentsFallbackText,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <AdminButton type="submit" disabled={isSaving || isUploadingMedia}>
        {isSaving ? `${labels.save}...` : isUploadingMedia ? (labels.loading ?? "Loading...") : labels.save}
      </AdminButton>
      <style>
        {`
          .constructor-form .constructor-settings-panel {
            background: linear-gradient(180deg, var(--builder-surface, #fff), color-mix(in srgb, var(--builder-accent, #fbf7f2) 55%, var(--builder-surface, #fff) 45%)) !important;
            border-color: var(--builder-border, #cbbeb0) !important;
            color: var(--builder-text, #1f1a17);
            box-shadow: 0 10px 24px rgba(12, 8, 5, 0.08);
          }
          .constructor-form .constructor-settings-panel strong {
            color: var(--builder-text, #1f1a17);
            letter-spacing: 0.01em;
          }
          .constructor-form .constructor-settings-panel label {
            font-size: 0.82rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            color: var(--builder-text, inherit);
          }
          .constructor-form .constructor-settings-panel input,
          .constructor-form .constructor-settings-panel select,
          .constructor-form .constructor-settings-panel textarea {
            width: 100%;
            border: 1px solid var(--builder-border, #cbbeb0);
            border-radius: 10px;
            background: color-mix(in srgb, var(--builder-surface, #fff) 88%, transparent);
            color: var(--builder-text, #1f1a17);
            padding: 9px 11px;
            font-size: 0.92rem;
            transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          }
          .constructor-form .constructor-settings-panel textarea {
            resize: vertical;
            min-height: 84px;
          }
          .constructor-form .constructor-settings-panel input:focus,
          .constructor-form .constructor-settings-panel select:focus,
          .constructor-form .constructor-settings-panel textarea:focus {
            outline: none;
            border-color: var(--builder-focus, #1f1a17);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--builder-focus, #1f1a17) 18%, transparent);
          }
          .constructor-form .constructor-settings-panel button {
            border-radius: 999px;
            border: 1px solid var(--builder-border, #cbbeb0);
            background: color-mix(in srgb, var(--builder-accent, #efe5da) 70%, var(--builder-surface, #fff) 30%);
            color: var(--builder-text, #1f1a17);
            font-weight: 700;
            padding: 8px 12px;
            transition: transform 0.15s ease, background 0.2s ease, border-color 0.2s ease;
          }
          .constructor-form .constructor-settings-panel button:hover {
            transform: translateY(-1px);
            background: color-mix(in srgb, var(--builder-accent, #efe5da) 82%, var(--builder-surface, #fff) 18%);
          }
          .constructor-form .constructor-comment-card {
            border-color: var(--builder-border, #dbcfc3) !important;
            background: color-mix(in srgb, var(--builder-surface, #fff) 92%, transparent) !important;
          }
          .constructor-main-grid {
            grid-template-columns: minmax(0, 1fr) 340px;
          }
          @media (max-width: 980px) {
            .constructor-main-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
    </form>
  );
}
