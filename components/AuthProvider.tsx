"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { trackEvent } from "@/lib/tracking";

export interface UserProfile {
  id: string;
  display_name: string | null;
  role: string;
  last_active_at: string | null;
  total_calls: number;
  avg_score: number;
  created_at: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Only create the client once, and only in the browser
  const supabase = useMemo<SupabaseClient | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  // Fetch profile from profiles table
  async function fetchProfile(userId: string) {
    if (!supabase) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile(data as UserProfile);
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth
      .getUser()
      .then(({ data: { user: u } }) => {
        setUser(u);
        if (u) fetchProfile(u.id);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setProfile(null);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);

      if (newUser) {
        fetchProfile(newUser.id);
      } else {
        setProfile(null);
      }

      setLoading(false);

      // Track login/logout events
      if (event === "SIGNED_IN") {
        trackEvent({ eventType: "login" });
      } else if (event === "SIGNED_OUT") {
        trackEvent({ eventType: "logout" });
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
