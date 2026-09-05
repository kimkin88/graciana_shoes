"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import styled, { css } from "styled-components";

export type QuickTone = "default" | "installment" | "promo";

export type HeaderQuickItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  tone?: QuickTone;
};

const Row = styled.div`
  display: none;
  @media (min-width: 900px) {
    display: flex;
    justify-content: center;
    flex-wrap: nowrap;
    gap: 10px;
    padding: 10px 24px 14px;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const toneStyles = {
  default: css`
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textMuted};
    border-color: ${({ theme }) => theme.colors.border};
    &:hover,
    &:focus-visible {
      border-color: ${({ theme }) => theme.colors.textMuted};
      background: ${({ theme }) => theme.colors.accent};
      color: ${({ theme }) => theme.colors.text};
    }
  `,
  installment: css`
    background: color-mix(in srgb, ${({ theme }) => theme.colors.success} 12%, ${({ theme }) => theme.colors.surface});
    color: ${({ theme }) => theme.colors.success};
    border-color: color-mix(in srgb, ${({ theme }) => theme.colors.success} 35%, ${({ theme }) => theme.colors.border});
    &:hover,
    &:focus-visible {
      background: color-mix(in srgb, ${({ theme }) => theme.colors.success} 20%, ${({ theme }) => theme.colors.surface});
      border-color: ${({ theme }) => theme.colors.success};
    }
  `,
  promo: css`
    background: color-mix(in srgb, ${({ theme }) => theme.colors.danger} 10%, ${({ theme }) => theme.colors.surface});
    color: ${({ theme }) => theme.colors.danger};
    border-color: color-mix(in srgb, ${({ theme }) => theme.colors.danger} 32%, ${({ theme }) => theme.colors.border});
    &:hover,
    &:focus-visible {
      background: color-mix(in srgb, ${({ theme }) => theme.colors.danger} 18%, ${({ theme }) => theme.colors.surface});
      border-color: ${({ theme }) => theme.colors.danger};
    }
  `,
};

const Chip = styled(Link)<{ $tone: QuickTone }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  max-width: none;
  padding: 8px 13px;
  border: 1px solid;
  border-radius: ${({ theme }) => theme.radii.md};
  text-decoration: none;
  white-space: nowrap;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;
  ${({ $tone }) => toneStyles[$tone]}
`;

const IconWrap = styled.span`
  display: grid;
  place-items: center;
  flex: 0 0 auto;
`;

const Label = styled.span`
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1;
`;

/** Compact icon chips for secondary header links (no wrap, tone accents). */
export function HeaderQuickLinks({ items, ariaLabel }: { items: HeaderQuickItem[]; ariaLabel: string }) {
  return (
    <Row aria-label={ariaLabel}>
      {items.map((item) => {
        const Icon = item.icon;
        const tone = item.tone ?? "default";
        return (
          <Chip key={item.href + item.label} href={item.href} $tone={tone} aria-label={item.label}>
            <IconWrap>
              <Icon size={14} strokeWidth={1.6} aria-hidden />
            </IconWrap>
            <Label>{item.label}</Label>
          </Chip>
        );
      })}
    </Row>
  );
}
