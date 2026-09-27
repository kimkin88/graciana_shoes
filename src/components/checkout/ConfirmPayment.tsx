"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { localizedPath } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";

type Phase = "checking" | "paid" | "unconfirmed";

/** Clears the cart only after the server confirms the webhook marked the order paid. */
export function ConfirmPayment({
  locale,
  pending,
  sessionId,
  dict,
}: {
  locale: Locale;
  pending: string;
  sessionId: string;
  dict: Messages;
}) {
  const { clear, ready } = useCart();
  const [phase, setPhase] = useState<Phase>("checking");

  useEffect(() => {
    if (!pending && !sessionId) {
      setPhase("unconfirmed");
      return;
    }
    let stopped = false;
    const params = new URLSearchParams();
    if (pending) params.set("pending", pending);
    if (sessionId) params.set("session_id", sessionId);

    async function poll() {
      for (let attempt = 0; attempt < 12 && !stopped; attempt += 1) {
        try {
          const res = await fetch(`/api/checkout/status?${params.toString()}`);
          const data = (await res.json()) as { status?: string };
          if (data.status === "paid") {
            if (!stopped) setPhase("paid");
            return;
          }
        } catch {
          /* keep polling */
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      if (!stopped) setPhase("unconfirmed");
    }

    void poll();
    return () => {
      stopped = true;
    };
  }, [pending, sessionId]);

  useEffect(() => {
    if (phase !== "paid" || !ready) return;
    clear();
  }, [phase, ready, clear]);

  if (phase === "paid") {
    return (
      <>
        <h1>{dict.checkout.successTitle}</h1>
        <p style={{ lineHeight: 1.6 }}>{dict.checkout.successBody}</p>
        <Link href={localizedPath("/", locale)}>{dict.checkout.backHome}</Link>
      </>
    );
  }

  if (phase === "unconfirmed") {
    return (
      <>
        <h1>{dict.checkout.unconfirmedTitle}</h1>
        <p style={{ lineHeight: 1.6 }}>{dict.checkout.unconfirmedBody}</p>
        <Link href={localizedPath("/account/orders", locale)}>{dict.orders.title}</Link>
      </>
    );
  }

  return (
    <>
      <h1>{dict.checkout.confirmingTitle}</h1>
      <p style={{ lineHeight: 1.6 }}>{dict.checkout.confirmingBody}</p>
    </>
  );
}
