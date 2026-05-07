"use client";

import { Bell, MessageSquare, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getDisplayName,
  getInitials,
  getRoleLabel,
  getShortName,
} from "@/lib/user-utils";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!user) return null;
  const displayName = getDisplayName(user);
  const shortName = getShortName(user);
  const initials = getInitials(user.name, user.email);
  const roleLabel = getRoleLabel(user);

  return (
    <header className="flex items-center gap-4 mb-8 flex-wrap">
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {action}
      <div className="hidden md:flex items-center gap-2 px-4 h-11 w-72 rounded-full bg-card border border-border/60 shadow-[var(--shadow-card)]">
        <Search className="size-4 text-muted-foreground" />
        <input
          placeholder="Search tasks, people, projects…"
          className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
        />
      </div>
      <button className="size-11 rounded-full bg-card border border-border/60 grid place-items-center text-muted-foreground hover:text-foreground shadow-[var(--shadow-card)]">
        <MessageSquare className="size-4" />
      </button>
      <button className="relative size-11 rounded-full bg-card border border-border/60 grid place-items-center text-muted-foreground hover:text-foreground shadow-[var(--shadow-card)]">
        <Bell className="size-4" />
        <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-[oklch(0.7_0.18_20)]" />
      </button>
      <div className="hidden sm:flex items-center gap-3 pl-3 pr-1 h-11 rounded-full bg-card border border-border/60 shadow-[var(--shadow-card)]">
        <div className="text-right leading-tight">
          <p className="text-xs font-semibold">{shortName}</p>
          <p className="text-[10px] text-muted-foreground">{roleLabel}</p>
        </div>
        <div className="size-9 rounded-full bg-[oklch(0.88_0.06_285)] grid place-items-center text-xs font-semibold text-[oklch(0.35_0.15_285)] overflow-hidden">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt={displayName} className="size-full object-cover" />
          ) : (
            initials
          )}
        </div>
      </div>
    </header>
  );
}
