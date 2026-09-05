"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";

const Wrap = styled.nav`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const Tab = styled(Link)<{ $active?: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.text};
  padding: 8px 12px;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: ${({ theme, $active }) => ($active ? theme.colors.text : "transparent")};
  color: ${({ theme, $active }) => ($active ? theme.colors.background : theme.colors.text)};
`;

type Props = {
  locale: Locale;
  labels: {
    stats: string;
    products: string;
    groups: string;
    orders: string;
    users?: string;
    content: string;
  };
};

export function AdminTabs({ locale, labels }: Props) {
  const pathname = usePathname() || "";
  const links = [
    { href: localizedPath("/admin", locale), label: labels.stats, key: "stats" },
    { href: localizedPath("/admin/products", locale), label: labels.products, key: "products" },
    { href: localizedPath("/admin/groups", locale), label: labels.groups, key: "groups" },
    { href: localizedPath("/admin/orders", locale), label: labels.orders, key: "orders" },
    ...(labels.users
      ? [{ href: localizedPath("/admin/users", locale), label: labels.users, key: "users" as const }]
      : []),
    { href: localizedPath("/admin/content", locale), label: labels.content, key: "content" },
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
