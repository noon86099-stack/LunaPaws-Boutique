---
name: LUNAPAWS catalog continuity
description: User requirements for catalog ownership, currency, and preserving saved shopping data across product identity changes.
---

Keep the product catalog in the user's existing connected Supabase database and prices in KWD. Do not substitute a hardcoded catalog when database access fails.

**Why:** The user explicitly requested their existing Supabase integration as the source of displayed products, KWD sample prices, and visible loading/empty/error states.

**How to apply:** Preserve that ownership and currency in future catalog changes rather than replacing Supabase or hiding connection failures behind demo data.

Preserve older browser bags and favourites across product-identity changes. The original storefront used numeric identities; saved data from that version may still be in visitors' browsers.

**Why:** The user requires existing shopping functionality to survive the database integration. Discarding old saved references would silently lose selections.

**How to apply:** Keep identity compatibility in mind when renaming seed products or changing identifiers. Resolve saved references where possible; show unavailable items explicitly instead of silently deleting them.
