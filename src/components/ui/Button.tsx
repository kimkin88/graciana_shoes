"use client";

import Link from "next/link";
import styled from "styled-components";

const buttonStyles = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 0;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  border: 1px solid transparent;
  cursor: pointer;
  line-height: 1;
`;

export const Button = styled.button<{ $variant?: "primary" | "ghost" | "danger" }>`
  ${buttonStyles}
  opacity: 1;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.18s ease;
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  @media (prefers-reduced-motion: reduce) {
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }
  ${({ theme, $variant = "primary" }) =>
    $variant === "danger"
      ? `
    background: ${theme.colors.danger};
    color: #fff;
    border-color: ${theme.colors.danger};
  `
      : $variant === "ghost"
        ? `
    background: transparent;
    color: ${theme.colors.buttonGhostText};
    border-color: ${theme.colors.buttonGhostBorder};
    &:hover:not(:disabled) {
      background: ${theme.colors.buttonGhostHoverBg};
      color: ${theme.colors.buttonGhostHoverText};
    }
  `
        : `
    background: ${theme.colors.buttonPrimaryBg};
    color: ${theme.colors.buttonPrimaryText};
    border-color: ${theme.colors.buttonPrimaryBorder};
    &:hover:not(:disabled) {
      background: ${theme.colors.buttonPrimaryHoverBg};
      transform: translateY(-1px);
    }
  `}
`;

export const ButtonLink = styled(Link)<{ $variant?: "primary" | "ghost" | "danger" }>`
  ${buttonStyles}
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.18s ease;
  ${({ theme, $variant = "primary" }) =>
    $variant === "ghost"
      ? `
    background: transparent;
    color: ${theme.colors.buttonGhostText};
    border-color: ${theme.colors.buttonGhostBorder};
    &:hover {
      background: ${theme.colors.buttonGhostHoverBg};
      color: ${theme.colors.buttonGhostHoverText};
      transform: translateY(-1px);
    }
  `
      : $variant === "danger"
        ? `
    background: ${theme.colors.danger};
    color: #fff;
    border-color: ${theme.colors.danger};
    &:hover {
      filter: brightness(1.05);
      transform: translateY(-1px);
    }
  `
        : `
    background: ${theme.colors.buttonPrimaryBg};
    color: ${theme.colors.buttonPrimaryText};
    border-color: ${theme.colors.buttonPrimaryBorder};
    &:hover {
      background: ${theme.colors.buttonPrimaryHoverBg};
      transform: translateY(-1px);
    }
  `}
  @media (prefers-reduced-motion: reduce) {
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
    &:hover {
      transform: none;
    }
  }
`;
