"use client";

import styled, { keyframes } from "styled-components";
import Link from "next/link";

const dance = keyframes`
  0%, 100% { transform: translateY(0); }
  40% { transform: translateY(-1.5px); }
  70% { transform: translateY(0.5px); }
`;

const Brand = styled(Link)<{ $boxed?: boolean }>`
  display: inline-flex;
  color: inherit;
  text-decoration: none;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 0.78;
  }
  ${({ $boxed }) =>
    $boxed
      ? `
    border: 1px solid currentColor;
    padding: 0.42em 0.72em 0.36em;
  `
      : ""}
`;

const Stack = styled.span`
  display: grid;
  justify-items: center;
  gap: 5px;
`;

const Word = styled.span<{ $boxed?: boolean }>`
  display: inline-flex;
  max-width: 100%;
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ $boxed }) => ($boxed ? "1.05rem" : "clamp(0.95rem, 3.6vw, 2.05rem)")};
  font-weight: 600;
  letter-spacing: ${({ $boxed }) => ($boxed ? "0.28em" : "0.16em")};
  text-transform: uppercase;
  line-height: 1;
  padding-left: ${({ $boxed }) => ($boxed ? "0.28em" : "0.16em")};
  @media (min-width: 760px) {
    font-size: ${({ $boxed }) => ($boxed ? "1.05rem" : "clamp(1.35rem, 2.4vw, 2.05rem)")};
    letter-spacing: ${({ $boxed }) => ($boxed ? "0.34em" : "0.32em")};
    padding-left: ${({ $boxed }) => ($boxed ? "0.34em" : "0.32em")};
  }
`;

const Letter = styled.span<{ $i: number }>`
  display: inline-block;
  animation: ${dance} 2.8s ease-in-out infinite;
  animation-delay: ${({ $i }) => `${$i * 0.07}s`};
  will-change: transform;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Sub = styled.span`
  display: none;
  font-family: ${({ theme }) => theme.font.display};
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  text-transform: none;
  font-style: italic;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  line-height: 1;
  @media (min-width: 520px) {
    display: block;
  }
`;

type Props = {
  href: string;
  boxed?: boolean;
  withSub?: boolean;
  sub?: string;
};

/** Editorial Graciana wordmark with a soft letter dance. */
export function BrandLogo({ href, boxed, withSub, sub = "Shoes & Accessories" }: Props) {
  const label = "Graciana";
  return (
    <Brand href={href} aria-label={label} $boxed={boxed}>
      <Stack>
        <Word $boxed={boxed}>
          {label.split("").map((ch, i) => (
            <Letter key={`${ch}-${i}`} $i={i}>
              {ch}
            </Letter>
          ))}
        </Word>
        {withSub ? <Sub>{sub}</Sub> : null}
      </Stack>
    </Brand>
  );
}
