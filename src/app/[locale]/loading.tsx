"use client";

import styled, { keyframes } from "styled-components";

const pulse = keyframes`
  0%, 100% { opacity: 0.28; }
  50% { opacity: 0.55; }
`;

const Wrap = styled.div`
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px clamp(16px, 4vw, 40px);
  opacity: 0;
  animation: fadeIn 0.35s ease forwards;
  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    animation: none;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 10px;
  width: 100%;
  @media (min-width: 900px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (min-width: 1100px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const Card = styled.div`
  display: grid;
  gap: 10px;
`;

const Media = styled.div`
  aspect-ratio: 3 / 4;
  background: color-mix(in srgb, var(--page-text-muted, #999) 18%, transparent);
  animation: ${pulse} 1.4s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Line = styled.div<{ $w?: string }>`
  height: 11px;
  width: ${({ $w }) => $w ?? "70%"};
  background: color-mix(in srgb, var(--page-text-muted, #999) 18%, transparent);
  animation: ${pulse} 1.4s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export default function Loading() {
  return (
    <Wrap aria-busy="true" aria-label="Loading">
      <Grid>
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <Media />
            <Line $w="55%" />
            <Line $w="32%" />
            <Line $w="100%" style={{ height: 40 }} />
          </Card>
        ))}
      </Grid>
    </Wrap>
  );
}
