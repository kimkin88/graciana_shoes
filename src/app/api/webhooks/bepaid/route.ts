import { NextResponse } from "next/server";
import { verifyBepaidBasicAuth } from "@/lib/bepaid/server";
import { fulfillPaidPending, releasePending } from "@/lib/orders/fulfill-pending";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs";

type BepaidNotice = {
  transaction?: {
    uid?: string;
    status?: string;
    amount?: number;
    currency?: string;
    tracking_id?: string;
    type?: string;
    customer?: { email?: string };
  };
  checkout?: {
    token?: string;
    order?: { tracking_id?: string };
  };
};

const PAID = new Set(["successful"]);
const RELEASE = new Set(["failed", "declined", "expired", "error", "canceled", "cancelled"]);
const PENDING_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** BePaid notification. Order is paid only after Basic auth + amount match. */
export async function POST(request: Request) {
  if (!verifyBepaidBasicAuth(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: BepaidNotice;
  try {
    body = (await request.json()) as BepaidNotice;
  } catch {
    return NextResponse.json({ error: "body" }, { status: 400 });
  }

  const localeParam = new URL(request.url).searchParams.get("locale");
  const locale: Locale = localeParam === "en" ? "en" : "ru";

  const tx = body.transaction;
  const pendingId = tx?.tracking_id || body.checkout?.order?.tracking_id;
  if (!pendingId || !PENDING_ID.test(pendingId)) {
    return NextResponse.json({ received: true, ignored: "tracking_id" });
  }

  const status = (tx?.status ?? "").toLowerCase();
  try {
    if (tx && PAID.has(status)) {
      const uid = tx.uid || "unknown";
      const result = await fulfillPaidPending({
        pendingId,
        paymentRef: `bepaid:${pendingId}:${uid}`,
        paidAmountCents: Number(tx.amount),
        currency: (tx.currency ?? "BYN").toLowerCase(),
        customerEmail: tx.customer?.email ?? null,
        locale,
      });
      if (result === "mismatch") {
        console.error("[bepaid] refused paid webhook, amount mismatch", pendingId);
      }
    } else if (RELEASE.has(status)) {
      await releasePending(pendingId);
    }
  } catch (error) {
    console.error("[bepaid webhook]", error);
    return NextResponse.json({ error: "handler" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
