"use client";

import { useState } from "react";

type Props = {
  sources: string[];
  width?: number;
  height?: number;
};

export function AdminProductThumb({ sources, width = 48, height = 60 }: Props) {
  const [index, setIndex] = useState(0);
  const src = sources[index] ?? null;

  if (!src) {
    return (
      <span
        aria-hidden
        style={{
          display: "block",
          width,
          height,
          background: "color-mix(in srgb, var(--page-text-muted, #999) 12%, transparent)",
          border: "1px solid var(--page-border, #d6d1c8)",
        }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => setIndex((current) => current + 1)}
      style={{
        width,
        height,
        objectFit: "cover",
        display: "block",
        background: "#f4f4f4",
        border: "1px solid var(--page-border, #d6d1c8)",
      }}
    />
  );
}
