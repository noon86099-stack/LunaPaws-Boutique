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
- No login, customer table, orders database, or payment integration was added.
  Bags and favourites remain local to the browser; checkout remains a demo.

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
