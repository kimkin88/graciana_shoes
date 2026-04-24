"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/cart-context";
import { logout } from "@/app/actions/auth";

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

const Inner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md};
  flex-wrap: wrap;
`;

const Brand = styled(Link)`
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.space.md};
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  font-size: 0.9rem;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.textMuted};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Right = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
`;

const Badge = styled.span`
  display: inline-flex;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 5px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
`;

const LangSelect = styled.select`
  font-size: 0.85rem;
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

type Props = {
  locale: Locale;
  dict: Messages;
  userEmail: string | null;
  isAdmin: boolean;
};

/** Main navigation — client so cart badge and language switch stay interactive. */
export function HeaderBar({ locale, dict, userEmail, isAdmin }: Props) {
  const pathname = usePathname() || "/";
  const { totalQuantity, ready } = useCart();

  function switchLocale(next: Locale) {
    const rest =
      pathname.replace(/^\/(en|ru)(?=\/|$)/, "") || "/";
    const path = rest === "/" ? "" : rest;
    window.location.href = `/${next}${path}`;
  }

  const mk = (path: string) => localizedPath(path, locale);
  const active = (p: string) =>
    pathname === mk(p) || pathname.startsWith(`${mk(p)}/`);

  return (
    <Bar>
      <Inner>
        <Brand href={mk("/")}>Graciana</Brand>
        <Nav>
          <NavLink href={mk("/")} $active={active("/")}>
            {dict.nav.home}
          </NavLink>
          <NavLink href={mk("/products")} $active={active("/products")}>
            {dict.nav.catalog}
          </NavLink>
          <NavLink href={mk("/cart")} $active={active("/cart")}>
            {dict.nav.cart}
            {ready && totalQuantity > 0 ? <Badge>{totalQuantity}</Badge> : null}
          </NavLink>
          {userEmail ? (
            <>
              <NavLink
                href={mk("/account/orders")}
                $active={active("/account/orders")}
              >
                {dict.nav.orders}
              </NavLink>
              {isAdmin ? (
                <NavLink href={mk("/admin")} $active={active("/admin")}>
                  {dict.nav.admin}
                </NavLink>
              ) : null}
            </>
          ) : null}
        </Nav>
        <Right>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="sr-only">{dict.common.language}</span>
            <LangSelect
              aria-label={dict.common.language}
              value={locale}
              onChange={(e) => switchLocale(e.target.value as Locale)}
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </LangSelect>
          </label>
          {userEmail ? (
            <form action={logout}>
              <input type="hidden" name="locale" value={locale} />
              <Button type="submit" $variant="ghost">
                {dict.nav.logout}
              </Button>
            </form>
          ) : (
            <>
              <Button as={Link} href={mk("/login")} $variant="ghost">
                {dict.nav.login}
              </Button>
              <Button as={Link} href={mk("/register")}>
                {dict.nav.register}
              </Button>
            </>
          )}
        </Right>
      </Inner>
    </Bar>
  );
}
