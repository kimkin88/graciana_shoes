"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styled from "styled-components";
import {
  ChatBubbleIcon,
  Cross1Icon,
  HamburgerMenuIcon,
  InstagramLogoIcon,
  MobileIcon,
  PaperPlaneIcon,
} from "@radix-ui/react-icons";
import {
  BadgePercent,
  CreditCard,
  FileText,
  Home,
  Info,
  LogIn,
  Package,
  Phone,
  Receipt,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Truck,
  UserRoundPlus,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useCart } from "@/context/cart-context";
import { logout } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 2px 14px rgb(0 0 0 / 4%);
`;

const Inner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md};
  flex-wrap: nowrap;
  min-width: 0;
  @media (max-width: 900px) {
    padding: 8px 12px;
    gap: 8px;
  }
`;

const Brand = styled(Link)`
  font-family: ${({ theme }) => theme.font.display};
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  @media (max-width: 900px) {
    font-size: 1.12rem;
    letter-spacing: 0.06em;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.space.sm};
  flex: 1;
  flex-wrap: nowrap;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  min-width: 0;
  &::-webkit-scrollbar {
    display: none;
  }
  @media (max-width: 900px) {
    display: none;
  }
`;

const Burger = styled.button`
  width: 38px;
  height: 38px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const DrawerOverlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 42%);
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition: opacity 0.2s ease;
  z-index: 70;
`;

const Drawer = styled.aside<{ $open: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: min(360px, 88vw);
  height: 100vh;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  transform: translateX(${({ $open }) => ($open ? "0" : "-102%")});
  transition: transform 0.23s ease;
  z-index: 80;
  display: grid;
  grid-template-rows: auto 1fr;
  @media (max-width: 520px) {
    width: 92vw;
  }
`;

const DrawerLink = styled(Link)<{ $noBorder?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 0;
  border-bottom: ${({ $noBorder, theme }) =>
    $noBorder ? "none" : `1px solid ${theme.colors.border}`};
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  svg {
    flex-shrink: 0;
  }
`;

const SocialLink = styled.a`
  width: 38px;
  height: 38px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  white-space: nowrap;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  transition: background 0.2s ease, color 0.2s ease;
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.accent};
  }
`;

const Right = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  flex-shrink: 0;
  @media (max-width: 900px) {
    margin-left: auto;
    gap: 6px;
  }
`;

const HeaderActionButton = styled(Button)`
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.text};
  border-color: ${({ theme }) => theme.colors.textMuted};
  box-shadow: none;
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.text};
  }
  @media (max-width: 900px) {
    display: none;
  }
`;

const HeaderActionLink = styled(ButtonLink)`
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.text};
  border-color: ${({ theme }) => theme.colors.textMuted};
  box-shadow: none;
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.text};
  }
  @media (max-width: 900px) {
    display: none;
  }
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
  border: 1px solid ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  @media (max-width: 900px) {
    font-size: 0.82rem;
    padding: 6px 8px;
    max-width: 100%;
  }
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
  const [menuOpen, setMenuOpen] = useState(false);

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
      <div
        style={{
          textAlign: "center",
          fontSize: "0.74rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "7px 12px",
          background: "var(--promo-bg, #1f1a17)",
          color: "var(--promo-text, #fff)",
        }}
      >
        {dict.common.freeShipping}
      </div>
      <Inner>
        <Burger type="button" aria-label={dict.common.openMenu} onClick={() => setMenuOpen(true)}>
          <HamburgerMenuIcon />
        </Burger>
        <Brand href={mk("/")}>Graciana</Brand>
        <Nav>
          <NavLink href={mk("/")} $active={active("/")}>
            {dict.nav.home}
          </NavLink>
          <NavLink href={mk("/products")} $active={active("/products")}>
            {dict.nav.catalog}
          </NavLink>
          <NavLink href={mk("/delivery-payment")} $active={active("/delivery-payment")}>
            {dict.nav.delivery}
          </NavLink>
          <NavLink href={mk("/contacts")} $active={active("/contacts")}>
            {dict.nav.contacts}
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
          <ThemeToggle />
          {userEmail ? (
            <form action={logout}>
              <input type="hidden" name="locale" value={locale} />
              <HeaderActionButton type="submit">
                {dict.nav.logout}
              </HeaderActionButton>
            </form>
          ) : (
            <>
              <HeaderActionLink href={mk("/login")}>
                {dict.nav.login}
              </HeaderActionLink>
              <HeaderActionLink href={mk("/register")}>
                {dict.nav.register}
              </HeaderActionLink>
            </>
          )}
        </Right>
      </Inner>
      <DrawerOverlay $open={menuOpen} onClick={() => setMenuOpen(false)} />
      <Drawer $open={menuOpen} aria-hidden={!menuOpen}>
        <div
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 14px",
            borderBottom: "1px solid #d9cec3",
          }}
        >
          <strong style={{ fontSize: "0.88rem", letterSpacing: "0.08em" }}>{dict.common.menu}</strong>
          <Burger type="button" aria-label={dict.common.closeMenu} onClick={() => setMenuOpen(false)}>
            <Cross1Icon />
          </Burger>
        </div>
        <div style={{ padding: "10px 16px 24px", overflowY: "auto" }}>
          <div style={{ paddingBottom: 10, marginBottom: 6, borderBottom: "1px solid #d9cec3" }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: "0.76rem", letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--page-text, inherit)" }}>
                {dict.common.language}
              </span>
              <LangSelect
                aria-label={dict.common.language}
                value={locale}
                onChange={(e) => switchLocale(e.target.value as Locale)}
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </LangSelect>
            </label>
          </div>
          <DrawerLink href={mk("/")} onClick={() => setMenuOpen(false)}>
            <Home size={16} />
            {dict.nav.home}
          </DrawerLink>
          <DrawerLink href={mk("/products")} onClick={() => setMenuOpen(false)}>
            <ShoppingBag size={16} />
            {dict.nav.catalog}
          </DrawerLink>
          <DrawerLink href={mk("/delivery-payment")} onClick={() => setMenuOpen(false)}>
            <Truck size={16} />
            {dict.nav.delivery}
          </DrawerLink>
          <DrawerLink href={mk("/returns-exchange")} onClick={() => setMenuOpen(false)}>
            <Receipt size={16} />
            {dict.nav.returns}
          </DrawerLink>
          <DrawerLink href={mk("/how-to-order")} onClick={() => setMenuOpen(false)}>
            <FileText size={16} />
            {dict.nav.howToOrder}
          </DrawerLink>
          <DrawerLink href={mk("/installment")} onClick={() => setMenuOpen(false)}>
            <CreditCard size={16} />
            {dict.nav.installment}
          </DrawerLink>
          <DrawerLink href={mk("/promotions")} onClick={() => setMenuOpen(false)}>
            <BadgePercent size={16} />
            {dict.nav.promotions}
          </DrawerLink>
          <DrawerLink href={mk("/about")} onClick={() => setMenuOpen(false)}>
            <Info size={16} />
            {dict.nav.about}
          </DrawerLink>
          <DrawerLink href={mk("/contacts")} onClick={() => setMenuOpen(false)}>
            <Phone size={16} />
            {dict.nav.contacts}
          </DrawerLink>
          <DrawerLink href={mk("/cart")} onClick={() => setMenuOpen(false)}>
            <ShoppingCart size={16} />
            {dict.nav.cart}
          </DrawerLink>
          {userEmail ? (
            <>
              <DrawerLink href={mk("/account/orders")} onClick={() => setMenuOpen(false)}>
                <Package size={16} />
                {dict.nav.orders}
              </DrawerLink>
              {isAdmin ? (
                <DrawerLink $noBorder href={mk("/admin")} onClick={() => setMenuOpen(false)}>
                  <Settings size={16} />
                  {dict.nav.admin}
                </DrawerLink>
              ) : null}
            </>
          ) : (
            <>
              <DrawerLink href={mk("/login")} onClick={() => setMenuOpen(false)}>
                <LogIn size={16} />
                {dict.nav.login}
              </DrawerLink>
              <DrawerLink $noBorder href={mk("/register")} onClick={() => setMenuOpen(false)}>
                <UserRoundPlus size={16} />
                {dict.nav.register}
              </DrawerLink>
            </>
          )}
          <div
            style={{
              marginTop: 16,
              padding: "12px 0 0",
              borderTop: "1px solid #d9cec3",
              color: "var(--page-text, inherit)",
              display: "grid",
              gap: 8,
              fontSize: "0.82rem",
              lineHeight: 1.45,
            }}
          >
            <strong style={{ color: "var(--page-heading, inherit)", letterSpacing: "0.04em" }}>{dict.info.customerTitle}</strong>
            <div>{dict.info.phones.join(" / ")}</div>
            <div>{dict.info.email}</div>
            <div>{dict.info.workHours}</div>
            <strong style={{ marginTop: 4, color: "var(--page-heading, inherit)", letterSpacing: "0.04em" }}>{dict.common.socialLinks}</strong>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <SocialLink
                href="https://www.instagram.com/graciana_shoes_by/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                title="Instagram"
              >
                <InstagramLogoIcon width={18} height={18} />
              </SocialLink>
              <SocialLink
                href="https://api.whatsapp.com/send/?phone=375297460114&text&type=phone_number&app_absent=0"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <ChatBubbleIcon width={18} height={18} />
              </SocialLink>
              <SocialLink
                href="https://t.me/graciana_shoes_by"
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                title="Telegram"
              >
                <PaperPlaneIcon width={18} height={18} />
              </SocialLink>
              <SocialLink
                href="viber://chat?number=%2B375297460114"
                aria-label="Viber"
                title="Viber"
              >
                <MobileIcon width={18} height={18} />
              </SocialLink>
            </div>
            <strong style={{ marginTop: 4, color: "var(--page-heading, inherit)", letterSpacing: "0.04em" }}>{dict.info.legalTitle}</strong>
            <div style={{ whiteSpace: "pre-wrap" }}>{dict.info.legal}</div>
          </div>
        </div>
      </Drawer>
    </Bar>
  );
}
