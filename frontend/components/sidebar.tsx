"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  CalendarClock,
  Activity,
  TrendingUp,
  AlertTriangle,
  Settings,
  LogOut,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getDisplayName, getInitials, getRoleLabel } from "@/lib/user-utils";

type NavItem = { label: string; href: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "My Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Team Members", href: "/team", icon: Users },
  { label: "Deadlines", href: "/deadlines", icon: CalendarClock },
  { label: "Activity Timeline", href: "/activity", icon: Activity },
  { label: "Progress Tracking", href: "/progress", icon: TrendingUp },
  { label: "Overdue Alerts", href: "/overdue", icon: AlertTriangle },
];

function planLabel(plan: string) {
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;
  const displayName = getDisplayName(user);
  const initials = getInitials(user.name, user.email);
  const roleLabel = getRoleLabel(user);

  return (
    <aside className="hidden lg:flex sticky top-4 h-[calc(100vh-2rem)] w-64 shrink-0 flex-col gap-2 px-5 py-6 bg-card/80 backdrop-blur border border-border/60 rounded-3xl shadow-[var(--shadow-soft)] overflow-y-auto self-start">
      <Link href="/" className="flex items-center gap-2 px-2 mb-6">
        <div className="size-9 rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-soft)] grid place-items-center text-white">
          <Sparkles className="size-4" />
        </div>
        <div>
          <p className="font-semibold tracking-tight">Lumen</p>
          <p className="text-[11px] text-muted-foreground">Task Manager</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map((n) => {
          const active =
            n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                active
                  ? "bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-soft)]"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <n.icon className="size-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        {user.plan !== "premium" && (
          <div className="rounded-2xl p-4 bg-[image:var(--gradient-soft)] border border-border/60">
            <p className="text-xs font-medium text-foreground">
              Upgrade to {user.plan === "pro" ? "Premium" : "Pro"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Unlock workflows, AI summaries, and advanced analytics.
            </p>
            <Link
              href="/settings"
              className="mt-3 w-full inline-flex items-center justify-center text-xs py-2 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
            >
              Upgrade
            </Link>
          </div>
        )}

        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition ${
            pathname.startsWith("/settings")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Settings className="size-4" />
          Settings
        </Link>

        <div className="flex items-center gap-3 px-2 pt-2 border-t border-border/60">
          <div className="size-9 rounded-full bg-[oklch(0.88_0.06_285)] grid place-items-center text-xs font-semibold text-[oklch(0.35_0.15_285)] overflow-hidden">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt={displayName} className="size-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {roleLabel} · {planLabel(user.plan)}
            </p>
          </div>
          <button
            onClick={logout}
            aria-label="Log out"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
