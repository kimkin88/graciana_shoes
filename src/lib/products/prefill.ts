import { STORE_CATEGORIES } from "@/lib/catalog/categories";
import { slugify } from "@/lib/products/slugify";

export type PrefillInput = {
  nameRu?: string;
  nameEn?: string;
  manufacturer?: string;
  model?: string;
  sku?: string;
  sourceUrl?: string;
  notes?: string;
  locale?: "ru" | "en";
};

export type PrefillOutput = {
  name_ru: string;
  name_en: string;
  slug: string;
  short_description_ru: string;
  short_description_en: string;
  description_ru: string;
  description_en: string;
  category: string;
  group_key: string;
  tags: string;
  colors: string;
  sizes: string;
  specs: string;
  seo_title_ru: string;
  seo_title_en: string;
  seo_description_ru: string;
  seo_description_en: string;
  manufacturer: string;
  model: string;
  sku: string;
  source_url: string;
};

function guessCategory(text: string) {
  const hay = text.toLowerCase();
  const rules: Array<{ keys: string[]; slug: string }> = [
    { keys: ["сапог", "boot", "knee"], slug: "sapogi" },
    { keys: ["ботильон", "bootie", "ankle"], slug: "botilony" },
    { keys: ["ботинк", "chelsea"], slug: "botinki" },
    { keys: ["лофер", "loafer"], slug: "loafers" },
    { keys: ["туфл", "pump", "heel"], slug: "tufii" },
    { keys: ["кроссов", "sneaker"], slug: "krossovki" },
    { keys: ["кед", "keds"], slug: "kedy" },
    { keys: ["балет", "ballet", "flat"], slug: "balletki" },
    { keys: ["сабо", "clog", "mule"], slug: "sabo" },
    { keys: ["босонож", "heeled sandal"], slug: "bosonozhki" },
    { keys: ["сандал", "sandal"], slug: "sandali" },
  ];
  for (const rule of rules) {
    if (rule.keys.some((key) => hay.includes(key))) return rule.slug;
  }
  return STORE_CATEGORIES[0]?.key ?? "botinki";
}

/** Deterministic draft generator — never publishes; admin must review and save. */
export function buildProductPrefill(input: PrefillInput): PrefillOutput {
  const nameRu = (input.nameRu || input.nameEn || input.model || "Новая модель").trim();
  const nameEn = (input.nameEn || input.nameRu || input.model || "New style").trim();
  const manufacturer = (input.manufacturer || "Graciana").trim();
  const model = (input.model || "").trim();
  const sku = (input.sku || "").trim();
  const source = (input.sourceUrl || "").trim();
  const notes = (input.notes || "").trim();
  const category = guessCategory(`${nameRu} ${nameEn} ${notes}`);
  const categoryMeta = STORE_CATEGORIES.find((row) => row.key === category);
  const slugBase = slugify([manufacturer, model || nameEn || nameRu, sku].filter(Boolean).join("-")) || "product";
  const tags = [
    categoryMeta?.ru,
    categoryMeta?.en?.toLowerCase(),
    manufacturer.toLowerCase(),
    model ? model.toLowerCase() : null,
    "women",
  ]
    .filter(Boolean)
    .join(", ");

  const shortRu = `${manufacturer}${model ? ` ${model}` : ""} — ${categoryMeta?.ru ?? "обувь"} для города.`;
  const shortEn = `${manufacturer}${model ? ` ${model}` : ""} — ${categoryMeta?.en ?? "shoes"} made for everyday wear.`;
  const descRu = [
    shortRu,
    notes || "Точная посадка, аккуратная фурнитура и материалы, которые держат форму.",
    sku ? `Артикул: ${sku}.` : null,
    source ? `Источник: ${source}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");
  const descEn = [
    shortEn,
    notes || "Precise last, clean hardware, and materials that keep their shape.",
    sku ? `SKU: ${sku}.` : null,
    source ? `Source: ${source}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    name_ru: nameRu,
    name_en: nameEn,
    slug: slugBase,
    short_description_ru: shortRu,
    short_description_en: shortEn,
    description_ru: descRu,
    description_en: descEn,
    category,
    group_key: category,
    tags,
    colors: "",
    sizes: "36, 37, 38, 39, 40",
    specs: [
      manufacturer ? `Brand: ${manufacturer}` : null,
      model ? `Model: ${model}` : null,
      sku ? `SKU: ${sku}` : null,
      categoryMeta ? `Category: ${categoryMeta.en}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    seo_title_ru: `${nameRu} | Graciana`,
    seo_title_en: `${nameEn} | Graciana`,
    seo_description_ru: shortRu,
    seo_description_en: shortEn,
    manufacturer,
    model,
    sku,
    source_url: source,
  };
}
