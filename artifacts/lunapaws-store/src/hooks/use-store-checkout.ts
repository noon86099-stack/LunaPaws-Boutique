import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { checkoutItems, cleanReturnUrl, clearAttempt, GUEST_OWNER, newGuestToken, orderSchema, readAttempt, returnTarget, saveAttempt, type CheckoutContact, type PaidOrder, type PaymentView } from "@/lib/checkout";
import { persistCart, type CartItem } from "@/lib/shopping-state";
import type { Product } from "@/lib/products";

type Target = { orderId?: string; key?: string; cancelled?: boolean; guestToken?: string };

export function useStoreCheckout(user: User | null, authLoading: boolean, catalogReady: boolean,
  products: Product[], onPaid: (order: PaidOrder) => void) {
  const [target, setTarget] = useState<Target | null>(returnTarget);
  const [view, setView] = useState<PaymentView | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [errorCode, setErrorCode] = useState("");
  const [revision, setRevision] = useState(0);
  const onPaidRef = useRef(onPaid);
  onPaidRef.current = onPaid;

  useEffect(() => {
    if (authLoading || target) return;
    const attempt = readAttempt(user?.id ?? GUEST_OWNER);
    if (attempt) setTarget({ orderId: attempt.orderId, key: attempt.key, guestToken: attempt.guestToken });
  }, [user?.id, authLoading]);

  useEffect(() => {
    if (!target || authLoading) { setView(null); return; }
    const owner = user?.id ?? GUEST_OWNER;
    // A guest order is read only through its secret token; account orders only through RLS.
    const guestToken = target.guestToken ?? (user ? undefined : readAttempt(GUEST_OWNER)?.guestToken);
    const guestRead = !!guestToken && !!target.orderId;
    if (!user && !guestRead) { setView({ kind: "login" }); return; }
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    let count = 0;
    setView({ kind: "checking" });
    const check = async () => {
      try {
        let data: unknown, error: unknown;
        if (guestRead) {
          ({ data, error } = await getSupabase().rpc("get_guest_order", { p_order_id: target.orderId, p_token: guestToken }));
        } else {
          let query = getSupabase().from("orders")
            .select("id,order_number,user_id,checkout_key,payment_status,stripe_session_id,total_minor,currency,items");
          query = target.orderId ? query.eq("id", target.orderId) : query.eq("checkout_key", target.key!);
          ({ data, error } = await query.maybeSingle());
        }
        if (!active) return;
        if (error || !data) throw new Error("order_unavailable");
        const order = orderSchema.parse(data);
        if (guestRead ? order.user_id !== null : order.user_id !== user?.id) throw new Error("order_unavailable");
        if (order.payment_status === "paid") {
          // Never consume an unreconciled legacy bag while the catalog is loading.
          if (!catalogReady) { setView({ kind: "checking" }); return; }
          let bagError = false;
          try { onPaidRef.current(order); } catch { bagError = true; }
          if (!bagError) {
            try {
              const attempt = readAttempt(owner);
              if (attempt?.key === order.checkout_key) clearAttempt(owner);
            } catch { /* The atomic bag receipt still prevents repeat consumption. */ }
          }
          setView({ kind: "paid", orderNumber: order.order_number, bagError });
          return;
        }
        setView({ kind: target.cancelled ? "cancelled" : "pending", orderNumber: order.order_number });
        if (!target.cancelled && ++count < 16) timer = setTimeout(() => { void check(); }, 3000);
      } catch {
        if (active) setView({ kind: "error" });
      }
    };
    void check();
    return () => { active = false; clearTimeout(timer); };
  }, [target, user?.id, authLoading, catalogReady, revision]);

  const start = async (cart: CartItem[], contact: CheckoutContact, guestEmail = "") => {
    if (busyRef.current) return;
    const owner = user?.id ?? GUEST_OWNER;
    if (!user && !/^\S+@\S+\.\S{2,}$/.test(guestEmail.trim())) { setErrorCode("invalid_email"); return; }
    busyRef.current = true;
    setBusy(true);
    setErrorCode("");
    try {
      const items = checkoutItems(cart, products);
      const fingerprint = JSON.stringify({ items, contact, email: user ? null : guestEmail.trim().toLowerCase() });
      let attempt = readAttempt(owner);
      if (!attempt || attempt.fingerprint !== fingerprint || Date.now() - attempt.createdAt > 55 * 60000) {
        attempt = { key: crypto.randomUUID(), fingerprint, createdAt: Date.now(), ...(user ? {} : { guestToken: newGuestToken() }) };
      }
      try {
        if (!persistCart(cart)) throw new Error("storage_unavailable");
        saveAttempt(owner, attempt);
      } catch { throw new Error("storage_unavailable"); }
      const client = getSupabase();
      const { data: { session } } = await client.auth.getSession();
      if (user && session?.user.id !== user.id) throw new Error("login_required");
      const { data, error } = await client.functions.invoke("create-checkout-session", {
        body: { key: attempt.key, items, contact, ...(user ? {} : { guest: { email: guestEmail.trim().toLowerCase(), token: attempt.guestToken } }) },
        ...(session ? { headers: { Authorization: `Bearer ${session.access_token}` } } : {}),
      });
      if (error) {
        let code = "connection_error";
        try {
          if (error.context instanceof Response) code = (await error.context.json()).error ?? code;
        } catch { /* Do not expose untrusted provider response text. */ }
        if (["order_expired", "request_conflict"].includes(code)) clearAttempt(owner);
        throw new Error(code);
      }
      if (typeof data?.url !== "string" || new URL(data.url).origin !== "https://checkout.stripe.com" ||
        !orderSchema.shape.id.safeParse(data.orderId).success) throw new Error("connection_error");
      saveAttempt(owner, { ...attempt, orderId: data.orderId });
      window.location.assign(data.url);
    } catch (error) {
      setErrorCode(error instanceof Error ? error.message : "connection_error");
      setBusy(false);
      busyRef.current = false;
    }
  };

  const dismissReturn = () => { setTarget(null); setView(null); cleanReturnUrl(); };
  return { start, view, busy, errorCode, hasReturn: !!target, dismissReturn, retry: () => setRevision(value => value + 1) };
}
