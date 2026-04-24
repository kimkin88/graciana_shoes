"use client";

import { ThemeProvider } from "styled-components";
import StyledComponentsRegistry from "@/lib/styled-registry";
import { theme } from "@/styles/theme";
import { GlobalStyles } from "@/styles/GlobalStyles";
import { CartProvider } from "@/context/cart-context";
import { ToastProvider } from "@/context/toast-context";

/**
 * Wraps the app with SSR-safe styled-components collection + theme + global CSS.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <StyledComponentsRegistry>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
}
