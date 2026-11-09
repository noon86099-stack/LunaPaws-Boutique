import { z } from "zod";
import type { CartItem } from "./shopping-state";
import type { Product } from "./products";
import type { StoreLanguage } from "./storefront-language";

export type CheckoutContact = { name: string; address: string; city: string; phone: string };
export type CheckoutAttempt = { key: string; fingerprint: string; orderId?: string; createdAt: number; guestToken?: string };
export const GUEST_OWNER = "guest";
export const guestTokenSchema = z.string().regex(/^[0-9a-f]{64}$/);
export const newGuestToken = () => [...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, "0")).join("");
export const orderSchema = z.object({
  id: z.string().uuid(), order_number: z.string(), user_id: z.string().uuid().nullable(),
  checkout_key: z.string().uuid(), payment_status: z.enum(["pending", "paid"]),
  stripe_session_id: z.string().nullable(),
  total_minor: z.number().int().positive(), currency: z.literal("kwd"),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().positive() })),
});
export type PaidOrder = z.infer<typeof orderSchema>;
export type PaymentView = { kind: "checking" | "pending" | "paid" | "cancelled" | "error" | "login"; orderNumber?: string; bagError?: boolean };
const attemptKey = (userId: string) => `lunapaws-test-checkout:${userId}`;

export function readAttempt(userId: string): CheckoutAttempt | null {
  try {
    const value = JSON.parse(localStorage.getItem(attemptKey(userId)) ?? "null");
    return z.object({
      key: z.string().uuid(), fingerprint: z.string(), orderId: z.string().uuid().optional(), createdAt: z.number(), guestToken: guestTokenSchema.optional(),
    }).parse(value);
  } catch { return null; }
}
export function saveAttempt(userId: string, value: CheckoutAttempt) {
  localStorage.setItem(attemptKey(userId), JSON.stringify(value));
}
export function clearAttempt(userId: string) { localStorage.removeItem(attemptKey(userId)); }

export function checkoutItems(cart: CartItem[], products: Product[]) {
  return cart.map(item => {
    const product = products.find(product => product.id === item.productId);
    if (!product || item.quantity < 1 || item.quantity > 20) throw new Error("invalid_quantity");
    return { ...item, expectedUnitAmount: Math.round(product.price * 1000) };
  }).sort((a, b) => a.productId.localeCompare(b.productId));
}

export function returnTarget() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("order");
  const outcome = params.get("checkout");
  return id && z.string().uuid().safeParse(id).success && (outcome === "return" || outcome === "cancel")
    ? { orderId: id, cancelled: outcome === "cancel", guestToken: guestTokenSchema.safeParse(params.get("gt")).data } : null;
}
export function cleanReturnUrl() {
  const url = new URL(window.location.href);
  ["checkout", "order", "session_id", "gt"].forEach(key => url.searchParams.delete(key));
  window.history.replaceState(null, "", url);
}

const errors: Record<string, [string, string]> = {
  login_required: ["Log in to your account before paying. Your bag is unchanged.", "سجّل الدخول إلى حسابك قبل الدفع. سلتك لم تتغير."],
  invalid_quantity: ["Choose between 1 and 20 of each product. Your bag is unchanged.", "اختر كمية من ١ إلى ٢٠ لكل منتج. سلتك لم تتغير."],
  price_changed: ["A price has changed. Refresh the collection and review your bag before retrying.", "تغيّر أحد الأسعار. حدّث التشكيلة وراجع سلتك قبل المحاولة مجددًا."],
  product_unavailable: ["A product is no longer available. Refresh the collection and review your bag.", "أحد المنتجات لم يعد متاحًا. حدّث التشكيلة وراجع سلتك."],
  invalid_email: ["Enter a valid email address for your order. Your bag is unchanged.", "أدخل بريدًا إلكترونيًا صالحًا لطلبك. سلتك لم تتغير."],
  rate_limited: ["Too many checkout attempts. Please wait a while and try again. Your bag is unchanged.", "محاولات دفع كثيرة. انتظر قليلًا ثم حاول مجددًا. سلتك لم تتغير."],
  invalid_contact: ["Check your delivery details and try again. Your bag is unchanged.", "تحقّق من بيانات التوصيل وحاول مجددًا. سلتك لم تتغير."],
  invalid_cart: ["Please review your bag and quantities before retrying.", "يرجى مراجعة السلة والكميات قبل المحاولة مجددًا."],
  invalid_request: ["Please review your details and bag before retrying.", "يرجى مراجعة بياناتك وسلتك قبل المحاولة مجددًا."],
  order_expired: ["This checkout has expired. Please try again to start a new test checkout.", "انتهت صلاحية جلسة الدفع. حاول مجددًا لبدء جلسة اختبار جديدة."],
  already_paid: ["This order is already paid. Refresh to check its confirmed payment status.", "هذا الطلب مدفوع بالفعل. حدّث الصفحة للتحقّق من حالة الدفع المؤكدة."],
  storage_unavailable: ["Enable browser storage before checkout so your bag and payment return can be saved.", "فعّل تخزين المتصفح قبل الدفع حتى يمكن حفظ السلة والعودة من الدفع."],
  request_conflict: ["Please retry checkout after reviewing your details. Your bag is unchanged.", "راجع بياناتك ثم أعد المحاولة. سلتك لم تتغير."],
};
export function checkoutError(code: string, language: StoreLanguage): string {
  const copy = errors[code] ?? [
    "Couldn't connect to test checkout. No payment is confirmed; your bag is unchanged. Please try again.",
    "تعذّر الاتصال بالدفع التجريبي. لم يُؤكّد أي دفع وسلتك لم تتغير. حاول مجددًا.",
  ];
  return copy[language === "ar" ? 1 : 0]!;
}
