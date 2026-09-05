type ThemeColors = {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryHover: string;
  danger: string;
  success: string;
  accent: string;
  buttonPrimaryBg: string;
  buttonPrimaryText: string;
  buttonPrimaryBorder: string;
  buttonPrimaryHoverBg: string;
  buttonGhostBg: string;
  buttonGhostText: string;
  buttonGhostBorder: string;
  buttonGhostHoverBg: string;
  buttonGhostHoverText: string;
};

type BaseTheme = {
  radii: {
    sm: string;
    md: string;
    lg: string;
    pill: string;
  };
  shadows: {
    sm: string;
    md: string;
    glow: string;
  };
  space: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
  };
  font: {
    sans: string;
    display: string;
    mono: string;
  };
  breakpoints: {
    md: string;
    lg: string;
  };
};

export type AppTheme = BaseTheme & {
  colors: ThemeColors;
};

const baseTheme: BaseTheme = {
  radii: {
    sm: "2px",
    md: "4px",
    lg: "8px",
    pill: "9999px",
  },
  shadows: {
    sm: "none",
    md: "0 18px 40px rgb(0 0 0 / 8%)",
    glow: "0 0 0 1px rgb(17 17 17 / 12%)",
  },
  space: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "40px",
    "2xl": "72px",
  },
  font: {
    sans: "var(--font-manrope), system-ui, sans-serif",
    display: "var(--font-cormorant), Georgia, serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
  },
  breakpoints: {
    md: "768px",
    lg: "1024px",
  },
};

export const lightTheme = {
  colors: {
    background: "#fbfaf7",
    surface: "#ffffff",
    text: "#111111",
    textMuted: "#6f6a64",
    border: "#e6e1d8",
    primary: "#111111",
    primaryHover: "#2b2b2b",
    danger: "#9f2f2f",
    success: "#1f6b45",
    accent: "#f3efe8",
    buttonPrimaryBg: "#111111",
    buttonPrimaryText: "#ffffff",
    buttonPrimaryBorder: "#111111",
    buttonPrimaryHoverBg: "#2b2b2b",
    buttonGhostBg: "transparent",
    buttonGhostText: "#111111",
    buttonGhostBorder: "#111111",
    buttonGhostHoverBg: "#111111",
    buttonGhostHoverText: "#ffffff",
  },
  ...baseTheme,
} satisfies AppTheme;

export const darkTheme = {
  colors: {
    background: "#0c0c0c",
    surface: "#141414",
    text: "#f6f3ee",
    textMuted: "#b8b0a6",
    border: "#2a2a2a",
    primary: "#f6f3ee",
    primaryHover: "#ffffff",
    danger: "#ff6f61",
    success: "#68d391",
    accent: "#1c1c1c",
    buttonPrimaryBg: "#f6f3ee",
    buttonPrimaryText: "#111111",
    buttonPrimaryBorder: "#f6f3ee",
    buttonPrimaryHoverBg: "#ffffff",
    buttonGhostBg: "transparent",
    buttonGhostText: "#f6f3ee",
    buttonGhostBorder: "#f6f3ee",
    buttonGhostHoverBg: "#f6f3ee",
    buttonGhostHoverText: "#111111",
  },
  ...baseTheme,
} satisfies AppTheme;
