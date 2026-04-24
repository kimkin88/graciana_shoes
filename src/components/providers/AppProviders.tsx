"use client";

import { ThemeProvider } from "styled-components";
import StyledComponentsRegistry from "@/lib/styled-registry";
import { darkTheme, lightTheme } from "@/styles/theme";
import { GlobalStyles } from "@/styles/GlobalStyles";
import { CartProvider } from "@/context/cart-context";
import { ToastProvider } from "@/context/toast-context";
import { ThemeModeProvider, useThemeMode } from "@/context/theme-context";

function ProvidersInner({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeMode();
  return (
    <ThemeProvider theme={mode === "dark" ? darkTheme : lightTheme}>
      <GlobalStyles />
      <ToastProvider>
        <CartProvider>{children}</CartProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

/**
 * Wraps the app with SSR-safe styled-components collection + theme + global CSS.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <StyledComponentsRegistry>
      <ThemeModeProvider>
        <ProvidersInner>{children}</ProvidersInner>
      </ThemeModeProvider>
    </StyledComponentsRegistry>
  );
}
