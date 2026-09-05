"use client";

import { useRef, useState } from "react";
import styled from "styled-components";
import { OptimizedImage } from "@/components/media/OptimizedImage";

const Frame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: color-mix(in srgb, ${({ theme }) => theme.colors.text} 5%, ${({ theme }) => theme.colors.surface});
`;

const Layer = styled.div<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    display: block;
    transform: scale(1.001);
    transition: transform 0.55s ease;
  }
  &[data-zoom="true"] img,
  &[data-zoom="true"] video {
    transform: scale(1.04);
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    img,
    video {
      transition: none;
      transform: none;
    }
    &[data-zoom="true"] img,
    &[data-zoom="true"] video {
      transform: none;
    }
  }
`;

const VideoEl = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  opacity: 0;
  transition: opacity 0.28s ease;
  &[data-active="true"] {
    opacity: 1;
  }
`;

type Props = {
  imageUrl: string | null;
  hoverImageUrl?: string | null;
  videoUrl: string | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
  zoom?: boolean;
};

export function ProductCardMedia({
  imageUrl,
  hoverImageUrl,
  videoUrl,
  alt,
  sizes,
  priority,
  zoom = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hover, setHover] = useState(false);
  const showSecond = Boolean(hover && hoverImageUrl && !videoUrl);

  function onEnter() {
    setHover(true);
    const node = videoRef.current;
    if (!node) return;
    void node.play().catch(() => undefined);
  }

  function onLeave() {
    setHover(false);
    const node = videoRef.current;
    if (!node) return;
    node.pause();
    node.currentTime = 0;
  }

  return (
    <Frame onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <Layer $visible={!showSecond} data-zoom={zoom && hover && !showSecond ? "true" : undefined}>
        <OptimizedImage src={imageUrl} alt={alt} sizes={sizes} priority={priority} objectFit="contain" />
      </Layer>
      {hoverImageUrl ? (
        <Layer $visible={showSecond} aria-hidden={!showSecond}>
          <OptimizedImage src={hoverImageUrl} alt="" sizes={sizes} objectFit="contain" />
        </Layer>
      ) : null}
      {videoUrl ? (
        <VideoEl
          ref={videoRef}
          src={videoUrl}
          muted
          loop
          playsInline
          preload="none"
          poster={imageUrl ?? undefined}
          data-active={hover}
        />
      ) : null}
    </Frame>
  );
}
