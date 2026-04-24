"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { localizedPath } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import { formatMoney } from "@/lib/format/money";

type RecentRow = {
  id: string;
  slug: string;
  name_ru: string;
  name_en: string;
  price_cents: number;
  currency: string;
  image_url: string | null;
};

const KEY = "graciana-recent-product-ids";

export function RecentlyViewedStory({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Messages;
}) {
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
        const rows = ids.map((id) => map[id]).filter(Boolean);
        setItems(rows);
      } catch {
        // ignore client fetch issues
      }
    }
    void run();
  }, []);

  if (!items.length) return null;

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{dict.home.recentlyViewed}</h2>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
        {items.map((p) => (
          <Link
            key={p.id}
            href={localizedPath(`/products/${p.slug}`, locale)}
            style={{
              minWidth: 180,
              maxWidth: 180,
              border: "1px solid #d6ccc1",
              borderRadius: 12,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image_url}
                alt=""
                width={180}
                height={130}
                style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }}
              />
            ) : null}
            <div style={{ padding: 10 }}>
              <div style={{ fontSize: 13, lineHeight: 1.35 }}>
                {locale === "en" ? p.name_en || p.name_ru : p.name_ru}
              </div>
              <div style={{ marginTop: 6, fontWeight: 600, fontSize: 13 }}>
                {formatMoney(p.price_cents, p.currency, locale)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
