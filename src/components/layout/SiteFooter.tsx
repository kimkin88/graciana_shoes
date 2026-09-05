"use client";

import Link from "next/link";
import styled from "styled-components";
import { useI18n } from "@/context/locale-context";
import { CurrencySwitch } from "@/components/layout/CurrencySwitch";

const Foot = styled.footer`
  margin-top: auto;
  background: #0a0a0a;
  color: #f6f3ee;
  border-top: 1px solid rgb(246 243 238 / 12%);
`;

const Inner = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 40px clamp(14px, 4vw, 40px) 32px;
  display: grid;
  gap: 36px;
  grid-template-columns: 1fr;
  @media (min-width: 760px) {
    padding: 56px clamp(16px, 4vw, 40px) 40px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (min-width: 900px) {
    padding-right: max(clamp(16px, 4vw, 40px), 72px);
  }
  @media (min-width: 1100px) {
    grid-template-columns: 1.35fr 1fr 1fr 1.1fr;
    gap: 40px;
  }
`;

const Brand = styled.p`
  margin: 0 0 12px;
  font-family: ${({ theme }) => theme.font.display};
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  letter-spacing: 0.16em;
  color: #fff;
  line-height: 1;
`;

const Muted = styled.p`
  margin: 0;
  color: rgb(246 243 238 / 68%);
  font-size: 0.84rem;
  line-height: 1.55;
`;

const Solid = styled.p`
  margin: 0;
  color: #f6f3ee;
  font-size: 0.88rem;
  line-height: 1.55;
`;

const ColTitle = styled.h4`
  margin: 0 0 14px;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
  color: rgb(246 243 238 / 55%);
`;

const LinkList = styled.div`
  display: grid;
  gap: 10px;
`;

const FootLink = styled(Link)`
  color: #f6f3ee;
  font-size: 0.9rem;
  width: fit-content;
  transition: color 0.18s ease, opacity 0.18s ease;
  &:hover {
    color: #fff;
    opacity: 0.78;
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const ContactLink = styled.a`
  color: #f6f3ee;
  font-size: 0.9rem;
  width: fit-content;
  transition: color 0.18s ease, opacity 0.18s ease;
  &:hover {
    color: #fff;
    opacity: 0.78;
  }
`;

const Legal = styled.p`
  margin: 0;
  color: rgb(246 243 238 / 62%);
  white-space: pre-wrap;
  font-size: 0.8rem;
  line-height: 1.55;
`;

const Bottom = styled.div`
  border-top: 1px solid rgb(246 243 238 / 10%);
  padding: 16px clamp(16px, 4vw, 40px) 28px;
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  align-items: center;
  justify-content: space-between;
`;

export function SiteFooter() {
  const { locale, dict, path } = useI18n();

  return (
    <Foot>
      <Inner>
        <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <Brand>GRACIANA</Brand>
          <Muted>{dict.info.tagline}</Muted>
          <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
            {dict.info.phones.map((phone) => (
              <ContactLink key={phone} href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
                {phone}
              </ContactLink>
            ))}
            <ContactLink href={`mailto:${dict.info.email}`}>{dict.info.email}</ContactLink>
          </div>
        </div>

        <div>
          <ColTitle>{dict.info.customerTitle}</ColTitle>
          <LinkList>
            <FootLink href={path("/products")}>{dict.nav.catalog}</FootLink>
            <FootLink href={path("/delivery-payment")}>{dict.nav.delivery}</FootLink>
            <FootLink href={path("/returns-exchange")}>{dict.nav.returns}</FootLink>
            <FootLink href={path("/how-to-order")}>{dict.nav.howToOrder}</FootLink>
            <FootLink href={path("/installment")}>{dict.nav.installment}</FootLink>
            <FootLink href={path("/promotions")}>{dict.nav.promotions}</FootLink>
            <FootLink href={path("/contacts")}>{dict.nav.contacts}</FootLink>
          </LinkList>
        </div>

        <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <ColTitle>{dict.info.contactsTitle}</ColTitle>
          <Solid style={{ whiteSpace: "pre-wrap" }}>{dict.info.address}</Solid>
          <Muted>{dict.info.workHours}</Muted>
        </div>

        <div>
          <ColTitle>{dict.info.legalTitle}</ColTitle>
          <Legal>{dict.info.legal}</Legal>
        </div>
      </Inner>

      <Bottom>
        <CurrencySwitch locale={locale} variant="select" tone="onDark" />
        <Muted style={{ fontSize: "0.75rem" }}>© {new Date().getFullYear()} Graciana</Muted>
      </Bottom>
    </Foot>
  );
}
