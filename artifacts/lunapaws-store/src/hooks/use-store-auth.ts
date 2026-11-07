import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";

export function useStoreAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let revision = 0;
    setLoading(true);
    setError(false);
    try {
      const client = getSupabase();
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        revision++;
        if (!active) return;
        setUser(session?.user ?? null);
        setLoading(false);
      });
      void client.auth.getSession().then(({ data, error: sessionError }) => {
        if (!active || revision > 0) return;
        setUser(data.session?.user ?? null);
        setError(Boolean(sessionError));
        setLoading(false);
      }).catch(() => {
        if (active) { setLoading(false); setError(true); }
      });
      return () => { active = false; subscription.unsubscribe(); };
    } catch {
      setError(true);
      setLoading(false);
      return () => { active = false; };
    }
  }, [attempt]);

  const logout = async () => {
    setSigningOut(true);
    setError(false);
    try {
      const { error: logoutError } = await getSupabase().auth.signOut({ scope: "local" });
      if (logoutError) throw logoutError;
      setUser(null);
      return true;
    } catch {
      setError(true);
      return false;
    } finally { setSigningOut(false); }
  };

  return { user, loading, error, signingOut, logout, retry: () => setAttempt(value => value + 1) };
}
