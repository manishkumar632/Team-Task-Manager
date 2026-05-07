"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type Mode = "login" | "signup";

export function AuthCard({
  mode,
  title,
  subtitle,
  footer,
}: {
  mode: Mode;
  title: string;
  subtitle: string;
  footer: ReactNode;
}) {
  const { login, signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await signup({ name, email, password });
      } else {
        await login({ email, password });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border/60 shadow-[var(--shadow-soft)] p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-soft)] grid place-items-center text-white">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="font-semibold tracking-tight">Lumen</p>
            <p className="text-[11px] text-muted-foreground">Task Manager</p>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          {mode === "signup" && (
            <Field
              label="Full name"
              type="text"
              value={name}
              onChange={setName}
              autoComplete="name"
              required
              minLength={1}
              maxLength={80}
            />
          )}
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
            maxLength={255}
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={mode === "signup" ? 8 : 1}
            maxLength={72}
            hint={mode === "signup" ? "At least 8 characters." : undefined}
          />

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center gap-2 h-11 rounded-full bg-[image:var(--gradient-primary)] text-white font-medium shadow-[var(--shadow-soft)] hover:opacity-95 disabled:opacity-60 transition"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground text-center">{footer}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  ...rest
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 px-4 rounded-xl bg-background border border-border/60 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 transition"
      />
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function AuthFooterLink({
  prompt,
  href,
  cta,
}: {
  prompt: string;
  href: string;
  cta: string;
}) {
  return (
    <>
      {prompt}{" "}
      <Link href={href} className="text-primary font-medium hover:underline">
        {cta}
      </Link>
    </>
  );
}
