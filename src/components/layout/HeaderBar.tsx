"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { InstagramLogoIcon } from "@radix-ui/react-icons";
import {
  BadgePercent,
  Heart,
  Info,
  ListOrdered,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Phone,
  Search,
  Send,
  Settings,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
  UserRoundPlus,
  X,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import { useI18nOptional } from "@/context/locale-context";
import { logout } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { HeaderQuickLinks } from "@/components/layout/HeaderQuickLinks";
import { CurrencySwitch } from "@/components/layout/CurrencySwitch";
import { AppScrollArea } from "@/components/ui/ScrollArea";
import { categoryLabel, STORE_CATEGORIES } from "@/lib/catalog/categories";

const Shell = styled.header`
  position: sticky;
  top: 0;
  z-index: 40;
  color: ${({ theme }) => theme.colors.text};
  background: color-mix(in srgb, ${({ theme }) => theme.colors.background} 88%, transparent);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
`;

const Top = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 10px 12px 8px;
  display: grid;
  grid-template-columns: minmax(40px, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 6px;
  min-width: 0;
  @media (min-width: 760px) {
    padding: 12px 16px 10px;
    gap: 10px;
  }
  @media (min-width: 1024px) {
    padding: 16px 32px 12px;
    gap: 12px;
  }
`;

const Social = styled.a`
  display: none;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.textMuted};
  justify-self: start;
  transition: color 0.18s ease;
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
  @media (min-width: 900px) {
    display: inline-flex;
  }
`;

const Burger = styled.button`
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  color: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  justify-self: start;
  transition: background 0.18s ease;
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
  @media (min-width: 1024px) {
    display: none;
  }
`;

const BrandWrap = styled.div`
  justify-self: center;
  grid-column: 2;
  min-width: 0;
  max-width: min(52vw, 280px);
`;

const Right = styled.div`
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
  flex-wrap: nowrap;
  height: 36px;
  @media (min-width: 900px) {
    gap: 4px;
  }
  @media (min-width: 1024px) {
    gap: 6px;
  }
`;

const IconCluster = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0;
  height: 36px;
`;

const LangGroup = styled.div<{ $always?: boolean }>`
  display: ${({ $always }) => ($always ? "inline-flex" : "none")};
  align-items: center;
  box-sizing: border-box;
  height: 36px;
  padding: 3px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  flex: 0 0 auto;
  @media (min-width: 1024px) {
    display: inline-flex;
  }
`;

const IconLink = styled(Link)`
  position: relative;
  box-sizing: border-box;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.md};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  transition: background 0.18s ease, color 0.18s ease;
  flex: 0 0 auto;
  line-height: 1;
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const AccountTrigger = styled(DropdownMenu.Trigger)`
  position: relative;
  box-sizing: border-box;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.textMuted};
  color: ${({ theme }) => theme.colors.background};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: 0 0 auto;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
  &:hover,
  &[data-state="open"] {
    background: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.background};
  }
`;

const OnlineDot = styled.span`
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.success};
  border: 1.5px solid ${({ theme }) => theme.colors.background};
  pointer-events: none;
`;

const GuestLogin = styled(Link)`
  position: relative;
  box-sizing: border-box;
  height: 36px;
  width: 36px;
  padding: 0;
  border-radius: ${({ theme }) => theme.radii.md};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid ${({ theme }) => theme.colors.border};
  flex: 0 0 auto;
  line-height: 1;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
  span {
    display: none;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    border-color: ${({ theme }) => theme.colors.textMuted};
    color: ${({ theme }) => theme.colors.text};
  }
  @media (min-width: 1100px) {
    width: auto;
    padding: 0 12px;
    gap: 6px;
    span {
      display: inline;
    }
  }
`;

const AccountMenu = styled(DropdownMenu.Content)`
  min-width: 220px;
  z-index: 70;
  padding: 6px 0;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 12px 28px rgb(0 0 0 / 8%);
`;

const AccountLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  color: inherit;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  outline: none;
  text-decoration: none;
  &:hover,
  &[data-highlighted] {
    background: ${({ theme }) => theme.colors.accent};
  }
`;

const AccountButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  outline: none;
  text-align: left;
  &:hover,
  &[data-highlighted] {
    background: ${({ theme }) => theme.colors.accent};
  }
`;

const AccountHead = styled.div`
  padding: 10px 14px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: grid;
  gap: 4px;
`;

const AccountStatus = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.success};
`;

const AccountEmail = styled.div`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.text};
  word-break: break-all;
  line-height: 1.35;
`;

const RolePill = styled.span`
  width: fit-content;
  margin-top: 2px;
  padding: 3px 7px;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const IconBtn = styled.button`
  position: relative;
  box-sizing: border-box;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: 0 0 auto;
  line-height: 1;
  transition: background 0.18s ease, color 0.18s ease;
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const DesktopOnly = styled.span`
  display: none;
  @media (min-width: 1024px) {
    display: contents;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 2px;
  right: 1px;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.textMuted};
  color: ${({ theme }) => theme.colors.background};
  font-size: 0.56rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
`;

const CatalogBtn = styled(Link)`
  display: none;
  box-sizing: border-box;
  height: 36px;
  padding: 0 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 600;
  line-height: 1;
  flex: 0 0 auto;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.textMuted};
  }
  @media (min-width: 1024px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
`;

const LangBtn = styled.button<{ $active?: boolean }>`
  border: 0;
  border-radius: 2px;
  height: 100%;
  min-width: 30px;
  background: ${({ $active, theme }) => ($active ? theme.colors.textMuted : "transparent")};
  color: ${({ $active, theme }) => ($active ? theme.colors.background : theme.colors.textMuted)};
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0 8px;
  font-weight: 600;
  line-height: 1;
  transition: background 0.18s ease, color 0.18s ease;
  &:hover {
    color: ${({ $active, theme }) => ($active ? theme.colors.background : theme.colors.text)};
  }
`;

const Overlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 42%);
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition: opacity 0.28s ease;
  z-index: 70;
`;

const Panel = styled.aside<{ $open: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: min(400px, 100%);
  height: 100dvh;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  transform: translateX(${({ $open }) => ($open ? "0" : "-102%")});
  transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 80;
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
`;

const PanelHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const PanelTitle = styled.p`
  margin: 0;
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 700;
`;

const PanelLink = styled(Link)`
  display: block;
  padding: 12px 0;
  font-size: 0.92rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: inherit;
  &:hover {
    opacity: 0.62;
  }
`;

const PanelSection = styled.p`
  margin: 18px 0 6px;
  font-size: 0.64rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const GhostBtn = styled.button`
  background: none;
  border: 0;
  padding: 9px 0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  font: inherit;
  color: inherit;
  text-align: left;
  &:hover {
    opacity: 0.62;
  }
`;

const SocialLink = styled.a`
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: inherit;
  transition: background 0.18s ease, color 0.18s ease;
  &:hover {
    background: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.background};
  }
`;

const PanelFoot = styled.div`
  padding: 16px 24px 22px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: grid;
  gap: 12px;
`;

type Props = {
  locale: Locale;
  dict: Messages;
  userEmail: string | null;
  isAdmin: boolean;
};

const iconStroke = 1.5;

export function HeaderBar({ locale: localeProp, dict: dictProp, userEmail, isAdmin }: Props) {
  const i18n = useI18nOptional();
  const locale = i18n?.locale ?? localeProp;
  const dict = i18n?.dict ?? dictProp;
  const pathname = usePathname() || "/";
  const { totalQuantity, ready, openDrawer } = useCart();
  const { ids: favIds, ready: favReady } = useFavorites();
  const [menuOpen, setMenuOpen] = useState(false);
  const shellRef = useRef<HTMLElement>(null);
  const navCategories = STORE_CATEGORIES;

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const sync = () => {
      document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function switchLocale(next: Locale) {
    if (i18n) {
      i18n.setLocale(next);
      return;
    }
    const rest = pathname.replace(/^\/(en|ru)(?=\/|$)/, "") || "/";
    const path = rest === "/" ? "" : rest;
    window.location.href = `/${next}${path}`;
  }

  const mk = (path: string) => (i18n ? i18n.path(path) : localizedPath(path, locale));
  const close = () => setMenuOpen(false);
  const cartCount = ready ? totalQuantity : 0;
  const favCount = favReady ? favIds.length : 0;

  const quickLinks = [
    {
      href: mk("/delivery-payment"),
      label: dict.nav.delivery,
      icon: Truck,
    },
    {
      href: mk("/products"),
      label: dict.home.newIn,
      icon: Sparkles,
    },
    {
      href: mk("/about"),
      label: dict.nav.about,
      icon: Info,
    },
    {
      href: mk("/how-to-order"),
      label: dict.nav.howToOrder,
      icon: ListOrdered,
    },
    {
      href: mk("/installment"),
      label: dict.nav.installment,
      icon: BadgePercent,
      tone: "installment" as const,
    },
    {
      href: mk("/promotions"),
      label: dict.nav.promotions,
      icon: Tag,
      tone: "promo" as const,
    },
  ];

  return (
    <Shell ref={shellRef}>
      <Top>
        <Burger type="button" aria-label={dict.common.openMenu} aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
          <Menu size={18} strokeWidth={iconStroke} />
        </Burger>
        <Social href="https://t.me/graciana_shoes_by" target="_blank" rel="noreferrer">
          <Send size={13} strokeWidth={iconStroke} />
          @graciana_shoes_by
        </Social>
        <BrandWrap>
          <BrandLogo href={mk("/")} withSub sub={dict.nav.brandSub} />
        </BrandWrap>
        <Right>
          <IconCluster>
            <DesktopOnly>
              <IconLink href={mk("/products")} aria-label={dict.products.search}>
                <Search size={18} strokeWidth={iconStroke} />
              </IconLink>
            </DesktopOnly>
            <IconLink href={mk("/products")} aria-label={dict.nav.favorites}>
              <Heart size={18} strokeWidth={iconStroke} />
              <Badge>{favCount}</Badge>
            </IconLink>
            <IconBtn type="button" aria-label={dict.nav.cart} onClick={openDrawer}>
              <ShoppingBag size={18} strokeWidth={iconStroke} />
              <Badge>{cartCount}</Badge>
            </IconBtn>
            <DesktopOnly>
              <ThemeToggle compact />
            </DesktopOnly>
          </IconCluster>
          <LangGroup>
            <LangBtn type="button" $active={locale === "ru"} onClick={() => switchLocale("ru")}>
              RU
            </LangBtn>
            <LangBtn type="button" $active={locale === "en"} onClick={() => switchLocale("en")}>
              EN
            </LangBtn>
          </LangGroup>
          <CatalogBtn href={mk("/products")}>{dict.nav.catalogPlus}</CatalogBtn>
          {userEmail ? (
            <DropdownMenu.Root modal={false}>
              <AccountTrigger
                aria-label={`${dict.nav.signedIn}: ${userEmail}`}
                title={`${dict.nav.signedInAs} ${userEmail}`}
              >
                {userEmail.slice(0, 1)}
                <OnlineDot aria-hidden />
              </AccountTrigger>
              <DropdownMenu.Portal>
                <AccountMenu align="end" sideOffset={8}>
                  <AccountHead>
                    <AccountStatus>
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 999,
                          background: "currentColor",
                          display: "inline-block",
                        }}
                      />
                      {dict.nav.signedIn}
                    </AccountStatus>
                    <AccountEmail>{userEmail}</AccountEmail>
                    {isAdmin ? <RolePill>{dict.nav.admin}</RolePill> : null}
                  </AccountHead>
                  <DropdownMenu.Item asChild>
                    <AccountLink href={mk("/account/orders")}>
                      <Package size={14} strokeWidth={iconStroke} />
                      {dict.nav.orders}
                    </AccountLink>
                  </DropdownMenu.Item>
                  {isAdmin ? (
                    <DropdownMenu.Item asChild>
                      <AccountLink href={mk("/admin")}>
                        <Settings size={14} strokeWidth={iconStroke} />
                        {dict.nav.admin}
                      </AccountLink>
                    </DropdownMenu.Item>
                  ) : null}
                  <form action={logout} style={{ margin: 0 }}>
                    <input type="hidden" name="locale" value={locale} />
                    <AccountButton type="submit">
                      <LogOut size={14} strokeWidth={iconStroke} />
                      {dict.nav.logout}
                    </AccountButton>
                  </form>
                </AccountMenu>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <GuestLogin href={mk("/login")} aria-label={dict.nav.login} title={dict.nav.login}>
              <LogIn size={15} strokeWidth={iconStroke} />
              <span>{dict.nav.signIn}</span>
            </GuestLogin>
          )}
        </Right>
      </Top>

      <HeaderQuickLinks items={quickLinks} ariaLabel={dict.nav.catalog} />

      <Overlay $open={menuOpen} onClick={close} />
      <Panel $open={menuOpen} aria-hidden={!menuOpen}>
        <PanelHead>
          <PanelTitle>{dict.nav.catalogPlus}</PanelTitle>
          <IconBtn type="button" aria-label={dict.common.closeMenu} onClick={close}>
            <X size={18} strokeWidth={iconStroke} />
          </IconBtn>
        </PanelHead>
        <AppScrollArea style={{ height: "100%" }} viewportStyle={{ padding: "8px 24px 28px" }}>
          <PanelLink href={mk("/products")} onClick={close}>
            {dict.nav.catalog}
          </PanelLink>
          <PanelSection>{dict.nav.categories}</PanelSection>
          {navCategories.map((item) => (
            <PanelLink
              key={item.key}
              href={`${mk("/products")}?category=${encodeURIComponent(item.key)}`}
              onClick={close}
            >
              {categoryLabel(item.key, locale)}
            </PanelLink>
          ))}
          <PanelSection>{dict.info.customerTitle}</PanelSection>
          <PanelLink href={mk("/how-to-order")} onClick={close}>
            {dict.nav.howToOrder}
          </PanelLink>
          <PanelLink href={mk("/delivery-payment")} onClick={close}>
            {dict.nav.delivery}
          </PanelLink>
          <PanelLink href={mk("/returns-exchange")} onClick={close}>
            {dict.nav.returns}
          </PanelLink>
          <PanelLink href={mk("/installment")} onClick={close}>
            {dict.nav.installment}
          </PanelLink>
          <PanelLink href={mk("/promotions")} onClick={close}>
            {dict.nav.promotions}
          </PanelLink>
          <PanelLink href={mk("/about")} onClick={close}>
            {dict.nav.about}
          </PanelLink>
          <PanelLink href={mk("/contacts")} onClick={close}>
            {dict.nav.contacts}
          </PanelLink>
          <PanelSection>{dict.nav.account}</PanelSection>
          <PanelLink href={mk("/products")} onClick={close}>
            {dict.nav.favorites}
          </PanelLink>
          <PanelLink
            href={mk("/cart")}
            onClick={(e) => {
              e.preventDefault();
              close();
              openDrawer();
            }}
          >
            {dict.nav.cart}
          </PanelLink>
          {userEmail ? (
            <>
              <div style={{ padding: "8px 0 4px", fontSize: "0.78rem", opacity: 0.72 }}>
                {dict.nav.signedInAs}
                <div style={{ marginTop: 4, color: "inherit", opacity: 1, wordBreak: "break-all" }}>{userEmail}</div>
                {isAdmin ? (
                  <div style={{ marginTop: 6, fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    {dict.nav.admin}
                  </div>
                ) : null}
              </div>
              <PanelLink href={mk("/account/orders")} onClick={close}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Package size={14} strokeWidth={iconStroke} /> {dict.nav.orders}
                </span>
              </PanelLink>
              {isAdmin ? (
                <PanelLink href={mk("/admin")} onClick={close}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <Settings size={14} strokeWidth={iconStroke} /> {dict.nav.admin}
                  </span>
                </PanelLink>
              ) : null}
              <form action={logout}>
                <input type="hidden" name="locale" value={locale} />
                <GhostBtn type="submit">{dict.nav.logout}</GhostBtn>
              </form>
            </>
          ) : (
            <>
              <PanelLink href={mk("/login")} onClick={close}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <LogIn size={14} strokeWidth={iconStroke} /> {dict.nav.signIn}
                </span>
              </PanelLink>
              <PanelLink href={mk("/register")} onClick={close}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <UserRoundPlus size={14} strokeWidth={iconStroke} /> {dict.nav.register}
                </span>
              </PanelLink>
            </>
          )}
        </AppScrollArea>
        <PanelFoot>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <LangGroup $always>
              <LangBtn type="button" $active={locale === "ru"} onClick={() => switchLocale("ru")}>
                RU
              </LangBtn>
              <LangBtn type="button" $active={locale === "en"} onClick={() => switchLocale("en")}>
                EN
              </LangBtn>
            </LangGroup>
            <ThemeToggle compact />
            <CurrencySwitch locale={locale} variant="pills" />
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--page-text-muted)" }}>
            <div>{dict.info.phones.join(" / ")}</div>
            <div>{dict.info.email}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <SocialLink href="https://www.instagram.com/graciana_shoes_by/" target="_blank" rel="noreferrer" aria-label="Instagram">
              <InstagramLogoIcon width={16} height={16} />
            </SocialLink>
            <SocialLink
              href="https://api.whatsapp.com/send/?phone=375297460114&text&type=phone_number&app_absent=0"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
            >
              <MessageCircle size={16} strokeWidth={iconStroke} />
            </SocialLink>
            <SocialLink href="https://t.me/graciana_shoes_by" target="_blank" rel="noreferrer" aria-label="Telegram">
              <Send size={16} strokeWidth={iconStroke} />
            </SocialLink>
            <SocialLink href="viber://chat?number=%2B375297460114" aria-label="Viber">
              <Phone size={16} strokeWidth={iconStroke} />
            </SocialLink>
          </div>
        </PanelFoot>
      </Panel>
    </Shell>
  );
}
