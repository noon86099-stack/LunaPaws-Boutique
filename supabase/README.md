# LUNAPAWS product catalog

The connected Supabase project is the source of truth for storefront products.
`migrations/202611070001_lunapaws_products.sql` was applied through the existing
Supabase integration and includes the table, read-only RLS policy, and eight
sample products. It is a migration record, not an automatic startup seeder.

## Access

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are shared Replit
  environment variables. Both are public configuration; only the Supabase
  **publishable** key is used. Do not put a secret/service-role key in a Vite
  variable or frontend code.
- Anonymous visitors can SELECT products. They cannot insert, update, or
  delete them. Manage catalog rows through Supabase's Table Editor or SQL
  Editor using the existing authorized account.
- Supabase Auth provides email/password login and signup. Bags remain local
  to the browser; checkout remains a demo (no orders or payment integration).
- Account favourites are stored in `public.favorites`, not in a shared local
  favourites list. The browser still retains old guest selections until the
  shopper explicitly imports them into their account.

## Product data

Prices are KWD amounts with three decimal places. IDs and creation timestamps
are generated automatically. The seed images are the store's existing images,
served from its verified published domain, not a temporary preview domain.
Use durable HTTPS URLs for future product images.

The storefront fetches the Data API on load and refreshes on window focus and
every minute while open. Failed requests show a retry action, not a hardcoded
catalog. Existing numeric-ID bags/favourites are reconciled to database UUIDs
without discarding unavailable saved items.

Re-publish the website to include the new catalog code and public environment
configuration in its production build. Subsequent product-row changes do not
require rebuilding the frontend.

## Accounts and private favourites

`202611070002_account_favorites.sql` creates the favourites table, ownership
foreign keys, unique `(user_id, product_id)` constraint and three RLS policies.
Authenticated users have SELECT, INSERT and DELETE access only to their own
rows. Anonymous access and UPDATE access are not granted. Product and account
deletion cascade to the corresponding favourites.

The Supabase SDK persists and refreshes shopper sessions using only the public
publishable key already configured above. Do not add any privileged key to
frontend configuration. User-scoped query caches are separated by account and
cleared on account changes. The navbar displays the user's name or email,
with logout; visitors see Login and Sign Up. New account forms respect the
existing Supabase email-confirmation policy.

**Auth dashboard configuration:** In Supabase → Authentication → URL
Configuration, set Site URL to the published LUNAPAWS URL and allow that exact
URL and the current Replit preview URL in Redirect URLs, including trailing
slashes. The connected MCP tools cannot update Auth URL settings. If
confirmation redirects to `http://localhost:3000`, the project owner needs to
change that default in the dashboard. Keep confirmation enabled.
The signup dialog requests the current origin/artifact base as its redirect.
Recheck the allowlist whenever the published domain or preview origin changes.

Verification uses temporary, confirmed test accounts with real Supabase
password authentication and actual user-JWT Data API requests. Never disable
confirmation or weaken RLS for tests, and delete only those temporary fixtures
after the tests. Real confirmation email delivery is not proven by fixture tests.

## Stripe test checkout

Test Mode only: functions reject `sk_live_` keys and any non-test session.
The browser never receives a Stripe key; it redirects to Stripe-hosted Checkout.

Edge Function secrets (Supabase → Edge Functions → Secrets):
`STRIPE_SECRET_KEY` (sk_test_...), `STRIPE_WEBHOOK_SECRET` (whsec_... of the
sandbox destination for `checkout.session.completed` pointing to
`https://<project-ref>.supabase.co/functions/v1/stripe-webhook`), and
`SITE_URL=https://lunapaws-boutique.vercel.app`.

- `create-checkout-session` (verify_jwt off; it authenticates account tokens itself): accepts a
  logged-in confirmed user or a guest (email + secret 256-bit token, stored hashed, with rate limits).
  Prices come from `products`, never the client. Guests read order status only via `get_guest_order`.
  Migration: `migrations/202611100003_guest_checkout.sql`.
- `stripe-webhook` (no JWT; verifies the Stripe signature on the raw body): the only
  path that marks an order `paid`. Replays are idempotent.
- Orders stay priced in KWD. The Stripe sandbox cannot process KWD, so test charges
  are converted server-side at a fixed 1 KWD = 3.25 USD and stored on the order.
- Migrations: `migrations/202611100001_test_checkout.sql`,
  `migrations/202611100002_usd_test_charge.sql`. Deploy functions from `functions/`.
