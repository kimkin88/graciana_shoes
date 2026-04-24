import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripeServer } from "@/lib/stripe/server";
import { sendOrderConfirmationEmail } from "@/lib/email/order-confirmation";

export const runtime = "nodejs";

async function releasePendingFromSession(session: Stripe.Checkout.Session) {
  const pendingId = session.metadata?.pending_checkout_id;
  if (!pendingId) return;
  const service = createServiceClient();
  const { error } = await service.rpc("release_checkout_hold", {
    p_pending_id: pendingId,
  });
  if (error) console.error("release_checkout_hold", error);
}

/** Confirms payment, writes orders (stock already decremented at checkout hold). */
async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    return;
  }

  const service = createServiceClient();

  const { data: existing } = await service
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();
  if (existing) return;

  const pendingId = session.metadata?.pending_checkout_id;
  if (!pendingId) {
    console.warn("checkout.session.completed missing pending_checkout_id");
    return;
  }

  const { data: pending } = await service
    .from("pending_checkouts")
    .select("*")
    .eq("id", pendingId)
    .maybeSingle();

  if (!pending) {
    console.warn("pending checkout not found", pendingId);
    return;
  }

  const items = pending.items as {
    product_id: string;
    quantity: number;
    unit_price_cents: number;
  }[];

  if (!Array.isArray(items) || !items.length) return;

  const total = items.reduce(
    (acc, row) => acc + row.unit_price_cents * row.quantity,
    0,
  );
  const currency = (session.currency ?? "usd").toLowerCase();
  const localeTag = session.metadata?.locale === "en" ? "en" : "ru";

  const { data: order, error: oerr } = await service
    .from("orders")
    .insert({
      user_id: pending.user_id,
      stripe_session_id: session.id,
      status: "paid",
      total_cents: total,
      currency,
      customer_email:
        session.customer_details?.email ??
        session.customer_email ??
        null,
    })
    .select("id")
    .single();

  if (oerr || !order) {
    console.error(oerr);
    throw new Error("order insert failed");
  }

  const lineRows = items.map((i) => ({
    order_id: order.id,
    product_id: i.product_id,
    quantity: i.quantity,
    unit_price_cents: i.unit_price_cents,
  }));

  const { error: ierr } = await service.from("order_items").insert(lineRows);
  if (ierr) {
    console.error(ierr);
    throw ierr;
  }

  const email =
    session.customer_details?.email ?? session.customer_email ?? null;

  const linesForEmail: { quantity: number; unit_price_cents: number; name: string }[] =
    [];
  for (const i of items) {
    const { data: prod } = await service
      .from("products")
      .select("name_ru, name_en")
      .eq("id", i.product_id)
      .maybeSingle();
    const name =
      localeTag === "en"
        ? prod?.name_en || prod?.name_ru || "Item"
        : prod?.name_ru || prod?.name_en || "Товар";
    linesForEmail.push({
      quantity: i.quantity,
      unit_price_cents: i.unit_price_cents,
      name,
    });
  }

  await sendOrderConfirmationEmail({
    to: email,
    locale: localeTag,
    orderId: order.id,
    totalCents: total,
    currency,
    lines: linesForEmail,
  });

  await service.from("pending_checkouts").delete().eq("id", pendingId);
}

export async function POST(request: Request) {
  const stripe = getStripeServer();
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!whSecret) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const body = await request.text();
  const sig = (await headers()).get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, whSecret);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await fulfillCheckoutSession(session);
    } else if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      await releasePendingFromSession(session);
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "handler" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
