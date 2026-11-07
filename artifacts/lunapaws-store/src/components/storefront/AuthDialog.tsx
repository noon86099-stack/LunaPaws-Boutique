import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import type { StoreLanguage } from "@/lib/storefront-language";
import "./account.css";

export type AuthMode = "login" | "signup";

function authError(code: string | undefined, ar: boolean): string {
  switch (code) {
    case "invalid_credentials": return ar ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "Your email or password is incorrect.";
    case "email_not_confirmed": return ar ? "يرجى تأكيد بريدك الإلكتروني أولاً، ثم تسجيل الدخول." : "Please confirm your email first, then log in.";
    case "email_address_invalid": return ar ? "يرجى استخدام عنوان بريد إلكتروني صالح." : "Please use a valid email address.";
    case "user_already_exists": return ar ? "يوجد حساب بهذا البريد الإلكتروني. يرجى تسجيل الدخول." : "An account already exists with this email. Please log in.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit": return ar ? "طلبات كثيرة. يرجى الانتظار قليلاً ثم المحاولة." : "Too many requests. Please wait a little before trying again.";
    case "email_address_not_authorized": return ar ? "إرسال بريد التأكيد غير متاح لهذا العنوان حالياً. يرجى التواصل مع المتجر." : "Confirmation emails are not yet available for this address. Please contact the store.";
    case "weak_password": return ar ? "اختر كلمة مرور أقوى تتضمن حروفاً وأرقاماً ورموزاً." : "Please choose a stronger password with letters, numbers and symbols.";
    default: return ar ? "تعذر إكمال الطلب. تحقق من الاتصال وحاول مجدداً." : "We couldn't complete that request. Check your connection and try again.";
  }
}

export function AuthDialog({ initialMode, language, onClose, onSignedIn }: {
  initialMode: AuthMode;
  language: StoreLanguage;
  onClose: () => void;
  onSignedIn: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const ar = language === "ar";
  const signup = mode === "signup";

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    return () => { previous?.focus(); };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const client = getSupabase();
      const result = signup
        ? await client.auth.signUp({
          email: email.trim(), password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: new URL(import.meta.env.BASE_URL, window.location.origin).href,
          },
        })
        : await client.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) { setError(authError(result.error.code, ar)); return; }
      setPassword("");
      if (result.data.session) onSignedIn();
      else setConfirmation(true);
    } catch { setError(authError(undefined, ar)); }
    finally { setBusy(false); }
  }

  function switchMode() {
    setMode(signup ? "login" : "signup");
    setPassword("");
    setError("");
    setConfirmation(false);
  }

  return <dialog ref={dialog} className="lp-auth-dialog" aria-labelledby="lp-auth-title"
    onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}
    onClick={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <div className="lp-auth-inner">
      <button type="button" className="lp-close lp-auth-close" aria-label={ar ? "إغلاق" : "Close account dialog"} disabled={busy} onClick={onClose}><X /></button>
      <div className="lp-eyebrow">LUNAPAWS</div>
      <h2 id="lp-auth-title">{signup ? (ar ? "أهلاً بك في عائلتنا." : "Make yourself at home.") : (ar ? "مرحباً بعودتك." : "Welcome back.")}</h2>
      <p>{ar ? "احفظ مفضلات قطتك واستمتع بها من أي جهاز." : "Keep your cat's favourite little things together, on every device."}</p>
      {confirmation ? <div role="status" className="lp-auth-confirmation">
        <h3>{ar ? "تحقق من بريدك الإلكتروني" : "Check your email"}</h3>
        <p>{ar ? "أكد حسابك عبر رسالة البريد الإلكتروني، ثم عد إلى هنا لتسجيل الدخول." : "Confirm your account using the email we sent, then return here to log in."}</p>
        <button className="lp-button lp-full-button" onClick={() => { setMode("login"); setConfirmation(false); }}>{ar ? "العودة لتسجيل الدخول" : "Back to login"}</button>
      </div> : <form onSubmit={submit} className="lp-auth-form">
        {signup && <label htmlFor="lp-auth-name">{ar ? "الاسم" : "Name"}
          <input id="lp-auth-name" autoFocus autoComplete="name" required maxLength={80} value={name} onChange={e => setName(e.target.value)} disabled={busy} />
        </label>}
        <label htmlFor="lp-auth-email">{ar ? "البريد الإلكتروني" : "Email"}
          <input id="lp-auth-email" type="email" dir="ltr" autoFocus={!signup} autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={busy} />
        </label>
        <label htmlFor="lp-auth-password">{ar ? "كلمة المرور" : "Password"}
          <input id="lp-auth-password" type="password" dir="ltr" autoComplete={signup ? "new-password" : "current-password"} required minLength={signup ? 8 : undefined} value={password} onChange={e => setPassword(e.target.value)} disabled={busy} />
        </label>
        {signup && <small>{ar ? "٨ أحرف على الأقل، مع حروف وأرقام ورموز." : "At least 8 characters, with letters, numbers and symbols."}</small>}
        {error && <p className="lp-account-error" role="alert">{error}</p>}
        <button type="submit" className="lp-button lp-full-button" disabled={busy}>
          {busy ? (ar ? "لحظة من فضلك..." : "One moment...") : signup ? (ar ? "إنشاء حساب" : "Create account") : (ar ? "تسجيل الدخول" : "Log in")}
        </button>
      </form>}
      {!confirmation && <button type="button" className="lp-auth-switch" disabled={busy} onClick={switchMode}>
        {signup ? (ar ? "لديك حساب؟ تسجيل الدخول" : "Already at home here? Log in") : (ar ? "جديد هنا؟ إنشاء حساب" : "New to our little world? Sign up")}
      </button>}
    </div>
  </dialog>;
}
