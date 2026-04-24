"use client";

import Link from "next/link";
import styled from "styled-components";

const buttonStyles = `
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
    background: ${theme.colors.buttonPrimaryBg};
    color: ${theme.colors.buttonPrimaryText};
    border-color: ${theme.colors.buttonPrimaryBorder};
    box-shadow: 0 8px 18px rgb(0 0 0 / 24%);
    &:hover:not(:disabled) {
      background: ${theme.colors.buttonPrimaryHoverBg};
      border-color: ${theme.colors.buttonPrimaryHoverBg};
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
    background: ${theme.colors.buttonGhostBg};
    color: ${theme.colors.buttonGhostText};
    border-color: ${theme.colors.buttonGhostBorder};
    box-shadow: 0 6px 14px rgb(0 0 0 / 18%);
    &:hover:not(:disabled) {
      background: ${theme.colors.buttonGhostHoverBg};
      color: ${theme.colors.buttonGhostHoverText};
      border-color: ${theme.colors.buttonGhostHoverBg};
    }
  `}
`;

export const Button = styled.button<{ $variant?: "primary" | "ghost" | "danger" }>`
  ${buttonStyles}
`;

export const ButtonLink = styled(Link)<{ $variant?: "primary" | "ghost" | "danger" }>`
  ${buttonStyles}
`;
