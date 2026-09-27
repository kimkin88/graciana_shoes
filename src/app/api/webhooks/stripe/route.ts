import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripeServer } from "@/lib/stripe/server";
import { fulfillPaidPending } from "@/lib/orders/fulfill-pending";

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
  if (session.payment_status !== "paid") return;
  const pendingId = session.metadata?.pending_checkout_id;
  if (!pendingId || !session.id) {
    console.warn("checkout.session.completed missing pending_checkout_id");
    return;
  }
  const locale = session.metadata?.locale === "en" ? "en" : "ru";
  await fulfillPaidPending({
    pendingId,
    paymentRef: session.id,
    paidAmountCents: session.amount_total ?? -1,
    currency: (session.currency ?? "usd").toLowerCase(),
    customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
    locale,
  });
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
