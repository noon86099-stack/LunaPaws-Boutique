import { Check, ShieldCheck } from "lucide-react";
import type { PaymentView } from "@/lib/checkout";
import type { StoreLanguage } from "@/lib/storefront-language";

export function PaymentStatus({ view, language, retry, login, back }: {
  view: PaymentView; language: StoreLanguage; retry: () => void; login: () => void; back: () => void;
}) {
  const ar = language === "ar";
  const titles = {
    checking: ar ? "جارٍ التحقق من الدفع..." : "Checking payment...",
    paid: ar ? "تم الدفع بنجاح ✓" : "Payment Successful ✓",
    pending: ar ? "بانتظار تأكيد الدفع" : "Waiting for payment confirmation",
    cancelled: ar ? "تم إلغاء الدفع" : "Checkout cancelled",
    error: ar ? "تعذّر التحقق من الطلب" : "Couldn't verify this order",
    login: ar ? "سجّل الدخول للتحقق من طلبك" : "Log in to check your order",
  };
  const messages = {
    checking: ar ? "نتحقق من حالة الطلب المحفوظة بأمان. لم نغيّر سلتك." : "Checking your securely saved order status. Your bag has not been changed.",
    paid: ar ? "شكرًا لتسوقك من Luna Paws Boutique!" : "Thank you for shopping with Luna Paws Boutique!",
    pending: ar ? "لم يصل تأكيد دفع موثّق بعد. سلتك محفوظة؛ لا تدفع مجددًا إذا أتممت الدفع بالفعل. انتظر قليلًا ثم أعد التحقق." : "Verified payment confirmation has not arrived yet. Your bag is saved; do not pay again if you already completed payment. Wait a moment, then check again.",
    cancelled: ar ? "لم يُؤكَّد الدفع. سلتك محفوظة ويمكنك المحاولة مجددًا." : "No payment is confirmed. Your bag is saved and you can try again.",
    error: ar ? "تحقق من اتصالك ومن تسجيل الدخول بحساب صاحب الطلب. سلتك لم تتغير؛ رابط العودة وحده لا يؤكد الدفع." : "Check your connection and sign in to the account that owns the order. Your bag is unchanged; a return link alone cannot confirm payment.",
    login: ar ? "افتح رابط العودة من المتصفح نفسه الذي بدأت منه الدفع، أو سجّل الدخول بحساب صاحب الطلب. سلتك محفوظة." : "Open the return link in the browser you paid from, or log in to the account that owns the order. Your bag is saved.",
  };
  return <div className="lp-success" aria-live="polite">
    <div className="lp-success-mark">{view.kind === "paid" ? <Check /> : <ShieldCheck />}</div>
    <h2>{titles[view.kind]}</h2><p>{messages[view.kind]}</p>
    {view.orderNumber && <p dir="ltr">{view.orderNumber}</p>}
    {view.bagError && <p role="alert">{ar
      ? "الدفع مؤكد، لكن تعذّر تحديث السلة المحفوظة. فعّل تخزين المتصفح وأعد التحقق قبل الشراء مجددًا."
      : "Payment is confirmed, but the saved bag could not be updated. Enable browser storage and check again before ordering again."}</p>}
    {view.kind === "login" && <button className="lp-button" onClick={login}>{ar ? "تسجيل الدخول" : "Login"}</button>}
    {(["pending", "error", "cancelled"].includes(view.kind) || view.bagError) &&
      <button className="lp-button" onClick={retry}>{ar ? "إعادة التحقق" : "Check again"}</button>}
    <button className="lp-back-cart" onClick={back}>{ar ? "العودة إلى السلة" : "Back to your bag"}</button>
  </div>;
}
