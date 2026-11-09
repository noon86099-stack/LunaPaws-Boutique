import { CheckoutError, parseCheckout, sha256Hex, SITE_URL, stripeRequest, testSecret, verifiedSite } from "../_shared/checkout.ts";
import { errorResponse, json, serviceClient } from "../_shared/runtime.ts";

Deno.serve(async (req: Request) => {
  // Auth is mandatory even for clients outside the browser. CORS is not auth.
  const headers = {
    "Access-Control-Allow-Origin": req.headers.get("Origin") === SITE_URL ? SITE_URL : "*",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, headers);
  try {
    const key = testSecret(Deno.env.get("STRIPE_SECRET_KEY"));
    const site = verifiedSite(Deno.env.get("SITE_URL"));
    const db = serviceClient();
    const token = req.headers.get("Authorization")?.match(/^Bearer (.+)$/i)?.[1];
    // A valid confirmed account token makes an owned order; anything else must be an explicit guest request.
    let user: { id: string; email: string } | null = null;
    if (token) {
      const { data: { user: found }, error: authError } = await db.auth.getUser(token);
      if (!authError && found?.email && found.email_confirmed_at) user = { id: found.id, email: found.email };
    }
    const raw = await req.text();
    if (raw.length > 20000) throw new CheckoutError("invalid_request");
    let input;
    try { input = parseCheckout(JSON.parse(raw)); }
    catch (error) { throw error instanceof CheckoutError ? error : new CheckoutError("invalid_request"); }
    if (!user && !input.guest) throw new CheckoutError("login_required", 401);
    const guest = user ? null : input.guest!;
    const guestHash = guest ? await sha256Hex(guest.token) : null;
    const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const ipHash = guest && forwarded ? await sha256Hex(`lp-ip:${forwarded}`) : null;
    const { data: order, error } = await db.rpc("prepare_test_order", {
      p_user_id: user?.id ?? null, p_email: user?.email ?? guest!.email, p_key: input.key,
      p_cart: input.items, p_contact: input.contact, p_guest_hash: guestHash, p_ip_hash: ipHash,
    });
    if (error) {
      const code = ["rate_limited", "request_conflict", "already_paid", "order_expired", "price_changed", "product_unavailable", "invalid_total", "invalid_quantity", "invalid_cart"]
        .find(code => error.message.includes(code));
      throw new CheckoutError(code ?? "order_unavailable", code === "rate_limited" ? 429 : code ? 409 : 503);
    }
    const ownerTag = user?.id ?? "guest";
    const returnSuffix = guest ? `&gt=${guest.token}` : "";
    let session;
    if (order.stripe_session_id) {
      session = await stripeRequest(key, `checkout/sessions/${encodeURIComponent(order.stripe_session_id)}`);
    } else {
      const params = new URLSearchParams({
        mode: "payment", customer_email: order.email,
        client_reference_id: order.id,
        "metadata[order_id]": order.id, "metadata[user_id]": ownerTag,
        "payment_intent_data[metadata][order_id]": order.id,
        "payment_method_types[0]": "card",
        success_url: `${site}/?checkout=return&order=${order.id}${returnSuffix}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${site}/?checkout=cancel&order=${order.id}${returnSuffix}`,
        expires_at: String(Math.floor(new Date(order.expires_at).getTime() / 1000)),
        locale: "auto",
        "shipping_options[0][shipping_rate_data][type]": "fixed_amount",
        "shipping_options[0][shipping_rate_data][fixed_amount][amount]": String(order.charge_delivery_cents),
        "shipping_options[0][shipping_rate_data][fixed_amount][currency]": "usd",
        "shipping_options[0][shipping_rate_data][display_name]": "Kuwait delivery",
      });
      for (const [index, item] of order.items.entries()) {
        // Real immutable Stripe Price objects; Supabase remains the catalog.
        const price = await stripeRequest(key, "prices", new URLSearchParams({
          currency: "usd", unit_amount: String(item.chargeUnitCents),
          "product_data[name]": item.name,
          "metadata[supabase_product_id]": item.productId,
        }), `lp-test-price-${order.id}-${index}`);
        if (price.currency !== "usd" || price.unit_amount !== item.chargeUnitCents) throw new CheckoutError("price_changed", 409);
        params.set(`line_items[${index}][price]`, price.id);
        params.set(`line_items[${index}][quantity]`, String(item.quantity));
      }
      session = await stripeRequest(key, "checkout/sessions", params, `lp-test-session-${order.id}`);
      if (!session.id?.startsWith("cs_test_") || session.amount_total !== order.charge_total_cents ||
        session.currency !== "usd" || session.client_reference_id !== order.id) throw new CheckoutError("session_mismatch", 503);
      const { error: bindError } = await db.rpc("bind_test_checkout", { p_order_id: order.id, p_session_id: session.id });
      if (bindError) throw new CheckoutError("order_unavailable", 503);
    }
    if (session.status !== "open" || !session.id?.startsWith("cs_test_") || session.currency !== "usd" ||
      session.amount_total !== order.charge_total_cents || session.metadata?.order_id !== order.id ||
      session.metadata?.user_id !== ownerTag || session.client_reference_id !== order.id ||
      typeof session.url !== "string" || new URL(session.url).origin !== "https://checkout.stripe.com") {
      throw new CheckoutError("order_expired", 409);
    }
    return json({ orderId: order.id, orderNumber: order.order_number, url: session.url }, 200, headers);
  } catch (error) { return errorResponse(error, headers); }
});
