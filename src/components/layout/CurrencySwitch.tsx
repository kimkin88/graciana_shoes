"use client";

import styled from "styled-components";
import type { Locale } from "@/i18n/config";
import { AppSelect } from "@/components/ui/AppSelect";
import { useCurrency } from "@/context/currency-context";
import { STOREFRONT_CURRENCIES } from "@/lib/money/fx";

const Pills = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
`;

const Pill = styled.button<{ $active?: boolean; $onDark?: boolean }>`
  border: 1px solid
    ${({ theme, $active, $onDark }) =>
      $onDark
        ? $active
          ? "#f6f3ee"
          : "rgb(246 243 238 / 28%)"
        : $active
          ? theme.colors.text
          : theme.colors.border};
  background: ${({ theme, $active, $onDark }) =>
    $active ? ($onDark ? "#f6f3ee" : theme.colors.text) : "transparent"};
  color: ${({ theme, $active, $onDark }) =>
    $active ? ($onDark ? "#0a0a0a" : theme.colors.background) : $onDark ? "#f6f3ee" : theme.colors.text};
  padding: 8px 12px;
  font-size: 0.66rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  line-height: 1;
  white-space: nowrap;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
  &:hover {
    border-color: ${({ theme, $onDark }) => ($onDark ? "#f6f3ee" : theme.colors.text)};
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Hint = styled.span`
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

type Props = {
  locale: Locale;
  variant?: "select" | "pills" | "bar";
  label?: string;
  tone?: "default" | "onDark";
};

export function CurrencySwitch({ locale, variant = "select", label, tone = "default" }: Props) {
  const { displayCurrency, setDisplayCurrency, rates } = useCurrency();
  const date = rates.date ? rates.date.slice(0, 10) : "";
  const onDark = tone === "onDark";

  if (variant === "select") {
    return (
      <AppSelect
        size="compact"
        tone={onDark ? "onDark" : "default"}
        ariaLabel="Currency"
        value={displayCurrency}
        onValueChange={setDisplayCurrency}
        options={STOREFRONT_CURRENCIES.map((item) => ({
          value: item.code,
          label: `${item.symbol} ${locale === "en" ? item.en : item.ru}`,
        }))}
      />
    );
  }

  const pills = (
    <Pills role="group" aria-label="Currency">
      {STOREFRONT_CURRENCIES.map((item) => (
        <Pill
          key={item.code}
          type="button"
          $onDark={onDark}
          $active={displayCurrency === item.code}
          title={date ? `NBRB ${date}` : "NBRB"}
          onClick={() => setDisplayCurrency(item.code)}
        >
          {item.symbol} {locale === "en" ? item.en : item.ru}
        </Pill>
      ))}
    </Pills>
  );

  if (variant === "bar") {
    return (
      <Bar>
        <Hint>{label ?? (locale === "en" ? "Currency" : "Валюта")}</Hint>
        {pills}
      </Bar>
    );
  }

  return pills;
}
