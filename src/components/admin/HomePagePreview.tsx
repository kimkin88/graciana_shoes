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
    max-width: ${({ $mobile }) => ($mobile ? "390px" : "100%")};
    background: ${({ theme }) => theme.colors.background};
    border: ${({ $mobile, theme }) => ($mobile ? `1px solid ${theme.colors.border}` : "none")};
    box-shadow: ${({ $mobile }) => ($mobile ? "0 18px 40px rgba(0,0,0,0.08)" : "none")};
    overflow: hidden;
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
