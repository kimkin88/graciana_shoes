"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { localizedPath } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import { useI18nOptional } from "@/context/locale-context";
import { productCardImage } from "@/lib/products/media";
import { HorizontalScroll } from "@/components/ui/ScrollArea";
import { Money } from "@/components/money/Money";

type RecentRow = {
  id: string;
  slug: string;
  name_ru: string;
  name_en: string;
  price_cents: number;
  currency: string;
  image_url: string | null;
  image_optimized_path?: string | null;
  updated_at: string;
};

const KEY = "graciana-recent-product-ids";

export function RecentlyViewedStory({
  locale,
  dict,
  title,
}: {
  locale: Locale;
  dict: Messages;
  title?: string;
}) {
  const i18n = useI18nOptional();
  const liveLocale = i18n?.locale ?? locale;
  const [items, setItems] = useState<RecentRow[]>([]);

  useEffect(() => {
    async function run() {
      try {
        const raw = window.localStorage.getItem(KEY);
        const ids = raw ? (JSON.parse(raw) as string[]) : [];
        if (!ids.length) return;
        const res = await fetch("/api/products/for-cart", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ids }),
        });
        if (!res.ok) return;
        const map = (await res.json()) as Record<string, RecentRow>;
        setItems(ids.map((id) => map[id]).filter(Boolean));
      } catch {
        // ignore client fetch issues
      }
    }
    void run();
  }, []);

  if (!items.length) return null;

  return (
    <section>
      <h2 className="home-section-title" style={{ marginBottom: 18 }}>{title ?? dict.home.recentlyViewed}</h2>
      <HorizontalScroll>
        {items.map((p) => (
          <Link
            key={p.id}
            href={localizedPath(`/products/${p.slug}`, liveLocale)}
            style={{ minWidth: 180, maxWidth: 180, color: "inherit" }}
          >
            {productCardImage(p) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={productCardImage(p) ?? ""}
                alt=""
                width={180}
                height={240}
                loading="lazy"
                style={{
                  width: "100%",
                  height: 240,
                  objectFit: "contain",
                  objectPosition: "center",
                  display: "block",
                  background: "color-mix(in srgb, var(--page-text-muted, #999) 12%, transparent)",
                }}
              />
            ) : (
              <div style={{ height: 240, background: "var(--page-text-muted)" }} />
            )}
            <div style={{ paddingTop: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>
                {liveLocale === "en" ? p.name_en || p.name_ru : p.name_ru}
              </div>
              <div style={{ marginTop: 6, fontSize: 14, fontWeight: 600, color: "var(--page-text)" }}>
                <Money cents={p.price_cents} currency={p.currency} locale={liveLocale} />
              </div>
            </div>
          </Link>
        ))}
      </HorizontalScroll>
    </section>
  );
}
