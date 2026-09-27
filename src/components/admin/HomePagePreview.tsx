"use client";

import { useEffect } from "react";
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
  background: ${({ theme }) => theme.colors.accent};
  padding: ${({ $mobile }) => ($mobile ? "18px 12px 40px" : "0 0 40px")};

  > .preview-scroll {
    height: 100%;
    min-height: 0;
  }

  .preview-frame {
    margin: 0 auto;
    width: 100%;
    max-width: ${({ $mobile }) => ($mobile ? "390px" : "1280px")};
    background: ${({ theme }) => theme.colors.background};
    border: ${({ $mobile, theme }) => ($mobile ? `1px solid ${theme.colors.border}` : "none")};
    box-shadow: ${({ $mobile }) => ($mobile ? "0 18px 40px rgba(0,0,0,0.08)" : "none")};
    overflow: hidden;
    container-type: inline-size;
    container-name: preview;
  }

  /* Layout follows the preview frame, not the browser window. */
  .preview-frame .home-first {
    height: auto;
    min-height: 0;
    max-height: none;
  }

  .preview-frame .home-hero-fill {
    height: auto;
    min-height: 280px;
  }

  .preview-frame .home-section-head h2,
  .preview-frame .home-section-title {
    font-size: clamp(1.7rem, 8cqi, 3.4rem);
  }

  .preview-frame .home-cat-tile.home-tile {
    flex: 0 0 min(38cqi, 240px);
    width: min(38cqi, 240px);
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
      min-height: min(68cqi, 520px);
    }
    .preview-frame .home-hero-fill > :nth-child(n + 2) {
      display: none;
    }
    .preview-frame .home-cat-tile.home-tile {
      flex: 0 0 72cqi;
      width: 72cqi;
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
      min-height: 420px;
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

  @container preview (min-width: 1100px) {
    .preview-frame .home-hero-fill {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      min-height: 520px;
    }
    .preview-frame .home-hero-fill > :nth-child(n) {
      display: block;
    }
    .preview-frame .product-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 28px 20px;
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

  if (!open) return null;

  return (
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
        <AppScrollArea className="preview-scroll" style={{ height: "100%" }}>
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
    </Overlay>
  );
}
