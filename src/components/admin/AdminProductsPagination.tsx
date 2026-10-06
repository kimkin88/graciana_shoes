"use client";

import Link from "next/link";
import styled from "styled-components";

type Props = {
  actionPath: string;
  query: string;
  status: "all" | "active" | "draft";
  page: number;
  totalPages: number;
  labels: {
    prev: string;
    next: string;
    pageOf: string;
  };
};

const Bar = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Meta = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: var(--page-text-muted, #666);
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const PageLink = styled(Link)<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $disabled }) => ($disabled ? "transparent" : theme.colors.surface)};
  color: ${({ theme, $disabled }) => ($disabled ? theme.colors.textMuted : theme.colors.text)};
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 600;
  pointer-events: ${({ $disabled }) => ($disabled ? "none" : "auto")};
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
  text-decoration: none;
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
`;

function hrefFor(
  actionPath: string,
  query: string,
  status: "all" | "active" | "draft",
  page: number,
) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (status !== "all") params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${actionPath}?${qs}` : actionPath;
}

export function AdminProductsPagination({
  actionPath,
  query,
  status,
  page,
  totalPages,
  labels,
}: Props) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <Bar aria-label="pagination">
      <Meta>
        {labels.pageOf.replace("{page}", String(page)).replace("{pages}", String(totalPages))}
      </Meta>
      <Controls>
        <PageLink
          href={hrefFor(actionPath, query, status, Math.max(1, page - 1))}
          $disabled={prevDisabled}
          aria-disabled={prevDisabled}
          tabIndex={prevDisabled ? -1 : undefined}
        >
          {labels.prev}
        </PageLink>
        <PageLink
          href={hrefFor(actionPath, query, status, Math.min(totalPages, page + 1))}
          $disabled={nextDisabled}
          aria-disabled={nextDisabled}
          tabIndex={nextDisabled ? -1 : undefined}
        >
          {labels.next}
        </PageLink>
      </Controls>
    </Bar>
  );
}
