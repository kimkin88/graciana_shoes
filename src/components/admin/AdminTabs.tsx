"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";

const Wrap = styled.nav`
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const Tab = styled(Link)<{ $active?: boolean }>`
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.buttonPrimaryBorder : theme.colors.buttonGhostBorder)};
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 0.82rem;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  background: ${({ theme, $active }) => ($active ? theme.colors.buttonPrimaryBg : theme.colors.buttonGhostBg)};
  color: ${({ theme, $active }) => ($active ? theme.colors.buttonPrimaryText : theme.colors.buttonGhostText)};
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
  &:hover {
    transform: translateY(-1px);
    background: ${({ theme, $active }) => ($active ? theme.colors.buttonPrimaryHoverBg : theme.colors.accent)};
  }
`;

type Props = {
  locale: Locale;
  labels: {
    stats: string;
    products: string;
    groups: string;
    orders: string;
    mainPageConstructor: string;
  };
};

export function AdminTabs({ locale, labels }: Props) {
  const pathname = usePathname() || "";
  const links = [
    { href: localizedPath("/admin", locale), label: labels.stats, key: "stats" },
    { href: localizedPath("/admin/products", locale), label: labels.products, key: "products" },
    { href: localizedPath("/admin/groups", locale), label: labels.groups, key: "groups" },
    { href: localizedPath("/admin/orders", locale), label: labels.orders, key: "orders" },
    {
      href: localizedPath("/admin/main-page-constructor", locale),
      label: labels.mainPageConstructor,
      key: "main-page-constructor",
    },
  ] as const;

  return (
    <Wrap>
      {links.map((item) => {
        const active =
          item.key === "stats"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Tab key={item.key} href={item.href} $active={active}>
            {item.label}
          </Tab>
        );
      })}
    </Wrap>
  );
}
