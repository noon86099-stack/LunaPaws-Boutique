---
name: Portable media
description: Why local uploaded media cannot be assumed available to GitHub-based builds.
---

Do not introduce production build imports from attached_assets for the storefront.
Keep public promotional videos in durable public storage, preserving the actual
user-supplied media rather than replacing it.

**Why:** The environment's global Git ignore excludes attached_assets, independently
of the project's own ignore file. A local build can succeed while a GitHub-based
Vercel build fails because the uploaded file is absent.

**How to apply:** Verify media is accessible without authentication using a stable
public URL, and confirm external builds no longer depend on local uploads. Do not
use expiring signed URLs for public storefront media.
