"use client";

import { ThemeProvider } from "styled-components";
import StyledComponentsRegistry from "@/lib/styled-registry";
import { darkTheme, lightTheme } from "@/styles/theme";
import { GlobalStyles } from "@/styles/GlobalStyles";
import { CartProvider } from "@/context/cart-context";
import { ToastProvider } from "@/context/toast-context";
import { ThemeModeProvider, useThemeMode } from "@/context/theme-context";
import { CurrencyProvider } from "@/context/currency-context";
import { FavoritesProvider } from "@/context/favorites-context";
import type { FxTable } from "@/lib/money/fx";

function ProvidersInner({
  children,
  initialCurrency,
  initialRates,
}: {
  children: React.ReactNode;
  initialCurrency?: string;
  initialRates: FxTable;
}) {
  const { mode } = useThemeMode();
  return (
    <ThemeProvider theme={mode === "dark" ? darkTheme : lightTheme}>
      <GlobalStyles />
      <ToastProvider>
        <CurrencyProvider initialCurrency={initialCurrency} initialRates={initialRates}>
          <FavoritesProvider>
            <CartProvider>{children}</CartProvider>
          </FavoritesProvider>
        </CurrencyProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

/**
 * Wraps the app with SSR-safe styled-components collection + theme + global CSS.
 */
export function AppProviders({
  children,
  initialCurrency,
  initialRates,
}: {
  children: React.ReactNode;
  initialCurrency?: string;
  initialRates: FxTable;
}) {
  return (
    <StyledComponentsRegistry>
      <ThemeModeProvider>
        <ProvidersInner initialCurrency={initialCurrency} initialRates={initialRates}>
          {children}
        </ProvidersInner>
      </ThemeModeProvider>
    </StyledComponentsRegistry>
  );
}
