import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

/**
 * Lazy singleton for Stripe.js on the client (checkout redirect / Elements).
 */
export function getStripe(): Promise<Stripe | null> {
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!pk) {
    throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  }
  if (!stripePromise) {
    stripePromise = loadStripe(pk);
  }
  return stripePromise;
}
