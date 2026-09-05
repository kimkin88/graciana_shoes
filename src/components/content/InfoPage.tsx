"use client";

import Link from "next/link";
import styled from "styled-components";
import { useI18n } from "@/context/locale-context";
import { PageShell } from "@/components/layout/PageShell";

export type InfoPageKey =
  | "about"
  | "delivery"
  | "returns"
  | "howToOrder"
  | "installment"
  | "promotions"
  | "contacts";

type Props = {
  page: InfoPageKey;
};

const Eyebrow = styled.p`
  margin: 0;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Title = styled.h1`
  margin: 12px 0 14px;
  font-size: clamp(1.85rem, 8vw, 4.2rem);
  max-width: 14ch;
  line-height: 1.05;
`;

const Lead = styled.p`
  margin: 0 0 28px;
  max-width: 52ch;
  font-size: 1.05rem;
  line-height: 1.65;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Steps = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 14px;
`;

const Step = styled.li`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: start;
  padding: 16px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Num = styled.span`
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  color: ${({ theme }) => theme.colors.textMuted};
  padding-top: 4px;
`;

const StepText = styled.p`
  margin: 0;
  font-size: 1.02rem;
  line-height: 1.55;
`;

const Cards = styled.div`
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr;
  @media (min-width: 720px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 18px;
  display: grid;
  gap: 10px;
`;

const CardLabel = styled.p`
  margin: 0;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const CardText = styled.p`
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.55;
`;

const CardValue = styled.a`
  color: inherit;
  font-size: 1.02rem;
  width: fit-content;
`;

const Actions = styled.div`
  margin-top: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Action = styled(Link)<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid ${({ theme }) => theme.colors.text};
  background: ${({ theme, $primary }) => ($primary ? theme.colors.text : "transparent")};
  color: ${({ theme, $primary }) => ($primary ? theme.colors.background : theme.colors.text)};
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
  &:hover {
    background: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.background};
    transform: translateY(-1px);
  }
  @media (prefers-reduced-motion: reduce) {
    transition: background 0.18s ease, color 0.18s ease;
    &:hover {
      transform: none;
    }
  }
`;

const ActionExt = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid ${({ theme }) => theme.colors.text};
  color: inherit;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

const Note = styled.p`
  margin-top: 28px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.82rem;
`;

function contentFor(page: InfoPageKey, dict: ReturnType<typeof useI18n>["dict"]) {
  switch (page) {
    case "about":
      return { title: dict.info.aboutTitle, body: dict.info.aboutBody, variant: "steps" as const };
    case "delivery":
      return { title: dict.info.deliveryTitle, body: dict.info.deliveryBody, variant: "steps" as const };
    case "returns":
      return { title: dict.info.returnsTitle, body: dict.info.returnsBody, variant: "steps" as const };
    case "howToOrder":
      return { title: dict.info.howToOrderTitle, body: dict.info.howToOrderBody, variant: "steps" as const };
    case "installment":
      return { title: dict.info.installmentTitle, body: dict.info.installmentBody, variant: "steps" as const };
    case "promotions":
      return { title: dict.info.promotionsTitle, body: dict.info.promotionsBody, variant: "steps" as const };
    case "contacts":
      return { title: dict.info.contactsPageTitle, body: [dict.info.tagline], variant: "contacts" as const };
  }
}

/** Shared layout for how-to-order, delivery, contacts, and other info pages. */
export function InfoPage({ page }: Props) {
  const { dict, path } = useI18n();
  const { title, body, variant } = contentFor(page, dict);
  const catalog = path("/products");
  const contacts = path("/contacts");
  const lead = variant === "contacts" || body.length > 1 ? (body[0] ?? "") : "";
  const steps = variant === "contacts" ? [] : body.length > 1 ? body.slice(1) : body;

  return (
    <PageShell width="default">
      <Eyebrow>GRACIANA</Eyebrow>
      <Title>{title}</Title>
      {lead ? <Lead>{lead}</Lead> : null}

      {variant === "steps" ? (
        <Steps>
          {steps.map((line, idx) => (
            <Step key={`${idx}-${line.slice(0, 24)}`}>
              <Num>{String(idx + 1).padStart(2, "0")}</Num>
              <StepText>{line}</StepText>
            </Step>
          ))}
        </Steps>
      ) : (
        <Cards>
          <Card>
            <CardLabel>{dict.info.contactsTitle}</CardLabel>
            {dict.info.phones.map((phone) => (
              <CardValue key={phone} href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
                {phone}
              </CardValue>
            ))}
            <CardValue href={`mailto:${dict.info.email}`}>{dict.info.email}</CardValue>
          </Card>
          <Card>
            <CardLabel>{dict.info.workHours}</CardLabel>
            <CardText>{dict.info.address}</CardText>
          </Card>
          <Card style={{ gridColumn: "1 / -1" }}>
            <CardLabel>{dict.info.legalTitle}</CardLabel>
            <CardText>{dict.info.legal}</CardText>
          </Card>
        </Cards>
      )}

      <Actions>
        <Action href={catalog} $primary>
          {dict.nav.catalog}
        </Action>
        {variant !== "contacts" ? (
          <Action href={contacts}>{dict.nav.contacts}</Action>
        ) : (
          <ActionExt href={`mailto:${dict.info.email}`}>{dict.home.newsletterCta}</ActionExt>
        )}
      </Actions>
      <Note>{dict.info.sourceNotice}</Note>
    </PageShell>
  );
}
