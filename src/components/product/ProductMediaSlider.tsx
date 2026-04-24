"use client";

import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { ChevronLeftIcon, ChevronRightIcon, VideoIcon } from "@radix-ui/react-icons";
import styled from "styled-components";

const Wrap = styled.div`
  position: relative;
`;

const Arrow = styled.button<{ $left?: boolean }>`
  position: absolute;
  top: 50%;
  ${({ $left }) => ($left ? "left: 8px;" : "right: 8px;")}
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgb(15 23 42 / 70%);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
`;

type Props = {
  imageUrl: string | null;
  videoUrl: string | null;
  alt: string;
};

export function ProductMediaSlider({ imageUrl, videoUrl, alt }: Props) {
  const media = [imageUrl, videoUrl].filter(Boolean) as string[];
  const [ref, slider] = useKeenSlider<HTMLDivElement>({
    loop: media.length > 1,
    slideChanged(s) {
      // keep internal for next/prev controls only
      void s.track.details.rel;
    },
    animation: {
      duration: 650,
      easing: (t) => 1 + --t * t * t * t * t,
    },
  });

  if (!media.length) return null;

  return (
    <Wrap>
      <div ref={ref} className="keen-slider">
        {media.map((url, idx) => (
          <div key={`${url}-${idx}`} className="keen-slider__slide">
            {idx === 1 && videoUrl ? (
              <div
                style={{
                  width: "100%",
                  height: 200,
                  display: "grid",
                  placeItems: "center",
                  background: "#0f172a",
                  color: "#fff",
                }}
              >
                <VideoIcon width={30} height={30} />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt={alt}
                width={640}
                height={360}
                style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
              />
            )}
          </div>
        ))}
      </div>
      {media.length > 1 ? (
        <>
          <Arrow
            $left
            type="button"
            aria-label="Previous media"
            onClick={() => slider.current?.prev()}
          >
            <ChevronLeftIcon />
          </Arrow>
          <Arrow
            type="button"
            aria-label="Next media"
            onClick={() => slider.current?.next()}
          >
            <ChevronRightIcon />
          </Arrow>
        </>
      ) : null}
    </Wrap>
  );
}
