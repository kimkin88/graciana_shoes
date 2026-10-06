/** Map Cyrillic (and a few extras) to Latin so product slugs stay URL-safe. */
const CYR: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** True when value is a UUID (used as product URL slug / lookup). */
export function isUuid(value: string) {
  return UUID_RE.test(value.trim());
}

/** True when a slug is only digits (not allowed — use product UUID instead). */
export function isNumericSlug(value: string) {
  return /^\d+$/.test(value.trim());
}

export function slugify(value: string, fallback = "product") {
  const transliterated = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[а-яё]/g, (ch) => CYR[ch] ?? "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  // Bare numbers make fragile URLs like /products/1 — prefer a named fallback.
  if (!transliterated || isNumericSlug(transliterated)) {
    return fallback;
  }
  return transliterated;
}

/** Prefer a readable slug; fall back to the product UUID when the name is numeric/empty. */
export function productUrlSlug(name: string, productId: string) {
  const base = slugify(name, "");
  if (!base || isNumericSlug(base)) return productId;
  return base;
}

/** Pick `base`, then `base-2`, `base-3`, … until the value is not in `taken`. */
export function nextAvailableSlug(base: string, taken: Iterable<string>) {
  const used = new Set(
    [...taken].map((value) => value.trim().toLowerCase()).filter(Boolean),
  );
  const clean = (base.trim().toLowerCase() || "product").slice(0, 72);
  if (!used.has(clean)) return clean;
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${clean.slice(0, 68)}-${n}`;
    if (!used.has(candidate)) return candidate;
  }
  return `${clean.slice(0, 56)}-${Date.now().toString(36)}`;
}
