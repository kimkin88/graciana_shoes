"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { localizeHref } from "@/i18n/routing";
import { LookTile } from "@/components/home/LookTile";
import { homeTileLabel, visibleTiles, type HeroLayout, type HomeMediaTile } from "@/lib/home/content";

type Props = {
  tiles: HomeMediaTile[];
  locale: Locale;
  layout: HeroLayout;
  labels: { previous: string; next: string };
};

function HeroPanels({ tiles, locale, className }: { tiles: HomeMediaTile[]; locale: Locale; className: string }) {
  return (
    <>
      {tiles.map((tile) => (
        <LookTile
          key={tile.id}
          href={localizeHref(tile.href || "/products", locale)}
          src={tile.src}
          video={tile.video || undefined}
          label={homeTileLabel(tile, locale)}
          className={className}
          objectPosition="center bottom"
        />
      ))}
    </>
  );
}

function HeroCarousel({
  tiles,
  locale,
  labels,
}: {
  tiles: HomeMediaTile[];
  locale: Locale;
  labels: { previous: string; next: string };
}) {
  const [index, setIndex] = useState(0);
  const count = tiles.length;
  const current = tiles[index] ?? tiles[0];
  if (!current) return null;

  function go(dir: -1 | 1) {
    setIndex((value) => (value + dir + count) % count);
  }

  return (
    <div className="home-hero-carousel">
      <LookTile
        href={localizeHref(current.href || "/products", locale)}
        src={current.src}
        video={current.video || undefined}
        label={homeTileLabel(current, locale)}
        className="home-hero-panel"
        objectPosition="center bottom"
      />
      {count > 1 ? (
        <>
          <button type="button" className="home-hero-nav home-hero-nav-prev" onClick={() => go(-1)}>
            {labels.previous}
          </button>
          <button type="button" className="home-hero-nav home-hero-nav-next" onClick={() => go(1)}>
            {labels.next}
          </button>
          <div className="home-hero-dots">
            {tiles.map((tile, dot) => (
              <button
                key={tile.id}
                type="button"
                aria-current={dot === index}
                className="home-hero-dot"
                onClick={() => setIndex(dot)}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

/** First-screen hero: columns, grid, carousel, or a sideways strip. */
export function HeroStage({ tiles, locale, layout, labels }: Props) {
  const visible = visibleTiles(tiles);
  const count = Math.min(3, visible.length);
  if (!count) return null;

  if (layout === "carousel") {
    return <HeroCarousel tiles={visible} locale={locale} labels={labels} />;
  }

  if (layout === "strip") {
    return (
      <div className="home-hero-strip">
        <HeroPanels tiles={visible} locale={locale} className="home-hero-panel" />
      </div>
    );
  }

  return (
    <div
      className="home-hero-fill"
      data-hero-layout={layout}
      data-hero-count={count}
    >
      <HeroPanels tiles={visible} locale={locale} className="home-hero-panel" />
    </div>
  );
}
