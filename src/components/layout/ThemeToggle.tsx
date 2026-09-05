"use client";

import styled from "styled-components";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "@/context/theme-context";

const Toggle = styled.button<{ $compact?: boolean }>`
  box-sizing: border-box;
  width: ${({ $compact }) => ($compact ? "36px" : "40px")};
  height: ${({ $compact }) => ($compact ? "36px" : "40px")};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: 0 0 auto;
  line-height: 1;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.16s ease;
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.text};
  }
  &:active {
    transform: scale(0.94);
  }
  @media (prefers-reduced-motion: reduce) {
    &:active {
      transform: none;
    }
  }
`;

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { mode, toggleMode } = useThemeMode();
  const reduceMotion = useReducedMotion();
  return (
    <Toggle
      type="button"
      $compact={compact}
      aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggleMode}
      title={mode === "dark" ? "Light mode" : "Dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mode}
          initial={reduceMotion ? false : { opacity: 0, rotate: -40, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, rotate: 40, scale: 0.8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "inline-flex" }}
        >
          {mode === "dark" ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
        </motion.span>
      </AnimatePresence>
    </Toggle>
  );
}
