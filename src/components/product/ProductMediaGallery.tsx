"use client";

import "keen-slider/keen-slider.min.css";
import { useMemo, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import ReactPlayer from "react-player";
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon } from "@radix-ui/react-icons";
import { motion, useReducedMotion } from "framer-motion";
import styled from "styled-components";

type MediaItem =
  | { kind: "image"; url: string }
  | { kind: "video"; url: string };

const Frame = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
`;

const Arrow = styled.button<{ $left?: boolean }>`
  position: absolute;
  top: 50%;
  ${({ $left }) => ($left ? "left: 12px;" : "right: 12px;")}
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgb(2 6 23 / 75%);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
`;

const Thumb = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0;
  overflow: hidden;
  height: 72px;
  cursor: pointer;
`;

const MediaImage = styled.img`
  width: 100%;
  height: clamp(240px, 52vw, 460px);
  object-fit: cover;
  display: block;
`;

type Props = {
  imageUrl: string | null;
  videoUrl: string | null;
  title: string;
};

export function ProductMediaGallery({ imageUrl, videoUrl, title }: Props) {
  const items = useMemo<MediaItem[]>(() => {
    const list: MediaItem[] = [];
    if (imageUrl) list.push({ kind: "image", url: imageUrl });
    if (videoUrl) list.push({ kind: "video", url: videoUrl });
    return list;
  }, [imageUrl, videoUrl]);
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();

  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(s) {
      setActive(s.track.details.rel);
    },
  });

  if (!items.length) return null;

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <Frame style={{ position: "relative" }}>
        <div ref={sliderRef} className="keen-slider">
          {items.map((item, idx) => (
            <div key={`${item.kind}-${idx}`} className="keen-slider__slide">
              {item.kind === "image" ? (
                <MediaImage src={item.url} alt={title} width={1000} height={800} />
              ) : (
                <div style={{ padding: 12 }}>
                  <ReactPlayer src={item.url} controls width="100%" height={436} />
                </div>
              )}
            </div>
          ))}
        </div>
        {items.length > 1 ? (
          <>
            <Arrow type="button" $left onClick={() => slider.current?.prev()} aria-label="Previous media">
              <ChevronLeftIcon />
            </Arrow>
            <Arrow type="button" onClick={() => slider.current?.next()} aria-label="Next media">
              <ChevronRightIcon />
            </Arrow>
          </>
        ) : null}
      </Frame>

      {items.length > 1 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 8 }}>
          {items.map((item, idx) => (
            <motion.div
              key={`thumb-${idx}`}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              transition={{ duration: 0.15 }}
            >
              <Thumb
                type="button"
                $active={active === idx}
                onClick={() => slider.current?.moveToIdx(idx)}
                aria-label={`Open ${item.kind} ${idx + 1}`}
              >
                {item.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt=""
                    width={140}
                    height={72}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
                    <PlayIcon />
                  </div>
                )}
              </Thumb>
            </motion.div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
