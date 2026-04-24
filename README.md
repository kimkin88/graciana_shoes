# Graciana — e-commerce (Next.js + Supabase + Stripe)

Storefront: **Next.js 16 (App Router)**, **TypeScript**, **styled-components**, **Framer Motion** (page transitions + product grids; respects `prefers-reduced-motion`), **Radix UI**, **Supabase** (Postgres + auth + RLS), **Stripe Checkout**, **Vercel-ready**.

**Languages:** **Russian (`ru`)** is the default; **English (`en`)** is available. All customer routes live under `/ru/...` or `/en/...`. `/` redirects to `/ru`.

## Project structure

```text
graciana/
├── .env.example
├── supabase/migrations/001_store.sql   # Schema + RLS
├── supabase/migrations/002_checkout_stock_hold.sql  # Atomic stock hold + release RPCs
├── src/
│   ├── middleware.ts                   # → /ru/... + Supabase cookie refresh
│   ├── i18n/                           # locales, routing helper, getDictionary
│   ├── messages/ru.json, en.json       # UI copy
│   ├── context/cart-context.tsx        # localStorage cart
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── [locale]/                   # localized storefront + admin
│   │   └── api/
│   │       ├── checkout/route.ts       # Stripe session + pending checkout row
│   │       ├── webhooks/stripe/route.ts
│   │       └── products/for-cart/route.ts
│   ├── components/ …
│   └── lib/                            # supabase (browser/server/service), stripe, products, auth
└── public/
```

## Run locally

```bash
npm install
cp .env.example .env.local
```

Fill **`.env.local`**: Supabase URL + anon key, **service role** key (server-only), Stripe secret + webhook secret, `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000`). Optional: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` if you add Elements later. Optional email: **`RESEND_API_KEY`** + **`ORDER_EMAIL_FROM`** (verified domain in [Resend](https://resend.com)).

**Database:** Supabase → SQL → run `001_store.sql`, then **`002_checkout_stock_hold.sql`** (stock reservations + RPCs used by checkout/webhook). If the auth trigger errors on your Postgres version, try replacing `execute procedure` with `execute function` for both triggers in `001`.

**First admin user** (after you can log in):

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

**Stripe webhook:** Dashboard → Developers → Webhooks → endpoint  
`https://<your-domain>/api/webhooks/stripe` → enable **`checkout.session.completed`**, **`checkout.session.expired`**, and **`checkout.session.async_payment_failed`** → signing secret into `STRIPE_WEBHOOK_SECRET`. Expired/failed sessions call `release_checkout_hold` so inventory is returned.

```bash
npm run dev
```

Visit `http://localhost:3000` → redirects to `http://localhost:3000/ru`.

## Security & performance (kept simple)

- **RLS** on `profiles`, `products`, `orders`, `order_items`; `pending_checkouts` / `stock_reservations` have RLS on with **no policies** so only the **service role** touches them.
- **Checkout** validates lines with the user’s anon client, then **`create_checkout_with_stock_hold`** (service RPC) creates `pending_checkouts`, decrements `products.stock`, and inserts `stock_reservations` in one transaction. If Stripe session creation fails, **`release_checkout_hold`** rolls back.
- **Webhook** verifies the Stripe signature. On **`checkout.session.completed`** (`payment_status = paid`), it inserts `orders` / `order_items`, sends the optional **Resend** receipt, and deletes the pending row (stock stays reduced). On **expired / async_payment_failed**, it calls **`release_checkout_hold`** to restore stock.
- **Admin** UI checks `profiles.role = admin` in `src/app/[locale]/admin/layout.tsx` in addition to RLS.
- **UI:** Radix **Select** on the catalog filter bar; Radix **Toast** for checkout errors (`ToastProvider` in `AppProviders`).
- **ISR:** `revalidate` on home and catalog (tune as needed).

## Implemented routes

| Path | Purpose |
|------|---------|
| `/[locale]` | Featured products |
| `/[locale]/products` | Listing + URL filters (Radix Select + client apply) |
| `/[locale]/products/[slug]` | PDP + related |
| `/[locale]/cart` | Cart + Stripe Checkout redirect |
| `/[locale]/checkout/success` | Thank-you + clear cart |
| `/[locale]/login`, `/register` | Email/password |
| `/[locale]/account/orders` | Order history (auth required) |
| `/[locale]/admin` | Stats (30-day revenue/orders, product count) |
| `/[locale]/admin/products` | CRUD list |
| `/[locale]/admin/products/new`, `/[id]/edit` | Forms |
| `/[locale]/admin/orders` | All orders |

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
