"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import {
  BarChart3,
  FolderTree,
  ImageIcon,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";
import { useI18nOptional } from "@/context/locale-context";

const Shell = styled.div`
  display: grid;
  gap: 28px;
`;

const Head = styled.header`
  display: grid;
  gap: 18px;
  padding-bottom: 22px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Eyebrow = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 4.5vw, 3rem);
  letter-spacing: 0.02em;
  line-height: 0.98;
`;

const Lead = styled.p`
  margin: 0;
  max-width: 42rem;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.55;
`;

const Tabs = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 5px;
  width: fit-content;
  max-width: 100%;
  background: ${({ theme }) => theme.colors.accent};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Tab = styled(Link)<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  color: ${({ theme, $active }) => ($active ? theme.colors.background : theme.colors.text)};
  background: ${({ theme, $active }) => ($active ? theme.colors.text : "transparent")};
  transition:
    background 0.18s ease,
    color 0.18s ease;
  &:hover {
    background: ${({ theme, $active }) =>
      $active ? theme.colors.text : "color-mix(in srgb, " + theme.colors.text + " 8%, transparent)"};
  }
`;

const Body = styled.div`
  min-width: 0;
`;

type Props = {
  locale: Locale;
  title: string;
  lead: string;
  labels: {
    stats: string;
    products: string;
    groups: string;
    orders: string;
    users: string;
    content: string;
  };
  children: React.ReactNode;
};

const icons = {
  stats: BarChart3,
  products: Package,
  groups: FolderTree,
  orders: ShoppingBag,
  users: Users,
  content: ImageIcon,
} as const;

/** Shared admin page frame: editorial header + segmented tabs. */
export function AdminChrome({ locale: localeProp, title, lead, labels: labelsProp, children }: Props) {
  const i18n = useI18nOptional();
  const locale = i18n?.locale ?? localeProp;
  const labels = i18n
    ? {
        stats: i18n.dict.admin.stats,
        products: i18n.dict.admin.products,
        groups: i18n.dict.admin.groups,
        orders: i18n.dict.admin.orders,
        users: i18n.dict.admin.users,
        content: i18n.dict.admin.siteContent,
      }
    : labelsProp;
  const liveTitle = i18n?.dict.admin.title ?? title;
  const liveLead = i18n?.dict.admin.lead ?? lead;
  const pathname = usePathname() || "";
  const barePath = pathname.replace(/^\/(en|ru)(?=\/|$)/, "") || "/";
  const links = [
    { href: localizedPath("/admin", locale), label: labels.stats, key: "stats" as const },
    { href: localizedPath("/admin/products", locale), label: labels.products, key: "products" as const },
    { href: localizedPath("/admin/groups", locale), label: labels.groups, key: "groups" as const },
    { href: localizedPath("/admin/orders", locale), label: labels.orders, key: "orders" as const },
    { href: localizedPath("/admin/users", locale), label: labels.users, key: "users" as const },
    { href: localizedPath("/admin/content", locale), label: labels.content, key: "content" as const },
  ];

  return (
    <Shell>
      <Head>
        <div style={{ display: "grid", gap: 8 }}>
          <Eyebrow>Graciana</Eyebrow>
          <Title>{liveTitle}</Title>
          <Lead>{liveLead}</Lead>
        </div>
        <Tabs aria-label={liveTitle}>
          {links.map((item) => {
            const Icon = icons[item.key];
            const bareHref = item.href.replace(/^\/(en|ru)(?=\/|$)/, "") || "/";
            const active =
              item.key === "stats"
                ? barePath === "/admin"
                : barePath === bareHref || barePath.startsWith(`${bareHref}/`);
            return (
              <Tab key={item.key} href={item.href} $active={active}>
                <Icon size={14} strokeWidth={1.7} aria-hidden />
                {item.label}
              </Tab>
            );
          })}
        </Tabs>
      </Head>
      <Body>{children}</Body>
    </Shell>
  );
}
