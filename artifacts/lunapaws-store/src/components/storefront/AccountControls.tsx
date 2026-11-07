import type { User } from "@supabase/supabase-js";
import type { StoreLanguage } from "@/lib/storefront-language";

export function AccountControls({ user, loading, signingOut, language, onLogin, onSignUp, onLogout }: {
  user: User | null;
  loading: boolean;
  signingOut: boolean;
  language: StoreLanguage;
  onLogin: () => void;
  onSignUp: () => void;
  onLogout: () => void;
}) {
  const ar = language === "ar";
  const name = [user?.user_metadata?.full_name, user?.user_metadata?.name, user?.email]
    .find(value => typeof value === "string" && value.trim()) as string | undefined;
  return <div className="lp-account-controls">
    {loading ? <span role="status">{ar ? "جارٍ الاتصال..." : "Connecting..."}</span> : user ? <>
      <span className="lp-account-name" dir="auto" title={user.email}>{name ?? (ar ? "حسابك" : "Your account")}</span>
      <button type="button" disabled={signingOut} onClick={onLogout}>
        {signingOut ? (ar ? "جارٍ الخروج..." : "Logging out...") : (ar ? "تسجيل الخروج" : "Logout")}
      </button>
    </> : <>
      <button type="button" onClick={onLogin}>{ar ? "تسجيل الدخول" : "Login"}</button>
      <button type="button" className="lp-account-signup" onClick={onSignUp}>{ar ? "إنشاء حساب" : "Sign Up"}</button>
    </>}
  </div>;
}
