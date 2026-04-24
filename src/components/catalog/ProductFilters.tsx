"use client";

import * as Select from "@radix-ui/react-select";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { localizedPath } from "@/i18n/routing";

const Panel = styled(motion.div)`
  display: grid;
  gap: ${({ theme }) => theme.space.md};
  padding: ${({ theme }) => theme.space.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  @media (max-width: 700px) {
    padding: 12px;
    gap: 12px;
  }
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.md};
  align-items: flex-end;
  @media (max-width: 700px) {
    gap: 10px;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
  flex: 1 1 160px;
  @media (max-width: 700px) {
    min-width: 100%;
    flex: 1 1 100%;
  }
`;

const Label = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 500;
`;

const SelectTrigger = styled(Select.Trigger)`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 1px;
  }
`;

const SelectIconWrap = styled(Select.Icon)`
  margin-left: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

const SelectContent = styled(Select.Content)`
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: 50;
`;

const SelectItem = styled(Select.Item)`
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  outline: none;
  &[data-highlighted] {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  @media (max-width: 700px) {
    display: grid;
    grid-template-columns: 1fr;
  }
`;

const ActionButton = styled(Button)`
  min-width: 120px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.text};
  border-color: ${({ theme }) => theme.colors.textMuted};
  box-shadow: none;
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.text};
  }
  @media (max-width: 700px) {
    width: 100%;
    min-width: 0;
  }
`;

const ALL = "__all__";

type Props = {
  locale: Locale;
  dict: Messages;
  categories: string[];
  colors: string[];
  sizes: string[];
  initialQ?: string;
  initialCategory?: string;
  initialColor?: string;
  initialSize?: string;
  initialMin?: string;
  initialMax?: string;
};

/** Client-side filters using Radix Select + URL search params (shareable links). */
export function ProductFilters({
  locale,
  dict,
  categories,
  colors,
  sizes,
  initialQ = "",
  initialCategory = "",
  initialColor = "",
  initialSize = "",
  initialMin = "",
  initialMax = "",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const baseList = localizedPath("/products", locale);
  const reduceMotion = useReducedMotion();

  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory || ALL);
  const [color, setColor] = useState(initialColor || ALL);
  const [size, setSize] = useState(initialSize || ALL);
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);

  const selectValue = useMemo(
    () => (category && category !== ALL ? category : ALL),
    [category],
  );

  const apply = useCallback(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category && category !== ALL) params.set("category", category);
    if (color && color !== ALL) params.set("color", color);
    if (size && size !== ALL) params.set("size", size);
    if (min.trim()) params.set("min", min.trim());
    if (max.trim()) params.set("max", max.trim());
    const qs = params.toString();
    const target = pathname?.startsWith("/") ? pathname : baseList;
    router.push(qs ? `${target}?${qs}` : target);
  }, [q, category, color, size, min, max, router, pathname, baseList]);

  const reset = useCallback(() => {
    setQ("");
    setCategory(ALL);
    setColor(ALL);
    setSize(ALL);
    setMin("");
    setMax("");
    router.push(pathname?.startsWith("/") ? pathname : baseList);
  }, [router, pathname, baseList]);

  return (
    <Panel
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <Row>
        <Field style={{ flex: "2 1 220px" }}>
          <Label>{dict.products.search}</Label>
          <Input value={q} onChange={(e) => setQ(e.target.value)} />
        </Field>
        <Field style={{ minWidth: 200 }}>
          <Label>{dict.products.category}</Label>
          <Select.Root
            value={selectValue}
            onValueChange={(v) => setCategory(v === ALL ? ALL : v)}
          >
            <SelectTrigger aria-label={dict.products.category}>
              <Select.Value placeholder={dict.products.allCategories} />
              <SelectIconWrap>▾</SelectIconWrap>
            </SelectTrigger>
            <Select.Portal>
              <SelectContent position="popper" sideOffset={4}>
                <Select.Viewport>
                  <SelectItem value={ALL}>{dict.products.allCategories}</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </Select.Viewport>
              </SelectContent>
            </Select.Portal>
          </Select.Root>
        </Field>
        <Field style={{ width: 120, flex: "0 0 120px" }}>
          <Label>{dict.products.color}</Label>
          <Select.Root value={color} onValueChange={(v) => setColor(v === ALL ? ALL : v)}>
            <SelectTrigger aria-label={dict.products.color}>
              <Select.Value placeholder={dict.products.allColors} />
              <SelectIconWrap>▾</SelectIconWrap>
            </SelectTrigger>
            <Select.Portal>
              <SelectContent position="popper" sideOffset={4}>
                <Select.Viewport>
                  <SelectItem value={ALL}>{dict.products.allColors}</SelectItem>
                  {colors.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </Select.Viewport>
              </SelectContent>
            </Select.Portal>
          </Select.Root>
        </Field>
        <Field style={{ width: 120, flex: "0 0 120px" }}>
          <Label>{dict.products.size}</Label>
          <Select.Root value={size} onValueChange={(v) => setSize(v === ALL ? ALL : v)}>
            <SelectTrigger aria-label={dict.products.size}>
              <Select.Value placeholder={dict.products.allSizes} />
              <SelectIconWrap>▾</SelectIconWrap>
            </SelectTrigger>
            <Select.Portal>
              <SelectContent position="popper" sideOffset={4}>
                <Select.Viewport>
                  <SelectItem value={ALL}>{dict.products.allSizes}</SelectItem>
                  {sizes.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </Select.Viewport>
              </SelectContent>
            </Select.Portal>
          </Select.Root>
        </Field>
        <Field style={{ width: 120, flex: "0 0 120px" }}>
          <Label>{dict.products.priceMin}</Label>
          <Input
            type="number"
            min={0}
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
        </Field>
        <Field style={{ width: 120, flex: "0 0 120px" }}>
          <Label>{dict.products.priceMax}</Label>
          <Input
            type="number"
            min={0}
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />
        </Field>
      </Row>
      <Actions>
        <ActionButton type="button" onClick={apply}>
          {dict.products.apply}
        </ActionButton>
        <ActionButton type="button" onClick={reset}>
          {dict.products.reset}
        </ActionButton>
      </Actions>
    </Panel>
  );
}
