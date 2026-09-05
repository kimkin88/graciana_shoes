"use client";

import styled from "styled-components";
import { Button, ButtonLink } from "@/components/ui/Button";

export const AdminButton = styled(Button)`
  background: ${({ theme }) => theme.colors.buttonPrimaryBg};
  color: ${({ theme }) => theme.colors.buttonPrimaryText};
  border-color: ${({ theme }) => theme.colors.buttonPrimaryBorder};
  box-shadow: none;
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.buttonPrimaryHoverBg};
    color: ${({ theme }) => theme.colors.buttonPrimaryText};
    border-color: ${({ theme }) => theme.colors.buttonPrimaryHoverBg};
  }
`;

export const AdminButtonLink = styled(ButtonLink)`
  background: ${({ theme }) => theme.colors.buttonPrimaryBg};
  color: ${({ theme }) => theme.colors.buttonPrimaryText};
  border-color: ${({ theme }) => theme.colors.buttonPrimaryBorder};
  box-shadow: none;
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.buttonPrimaryHoverBg};
    color: ${({ theme }) => theme.colors.buttonPrimaryText};
    border-color: ${({ theme }) => theme.colors.buttonPrimaryHoverBg};
  }
`;

export const AdminSectionHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 4px;
`;

export const AdminSectionTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.35rem, 2.4vw, 1.75rem);
  letter-spacing: 0.02em;
  line-height: 1.1;
`;

export const AdminTableWrap = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  overflow: hidden;
`;

export const AdminTable = styled.table`
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 0.9rem;

  thead tr {
    text-align: left;
    background: ${({ theme }) => theme.colors.accent};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  th {
    padding: 12px 14px;
    font-size: 0.64rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  td {
    padding: 14px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody tr:hover td {
    background: color-mix(in srgb, ${({ theme }) => theme.colors.accent} 65%, transparent);
  }
`;
