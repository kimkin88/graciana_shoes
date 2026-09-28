"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import styled from "styled-components";

/** Keeps a portaled menu on its trigger. Shift is limited so the list cannot slide away. */
export const anchoredPopperProps = {
  side: "bottom" as const,
  sideOffset: 4,
  collisionPadding: 8,
  avoidCollisions: true,
  sticky: "partial" as const,
  hideWhenDetached: true,
  updatePositionStrategy: "always" as const,
};

type Option = {
  value: string;
  label: string;
};

type Props = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  ariaLabel?: string;
  align?: "start" | "center" | "end";
  tone?: "default" | "onDark";
  size?: "field" | "compact";
};

const Root = styled.div<{ $compact?: boolean }>`
  width: ${({ $compact }) => ($compact ? "auto" : "100%")};
  max-width: ${({ $compact }) => ($compact ? "14rem" : "none")};
  min-width: 0;
`;

const Trigger = styled(Select.Trigger)<{ $onDark?: boolean; $compact?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  height: ${({ $compact }) => ($compact ? "36px" : "42px")};
  padding: ${({ $compact }) => ($compact ? "0 10px" : "0 12px")};
  border: 1px solid
    ${({ theme, $onDark }) => ($onDark ? "rgb(246 243 238 / 28%)" : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  color: ${({ theme, $onDark }) => ($onDark ? "#f6f3ee" : theme.colors.text)};
  font-size: ${({ $compact }) => ($compact ? "0.68rem" : "0.86rem")};
  letter-spacing: ${({ $compact }) => ($compact ? "0.08em" : "0")};
  text-transform: ${({ $compact }) => ($compact ? "uppercase" : "none")};
  cursor: pointer;
  outline: none;
  > span:first-of-type {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &[data-placeholder] {
    color: ${({ theme, $onDark }) => ($onDark ? "rgb(246 243 238 / 68%)" : theme.colors.textMuted)};
  }
  &:hover {
    border-color: ${({ theme, $onDark }) => ($onDark ? "rgb(246 243 238 / 55%)" : theme.colors.text)};
  }
`;

const Icon = styled(Select.Icon)`
  display: inline-flex;
  flex: 0 0 auto;
  color: currentColor;
  opacity: 0.7;
`;

const Content = styled(Select.Content)<{ $onDark?: boolean }>`
  z-index: 80;
  overflow: hidden;
  box-sizing: border-box;
  width: var(--radix-select-trigger-width);
  min-width: var(--radix-select-trigger-width);
  max-width: min(var(--radix-select-content-available-width), calc(100vw - 16px));
  background: ${({ theme, $onDark }) => ($onDark ? "#161616" : theme.colors.surface)};
  color: ${({ theme, $onDark }) => ($onDark ? "#f6f3ee" : theme.colors.text)};
  border: 1px solid
    ${({ theme, $onDark }) => ($onDark ? "rgb(246 243 238 / 28%)" : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 12px 28px rgb(0 0 0 / 16%);
`;

const Viewport = styled(Select.Viewport)`
  padding: 4px;
  max-height: var(--radix-select-content-available-height);
`;

const Item = styled(Select.Item)<{ $onDark?: boolean }>`
  padding: 10px 12px;
  font-size: 0.86rem;
  line-height: 1.35;
  outline: none;
  cursor: pointer;
  border-radius: 2px;
  color: inherit;
  &[data-highlighted] {
    background: ${({ theme, $onDark }) =>
      $onDark ? "rgb(246 243 238 / 12%)" : theme.colors.accent};
  }
  &[data-state="checked"] {
    font-weight: 600;
  }
`;

export function AppSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  ariaLabel,
  align = "start",
  tone = "default",
  size = "field",
}: Props) {
  const onDark = tone === "onDark";
  const compact = size === "compact";
  const current = options.some((option) => option.value === value) ? value : undefined;

  return (
    <Root $compact={compact}>
      <Select.Root value={current} onValueChange={onValueChange}>
        <Trigger id={id} aria-label={ariaLabel} $onDark={onDark} $compact={compact}>
          <Select.Value placeholder={placeholder} />
          <Icon>
            <ChevronDown size={14} strokeWidth={1.75} aria-hidden />
          </Icon>
        </Trigger>
        <Select.Portal>
          <Content position="popper" align={align} $onDark={onDark} {...anchoredPopperProps}>
            <Viewport>
              {options.map((option) => (
                <Item key={option.value} value={option.value} $onDark={onDark}>
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Item>
              ))}
            </Viewport>
          </Content>
        </Select.Portal>
      </Select.Root>
    </Root>
  );
}
