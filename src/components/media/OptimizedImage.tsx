"use client";

import Image from "next/image";

type Props = {
  src: string | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
  objectFit?: "cover" | "contain";
};

function isRemote(src: string) {
  return /^https?:\/\//i.test(src);
}

function canOptimize(src: string) {
  try {
    return new URL(src).hostname.endsWith("supabase.co");
  } catch {
    return false;
  }
}

export function OptimizedImage({
  src,
  alt,
  sizes = "(max-width: 700px) 100vw, 33vw",
  priority = false,
  objectFit = "cover",
}: Props) {
  if (!src) {
    return <div aria-hidden style={{ width: "100%", height: "100%", background: "var(--page-text-muted, #ddd)" }} />;
  }

  if (!isRemote(src) || !canOptimize(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        style={{ width: "100%", height: "100%", objectFit, objectPosition: "center", display: "block" }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
        style={{ objectFit, objectPosition: "center" }}
    />
  );
}
