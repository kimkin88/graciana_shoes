import Stripe from "stripe";

/**
 * Server-only Stripe SDK — use in Route Handlers and Server Actions (never ship to client).
 */
export function getStripeServer(): Stripe {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  return new Stripe(secret, {
    apiVersion: Stripe.API_VERSION,
    typescript: true,
  });
}
