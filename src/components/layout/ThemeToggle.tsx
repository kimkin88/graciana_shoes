"use client";

import styled from "styled-components";
import { motion, useReducedMotion } from "framer-motion";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useThemeMode } from "@/context/theme-context";

const Toggle = styled(motion.button)`
  width: 38px;
  height: 38px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  const reduceMotion = useReducedMotion();
  return (
    <Toggle
      type="button"
      aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggleMode}
      whileTap={reduceMotion ? undefined : { scale: 0.95 }}
      whileHover={reduceMotion ? undefined : { y: -1 }}
      transition={{ duration: 0.15 }}
      title={mode === "dark" ? "Light mode" : "Dark mode"}
    >
      {mode === "dark" ? <SunIcon /> : <MoonIcon />}
    </Toggle>
  );
}
