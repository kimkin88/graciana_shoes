import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const CART_SELECT =
  "id, slug, name_ru, name_en, price_cents, currency, stock, image_url, image_optimized_path, updated_at, colors, sizes, sku, manufacturer, specs, active";

/** Returns product fields for cart drawer / cart page (includes inactive so UI can show “unavailable”). */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { ids?: string[] };
    const ids = Array.isArray(body.ids) ? [...new Set(body.ids)].slice(0, 50) : [];
    if (!ids.length) {
      return NextResponse.json({});
    }

    const service = createServiceClient();
    const { data, error } = await service.from("products").select(CART_SELECT).in("id", ids);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "db" }, { status: 500 });
    }

    const map: Record<string, NonNullable<typeof data>[number]> = {};
    for (const row of data ?? []) {
      map[row.id] = row;
    }
    return NextResponse.json(map);
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
