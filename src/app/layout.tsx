import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { getNbrbRates, FX_COOKIE } from "@/lib/money/fx";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: true,
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600"],
  display: "swap",
  // Display font — avoid unused preload warnings for weights not painted on first paint.
  preload: false,
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Graciana",
  description: "Женская обувь — editorial storefront",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("graciana-theme")?.value;
  const initialTheme = themeCookie === "dark" ? "dark" : "light";
  const [rates] = await Promise.all([getNbrbRates()]);
  return (
    <html
      lang="ru"
      data-theme={initialTheme}
      className={`${manrope.variable} ${cormorant.variable}`}
      style={{ colorScheme: initialTheme }}
    >
      <body className={manrope.className}>
        <AppProviders
          initialCurrency={cookieStore.get(FX_COOKIE)?.value}
          initialRates={rates}
          initialTheme={initialTheme}
        >
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
