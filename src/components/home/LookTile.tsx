"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type Props = {
  href: string;
  src: string;
  label: string;
  video?: string;
  wide?: boolean;
  className?: string;
  objectPosition?: string;
};

export function LookTile({ href, src, label, video, wide, className, objectPosition = "center" }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !video) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void node.play().catch(() => undefined);
        else node.pause();
      },
      { threshold: 0.3 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [video]);

  return (
    <Link
      href={href}
      className={`home-tile${wide ? " home-tile-wide" : ""}${className ? ` ${className}` : ""}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label} style={{ objectPosition }} />
      ) : null}
      {video ? (
        <video ref={videoRef} src={video} muted loop playsInline preload="metadata" style={{ objectPosition }} />
      ) : null}
      {label ? <span className="home-tile-label">{label}</span> : null}
    </Link>
  );
}
