"use client";

import styled from "styled-components";

const Mark = styled.span<{ $tone: "sale" | "new" | "out" }>`
  display: inline-flex;
  align-items: center;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 5px 8px;
  background: ${({ $tone, theme }) =>
    $tone === "sale" ? theme.colors.text : $tone === "out" ? "transparent" : theme.colors.accent};
  color: ${({ $tone, theme }) => ($tone === "sale" ? theme.colors.background : theme.colors.text)};
  border: 1px solid ${({ theme }) => theme.colors.text};
`;

export function ProductBadge({
  tone,
  children,
}: {
  tone: "sale" | "new" | "out";
  children: React.ReactNode;
}) {
  return <Mark $tone={tone}>{children}</Mark>;
}
