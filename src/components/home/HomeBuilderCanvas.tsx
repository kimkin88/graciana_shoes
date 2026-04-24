"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HomeCommentsBlock } from "@/components/home/HomeCommentsBlock";
import { HomeStoryItemsMini } from "@/components/home/HomeStoryItemsMini";
import {
  HOME_BUILDER_CONTENT_WIDTH,
  HOME_BUILDER_FOOTER_HEIGHT,
  HOME_BUILDER_GRID_STEP,
  HOME_BUILDER_HEADER_HEIGHT,
} from "@/components/home/home-builder-constants";

function getResponsiveCanvasHeight(baseHeight: number, scale: number) {
  return Math.round(baseHeight * Math.max(0.62, Math.min(1, scale)));
}

export type HomeBuilderElement = {
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
  content: string;
  href: string;
  imageUrl: string;
  videoUrl: string;
  icon: string;
  color: string;
  background: string;
  fontSize: number;
  fontWeight: number;
};

function iconFromName(name: string) {
  if (name === "truck") return "🚚";
  if (name === "gift") return "🎁";
  if (name === "credit-card") return "💳";
  if (name === "phone") return "📞";
  return "⭐";
}

function InViewVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const node = videoRef.current;
    if (!node || !src) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          void node.play().catch(() => {
            // Ignore autoplay permission errors.
          });
        } else {
          node.pause();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [src]);
  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      controls={false}
      preload="metadata"
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
}

export function HomeBuilderCanvas({
  heroImageUrl,
  canvasHeight,
  canvasBackground,
  elements,
  editable = false,
  selectedId,
  onSelect,
  onUpdateElement,
  showChrome = false,
  showFooterOverlay = false,
  locale = "ru",
  productGroups = {},
  text = {},
}: {
  heroImageUrl?: string;
  canvasHeight: number;
  canvasBackground?: string;
  elements: HomeBuilderElement[];
  editable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onUpdateElement?: (id: string, patch: Partial<HomeBuilderElement>) => void;
  showChrome?: boolean;
  showFooterOverlay?: boolean;
  locale?: string;
  productGroups?: Record<
    string,
    Array<{ id: string; title: string; href: string; imageUrl?: string | null }>
  >;
  text?: Partial<{
    header: string;
    footer: string;
    heroMissing: string;
    imageUrlEmpty: string;
    videoUrlEmpty: string;
    productGroupFallback: string;
    productGroupEmpty: string;
    noViewedItems: string;
    noSearchHistory: string;
    commentsFallbackName: string;
    commentsFallbackText: string;
  }>;
}) {
  const ui = {
    header: text.header ?? "Header",
    footer: text.footer ?? "Footer",
    heroMissing: text.heroMissing ?? "Hero image is not set yet",
    imageUrlEmpty: text.imageUrlEmpty ?? "Image URL is empty",
    videoUrlEmpty: text.videoUrlEmpty ?? "Video URL is empty",
    productGroupFallback: text.productGroupFallback ?? "Product group",
    productGroupEmpty:
      text.productGroupEmpty ?? "Group is empty. Set group key in product admin.",
    noViewedItems: text.noViewedItems ?? "No viewed items yet.",
    noSearchHistory: text.noSearchHistory ?? "No search history yet.",
    commentsFallbackName: text.commentsFallbackName ?? "Customer",
    commentsFallbackText:
      text.commentsFallbackText ?? "Great quality and fast delivery.",
  };
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [contentScale, setContentScale] = useState(1);

  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? HOME_BUILDER_CONTENT_WIDTH;
      const next = Math.max(0.62, Math.min(1, width / HOME_BUILDER_CONTENT_WIDTH));
      setContentScale(next);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function snap(value: number) {
    return Math.round(value / HOME_BUILDER_GRID_STEP) * HOME_BUILDER_GRID_STEP;
  }
  function startDragElement(event: React.MouseEvent, item: HomeBuilderElement) {
    const updateElement = onUpdateElement;
    if (!editable || !updateElement) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const rect = canvasRef.current?.getBoundingClientRect();
    const baseWidth = Math.max(1, rect?.width ?? 1);
    const baseHeight = Math.max(1, rect?.height ?? 1);
    function onMove(moveEvent: MouseEvent) {
      const dx = ((moveEvent.clientX - startX) / baseWidth) * 100;
      const dy = ((moveEvent.clientY - startY) / baseHeight) * 100;
      updateElement?.(item.id, {
        x: snap(Math.max(0, Math.min(100 - item.width, item.x + dx))),
        y: snap(Math.max(0, Math.min(100, item.y + dy))),
      });
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function startResizeElement(event: React.MouseEvent, item: HomeBuilderElement) {
    const updateElement = onUpdateElement;
    if (!editable || !updateElement) return;
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const rect = canvasRef.current?.getBoundingClientRect();
    const baseWidth = Math.max(1, rect?.width ?? 1);
    const baseHeight = Math.max(1, rect?.height ?? 1);
    function onMove(moveEvent: MouseEvent) {
      const dx = ((moveEvent.clientX - startX) / baseWidth) * 100;
      const dy = ((moveEvent.clientY - startY) / baseHeight) * 100;
      updateElement?.(item.id, {
        width: snap(Math.max(6, Math.min(100 - item.x, item.width + dx))),
        height: snap(Math.max(6, Math.min(100 - item.y, item.height + dy))),
      });
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  const content = (
    <div
      ref={canvasRef}
      style={{
        position: "relative",
        height: getResponsiveCanvasHeight(canvasHeight, contentScale),
        background: canvasBackground || "#f7f2ec",
      }}
    >
      {heroImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={heroImageUrl} alt="Hero" style={{ width: "100%", height: 340, objectFit: "cover", display: "block" }} />
      ) : (
        <div style={{ width: "100%", height: 340, display: "grid", placeItems: "center", background: "#e8ddd1", color: "inherit", fontSize: "0.95rem" }}>
          {ui.heroMissing}
        </div>
      )}

      {elements.map((item) => {
        const isImageBlock = item.type === "image" || item.type === "video";
        const isAdaptiveHeightBlock =
          item.type === "text" ||
          item.type === "icon" ||
          item.type === "product-group" ||
          item.type === "story-viewed" ||
          item.type === "story-searched" ||
          item.type === "comments";
        const imageAspect = Math.max(0.2, item.width / Math.max(0.2, item.height));
        const scaledFontSize = Math.max(10, item.fontSize * contentScale);
        const scaledPadding = Math.max(6, 8 * contentScale);
        const adjustedHeight = Math.min(100 - item.y, item.height / contentScale);
        const style = {
          position: "absolute" as const,
          left: `${item.x}%`,
          top: `${item.y}%`,
          width: `${item.width}%`,
          height: isImageBlock ? undefined : `${isAdaptiveHeightBlock ? adjustedHeight : item.height}%`,
          aspectRatio: isImageBlock ? `${imageAspect}` : undefined,
          border: editable
            ? selectedId === item.id
              ? "2px solid #7e6654"
              : "1px dashed #b79f8b"
            : undefined,
          borderRadius: 10,
          background: item.background || "rgba(0,0,0,0.2)",
          color: item.color || "#fff",
          padding: isImageBlock ? 0 : scaledPadding,
          cursor: editable ? "move" : "default",
          overflow: "hidden" as const,
        };
        const body =
          item.type === "image" ? (
            item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>{ui.imageUrlEmpty}</div>
            )
          ) : item.type === "video" ? (
            item.videoUrl ? (
              <InViewVideo src={item.videoUrl} />
            ) : (
              <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>{ui.videoUrlEmpty}</div>
            )
          ) : item.type === "icon" ? (
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontSize: Math.max(14, scaledFontSize + 8 * contentScale) }}>{iconFromName(item.icon)}</div>
              <div style={{ fontSize: scaledFontSize, fontWeight: item.fontWeight }}>{item.content}</div>
            </div>
          ) : item.type === "product-group" ? (
            <div style={{ display: "grid", gap: 8 }}>
              <strong style={{ fontSize: scaledFontSize, fontWeight: item.fontWeight }}>
                {item.content || ui.productGroupFallback}
              </strong>
              <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                {(productGroups[item.content] ?? []).slice(0, 8).map((product) => (
                  <Link
                    key={product.id}
                    href={product.href}
                    style={{
                      minWidth: Math.max(68, 92 * contentScale),
                      border: "1px solid rgba(255,255,255,0.4)",
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "rgba(0,0,0,0.12)",
                    }}
                  >
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt=""
                        style={{
                          width: "100%",
                          height: Math.max(52, 72 * contentScale),
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : null}
                    <div style={{ padding: Math.max(4, 6 * contentScale), fontSize: `${Math.max(10, 11.5 * contentScale)}px` }}>
                      {product.title}
                    </div>
                  </Link>
                ))}
                {!productGroups[item.content]?.length ? (
                  <div style={{ fontSize: "0.82rem", opacity: 0.85 }}>
                    {ui.productGroupEmpty}
                  </div>
                ) : null}
              </div>
            </div>
          ) : item.type === "story-viewed" ? (
            <HomeStoryItemsMini
              locale={locale}
              mode="viewed"
              emptyViewed={ui.noViewedItems}
              emptySearched={ui.noSearchHistory}
              scale={contentScale}
            />
          ) : item.type === "story-searched" ? (
            <HomeStoryItemsMini
              locale={locale}
              mode="searched"
              emptyViewed={ui.noViewedItems}
              emptySearched={ui.noSearchHistory}
              scale={contentScale}
            />
          ) : item.type === "comments" ? (
            <HomeCommentsBlock
              raw={item.content}
              fallbackName={ui.commentsFallbackName}
              fallbackText={ui.commentsFallbackText}
              scale={contentScale}
            />
          ) : (
            <div style={{ fontSize: scaledFontSize, fontWeight: item.fontWeight }}>{item.content}</div>
          );

        const inner = (
          <>
            {body}
            {editable ? (
              <button
                type="button"
                onMouseDown={(event) => startResizeElement(event, item)}
                style={{
                  position: "absolute",
                  right: 4,
                  bottom: 4,
                  width: 18,
                  height: 18,
                  border: "none",
                  borderRight: "2px solid #8f7762",
                  borderBottom: "2px solid #8f7762",
                  borderBottomRightRadius: 6,
                  background: "transparent",
                  cursor: "nwse-resize",
                }}
                aria-label="Resize block with mouse"
              />
            ) : null}
          </>
        );

        if (!editable && item.href) {
          return (
            <Link key={item.id} href={item.href} style={style}>
              {inner}
            </Link>
          );
        }
        return (
          <div
            key={item.id}
            style={style}
            onMouseDown={(event) => {
              onSelect?.(item.id);
              startDragElement(event, item);
            }}
          >
            {inner}
          </div>
        );
      })}
    </div>
  );

  if (!showChrome && !showFooterOverlay) return content;
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 10,
        overflow: "hidden",
        position: "relative",
        width: `min(100%, ${HOME_BUILDER_CONTENT_WIDTH}px)`,
        maxWidth: HOME_BUILDER_CONTENT_WIDTH,
      }}
    >
      {content}
      {showChrome ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            background: "#131313",
            color: "#fff",
            height: HOME_BUILDER_HEADER_HEIGHT,
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            pointerEvents: "none",
          }}
        >
          {ui.header}
        </div>
      ) : null}
      {showChrome ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            background: "#1f1f1f",
            color: "#fff",
            height: HOME_BUILDER_FOOTER_HEIGHT,
            display: "flex",
            alignItems: "flex-start",
            padding: "12px",
            pointerEvents: "none",
          }}
        >
          {ui.footer}
        </div>
      ) : null}
      {showFooterOverlay ? (
        <div
          style={{
            background: "#1f1f1f",
            color: "#fff",
            height: HOME_BUILDER_FOOTER_HEIGHT,
            display: "flex",
            alignItems: "flex-start",
            padding: "12px",
          }}
        >
          {ui.footer}
        </div>
      ) : null}
    </div>
  );
}
