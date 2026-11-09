import { createClient } from "npm:@supabase/supabase-js@2.119.0";
import { CheckoutError } from "./checkout.ts";

export function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new CheckoutError("server_not_configured", 503);
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
  });
}

export function errorResponse(error: unknown, headers: Record<string, string> = {}) {
  // Never expose Stripe responses, user details, signatures, or service secrets.
  const known = error instanceof CheckoutError;
  console.error("checkout_error", known ? error.code : "internal_error");
  return json({ error: known ? error.code : "connection_error" }, known ? error.status : 503, headers);
}
