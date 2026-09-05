"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import * as Select from "@radix-ui/react-select";
import * as Slider from "@radix-ui/react-slider";
import { CheckIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import { Input } from "@/components/ui/Input";
import { localizedPath } from "@/i18n/routing";
import { categoryLabel } from "@/lib/catalog/categories";
import { useI18nOptional } from "@/context/locale-context";

const Layout = styled.div`
  display: grid;
  gap: 22px;
  @media (min-width: 980px) {
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 28px;
    align-items: start;
  }
`;

const FiltersToggle = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  @media (min-width: 980px) {
    display: none;
  }
`;

const Sidebar = styled.aside<{ $open?: boolean }>`
  background: ${({ theme }) => theme.colors.accent};
  padding: 18px 16px;
  display: ${({ $open }) => ($open ? "grid" : "none")};
  gap: 22px;
  @media (min-width: 980px) {
    display: grid;
  }
`;

const Main = styled.div`
  min-width: 0;
  display: grid;
  gap: 18px;
`;

const Section = styled.section`
  display: grid;
  gap: 10px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
`;

const CheckRow = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 40px;
  font-size: 0.9rem;
  cursor: pointer;
`;

const Box = styled(Checkbox.Root)`
  width: 22px;
  height: 22px;
  border: 1px solid ${({ theme }) => theme.colors.text};
  background: transparent;
  display: grid;
  place-items: center;
  flex: 0 0 22px;
  &[data-state="checked"] {
    background: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.background};
  }
`;

const MoreBtn = styled.button`
  border: 0;
  background: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.82rem;
  text-align: left;
  cursor: pointer;
  width: fit-content;
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const PriceInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const Range = styled(Slider.Root)`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 24px;
  user-select: none;
  touch-action: none;
`;

const Track = styled(Slider.Track)`
  background: ${({ theme }) => theme.colors.border};
  position: relative;
  flex-grow: 1;
  height: 2px;
`;

const RangeFill = styled(Slider.Range)`
  position: absolute;
  background: ${({ theme }) => theme.colors.text};
  height: 100%;
`;

const Thumb = styled(Slider.Thumb)`
  display: block;
  width: 20px;
  height: 20px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.text};
  border-radius: 999px;
  cursor: pointer;
`;

const Toolbar = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 10px;
  align-items: center;
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const SearchWrap = styled.div`
  position: relative;
  min-width: 0;
`;

const SearchIcon = styled(MagnifyingGlassIcon)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.45;
  pointer-events: none;
`;

const SearchInput = styled(Input)`
  height: 42px;
  padding-right: 36px;
  box-sizing: border-box;
`;

const SelectTrigger = styled(Select.Trigger)`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  height: 42px;
  box-sizing: border-box;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.86rem;
  cursor: pointer;
  outline: none;
  &[data-placeholder] {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const SelectIcon = styled(Select.Icon)`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.textMuted};
  flex: 0 0 auto;
`;

const SelectContent = styled(Select.Content)`
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  z-index: 60;
  box-shadow: 0 12px 28px rgb(0 0 0 / 8%);
  width: var(--radix-select-trigger-width);
  min-width: var(--radix-select-trigger-width);
`;

const SelectViewport = styled(Select.Viewport)`
  padding: 4px;
`;

const SelectItem = styled(Select.Item)`
  padding: 10px 12px;
  font-size: 0.86rem;
  outline: none;
  cursor: pointer;
  border-radius: 2px;
  color: ${({ theme }) => theme.colors.text};
  &[data-highlighted] {
    background: ${({ theme }) => theme.colors.accent};
  }
  &[data-state="checked"] {
    font-weight: 600;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button<{ $primary?: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.text};
  background: ${({ theme, $primary }) => ($primary ? theme.colors.text : "transparent")};
  color: ${({ theme, $primary }) => ($primary ? theme.colors.background : theme.colors.text)};
  padding: 12px 14px;
  min-height: 44px;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  &:hover {
    opacity: 0.86;
  }
`;

const SortWrap = styled.div`
  width: 100%;
  min-width: 0;
`;

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
  initialSort?: string;
  children: React.ReactNode;
};

const PRICE_MAX_MAJOR = 30000;

function Chevron() {
  return <ChevronDown size={14} strokeWidth={1.75} aria-hidden />;
}

/** Left sidebar filters + search/sort toolbar around the product grid. */
export function ProductFilters({
  locale: localeProp,
  dict: dictProp,
  categories,
  colors,
  sizes,
  initialQ = "",
  initialCategory = "",
  initialColor = "",
  initialSize = "",
  initialMin = "",
  initialMax = "",
  initialSort = "default",
  children,
}: Props) {
  const i18n = useI18nOptional();
  const locale = i18n?.locale ?? localeProp;
  const dict = i18n?.dict ?? dictProp;
  const router = useRouter();
  const pathname = usePathname();
  const baseList = localizedPath("/products", locale);

  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [selectedColors, setSelectedColors] = useState<string[]>(
    initialColor ? initialColor.split(",").filter(Boolean) : [],
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    initialSize ? initialSize.split(",").filter(Boolean) : [],
  );
  const [min, setMin] = useState(initialMin || "0");
  const [max, setMax] = useState(initialMax || String(PRICE_MAX_MAJOR));
  const [sort, setSort] = useState(initialSort || "default");
  const [showAllSizes, setShowAllSizes] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const visibleSizes = useMemo(
    () => (showAllSizes ? sizes : sizes.slice(0, 8)),
    [sizes, showAllSizes],
  );
  const visibleColors = useMemo(
    () => (showAllColors ? colors : colors.slice(0, 8)),
    [colors, showAllColors],
  );

  const rangeValue = [
    Math.max(0, Number.parseInt(min, 10) || 0),
    Math.min(PRICE_MAX_MAJOR, Number.parseInt(max, 10) || PRICE_MAX_MAJOR),
  ] as [number, number];

  const apply = useCallback(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (selectedColors[0]) params.set("color", selectedColors[0]);
    if (selectedSizes[0]) params.set("size", selectedSizes[0]);
    if (min.trim() && min !== "0") params.set("min", min.trim());
    if (max.trim() && max !== String(PRICE_MAX_MAJOR)) params.set("max", max.trim());
    if (sort && sort !== "default") params.set("sort", sort);
    const qs = params.toString();
    const target = pathname?.startsWith("/") ? pathname : baseList;
    router.push(qs ? `${target}?${qs}` : target);
    setFiltersOpen(false);
  }, [q, category, selectedColors, selectedSizes, min, max, sort, router, pathname, baseList]);

  const reset = useCallback(() => {
    setQ("");
    setCategory("");
    setSelectedColors([]);
    setSelectedSizes([]);
    setMin("0");
    setMax(String(PRICE_MAX_MAJOR));
    setSort("default");
    router.push(pathname?.startsWith("/") ? pathname : baseList);
  }, [router, pathname, baseList]);

  function toggleIn(list: string[], value: string, setter: (next: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  return (
    <Layout>
      <FiltersToggle
        type="button"
        aria-expanded={filtersOpen}
        onClick={() => setFiltersOpen((v) => !v)}
      >
        <span>{filtersOpen ? dict.products.hideFilters : dict.products.filters}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          aria-hidden
          style={{
            transform: filtersOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s ease",
          }}
        />
      </FiltersToggle>
      <Sidebar $open={filtersOpen}>
        <Section>
          <SectionTitle>{dict.products.category}</SectionTitle>
          <Select.Root value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? "" : v)}>
            <SelectTrigger aria-label={dict.products.category}>
              <Select.Value placeholder={dict.products.allCategories} />
              <SelectIcon>
                <Chevron />
              </SelectIcon>
            </SelectTrigger>
            <Select.Portal>
              <SelectContent position="popper" side="bottom" align="start" sideOffset={4} avoidCollisions={false}>
                <SelectViewport>
                  <SelectItem value="all">
                    <Select.ItemText>{dict.products.allCategories}</Select.ItemText>
                  </SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      <Select.ItemText>{categoryLabel(c, locale)}</Select.ItemText>
                    </SelectItem>
                  ))}
                </SelectViewport>
              </SelectContent>
            </Select.Portal>
          </Select.Root>
        </Section>

        <Section>
          <SectionTitle>{dict.products.size}</SectionTitle>
          {visibleSizes.map((item) => (
            <CheckRow key={item}>
              <Box
                checked={selectedSizes.includes(item)}
                onCheckedChange={() => toggleIn(selectedSizes, item, setSelectedSizes)}
              >
                <Checkbox.Indicator>
                  <CheckIcon width={12} height={12} />
                </Checkbox.Indicator>
              </Box>
              <span>{item}</span>
            </CheckRow>
          ))}
          {sizes.length > 8 ? (
            <MoreBtn type="button" onClick={() => setShowAllSizes((v) => !v)}>
              {showAllSizes ? dict.products.reset : dict.products.showAll}
            </MoreBtn>
          ) : null}
        </Section>

        <Section>
          <SectionTitle>{dict.products.price}</SectionTitle>
          <Range
            min={0}
            max={PRICE_MAX_MAJOR}
            step={10}
            value={rangeValue}
            onValueChange={(value) => {
              setMin(String(value[0] ?? 0));
              setMax(String(value[1] ?? PRICE_MAX_MAJOR));
            }}
          >
            <Track>
              <RangeFill />
            </Track>
            <Thumb aria-label={dict.products.priceMin} />
            <Thumb aria-label={dict.products.priceMax} />
          </Range>
          <PriceInputs>
            <Input value={min} onChange={(e) => setMin(e.target.value)} inputMode="numeric" />
            <Input value={max} onChange={(e) => setMax(e.target.value)} inputMode="numeric" />
          </PriceInputs>
        </Section>

        <Section>
          <SectionTitle>{dict.products.color}</SectionTitle>
          {visibleColors.map((item) => (
            <CheckRow key={item}>
              <Box
                checked={selectedColors.includes(item)}
                onCheckedChange={() => toggleIn(selectedColors, item, setSelectedColors)}
              >
                <Checkbox.Indicator>
                  <CheckIcon width={12} height={12} />
                </Checkbox.Indicator>
              </Box>
              <span>{item}</span>
            </CheckRow>
          ))}
          {colors.length > 8 ? (
            <MoreBtn type="button" onClick={() => setShowAllColors((v) => !v)}>
              {showAllColors ? dict.products.reset : dict.products.showAll}
            </MoreBtn>
          ) : null}
        </Section>

        <Actions>
          <ActionBtn type="button" $primary onClick={apply}>
            {dict.products.apply}
          </ActionBtn>
          <ActionBtn type="button" onClick={reset}>
            {dict.products.reset}
          </ActionBtn>
        </Actions>
      </Sidebar>

      <Main>
        <Toolbar>
          <SearchWrap>
            <SearchInput
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") apply();
              }}
              placeholder={dict.products.search}
            />
            <SearchIcon width={16} height={16} />
          </SearchWrap>
          <SortWrap>
            <Select.Root
              value={sort || "default"}
              onValueChange={(value) => {
                setSort(value);
                const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
                if (value === "default") params.delete("sort");
                else params.set("sort", value);
                const qs = params.toString();
                const target = pathname?.startsWith("/") ? pathname : baseList;
                router.push(qs ? `${target}?${qs}` : target);
              }}
            >
              <SelectTrigger aria-label={dict.products.sort}>
                <Select.Value placeholder={dict.products.sortDefault} />
                <SelectIcon>
                  <Chevron />
                </SelectIcon>
              </SelectTrigger>
              <Select.Portal>
                <SelectContent position="popper" side="bottom" align="end" sideOffset={4} avoidCollisions={false}>
                  <SelectViewport>
                    <SelectItem value="default">
                      <Select.ItemText>{dict.products.sortDefault}</Select.ItemText>
                    </SelectItem>
                    <SelectItem value="price-asc">
                      <Select.ItemText>{dict.products.sortPriceAsc}</Select.ItemText>
                    </SelectItem>
                    <SelectItem value="price-desc">
                      <Select.ItemText>{dict.products.sortPriceDesc}</Select.ItemText>
                    </SelectItem>
                    <SelectItem value="new">
                      <Select.ItemText>{dict.products.sortNew}</Select.ItemText>
                    </SelectItem>
                  </SelectViewport>
                </SelectContent>
              </Select.Portal>
            </Select.Root>
          </SortWrap>
        </Toolbar>
        {children}
      </Main>
    </Layout>
  );
}
