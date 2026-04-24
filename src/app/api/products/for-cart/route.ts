import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Returns minimal product fields for cart UI (ids must be public catalog items). */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { ids?: string[] };
    const ids = Array.isArray(body.ids) ? [...new Set(body.ids)].slice(0, 50) : [];
    if (!ids.length) {
      return NextResponse.json({});
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, slug, name_ru, name_en, price_cents, currency, stock, image_url, active",
      )
      .in("id", ids)
      .eq("active", true);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "db" }, { status: 500 });
    }

    const map: Record<string, (typeof data)[number]> = {};
    for (const row of data ?? []) {
      map[row.id] = row;
    }
    return NextResponse.json(map);
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
