"use client";

import styled from "styled-components";
import { Banknote, Package, ShoppingBag } from "lucide-react";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
`;

const Tile = styled.article`
  position: relative;
  display: grid;
  gap: 18px;
  padding: 22px 20px 20px;
  background: ${({ theme }) => theme.colors.accent};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  &::after {
    content: "";
    position: absolute;
    inset: auto -20% -40% auto;
    width: 120px;
    height: 120px;
    border-radius: 999px;
    background: color-mix(in srgb, ${({ theme }) => theme.colors.text} 5%, transparent);
    pointer-events: none;
  }
`;

const Top = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const Label = styled.p`
  margin: 0;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.35;
`;

const IconWrap = styled.span`
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  flex: 0 0 auto;
`;

const Value = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.font.display};
  font-size: clamp(1.8rem, 3vw, 2.35rem);
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1;
`;

export type AdminStatIcon = "banknote" | "bag" | "package";

export type AdminStatItem = {
  label: string;
  value: string;
  icon: AdminStatIcon;
};

function StatIcon({ name }: { name: AdminStatIcon }) {
  const props = { size: 15, strokeWidth: 1.7, "aria-hidden": true as const };
  if (name === "banknote") return <Banknote {...props} />;
  if (name === "bag") return <ShoppingBag {...props} />;
  return <Package {...props} />;
}

/** Soft metric tiles for the admin dashboard (icons resolved on the client). */
export function AdminStatGrid({ items }: { items: AdminStatItem[] }) {
  return (
    <Grid>
      {items.map((item) => (
        <Tile key={item.label}>
          <Top>
            <Label>{item.label}</Label>
            <IconWrap>
              <StatIcon name={item.icon} />
            </IconWrap>
          </Top>
          <Value>{item.value}</Value>
        </Tile>
      ))}
    </Grid>
  );
}
