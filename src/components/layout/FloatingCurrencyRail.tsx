"use client";

import styled from "styled-components";
import { useCurrency } from "@/context/currency-context";
import { STOREFRONT_CURRENCIES, isStorefrontCurrency } from "@/lib/money/fx";

const Rail = styled.div`
  display: none;
  @media (min-width: 900px) {
    position: fixed;
    top: 50%;
    right: 12px;
    z-index: 55;
    transform: translateY(-50%);
    display: grid;
    gap: 6px;
    padding: 6px;
    background: ${({ theme }) => theme.colors.background};
    border: 1px solid ${({ theme }) => theme.colors.border};
    box-shadow: 0 12px 28px rgb(0 0 0 / 10%);
  }
`;

const Cell = styled.button<{ $active?: boolean }>`
  width: 46px;
  min-height: 46px;
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.text : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.text : "transparent")};
  color: ${({ theme, $active }) => ($active ? theme.colors.background : theme.colors.text)};
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
  &:hover {
    border-color: ${({ theme }) => theme.colors.text};
    transform: translateY(-1px);
  }
  @media (prefers-reduced-motion: reduce) {
    transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
    &:hover {
      transform: none;
    }
  }
`;

/** Vertical BYN / RUB switcher — editorial styling aligned with the shop. */
export function FloatingCurrencyRail() {
  const { displayCurrency, setDisplayCurrency, rates } = useCurrency();
  const date = rates.date ? rates.date.slice(0, 10) : "";
  const active = isStorefrontCurrency(displayCurrency) ? displayCurrency : "BYN";

  return (
    <Rail role="group" aria-label="Currency">
      {STOREFRONT_CURRENCIES.map((item) => (
        <Cell
          key={item.code}
          type="button"
          $active={active === item.code}
          title={date ? `NBRB ${date}` : item.code}
          aria-pressed={active === item.code}
          onClick={() => setDisplayCurrency(item.code)}
        >
          {item.code === "BYN" ? "BYN" : "₽"}
        </Cell>
      ))}
    </Rail>
  );
}
