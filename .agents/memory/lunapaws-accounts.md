---
name: LUNAPAWS accounts
description: User-chosen authentication provider, guest-data ownership decisions, and authentication testing constraints.
---

Use the existing Supabase Integration and Supabase Auth for LUNAPAWS accounts
and account-private favourites, rather than introducing a different auth provider.

**Why:** The user explicitly requested Supabase Auth and favourites that only
their authenticated owner can view, add and remove.

**How to apply:** Preserve that provider choice and ownership boundary in
future account features unless the user requests a change.

Do not automatically attach old browser favourites to the first account that
signs in. Offer an explicit import and retain the old selections until the
cloud save succeeds. Never mirror an account's private favourites back into a
shared guest list.

**Why:** Earlier favourites belonged to a browser, not an authenticated person;
on a shared device, automatic assignment could expose one shopper's selections
to another account. Preserving old selections must not compromise account privacy.

**How to apply:** Keep guest-data migration deliberate and account-specific.

Do not assume reserved example-domain emails can be used for public signup
tests in this Supabase project, and do not disable email confirmation for testing.

**Why:** The live provider rejected reserved test email addresses even though
they were syntactically valid. Authentication tests must not require weakening
the store's real security settings.

**How to apply:** Use isolated, controlled test accounts and real authentication;
remove only the test accounts and their data after verification.
