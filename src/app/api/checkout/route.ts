import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripeServer } from "@/lib/stripe/server";
import { isLocale, type Locale } from "@/i18n/config";

export const runtime = "nodejs";

type Line = { productId: string; quantity: number };

function unwrapRpcUuid(data: unknown): string | null {
  if (typeof data === "string" && data.length > 0) return data;
  if (Array.isArray(data) && typeof data[0] === "string") return data[0];
  return null;
}

/** Creates a Stripe Checkout Session using server-verified prices; stock is held via DB RPC until paid or released. */
export async function POST(request: Request) {
  let pendingId: string | null = null;
  const service = createServiceClient();

  try {
    const body = (await request.json()) as { locale?: string; items?: Line[] };
    const locale = body.locale as Locale | undefined;
    if (!locale || !isLocale(locale)) {
      return NextResponse.json({ error: "locale" }, { status: 400 });
    }

    const lines = body.items;
    if (!Array.isArray(lines) || !lines.length || lines.length > 40) {
      return NextResponse.json({ error: "cart" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const ids = [...new Set(lines.map((l) => l.productId))];
    const { data: products, error: perr } = await supabase
      .from("products")
      .select("*")
      .in("id", ids)
      .eq("active", true);

    if (perr || !products?.length) {
      return NextResponse.json({ error: "products" }, { status: 400 });
    }

    const byId = new Map(products.map((p) => [p.id, p]));

    const validated: {
      product_id: string;
      quantity: number;
      unit_price_cents: number;
    }[] = [];

    for (const line of lines) {
      const p = byId.get(line.productId);
      if (!p) {
        return NextResponse.json({ error: "unknown" }, { status: 400 });
      }
      const qty = Math.floor(Number(line.quantity));
      if (qty < 1 || qty > 99) {
        return NextResponse.json({ error: "qty" }, { status: 400 });
      }
      if (p.stock < qty) {
        return NextResponse.json(
          { error: "stock", productId: p.id },
          { status: 409 },
        );
      }
      validated.push({
        product_id: p.id,
        quantity: qty,
        unit_price_cents: p.price_cents,
      });
    }

    const { data: rpcPending, error: rpcErr } = await service.rpc(
      "create_checkout_with_stock_hold",
      {
        p_user_id: user?.id ?? null,
        p_items: validated,
      },
    );

    if (rpcErr) {
      const msg = rpcErr.message ?? "";
      const code =
        msg.includes("insufficient_stock") || msg.includes("invalid_quantity")
          ? 409
          : 500;
      console.error(rpcErr);
      return NextResponse.json({ error: "hold", detail: msg }, { status: code });
    }

    const pending = unwrapRpcUuid(rpcPending);
    if (!pending) {
      return NextResponse.json({ error: "hold" }, { status: 500 });
    }

    pendingId = pending;

    const stripe = getStripeServer();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const checkoutLineItems = validated.map((row) => {
      const p = byId.get(row.product_id)!;
      const name =
        locale === "en" ? p.name_en || p.name_ru : p.name_ru || p.name_en;
      return {
        quantity: row.quantity,
        price_data: {
          currency: p.currency,
          unit_amount: p.price_cents,
          product_data: {
            name,
            metadata: { product_id: p.id },
          },
        },
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: checkoutLineItems,
      success_url: `${appUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/${locale}/cart`,
      customer_email: user?.email ?? undefined,
      metadata: {
        pending_checkout_id: pendingId,
        locale,
      },
    });

    const { error: uerr } = await service
      .from("pending_checkouts")
      .update({ stripe_session_id: session.id })
      .eq("id", pendingId);

    if (uerr) {
      console.error(uerr);
      throw uerr;
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    if (pendingId) {
      const { error: relErr } = await service.rpc("release_checkout_hold", {
        p_pending_id: pendingId,
      });
      if (relErr) console.error("release_checkout_hold failed", relErr);
    }
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
