export const SITE_URL = "https://lunapaws-boutique.vercel.app";
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class CheckoutError extends Error {
  constructor(public code: string, public status = 400) { super(code); }
}

function exactObject(value: unknown, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
    Object.keys(value).some(key => !keys.includes(key)) ||
    keys.some(key => !(key in value))) throw new CheckoutError("invalid_request");
  return value as Record<string, unknown>;
}

export function parseCheckout(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new CheckoutError("invalid_request");
  const { guest: rawGuest, ...rest } = value as Record<string, unknown>;
  const body = exactObject(rest, ["key", "items", "contact"]);
  let guest: { email: string; token: string } | null = null;
  if (rawGuest !== undefined) {
    const g = exactObject(rawGuest, ["email", "token"]);
    const email = typeof g.email === "string" ? g.email.trim().toLowerCase() : "";
    if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(email) || email.length > 254) throw new CheckoutError("invalid_email");
    if (typeof g.token !== "string" || !/^[0-9a-f]{64}$/.test(g.token)) throw new CheckoutError("invalid_request");
    guest = { email, token: g.token };
  }
  if (typeof body.key !== "string" || !UUID.test(body.key)) throw new CheckoutError("invalid_request");
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30) throw new CheckoutError("invalid_cart");
  const seen = new Set<string>();
  const items = body.items.map(value => {
    const item = exactObject(value, ["productId", "quantity", "expectedUnitAmount"]);
    if (typeof item.productId !== "string" || !UUID.test(item.productId) || seen.has(item.productId.toLowerCase())) {
      throw new CheckoutError("invalid_cart");
    }
    if (!Number.isSafeInteger(item.quantity) || Number(item.quantity) < 1 || Number(item.quantity) > 20) {
      throw new CheckoutError("invalid_quantity");
    }
    if (!Number.isSafeInteger(item.expectedUnitAmount) || Number(item.expectedUnitAmount) < 1 ||
      Number(item.expectedUnitAmount) > 99999999) throw new CheckoutError("invalid_cart");
    seen.add(item.productId.toLowerCase());
    return { productId: item.productId.toLowerCase(), quantity: Number(item.quantity), expectedUnitAmount: Number(item.expectedUnitAmount) };
  }).sort((a, b) => a.productId.localeCompare(b.productId));
  const input = exactObject(body.contact, ["name", "address", "city", "phone"]);
  const contact: Record<string, string> = {};
  for (const [key, max] of [["name", 100], ["address", 300], ["city", 100], ["phone", 30]] as const) {
    const value = input[key];
    if (typeof value !== "string" || value.trim().length < 2 || value.trim().length > max || /[\u0000-\u001f]/.test(value)) {
      throw new CheckoutError("invalid_contact");
    }
    contact[key] = value.trim();
  }
  return { key: body.key, items, contact, guest };
}

export function testSecret(key: string | undefined): string {
  if (!key?.startsWith("sk_test_")) throw new CheckoutError("test_mode_required", 503);
  return key;
}

export function verifiedSite(value: string | undefined): string {
  if (value !== SITE_URL && value !== `${SITE_URL}/`) throw new CheckoutError("site_not_configured", 503);
  return SITE_URL;
}

export async function stripeRequest(key: string, path: string, params?: URLSearchParams, idempotencyKey?: string) {
  testSecret(key);
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: params ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      "Stripe-Version": "2025-02-24.acacia",
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: params?.toString(),
    signal: AbortSignal.timeout(20000),
  });
  const data = await response.json();
  if (!response.ok) {
    // Log only non-secret Stripe error metadata for diagnosis.
    console.error("stripe_error", path.split("/")[0], response.status, data?.error?.type, data?.error?.code, data?.error?.param, data?.error?.message);
    throw new CheckoutError("payment_connection_error", 502);
  }
  if (data.livemode !== false) throw new CheckoutError("test_mode_required", 503);
  return data;
}

/** Verify the exact bytes Stripe signed, with five-minute replay tolerance. */
export async function verifyStripeSignature(raw: string, header: string | null, secret: string, now = Date.now()) {
  if (!secret.startsWith("whsec_") || !header) throw new CheckoutError("invalid_signature");
  const parts = header.split(",").map(part => part.trim().split("="));
  const timestamps = parts.filter(([key]) => key === "t").map(([, value]) => value);
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (timestamps.length !== 1 || !/^\d+$/.test(timestamps[0] ?? "") ||
    Math.abs(now / 1000 - Number(timestamps[0])) > 300) throw new CheckoutError("invalid_signature");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const signed = new TextEncoder().encode(`${timestamps[0]}.${raw}`);
  for (const signature of signatures) {
    if (!/^[a-f0-9]{64}$/i.test(signature ?? "")) continue;
    const bytes = new Uint8Array(signature!.match(/../g)!.map(byte => parseInt(byte, 16)));
    if (await crypto.subtle.verify("HMAC", key, bytes, signed)) return;
  }
  throw new CheckoutError("invalid_signature");
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}
