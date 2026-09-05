"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import styled from "styled-components";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";

const Root = styled(ScrollAreaPrimitive.Root)`
  overflow: hidden;
  --scrollbar-size: 7px;
`;

const Viewport = styled(ScrollAreaPrimitive.Viewport)<{
  $orientation: "vertical" | "horizontal" | "both";
}>`
  width: 100%;
  height: ${({ $orientation }) => ($orientation === "horizontal" ? "auto" : "100%")};
  max-height: inherit;
  border-radius: inherit;
  ${({ $orientation }) =>
    $orientation === "horizontal"
      ? `
    overscroll-behavior-x: contain;
    overscroll-behavior-y: auto;
    scroll-behavior: auto;
  `
      : `
    overscroll-behavior: contain;
    scroll-behavior: smooth;
  `}
  @media (prefers-reduced-motion: reduce) {
    scroll-behavior: auto !important;
  }
  > div {
    ${({ $orientation }) =>
      $orientation === "horizontal"
        ? "display: block !important; min-width: 100%; width: max-content;"
        : "display: block !important; min-height: 100%;"}
  }
`;

const Scrollbar = styled(ScrollAreaPrimitive.Scrollbar)`
  display: flex;
  user-select: none;
  touch-action: none;
  padding: 2px;
  background: transparent;
  transition: background 0.16s ease;
  &:hover {
    background: rgb(0 0 0 / 4%);
  }
  &[data-orientation="vertical"] {
    width: var(--scrollbar-size);
  }
  &[data-orientation="horizontal"] {
    flex-direction: column;
    height: var(--scrollbar-size);
  }
`;

const Thumb = styled(ScrollAreaPrimitive.Thumb)`
  flex: 1;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 99px;
  position: relative;
`;

type Props = {
  children: ReactNode;
  orientation?: "vertical" | "horizontal" | "both";
  style?: CSSProperties;
  viewportStyle?: CSSProperties;
  viewportRef?: Ref<HTMLDivElement>;
  className?: string;
};

export function AppScrollArea({
  children,
  orientation = "vertical",
  style,
  viewportStyle,
  viewportRef,
  className,
}: Props) {
  return (
    <Root type="scroll" style={style} className={className} scrollHideDelay={400}>
      <Viewport ref={viewportRef} $orientation={orientation} style={viewportStyle}>
        {children}
      </Viewport>
      {orientation !== "horizontal" ? (
        <Scrollbar orientation="vertical">
          <Thumb />
        </Scrollbar>
      ) : null}
      {orientation !== "vertical" ? (
        <Scrollbar orientation="horizontal">
          <Thumb />
        </Scrollbar>
      ) : null}
      <ScrollAreaPrimitive.Corner />
    </Root>
  );
}

type PageScrollApi = {
  scrollBy: (deltaY: number) => void;
  getViewport: () => HTMLDivElement | null;
};

const PageScrollContext = createContext<PageScrollApi | null>(null);

export function usePageScroll() {
  return useContext(PageScrollContext);
}

/** Scroll the page shell (Radix viewport) or fall back to window. */
export function scrollPageBy(deltaY: number, api?: PageScrollApi | null) {
  if (api) {
    api.scrollBy(deltaY);
    return;
  }
  const smooth =
    typeof window !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollBy({ top: deltaY, left: 0, behavior: smooth ? "smooth" : "auto" });
}

const PageRoot = styled(Root)`
  height: 100dvh;
  width: 100%;
`;

function preferReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Full-page Radix scroll shell — keeps sticky header / layout styles intact. */
export function PageScrollShell({ children }: { children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef(0);
  const targetRef = useRef(0);
  const rafRef = useRef(0);

  const scrollBy = useCallback((deltaY: number) => {
    const el = viewportRef.current;
    if (!el) return;

    if (preferReducedMotion()) {
      el.scrollTop += deltaY;
      currentRef.current = el.scrollTop;
      targetRef.current = el.scrollTop;
      return;
    }

    const max = Math.max(0, el.scrollHeight - el.clientHeight);
    if (!rafRef.current) {
      currentRef.current = el.scrollTop;
      targetRef.current = el.scrollTop;
    }
    targetRef.current = Math.max(0, Math.min(max, targetRef.current + deltaY));

    const tick = () => {
      const node = viewportRef.current;
      if (!node) {
        rafRef.current = 0;
        return;
      }
      currentRef.current += (targetRef.current - currentRef.current) * 0.16;
      if (Math.abs(targetRef.current - currentRef.current) < 0.4) {
        currentRef.current = targetRef.current;
        node.scrollTop = currentRef.current;
        rafRef.current = 0;
        return;
      }
      node.scrollTop = currentRef.current;
      rafRef.current = requestAnimationFrame(tick);
    };

    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const viewport = el;

    function onWheel(event: WheelEvent) {
      if (preferReducedMotion()) return;
      // Soften discrete mouse-wheel steps; leave pixel trackpad scrolling native.
      if (event.deltaMode === 0) return;
      if (event.ctrlKey) return;
      event.preventDefault();
      let delta = event.deltaY;
      if (event.deltaMode === 1) delta *= 16;
      else if (event.deltaMode === 2) delta *= viewport.clientHeight * 0.85;
      scrollBy(delta);
    }

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [scrollBy]);

  const api = useMemo<PageScrollApi>(
    () => ({
      scrollBy,
      getViewport: () => viewportRef.current,
    }),
    [scrollBy],
  );

  return (
    <PageScrollContext.Provider value={api}>
      <PageRoot type="scroll" scrollHideDelay={600}>
        <Viewport ref={viewportRef} $orientation="vertical" data-page-scroll="true">
          {children}
        </Viewport>
        <Scrollbar orientation="vertical">
          <Thumb />
        </Scrollbar>
        <ScrollAreaPrimitive.Corner />
      </PageRoot>
    </PageScrollContext.Provider>
  );
}

export function TableScroll({ children }: { children: ReactNode }) {
  return (
    <AppScrollArea orientation="horizontal" style={{ width: "100%" }}>
      {children}
    </AppScrollArea>
  );
}

export function HorizontalScroll({
  children,
  gap = 14,
}: {
  children: ReactNode;
  gap?: number;
}) {
  const viewRef = useRef<HTMLDivElement>(null);
  const pageScroll = usePageScroll();

  useEffect(() => {
    const scroller = viewRef.current;
    if (!scroller) return;

    function onWheel(event: WheelEvent) {
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      event.preventDefault();
      scrollPageBy(event.deltaY, pageScroll);
    }

    scroller.addEventListener("wheel", onWheel, { passive: false });
    return () => scroller.removeEventListener("wheel", onWheel);
  }, [pageScroll]);

  return (
    <AppScrollArea
      orientation="horizontal"
      style={{ width: "100%" }}
      viewportRef={viewRef}
      viewportStyle={{ paddingBottom: 8 }}
    >
      <div style={{ display: "flex", gap }}>{children}</div>
    </AppScrollArea>
  );
}

export function WheelLockHScroll({
  children,
  className,
  lockOnHover = false,
  lead,
}: {
  children: ReactNode;
  className?: string;
  lockOnHover?: boolean;
  lead?: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const pageScroll = usePageScroll();

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewRef.current;
    if (!track || !viewport) return;
    const scroller = viewport;

    let current = scroller.scrollLeft;
    let target = scroller.scrollLeft;
    let raf = 0;
    let animating = false;
    let hovering = !lockOnHover;

    const maxScroll = () => Math.max(0, scroller.scrollWidth - scroller.clientWidth);

    const tick = () => {
      const max = maxScroll();
      target = Math.max(0, Math.min(max, target));
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.35) current = target;
      scroller.scrollLeft = current;
      if (current !== target) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        animating = false;
      }
    };

    function onWheel(event: WheelEvent) {
      if (lockOnHover && !hovering) return;
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

      const max = maxScroll();
      if (max <= 1) return;

      if (!lockOnHover) {
        const pageViewport = pageScroll?.getViewport() ?? null;
        const boundsRoot = pageViewport ?? document.documentElement;
        const rootRect = boundsRoot.getBoundingClientRect?.() ?? {
          top: 0,
          height: window.innerHeight,
        };
        const rect = scroller.getBoundingClientRect();
        const top = "top" in rootRect ? rootRect.top : 0;
        const height = "height" in rootRect ? rootRect.height : window.innerHeight;
        const inBand = rect.top < top + height * 0.78 && rect.bottom > top + height * 0.22;
        if (!inBand) return;
      }

      let delta = event.deltaY;
      if (event.deltaMode === 1) delta *= 16;
      else if (event.deltaMode === 2) delta *= scroller.clientWidth * 0.75;
      delta *= 0.55;

      const left = scroller.scrollLeft;
      if (!animating) {
        current = left;
        target = left;
      }

      const edge = 2;
      const goingEnd = delta > 0;
      const goingStart = delta < 0;
      const atEnd = left >= max - edge && target >= max - edge;
      const atStart = left <= edge && target <= edge;

      if ((goingEnd && atEnd) || (goingStart && atStart)) {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
          animating = false;
        }
        current = left;
        target = left;
        // Forward vertical wheel to the page Radix viewport (html no longer scrolls).
        event.preventDefault();
        scrollPageBy(event.deltaY, pageScroll);
        return;
      }

      event.preventDefault();
      target = Math.max(0, Math.min(max, target + delta));
      if (!raf) {
        animating = true;
        raf = requestAnimationFrame(tick);
      }
    }

    const onScroll = () => {
      if (animating) return;
      current = scroller.scrollLeft;
      target = current;
    };

    const onEnter = () => {
      hovering = true;
    };
    const onLeave = () => {
      hovering = false;
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });

    if (lockOnHover) {
      track.addEventListener("pointerenter", onEnter);
      track.addEventListener("pointerleave", onLeave);
      track.addEventListener("wheel", onWheel, { passive: false });
      return () => {
        cancelAnimationFrame(raf);
        track.removeEventListener("pointerenter", onEnter);
        track.removeEventListener("pointerleave", onLeave);
        track.removeEventListener("wheel", onWheel);
        scroller.removeEventListener("scroll", onScroll);
      };
    }

    // Listen on the page viewport (or window) so vertical release still works.
    const wheelTarget: EventTarget = pageScroll?.getViewport() ?? window;
    wheelTarget.addEventListener("wheel", onWheel as EventListener, { passive: false } as AddEventListenerOptions);
    return () => {
      cancelAnimationFrame(raf);
      wheelTarget.removeEventListener("wheel", onWheel as EventListener);
      scroller.removeEventListener("scroll", onScroll);
    };
  }, [lockOnHover, pageScroll]);

  return (
    <div>
      {lead}
      <div ref={trackRef}>
        <AppScrollArea
          orientation="horizontal"
          style={{ width: "100%" }}
          viewportRef={viewRef}
          viewportStyle={{ paddingBottom: 10 }}
        >
          <div className={className ?? "home-hrow"}>{children}</div>
        </AppScrollArea>
      </div>
    </div>
  );
}
