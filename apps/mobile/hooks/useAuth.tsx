import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { registerDeviceToken } from "@/services/notifications";

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ session: null, user: null, loading: true });

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (data.session?.user.id) void registerDeviceToken(data.session.user.id);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user.id) void registerDeviceToken(nextSession.user.id);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo(() => ({ session, user: session?.user ?? null, loading }), [session, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
