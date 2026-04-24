"use client";

import styled from "styled-components";
import { Button, ButtonLink } from "@/components/ui/Button";

export const AdminButton = styled(Button)`
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.text};
  border-color: ${({ theme }) => theme.colors.textMuted};
  box-shadow: none;
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.text};
  }
`;

export const AdminButtonLink = styled(ButtonLink)`
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.text};
  border-color: ${({ theme }) => theme.colors.textMuted};
  box-shadow: none;
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.text};
  }
`;
