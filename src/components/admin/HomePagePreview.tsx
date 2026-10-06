"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import type { HomePageContent } from "@/lib/home/content";
import type { ProductRow } from "@/types";
import { HomeView } from "@/components/home/HomeView";
import { AdminButton } from "@/components/admin/AdminButtons";
import { AppScrollArea } from "@/components/ui/ScrollArea";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  background: ${({ theme }) => theme.colors.background};
`;

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

const Title = styled.div`
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

const Modes = styled.div`
  display: flex;
  gap: 6px;
`;

const ModeBtn = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.text};
  background: ${({ theme, $active }) => ($active ? theme.colors.text : "transparent")};
  color: ${({ theme, $active }) => ($active ? theme.colors.background : theme.colors.text)};
  padding: 8px 12px;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
`;

const Stage = styled.div<{ $mobile?: boolean }>`
  min-height: 0;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.accent};
  padding: 0;

  > .preview-scroll {
    position: relative;
    flex: 1 1 0%;
    min-height: 0;
    container-type: size;
    container-name: previewstage;
  }

  > .preview-scroll [data-radix-scroll-area-viewport] {
    position: absolute;
    inset: 0;
    height: auto;
    max-height: none;
  }

  .preview-frame {
    margin: 0 auto;
    width: 100%;
    max-width: ${({ $mobile }) => ($mobile ? "390px" : "none")};
    background: ${({ theme }) => theme.colors.background};
    border: ${({ $mobile, theme }) => ($mobile ? `1px solid ${theme.colors.border}` : "none")};
    box-shadow: ${({ $mobile }) => ($mobile ? "0 18px 40px rgba(0,0,0,0.08)" : "none")};
    overflow: visible;
    container-type: inline-size;
    container-name: preview;
  }

  /* Layout follows the preview frame, not the browser window. */
  .preview-frame .home-first {
    height: 100cqh;
    min-height: calc(100dvh - 140px);
    max-height: none;
    overflow: hidden;
  }

  .preview-frame .home-hero-fill,
  .preview-frame .home-hero-carousel,
  .preview-frame .home-hero-strip {
    height: 100%;
    min-height: 0;
  }

  .preview-frame .home-section-head h2,
  .preview-frame .home-section-title {
    font-size: clamp(1.7rem, 8cqi, 3.4rem);
  }

  .preview-frame .home-cat-tile.home-tile {
    flex: 0 0 min(38cqi, 240px);
    width: min(38cqi, 240px);
  }

  .preview-frame .home-cat-columns .home-cat-tile.home-tile,
  .preview-frame .home-cat-mosaic .home-cat-tile.home-tile,
  .preview-frame .home-cat-cards .home-cat-tile.home-tile {
    flex: none;
    width: 100%;
  }

  /* Override viewport @media category rules from GlobalStyles — preview uses container width. */
  .preview-frame .home-cat-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .preview-frame .home-cat-mosaic {
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: minmax(140px, 46cqi);
  }
  .preview-frame .home-cat-mosaic .home-cat-tile.home-tile:first-child {
    grid-column: 1 / -1;
    grid-row: auto;
    aspect-ratio: 16 / 9;
  }
  .preview-frame .home-cat-cards .home-cat-tile.home-tile {
    aspect-ratio: 2 / 1;
  }

  .preview-frame .home-rest {
    padding-right: clamp(16px, 4cqi, 40px);
    padding-left: clamp(16px, 4cqi, 40px);
  }
`;

const previewLayoutCss = `
  @container preview (max-width: 760px) {
    .preview-frame .home-hero-fill {
      grid-template-columns: 1fr;
      min-height: 0;
    }
    .preview-frame .home-hero-fill > :nth-child(n + 2) {
      display: none;
    }
    .preview-frame .home-first:has(.home-hero-fill[data-hero-layout="grid"]) {
      height: auto;
      min-height: 100cqh;
      overflow: visible;
    }
    .preview-frame .home-hero-fill[data-hero-layout="grid"] > .home-hero-panel {
      min-height: min(70cqh, 520px);
      height: auto;
    }
    .preview-frame .home-cat-tile.home-tile {
      flex: 0 0 72cqi;
      width: 72cqi;
    }
    .preview-frame .home-cat-columns .home-cat-tile.home-tile,
    .preview-frame .home-cat-mosaic .home-cat-tile.home-tile,
    .preview-frame .home-cat-cards .home-cat-tile.home-tile {
      flex: none;
      width: 100%;
    }
    .preview-frame .home-rest {
      padding: 8px 14px 0;
    }
    .preview-frame .product-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px 10px;
    }
    .preview-frame .home-section-head h2,
    .preview-frame .home-section-title {
      font-size: clamp(1.7rem, 12cqi, 2.6rem);
    }
  }

  @container preview (min-width: 761px) and (max-width: 1099px) {
    .preview-frame .home-hero-fill {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      min-height: 0;
    }
    .preview-frame .home-hero-fill > :nth-child(2) {
      display: block;
    }
    .preview-frame .home-hero-fill > :nth-child(n + 3) {
      display: none;
    }
    .preview-frame .product-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 26px 18px;
    }
  }

  @container preview (min-width: 900px) {
    .preview-frame .home-cat-columns {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .preview-frame .home-cat-mosaic {
      grid-template-columns: 1.5fr 1fr 1fr;
      grid-auto-rows: minmax(180px, 16cqi);
    }
    .preview-frame .home-cat-mosaic .home-cat-tile.home-tile:first-child {
      grid-column: auto;
      grid-row: span 2;
      aspect-ratio: auto;
    }
    .preview-frame .home-cat-cards .home-cat-tile.home-tile {
      aspect-ratio: 16 / 6;
    }
  }

  @container preview (min-width: 1100px) {
    .preview-frame .home-hero-fill {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      min-height: 0;
    }
    .preview-frame .home-hero-fill > :nth-child(n) {
      display: block;
    }
    .preview-frame .product-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 28px 20px;
    }
    .preview-frame .home-cat-columns {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    .preview-frame .home-cat-cards .home-cat-tile.home-tile {
      aspect-ratio: 16 / 5;
    }
  }

  .preview-frame .home-hero-fill[data-hero-count="1"] {
    grid-template-columns: 1fr;
  }
  .preview-frame .home-hero-fill[data-hero-count="1"] > :nth-child(n) {
    display: block;
  }
  @container preview (min-width: 761px) {
    .preview-frame .home-hero-fill[data-hero-count="1"] {
      grid-template-columns: 1fr;
    }
    .preview-frame .home-hero-fill[data-hero-count="2"] {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .preview-frame .home-hero-fill[data-hero-count="2"] > :nth-child(-n + 2) {
      display: block;
    }
    .preview-frame .home-hero-fill[data-hero-count="2"] > :nth-child(n + 3) {
      display: none;
    }
  }

  .preview-frame .home-hero-fill[data-hero-layout="grid"] > * {
    display: block;
  }
  .preview-frame .home-hero-fill[data-hero-layout="grid"] {
    grid-template-columns: 1fr;
    height: auto;
  }
  @container preview (min-width: 761px) {
    .preview-frame .home-hero-fill[data-hero-layout="grid"][data-hero-count="2"],
    .preview-frame .home-hero-fill[data-hero-layout="grid"][data-hero-count="3"] {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      height: 100%;
    }
    .preview-frame .home-hero-fill[data-hero-layout="grid"][data-hero-count="3"] > :nth-child(3) {
      grid-column: 1 / -1;
    }
  }
  @container preview (min-width: 1100px) {
    .preview-frame .home-hero-fill[data-hero-layout="grid"][data-hero-count="3"] {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .preview-frame .home-hero-fill[data-hero-layout="grid"][data-hero-count="3"] > :nth-child(3) {
      grid-column: auto;
    }
  }
`;

type Props = {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  dict: Messages;
  content: HomePageContent;
  products: ProductRow[];
  featured: ProductRow[];
  groups: Array<{ key: string; products: ProductRow[] }>;
  labels: {
    title: string;
    close: string;
    mobile: string;
    desktop: string;
    draftHint: string;
  };
  mode: "desktop" | "mobile";
  onModeChange: (mode: "desktop" | "mobile") => void;
};

/** Full homepage draft preview before saving content. */
export function HomePagePreview({
  open,
  onClose,
  locale,
  dict,
  content,
  products,
  featured,
  groups,
  labels,
  mode,
  onModeChange,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <Overlay role="dialog" aria-modal aria-label={labels.title}>
      <Bar>
        <div style={{ display: "grid", gap: 4 }}>
          <Title>{labels.title}</Title>
          <span style={{ fontSize: "0.82rem", color: "var(--page-text-muted)" }}>{labels.draftHint}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <Modes>
            <ModeBtn type="button" $active={mode === "desktop"} onClick={() => onModeChange("desktop")}>
              {labels.desktop}
            </ModeBtn>
            <ModeBtn type="button" $active={mode === "mobile"} onClick={() => onModeChange("mobile")}>
              {labels.mobile}
            </ModeBtn>
          </Modes>
          <AdminButton type="button" $variant="ghost" onClick={onClose}>
            {labels.close}
          </AdminButton>
        </div>
      </Bar>
      <style>{previewLayoutCss}</style>
      <Stage $mobile={mode === "mobile"}>
        <AppScrollArea className="preview-scroll">
          <div className="preview-frame">
            <HomeView
              locale={locale}
              dict={dict}
              content={content}
              products={products}
              featured={featured}
              groups={groups}
            />
          </div>
        </AppScrollArea>
      </Stage>
    </Overlay>,
    document.body,
  );
}
