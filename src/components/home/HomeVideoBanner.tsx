"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type Props = {
  href: string;
  poster: string;
  video: string;
  label: string;
};

export function HomeVideoBanner({ href, poster, video, label }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void node.play().catch(() => undefined);
        else node.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <Link href={href} className="home-video-banner" aria-label={label}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt="" />
      <video ref={videoRef} src={video} muted loop playsInline preload="metadata" poster={poster} />
      <span className="home-hero-cta">{label}</span>
    </Link>
  );
}
