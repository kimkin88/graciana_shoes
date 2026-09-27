import { createServiceClient } from "@/lib/supabase/service";
import { sendOrderConfirmationEmail } from "@/lib/email/order-confirmation";
import type { Locale } from "@/i18n/config";

type Item = { product_id: string; quantity: number; unit_price_cents: number };

export type FulfillResult = "created" | "duplicate" | "missing" | "mismatch";

/**
 * Marks a held checkout as paid only when the gateway amount matches the server total.
 * Idempotent on `paymentRef` (stored in orders.stripe_session_id).
 */
export async function fulfillPaidPending(input: {
  pendingId: string;
  paymentRef: string;
  paidAmountCents: number;
  currency: string;
  customerEmail: string | null;
  locale: Locale;
}): Promise<FulfillResult> {
  const service = createServiceClient();

  const { data: existing } = await service
    .from("orders")
    .select("id")
    .eq("stripe_session_id", input.paymentRef)
    .maybeSingle();
  if (existing) return "duplicate";

  if (input.paymentRef.startsWith("bepaid:")) {
    const pendingKey = input.paymentRef.split(":")[1];
    if (pendingKey) {
      const { data: prior } = await service
        .from("orders")
        .select("id")
        .like("stripe_session_id", `bepaid:${pendingKey}:%`)
        .maybeSingle();
      if (prior) return "duplicate";
    }
  }

  const { data: pending } = await service
    .from("pending_checkouts")
    .select("*")
    .eq("id", input.pendingId)
    .maybeSingle();
  if (!pending) return "missing";

  const items = pending.items as Item[];
  if (!Array.isArray(items) || !items.length) return "mismatch";

  const total = items.reduce((acc, row) => acc + row.unit_price_cents * row.quantity, 0);
  if (!Number.isFinite(input.paidAmountCents) || total !== input.paidAmountCents) {
    console.error("[fulfill] amount mismatch", {
      pendingId: input.pendingId,
      expected: total,
      paid: input.paidAmountCents,
    });
    return "mismatch";
  }

  const { data: order, error: oerr } = await service
    .from("orders")
    .insert({
      user_id: pending.user_id,
      stripe_session_id: input.paymentRef,
      status: "paid",
      total_cents: total,
      currency: input.currency.toLowerCase(),
      customer_email: input.customerEmail,
    })
    .select("id")
    .single();

  if (oerr || !order) {
    if (oerr?.code === "23505") return "duplicate";
    console.error(oerr);
    throw new Error("order insert failed");
  }

  const { error: ierr } = await service.from("order_items").insert(
    items.map((row) => ({
      order_id: order.id,
      product_id: row.product_id,
      quantity: row.quantity,
      unit_price_cents: row.unit_price_cents,
    })),
  );
  if (ierr) {
    console.error(ierr);
    throw ierr;
  }

  const linesForEmail: { quantity: number; unit_price_cents: number; name: string }[] = [];
  for (const row of items) {
    const { data: prod } = await service
      .from("products")
      .select("name_ru, name_en")
      .eq("id", row.product_id)
      .maybeSingle();
    const name =
      input.locale === "en"
        ? prod?.name_en || prod?.name_ru || "Item"
        : prod?.name_ru || prod?.name_en || "Товар";
    linesForEmail.push({
      quantity: row.quantity,
      unit_price_cents: row.unit_price_cents,
      name,
    });
  }

  await sendOrderConfirmationEmail({
    to: input.customerEmail,
    locale: input.locale,
    orderId: order.id,
    totalCents: total,
    currency: input.currency,
    lines: linesForEmail,
  });

  await service.from("pending_checkouts").delete().eq("id", input.pendingId);
  return "created";
}

export async function releasePending(pendingId: string) {
  const service = createServiceClient();
  const { error } = await service.rpc("release_checkout_hold", { p_pending_id: pendingId });
  if (error) console.error("release_checkout_hold", error);
}
