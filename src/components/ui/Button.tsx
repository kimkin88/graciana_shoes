"use client";

import Link from "next/link";
import styled, { css } from "styled-components";

const buttonStyles = css<{ $variant?: "primary" | "ghost" | "danger" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space.sm};
  padding: 10px 18px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 0.86rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid transparent;
  cursor: pointer;
  opacity: 1;
  transition: background 0.22s ease, border-color 0.22s ease, opacity 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease, color 0.22s ease;
  line-height: 1;

  &:disabled {
    opacity: 0.9;
    cursor: not-allowed;
    filter: grayscale(8%);
  }

  &:not(:disabled):hover {
    transform: translateY(-1px) scale(1.01);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.text};
    outline-offset: 2px;
  }

  ${({ theme, $variant = "primary" }) =>
    $variant === "primary"
      ? `
    background: ${theme.colors.accent};
    color: ${theme.colors.text};
    border-color: ${theme.colors.textMuted};
    box-shadow: none;
    &:hover:not(:disabled) {
      background: ${theme.colors.text};
      color: ${theme.colors.surface};
      border-color: ${theme.colors.text};
    }
  `
      : $variant === "danger"
        ? `
    background: ${theme.colors.danger};
    color: #fff;
    border-color: ${theme.colors.danger};
    &:hover:not(:disabled) { filter: brightness(0.95); }
  `
        : `
    background: ${theme.colors.accent};
    color: ${theme.colors.text};
    border-color: ${theme.colors.textMuted};
    box-shadow: none;
    &:hover:not(:disabled) {
      background: ${theme.colors.text};
      color: ${theme.colors.surface};
      border-color: ${theme.colors.text};
    }
  `}
`;

export const Button = styled.button<{ $variant?: "primary" | "ghost" | "danger" }>`
  ${buttonStyles}
`;

export const ButtonLink = styled(Link)<{ $variant?: "primary" | "ghost" | "danger" }>`
  ${buttonStyles}
`;
