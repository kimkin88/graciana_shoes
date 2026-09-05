"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import { AppScrollArea } from "@/components/ui/ScrollArea";

const Wrap = styled.div<{ $withThumbs?: boolean }>`
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
  @media (min-width: 900px) {
    grid-template-columns: ${({ $withThumbs }) => ($withThumbs ? "72px minmax(0, 1fr)" : "1fr")};
    gap: 16px;
    align-items: start;
  }
`;

const ThumbsCol = styled.div`
  display: none;
  @media (min-width: 900px) {
    display: block;
    max-height: min(72vh, 640px);
  }
`;

const ThumbStack = styled.div`
  display: grid;
  gap: 10px;
  padding-right: 4px;
`;

const Thumb = styled.button<{ $active?: boolean }>`
  width: 72px;
  height: 90px;
  padding: 0;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.text : theme.colors.border)};
  background: ${({ theme }) => theme.colors.accent};
  cursor: pointer;
  position: relative;
  overflow: hidden;
  opacity: ${({ $active }) => ($active ? 1 : 0.72)};
  transition: opacity 0.2s ease, border-color 0.2s ease;
  &:hover {
    opacity: 1;
  }
`;

const MobileThumbs = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 12px 0 2px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  @media (min-width: 900px) {
    display: none;
  }
`;

const Stage = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.accent};
  touch-action: pan-y;
  @media (min-width: 760px) {
    aspect-ratio: 4 / 5;
    max-height: min(72vh, 640px);
  }
`;

const Slide = styled(motion.div)`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
`;

const NavBtn = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.md};
  background: color-mix(in srgb, ${({ theme }) => theme.colors.background} 72%, transparent);
  color: ${({ theme }) => theme.colors.textMuted};
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: color 0.18s ease, background 0.18s ease;
  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: color-mix(in srgb, ${({ theme }) => theme.colors.background} 92%, transparent);
  }
  &:disabled {
    opacity: 0.25;
    cursor: default;
  }
`;

const Prev = styled(NavBtn)`
  left: 8px;
`;

const Next = styled(NavBtn)`
  right: 8px;
`;

const ExpandBtn = styled.button`
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 2;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.md};
  background: color-mix(in srgb, ${({ theme }) => theme.colors.background} 82%, transparent);
  color: ${({ theme }) => theme.colors.textMuted};
  display: grid;
  place-items: center;
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Dots = styled.div`
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  gap: 6px;
  pointer-events: none;
  @media (min-width: 900px) {
    display: none;
  }
`;

const Dot = styled.span<{ $active?: boolean }>`
  width: ${({ $active }) => ($active ? "16px" : "6px")};
  height: 6px;
  border-radius: 999px;
  background: ${({ theme, $active }) => ($active ? theme.colors.text : theme.colors.textMuted)};
  opacity: ${({ $active }) => ($active ? 0.9 : 0.35)};
  transition: width 0.28s ease, opacity 0.28s ease, background 0.28s ease;
`;

const Lightbox = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgb(0 0 0 / 90%);
  display: grid;
  place-items: center;
  padding: max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom));
`;

const LightboxFrame = styled(motion.div)`
  position: relative;
  width: min(1400px, 96vw);
  max-height: 92vh;
  display: grid;
  place-items: center;
`;

const LightboxImg = styled(motion.img)`
  max-width: min(1400px, 96vw);
  max-height: 92vh;
  object-fit: contain;
  user-select: none;
`;

const LightboxClose = styled.button`
  position: absolute;
  top: max(12px, env(safe-area-inset-top));
  right: 12px;
  z-index: 2;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.md};
  background: rgb(255 255 255 / 10%);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  &:hover {
    background: rgb(255 255 255 / 18%);
  }
`;

const LightboxNav = styled.button<{ $side: "left" | "right" }>`
  position: absolute;
  top: 50%;
  ${({ $side }) => ($side === "left" ? "left: 12px;" : "right: 12px;")}
  transform: translateY(-50%);
  z-index: 2;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.md};
  background: rgb(255 255 255 / 10%);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.18s ease;
  &:hover {
    background: rgb(255 255 255 / 18%);
  }
  &:disabled {
    opacity: 0.25;
    cursor: default;
  }
`;

type MediaItem = { kind: "image" | "video"; url: string };

type Props = {
  images: string[];
  videos?: string[];
  videoUrl: string | null;
  title: string;
  labels?: {
    prev: string;
    next: string;
    expand: string;
  };
};

function slideVariants(dir: number, reduce: boolean | null) {
  if (reduce) {
    return {
      enter: { opacity: 0 },
      center: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return {
    enter: { opacity: 0, x: dir > 0 ? 56 : -56, scale: 0.985 },
    center: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: dir > 0 ? -40 : 40, scale: 0.99 },
  };
}

export function ProductMediaGallery({ images, videos = [], videoUrl, title, labels }: Props) {
  const items = useMemo(() => {
    const list: MediaItem[] = [];
    for (const url of images) {
      if (url) list.push({ kind: "image", url });
    }
    const videoList = [...videos, videoUrl ?? ""].filter(Boolean);
    for (const url of [...new Set(videoList)]) {
      list.push({ kind: "video", url });
    }
    return list;
  }, [images, videos, videoUrl]);

  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);
  const [open, setOpen] = useState(false);
  const startX = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const current = items[active];
  const variants = slideVariants(direction, reduceMotion);

  useEffect(() => {
    setActive(0);
    setDirection(0);
  }, [images.join("|"), videoUrl]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items.length]);

  if (!items.length) {
    return <Stage aria-label={title} />;
  }

  function select(idx: number) {
    setDirection(idx > active ? 1 : -1);
    setActive(idx);
  }

  function go(dir: -1 | 1) {
    setActive((v) => {
      const next = Math.max(0, Math.min(items.length - 1, v + dir));
      setDirection(dir);
      return next;
    });
  }

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current == null) return;
    const end = e.changedTouches[0]?.clientX ?? startX.current;
    const delta = end - startX.current;
    startX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) go(1);
    if (delta > 0) go(-1);
  }

  const thumbs = items.map((item, idx) => (
    <Thumb
      key={`${item.kind}-thumb-${idx}`}
      type="button"
      $active={active === idx}
      onClick={() => select(idx)}
      aria-label={item.kind === "video" ? "Video" : `Image ${idx + 1}`}
      aria-current={active === idx}
    >
      {item.kind === "image" ? (
        <OptimizedImage src={item.url} alt="" sizes="72px" objectFit="contain" />
      ) : (
        <span style={{ fontSize: 11, letterSpacing: "0.08em" }}>VIDEO</span>
      )}
    </Thumb>
  ));

  const mediaNode = (item: MediaItem, priority?: boolean) =>
    item.kind === "image" ? (
      <OptimizedImage
        src={item.url}
        alt={title}
        sizes="(max-width: 900px) 100vw, 50vw"
        priority={priority}
        objectFit="contain"
      />
    ) : (
      <video
        src={item.url}
        controls
        playsInline
        poster={images[0] ?? undefined}
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
      />
    );

  return (
    <div>
      <Wrap $withThumbs={items.length > 1}>
        {items.length > 1 ? (
          <ThumbsCol>
            <AppScrollArea style={{ maxHeight: "min(72vh, 640px)" }}>
              <ThumbStack>{thumbs}</ThumbStack>
            </AppScrollArea>
          </ThumbsCol>
        ) : null}

        <Stage onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} role="img" aria-label={title}>
          <AnimatePresence initial={false} custom={direction}>
            <Slide
              key={`${current.kind}-${current.url}-${active}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduceMotion ? 0.12 : 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              {mediaNode(current, active === 0)}
            </Slide>
          </AnimatePresence>

          {items.length > 1 ? (
            <>
              <Prev
                type="button"
                aria-label={labels?.prev ?? "Previous"}
                disabled={active === 0}
                onClick={() => go(-1)}
              >
                <ChevronLeft size={22} strokeWidth={1.5} />
              </Prev>
              <Next
                type="button"
                aria-label={labels?.next ?? "Next"}
                disabled={active === items.length - 1}
                onClick={() => go(1)}
              >
                <ChevronRight size={22} strokeWidth={1.5} />
              </Next>
              <Dots aria-hidden>
                {items.map((_, idx) => (
                  <Dot key={idx} $active={idx === active} />
                ))}
              </Dots>
            </>
          ) : null}

          {current.kind === "image" ? (
            <ExpandBtn
              type="button"
              aria-label={labels?.expand ?? "Expand"}
              onClick={() => setOpen(true)}
            >
              <Expand size={16} strokeWidth={1.6} />
            </ExpandBtn>
          ) : null}
        </Stage>
      </Wrap>

      {items.length > 1 ? <MobileThumbs>{thumbs}</MobileThumbs> : null}

      <AnimatePresence>
        {open && current.kind === "image" ? (
          <Lightbox
            key="lightbox"
            role="dialog"
            aria-label={title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setOpen(false)}
          >
            <LightboxClose
              type="button"
              aria-label="Close"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            >
              <X size={18} strokeWidth={1.6} />
            </LightboxClose>
            {items.length > 1 ? (
              <>
                <LightboxNav
                  type="button"
                  $side="left"
                  aria-label={labels?.prev ?? "Previous"}
                  disabled={active === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                >
                  <ChevronLeft size={22} strokeWidth={1.5} />
                </LightboxNav>
                <LightboxNav
                  type="button"
                  $side="right"
                  aria-label={labels?.next ?? "Next"}
                  disabled={active === items.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                >
                  <ChevronRight size={22} strokeWidth={1.5} />
                </LightboxNav>
              </>
            ) : null}
            <LightboxFrame onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait" initial={false}>
                <LightboxImg
                  key={current.url}
                  src={current.url}
                  alt={title}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                />
              </AnimatePresence>
            </LightboxFrame>
          </Lightbox>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
