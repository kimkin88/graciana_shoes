import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const PUBLIC_PATHS = [
  "",
  "/products",
  "/about",
  "/contacts",
  "/promotions",
  "/delivery-payment",
  "/returns-exchange",
  "/how-to-order",
  "/installment",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [];

  for (const locale of ["ru", "en"] as const) {
    for (const path of PUBLIC_PATHS) {
      pages.push({
        url: `${base}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "" || path === "/products" ? "daily" : "monthly",
        priority: path === "" ? 1 : 0.7,
      });
    }
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("active", true);
    for (const row of data ?? []) {
      if (!row.slug) continue;
      for (const locale of ["ru", "en"] as const) {
        pages.push({
          url: `${base}/${locale}/products/${row.slug}`,
          lastModified: row.updated_at ? new Date(row.updated_at) : now,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch (error) {
    console.error("[sitemap]", error);
  }

  return pages;
}
