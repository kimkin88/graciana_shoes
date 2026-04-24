"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { localizedPath } from "@/i18n/routing";

type ViewedRow = {
  id: string;
  slug: string;
  name_ru: string;
  name_en: string;
  image_url: string | null;
};

const VIEWED_KEY = "graciana-recent-product-ids";
const SEARCH_KEY = "graciana-search-history";

export function HomeStoryItemsMini({
  locale,
  mode,
  emptyViewed = "No viewed items yet.",
  emptySearched = "No search history yet.",
  scale = 1,
}: {
  locale: string;
  mode: "viewed" | "searched";
  emptyViewed?: string;
  emptySearched?: string;
  scale?: number;
}) {
  const safeScale = Math.max(0.62, Math.min(1, scale));
  const [viewed, setViewed] = useState<ViewedRow[]>([]);
  const [searches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const parsed = JSON.parse(window.localStorage.getItem(SEARCH_KEY) || "[]") as string[];
      return parsed.filter(Boolean).slice(0, 8);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (mode === "searched") return;

    async function loadViewed() {
      try {
        const ids = JSON.parse(window.localStorage.getItem(VIEWED_KEY) || "[]") as string[];
        if (!ids.length) return;
        const res = await fetch("/api/products/for-cart", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ids }),
        });
        if (!res.ok) return;
        const map = (await res.json()) as Record<string, ViewedRow>;
        setViewed(ids.map((id) => map[id]).filter(Boolean).slice(0, 8));
      } catch {
        setViewed([]);
      }
    }

    void loadViewed();
  }, [mode]);

  if (mode === "searched") {
    if (!searches.length) return <div style={{ fontSize: `${Math.max(11, 14 * safeScale)}px` }}>{emptySearched}</div>;
    return (
      <div style={{ display: "flex", gap: Math.max(6, 8 * safeScale), flexWrap: "wrap" }}>
        {searches.map((q) => (
          <Link
            key={q}
            href={`${localizedPath("/products", locale as "ru" | "en")}?q=${encodeURIComponent(q)}`}
            style={{
              border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: 999,
              padding: `${Math.max(4, 5 * safeScale)}px ${Math.max(8, 10 * safeScale)}px`,
              fontSize: `${Math.max(10, 13 * safeScale)}px`,
            }}
          >
            {q}
          </Link>
        ))}
      </div>
    );
  }

  if (!viewed.length) return <div style={{ fontSize: `${Math.max(11, 14 * safeScale)}px` }}>{emptyViewed}</div>;
  return (
    <div style={{ display: "flex", gap: Math.max(6, 8 * safeScale), overflowX: "auto" }}>
      {viewed.map((item) => (
        <Link
          key={item.id}
          href={localizedPath(`/products/${item.slug}`, locale as "ru" | "en")}
          style={{
            minWidth: Math.max(72, 96 * safeScale),
            border: "1px solid rgba(255,255,255,0.35)",
            borderRadius: 8,
            overflow: "hidden",
            background: "rgba(0,0,0,0.12)",
          }}
        >
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt="" style={{ width: "100%", height: Math.max(56, 76 * safeScale), objectFit: "cover", display: "block" }} />
          ) : null}
          <div style={{ padding: Math.max(4, 6 * safeScale), fontSize: `${Math.max(10, 12 * safeScale)}px` }}>
            {locale === "en" ? item.name_en || item.name_ru : item.name_ru}
          </div>
        </Link>
      ))}
    </div>
  );
}
