import { CheckoutError, stripeRequest, testSecret, UUID, verifyStripeSignature, verifiedSite } from "../_shared/checkout.ts";
import { errorResponse, json, serviceClient } from "../_shared/runtime.ts";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  try {
    const key = testSecret(Deno.env.get("STRIPE_SECRET_KEY"));
    verifiedSite(Deno.env.get("SITE_URL"));
    const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!secret?.startsWith("whsec_")) throw new CheckoutError("webhook_not_configured", 503);
    const raw = await req.text();
    if (raw.length > 1000000) throw new CheckoutError("invalid_request");
    await verifyStripeSignature(raw, req.headers.get("stripe-signature"), secret);
    const event = JSON.parse(raw);
    if (event.livemode !== false) throw new CheckoutError("test_mode_required");
    if (event.type !== "checkout.session.completed") return json({ received: true, ignored: true });
    const incoming = event.data?.object;
    if (typeof event.id !== "string" || !event.id.startsWith("evt_") || !incoming?.id?.startsWith("cs_test_") ||
      incoming.livemode !== false) throw new CheckoutError("invalid_event");
    if (incoming.payment_status !== "paid") return json({ received: true, ignored: true });
    // Retrieve independently: signature alone must not bypass session/order binding.
    const session = await stripeRequest(key, `checkout/sessions/${encodeURIComponent(incoming.id)}`);
    const orderId = session.metadata?.order_id;
    const userId = session.metadata?.user_id;
    const guestOrder = userId === "guest";
    if (!UUID.test(orderId ?? "") || (!guestOrder && !UUID.test(userId ?? "")) ||
      session.client_reference_id !== orderId || incoming.client_reference_id !== orderId ||
      incoming.metadata?.order_id !== orderId || incoming.metadata?.user_id !== userId ||
      session.mode !== "payment" || incoming.mode !== "payment" ||
      session.status !== "complete" || incoming.status !== "complete" || session.payment_status !== "paid" ||
      session.currency !== "usd" || incoming.currency !== "usd" ||
      session.amount_total !== incoming.amount_total || session.amount_subtotal !== incoming.amount_subtotal ||
      session.payment_intent !== incoming.payment_intent ||
      !session.payment_intent?.startsWith("pi_") ||
      !Number.isSafeInteger(session.amount_total) || !Number.isSafeInteger(session.amount_subtotal) ||
      !Number.isSafeInteger(session.total_details?.amount_shipping) ||
      session.total_details.amount_discount !== 0 || session.total_details.amount_tax !== 0) {
      throw new CheckoutError("payment_binding_mismatch");
    }
    const { data: changed, error } = await serviceClient().rpc("record_test_payment", {
      p_event_id: event.id, p_order_id: orderId, p_user_id: guestOrder ? null : userId,
      p_session_id: session.id, p_payment_intent_id: session.payment_intent,
      p_currency: session.currency, p_subtotal: session.amount_subtotal,
      p_delivery: session.total_details.amount_shipping, p_total: session.amount_total,
    });
    // A webhook racing session binding must be retried by Stripe, never acknowledged.
    if (error) throw new CheckoutError("payment_binding_unavailable", 503);
    return json({ received: true, changed });
  } catch (error) { return errorResponse(error); }
});
