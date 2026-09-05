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

export const metadata: Metadata = {
  title: "Graciana",
  description: "Женская обувь — editorial storefront",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const [rates] = await Promise.all([getNbrbRates()]);
  return (
    <html lang="ru" className={`${manrope.variable} ${cormorant.variable}`}>
      <body className={manrope.className}>
        <AppProviders initialCurrency={cookieStore.get(FX_COOKIE)?.value} initialRates={rates}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
