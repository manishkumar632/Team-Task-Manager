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
  logout: () => void;
  refresh: () => Promise<void>;
  updateProfile: (patch: ProfileUpdate) => Promise<AuthUser>;
};

const TOKEN_KEY = "lumen.auth.token";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const AuthContext = createContext<AuthContextValue | null>(null);

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const { user } = await apiFetch<{ user: AuthUser }>("/api/auth/me");
      setUser(user);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchMe().finally(() => setLoading(false));
  }, [fetchMe]);

  const signup = useCallback<AuthContextValue["signup"]>(async (input) => {
    const { token, user } = await apiFetch<{ token: string; user: AuthUser }>(
      "/api/auth/signup",
      { method: "POST", body: JSON.stringify(input) }
    );
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
    router.push("/");
  }, [router]);

  const login = useCallback<AuthContextValue["login"]>(async (input) => {
    const { token, user } = await apiFetch<{ token: string; user: AuthUser }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify(input) }
    );
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
    router.push("/");
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
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
