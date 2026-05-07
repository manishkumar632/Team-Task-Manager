"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
  plan: "free" | "pro" | "premium";
  avatar_url: string | null;
  created_at: string;
};

type ProfileUpdate = Partial<Pick<AuthUser, "name" | "avatar_url" | "plan">>;

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signup: (input: { name: string; email: string; password: string }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (patch: ProfileUpdate) => Promise<AuthUser>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Same-origin fetch helper. The browser only ever talks to /api/* on the
 * Next.js server, which proxies to the real backend with an HttpOnly cookie.
 * No tokens are stored in localStorage; nothing the page reads is auth-bearing.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchMe = useCallback(async () => {
    try {
      const { user } = await apiFetch<{ user: AuthUser }>("/api/auth/me");
      setUser(user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchMe().finally(() => setLoading(false));
  }, [fetchMe]);

  const signup = useCallback<AuthContextValue["signup"]>(async (input) => {
    const { user } = await apiFetch<{ user: AuthUser }>(
      "/api/auth/signup",
      { method: "POST", body: JSON.stringify(input) }
    );
    setUser(user);
    router.push("/");
  }, [router]);

  const login = useCallback<AuthContextValue["login"]>(async (input) => {
    const { user } = await apiFetch<{ user: AuthUser }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify(input) }
    );
    setUser(user);
    router.push("/");
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await apiFetch<{ ok: true }>("/api/auth/logout", { method: "POST" });
    } catch {
      /* even if it fails, clear local state */
    }
    setUser(null);
    router.push("/login");
  }, [router]);

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>(async (patch) => {
    const { user } = await apiFetch<{ user: AuthUser }>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    setUser(user);
    return user;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, signup, login, logout, refresh: fetchMe, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
