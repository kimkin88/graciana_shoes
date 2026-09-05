export type FxRate = {
  code: string;
  scale: number;
  rate: number;
};

export type FxTable = {
  date: string | null;
  rates: Record<string, FxRate>;
};

export const DISPLAY_CURRENCIES = [
  { code: "BYN", ru: "Беларусь", en: "Belarus", symbol: "BYN" },
  { code: "RUB", ru: "Россия", en: "Russia", symbol: "₽" },
  { code: "USD", ru: "США", en: "USA", symbol: "$" },
  { code: "EUR", ru: "ЕС", en: "EU", symbol: "€" },
] as const;

/** Currencies offered in the storefront switcher (BYN + RUB). */
export const STOREFRONT_CURRENCIES = DISPLAY_CURRENCIES.filter(
  (item) => item.code === "BYN" || item.code === "RUB",
);

export function isStorefrontCurrency(value: string | null | undefined): value is "BYN" | "RUB" {
  return value === "BYN" || value === "RUB";
}

export const ADMIN_CURRENCIES = [
  "BYN",
  "USD",
  "EUR",
  "RUB",
  "PLN",
  "UAH",
  "GBP",
  "CNY",
  "KZT",
  "CZK",
  "CHF",
] as const;

export const DEFAULT_DISPLAY_CURRENCY = "BYN";
export const FX_COOKIE = "graciana-currency";

export function isDisplayCurrency(value: string | null | undefined): value is (typeof DISPLAY_CURRENCIES)[number]["code"] {
  return DISPLAY_CURRENCIES.some((item) => item.code === value);
}

export function emptyFxTable(): FxTable {
  return { date: null, rates: {} };
}

/** Convert minor units using National Bank of Belarus official rates (via BYN). */
export function canConvert(from: string, to: string, table: FxTable) {
  const source = from.trim().toUpperCase() || "BYN";
  const target = to.trim().toUpperCase() || "BYN";
  if (source === target) return true;
  return bynPerUnit(source, table) != null && bynPerUnit(target, table) != null;
}

export function convertCents(cents: number, from: string, to: string, table: FxTable): number {
  const source = from.trim().toUpperCase() || "BYN";
  const target = to.trim().toUpperCase() || "BYN";
  if (!Number.isFinite(cents) || source === target) return Math.round(cents);
  const sourcePerByn = bynPerUnit(source, table);
  const targetPerByn = bynPerUnit(target, table);
  if (sourcePerByn == null || targetPerByn == null || targetPerByn === 0) return Math.round(cents);
  return Math.round(cents * (sourcePerByn / targetPerByn));
}

function bynPerUnit(code: string, table: FxTable): number | null {
  if (code === "BYN") return 1;
  const row = table.rates[code];
  if (!row || !row.scale || !row.rate) return null;
  return row.rate / row.scale;
}

type NbrbRow = {
  Date?: string;
  Cur_Abbreviation?: string;
  Cur_Scale?: number;
  Cur_OfficialRate?: number;
};

export async function getNbrbRates(): Promise<FxTable> {
  const urls = [
    "https://api.nbrb.by/exrates/rates?periodicity=0",
    "https://www.nbrb.by/api/exrates/rates?periodicity=0",
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) continue;
      const rows = (await res.json()) as NbrbRow[];
      if (!Array.isArray(rows)) continue;
      const rates: Record<string, FxRate> = {};
      let date: string | null = null;
      for (const row of rows) {
        const code = row.Cur_Abbreviation?.toUpperCase();
        if (!code || typeof row.Cur_OfficialRate !== "number" || typeof row.Cur_Scale !== "number") continue;
        rates[code] = { code, scale: row.Cur_Scale, rate: row.Cur_OfficialRate };
        if (!date && row.Date) date = row.Date;
      }
      if (Object.keys(rates).length) return { date, rates };
    } catch {
      // try next endpoint
    }
  }
  return emptyFxTable();
}
