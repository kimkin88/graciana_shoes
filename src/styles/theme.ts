/**
 * Central design tokens for styled-components ThemeProvider.
 * Extend this object as the storefront UI grows (spacing scale, radii, etc.).
 */
export const theme = {
  colors: {
    background: "#fafafa",
    surface: "#ffffff",
    text: "#0f172a",
    textMuted: "#64748b",
    border: "#e2e8f0",
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    danger: "#dc2626",
    success: "#16a34a",
  },
  radii: {
    sm: "6px",
    md: "10px",
    lg: "16px",
    pill: "9999px",
  },
  shadows: {
    sm: "0 1px 2px rgb(15 23 42 / 6%)",
    md: "0 8px 24px rgb(15 23 42 / 8%)",
  },
  space: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
  },
  font: {
    sans: "var(--font-geist-sans), system-ui, sans-serif",
    mono: "var(--font-geist-mono), ui-monospace, monospace",
  },
  breakpoints: {
    md: "768px",
    lg: "1024px",
  },
} as const;

export type AppTheme = typeof theme;
