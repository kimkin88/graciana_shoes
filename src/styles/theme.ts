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
    sm: "8px",
    md: "12px",
    lg: "18px",
    pill: "9999px",
  },
  shadows: {
    sm: "0 2px 10px rgb(15 23 42 / 8%)",
    md: "0 12px 30px rgb(15 23 42 / 12%)",
    glow: "0 0 0 1px rgb(59 130 246 / 30%), 0 10px 30px rgb(59 130 246 / 20%)",
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
    background: "#f7f5f1",
    surface: "#ffffff",
    text: "#1f1a17",
    textMuted: "#6b625d",
    border: "#e5ddd4",
    primary: "#1f1a17",
    primaryHover: "#3a312d",
    danger: "#9f2f2f",
    success: "#1f6b45",
    accent: "#efe5da",
    buttonPrimaryBg: "#1f1a17",
    buttonPrimaryText: "#ffffff",
    buttonPrimaryBorder: "#1f1a17",
    buttonPrimaryHoverBg: "#3a312d",
    buttonGhostBg: "#f3ece4",
    buttonGhostText: "#1f1a17",
    buttonGhostBorder: "#8e8178",
    buttonGhostHoverBg: "#1f1a17",
    buttonGhostHoverText: "#ffffff",
  },
  ...baseTheme,
} satisfies AppTheme;

export const darkTheme = {
  colors: {
    background: "#13100e",
    surface: "#1d1714",
    text: "#f6f1ea",
    textMuted: "#c7bbb0",
    border: "#3d2f27",
    primary: "#f6f1ea",
    primaryHover: "#f0e6da",
    danger: "#ff6f61",
    success: "#68d391",
    accent: "#2a211c",
    buttonPrimaryBg: "#f6f1ea",
    buttonPrimaryText: "#171210",
    buttonPrimaryBorder: "#f6f1ea",
    buttonPrimaryHoverBg: "#e7dacb",
    buttonGhostBg: "#2a211c",
    buttonGhostText: "#f6f1ea",
    buttonGhostBorder: "#a28f83",
    buttonGhostHoverBg: "#f6f1ea",
    buttonGhostHoverText: "#171210",
  },
  ...baseTheme,
} satisfies AppTheme;
