import { timingSafeEqual } from "node:crypto";

const CHECKOUT_URL = "https://checkout.bepaid.by/ctp/api/checkouts";

export function bepaidConfig() {
  const shopId = process.env.BEPAID_SHOP_ID?.trim() ?? "";
  const secretKey = process.env.BEPAID_SECRET_KEY?.trim() ?? "";
  return {
    shopId,
    secretKey,
    configured: Boolean(shopId && secretKey),
    test: process.env.BEPAID_TEST === "true",
  };
}

function basicAuth(shopId: string, secretKey: string) {
  return `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString("base64")}`;
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Reject webhook calls that do not present this shop's BePaid credentials. */
export function verifyBepaidBasicAuth(authorization: string | null) {
  const { shopId, secretKey, configured } = bepaidConfig();
  if (!configured || !authorization) return false;
  return safeEqual(authorization.trim(), basicAuth(shopId, secretKey));
}

type CreateInput = {
  amountCents: number;
  currency: string;
  description: string;
  trackingId: string;
  locale: "ru" | "en";
  email?: string | null;
  successUrl: string;
  declineUrl: string;
  failUrl: string;
  cancelUrl: string;
  notificationUrl: string;
};

/** Hosted payment page token. Amount is in minor units (kopecks for BYN). */
export async function createBepaidCheckout(input: CreateInput) {
  const { shopId, secretKey, test } = bepaidConfig();
  const body = {
    checkout: {
      test,
      transaction_type: "payment",
      attempts: 3,
      settings: {
        success_url: input.successUrl,
        decline_url: input.declineUrl,
        fail_url: input.failUrl,
        cancel_url: input.cancelUrl,
        notification_url: input.notificationUrl,
        language: input.locale,
        customer_fields: { visible: ["email"] },
      },
      order: {
        amount: input.amountCents,
        currency: input.currency.toUpperCase(),
        description: input.description.slice(0, 255),
        tracking_id: input.trackingId,
      },
      ...(input.email ? { customer: { email: input.email } } : {}),
    },
  };

  const res = await fetch(CHECKOUT_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuth(shopId, secretKey),
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-Version": "2",
    },
    body: JSON.stringify(body),
  });

  const payload = (await res.json().catch(() => null)) as {
    checkout?: { token?: string; redirect_url?: string };
    message?: string;
    errors?: unknown;
  } | null;

  if (!res.ok || !payload?.checkout?.redirect_url) {
    const detail =
      payload?.message ||
      (payload?.errors ? JSON.stringify(payload.errors) : `bepaid ${res.status}`);
    throw new Error(detail);
  }

  return {
    token: payload.checkout.token ?? "",
    redirectUrl: payload.checkout.redirect_url,
  };
}
