"use client";

import styled from "styled-components";

export const Button = styled.button<{ $variant?: "primary" | "ghost" | "danger" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space.sm};
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  ${({ theme, $variant = "primary" }) =>
    $variant === "primary"
      ? `
    background: ${theme.colors.primary};
    color: #fff;
    &:hover:not(:disabled) { background: ${theme.colors.primaryHover}; }
  `
      : $variant === "danger"
        ? `
    background: ${theme.colors.danger};
    color: #fff;
    &:hover:not(:disabled) { filter: brightness(0.95); }
  `
        : `
    background: ${theme.colors.surface};
    color: ${theme.colors.text};
    border-color: ${theme.colors.border};
    &:hover:not(:disabled) { background: ${theme.colors.background}; }
  `}
`;
