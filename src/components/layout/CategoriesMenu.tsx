"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import styled from "styled-components";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { AppScrollArea } from "@/components/ui/ScrollArea";

const Trigger = styled(DropdownMenu.Trigger)`
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  &[data-state="open"] svg {
    transform: rotate(180deg);
  }
  svg {
    transition: transform 0.2s ease;
  }
  @media (min-width: 1240px) {
    font-size: 0.7rem;
    letter-spacing: 0.16em;
  }
`;

const Content = styled(DropdownMenu.Content)`
  min-width: 240px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: 60;
  padding: 6px 0;
`;

const ItemLink = styled(Link)`
  display: block;
  padding: 10px 16px;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
  outline: none;
  &:hover,
  &[data-highlighted] {
    background: ${({ theme }) => theme.colors.accent};
  }
`;

type Props = {
  label: string;
  allLabel: string;
  allHref: string;
  categories: string[];
  categoryHref: (name: string) => string;
};

export function CategoriesMenu({ label, allLabel, allHref, categories, categoryHref }: Props) {
  return (
    <DropdownMenu.Root modal={false}>
      <Trigger>
        {label}
        <ChevronDownIcon width={12} height={12} />
      </Trigger>
      <DropdownMenu.Portal>
        <Content align="start" sideOffset={14}>
          <AppScrollArea style={{ maxHeight: 360 }}>
            <DropdownMenu.Item asChild>
              <ItemLink href={allHref}>{allLabel}</ItemLink>
            </DropdownMenu.Item>
            {categories.map((category) => (
              <DropdownMenu.Item asChild key={category}>
                <ItemLink href={categoryHref(category)}>{category}</ItemLink>
              </DropdownMenu.Item>
            ))}
          </AppScrollArea>
        </Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
