"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Search,
  Bell,
  MessageSquare,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  Sparkles,
  Clock,
  CheckCircle2,
  Circle,
  Flame,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getDisplayName,
  getInitials,
  getRoleLabel,
  getShortName,
} from "@/lib/user-utils";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Projects", icon: FolderKanban },
  { label: "My Tasks", icon: CheckSquare },
  { label: "Team Members", icon: Users },
  { label: "Deadlines", icon: CalendarClock },
  { label: "Activity Timeline", icon: Activity },
  { label: "Progress Tracking", icon: TrendingUp },
  { label: "Overdue Alerts", icon: AlertTriangle },
];

const team = [
  { name: "Anna Stewart", initials: "AS", color: "bg-[oklch(0.88_0.06_285)]" },
  {
    name: "Manish Mukhiya",
    initials: "VA",
    color: "bg-[oklch(0.88_0.05_230)]",
  },
  { name: "Alice Miller", initials: "AM", color: "bg-[oklch(0.88_0.06_350)]" },
  { name: "Monica Peters", initials: "MP", color: "bg-[oklch(0.88_0.06_160)]" },
  { name: "Liam Carter", initials: "LC", color: "bg-[oklch(0.88_0.06_75)]" },
];

const projects = [
  {
    name: "Mobile App Redesign",
    tag: "Design",
    tagBg: "bg-[oklch(0.94_0.05_285)] text-[oklch(0.4_0.15_285)]",
    progress: 72,
    due: "May 18",
    members: ["AS", "VA", "AM"],
  },
  {
    name: "Marketing Website v2",
    tag: "Web",
    tagBg: "bg-[oklch(0.94_0.05_230)] text-[oklch(0.4_0.15_230)]",
    progress: 48,
    due: "May 24",
    members: ["MP", "LC"],
  },
  {
    name: "Onboarding Flow",
    tag: "Product",
    tagBg: "bg-[oklch(0.94_0.05_350)] text-[oklch(0.45_0.15_350)]",
    progress: 91,
    due: "May 12",
    members: ["VA", "AS"],
  },
];

const taskBuckets = [
  {
    label: "To Do",
    count: 14,
    accent: "bg-[oklch(0.94_0.05_230)] text-[oklch(0.4_0.15_230)]",
    icon: Circle,
  },
  {
    label: "In Progress",
    count: 8,
    accent: "bg-[oklch(0.94_0.06_285)] text-[oklch(0.4_0.18_285)]",
    icon: Activity,
  },
  {
    label: "Done",
    count: 27,
    accent: "bg-[oklch(0.94_0.07_160)] text-[oklch(0.38_0.13_160)]",
    icon: CheckCircle2,
  },
  {
    label: "Overdue",
    count: 3,
    accent: "bg-[oklch(0.94_0.07_20)] text-[oklch(0.5_0.18_20)]",
    icon: Flame,
  },
];

const todayTasks = [
  { time: "09:30", title: "Design review with Anna", tag: "Design" },
  { time: "11:00", title: "Sprint planning standup", tag: "Team" },
  { time: "14:30", title: "Ship onboarding v2 build", tag: "Product" },
];

const updates = [
  { who: "Anna", text: "moved Login screen to In Progress", when: "2m" },
  { who: "Volter", text: "completed API auth refactor", when: "18m" },
  { who: "Alice", text: "left a comment on Onboarding", when: "1h" },
  { who: "Monica", text: "uploaded 3 new assets to Brand", when: "3h" },
];

const barData = [38, 64, 52, 88, 46, 70, 58];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const displayName = getDisplayName(user);
  const shortName = getShortName(user);
  const initials = getInitials(user.name, user.email);
  const roleLabel = getRoleLabel(user);
  const firstName = displayName.split(" ")[0];

  return (
    <div className="flex flex-1 min-h-screen bg-[var(--background)] text-foreground font-sans p-4 gap-4">
      {/* Sidebar */}
      <aside className="hidden lg:flex sticky top-4 h-[calc(100vh-2rem)] w-64 shrink-0 flex-col gap-2 px-5 py-6 bg-card/80 backdrop-blur border border-border/60 rounded-3xl shadow-[var(--shadow-soft)] overflow-y-auto self-start">
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="size-9 rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-soft)] grid place-items-center text-white">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="font-semibold tracking-tight">Lumen</p>
            <p className="text-[11px] text-muted-foreground">Task Manager</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {nav.map((n) => (
            <a
              key={n.label}
              href="#"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                n.active
                  ? "bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-soft)]"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <n.icon className="size-4" />
              {n.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <div className="rounded-2xl p-4 bg-[image:var(--gradient-soft)] border border-border/60">
            <p className="text-xs font-medium text-foreground">
              Upgrade to Pro
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Unlock workflows, AI summaries, and advanced analytics.
            </p>
            <button className="mt-3 w-full text-xs py-2 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition">
              Upgrade
            </button>
          </div>
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
                {roleLabel} · {user.email}
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

      {/* Main */}
      <main className="flex-1 min-w-0 px-2 lg:px-6 py-2">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back, Volter — here&apos;s what your team is shipping
              today.
            </p>
          </div>
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
              <p className="text-xs font-semibold">Volter A.</p>
              <p className="text-[10px] text-muted-foreground">Admin</p>
            </div>
            <div className="size-9 rounded-full bg-[oklch(0.88_0.06_285)] grid place-items-center text-xs font-semibold text-[oklch(0.35_0.15_285)]">
              VA
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          <div className="flex flex-col gap-6 min-w-0">
            {/* Task buckets */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {taskBuckets.map((b) => (
                <div
                  key={b.label}
                  className="rounded-2xl bg-card border border-border/60 p-5 shadow-[var(--shadow-card)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] transition"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${b.accent}`}
                    >
                      <b.icon className="size-3" />
                      {b.label}
                    </span>
                    <MoreHorizontal className="size-4 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-3xl font-bold tracking-tight">
                    {b.count}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    tasks this sprint
                  </p>
                </div>
              ))}
            </section>

            {/* Activity chart + sprint */}
            <section className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
              <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold">Task activity</h2>
                    <p className="text-xs text-muted-foreground">
                      Completed vs created this week
                    </p>
                  </div>
                  <div className="flex items-center gap-1 p-1 rounded-full bg-muted text-xs">
                    {["Week", "Month", "Quarter"].map((t, i) => (
                      <button
                        key={t}
                        className={`px-3 py-1.5 rounded-full transition ${
                          i === 0
                            ? "bg-card shadow-[var(--shadow-card)] font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-end justify-between gap-4 h-48">
                  {barData.map((v, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div className="relative w-full flex justify-center">
                        {i === 3 && (
                          <span className="absolute -top-7 text-[11px] font-semibold px-2 py-1 rounded-full bg-foreground text-background">
                            {v}
                          </span>
                        )}
                        <div
                          className={`w-7 rounded-xl transition-all ${
                            i === 3
                              ? "bg-[image:var(--gradient-primary)] shadow-[var(--shadow-soft)]"
                              : "bg-[oklch(0.94_0.04_285)]"
                          }`}
                          style={{ height: `${v * 1.6}px` }}
                        />
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {days[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sprint progress donut */}
              <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">Sprint #24</h2>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-[oklch(0.94_0.07_160)] text-[oklch(0.38_0.13_160)] font-medium">
                    On track
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  May 6 — May 20 · 14 days
                </p>

                <div className="relative grid place-items-center my-5">
                  <svg viewBox="0 0 120 120" className="size-40 -rotate-90">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="oklch(0.94 0.04 285)"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="url(#g)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${0.68 * 314} 314`}
                    />
                    <defs>
                      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="oklch(0.62 0.2 285)" />
                        <stop offset="100%" stopColor="oklch(0.74 0.14 260)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-3xl font-bold tracking-tight">68%</p>
                    <p className="text-[11px] text-muted-foreground">
                      completed
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-muted/60 py-2">
                    <p className="text-sm font-semibold">42</p>
                    <p className="text-[10px] text-muted-foreground">Done</p>
                  </div>
                  <div className="rounded-xl bg-muted/60 py-2">
                    <p className="text-sm font-semibold">14</p>
                    <p className="text-[10px] text-muted-foreground">Active</p>
                  </div>
                  <div className="rounded-xl bg-muted/60 py-2">
                    <p className="text-sm font-semibold">6</p>
                    <p className="text-[10px] text-muted-foreground">Backlog</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Workload curve */}
            <section className="rounded-2xl bg-card border border-border/60 p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Team workload</h2>
                  <p className="text-xs text-muted-foreground">
                    Avg hours logged per day
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-primary" /> This
                    week
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[oklch(0.85_0.08_350)]" />{" "}
                    Last week
                  </span>
                </div>
              </div>
              <svg viewBox="0 0 600 180" className="w-full h-44">
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.2 285 / 0.35)" />
                    <stop offset="100%" stopColor="oklch(0.62 0.2 285 / 0)" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,140 C80,90 140,150 220,80 C300,20 360,110 440,70 C520,30 560,90 600,60 L600,180 L0,180 Z"
                  fill="url(#area)"
                />
                <path
                  d="M0,140 C80,90 140,150 220,80 C300,20 360,110 440,70 C520,30 560,90 600,60"
                  fill="none"
                  stroke="oklch(0.62 0.2 285)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M0,150 C80,130 140,160 220,120 C300,90 360,140 440,110 C520,90 560,120 600,100"
                  fill="none"
                  stroke="oklch(0.85 0.08 350)"
                  strokeWidth="2.5"
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                />
                <circle
                  cx="220"
                  cy="80"
                  r="6"
                  fill="white"
                  stroke="oklch(0.62 0.2 285)"
                  strokeWidth="3"
                />
              </svg>
            </section>

            {/* Projects */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Active projects</h2>
                <button className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80">
                  <Plus className="size-4" /> New project
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {projects.map((p) => (
                  <div
                    key={p.name}
                    className="rounded-2xl bg-card border border-border/60 p-5 shadow-[var(--shadow-card)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] transition"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${p.tagBg}`}
                      >
                        {p.tag}
                      </span>
                      <button className="text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="size-4" />
                      </button>
                    </div>
                    <h3 className="font-semibold tracking-tight">{p.name}</h3>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{p.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {p.members.map((m) => (
                          <div
                            key={m}
                            className="size-7 rounded-full ring-2 ring-card bg-[oklch(0.92_0.04_285)] grid place-items-center text-[10px] font-semibold text-[oklch(0.35_0.15_285)]"
                          >
                            {m}
                          </div>
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarClock className="size-3.5" /> {p.due}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Team */}
            <section className="rounded-2xl bg-card border border-border/60 p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold">Your team</h2>
                  <p className="text-xs text-muted-foreground">
                    5 collaborators online now
                  </p>
                </div>
                <button className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80">
                  Invite <ArrowUpRight className="size-4" />
                </button>
              </div>
              <div className="flex items-center gap-6 overflow-x-auto pb-1">
                {team.map((t) => (
                  <div
                    key={t.name}
                    className="flex flex-col items-center gap-2 shrink-0"
                  >
                    <div className="relative">
                      <div
                        className={`size-14 rounded-full grid place-items-center text-sm font-semibold text-[oklch(0.3_0.1_285)] ${t.color}`}
                      >
                        {t.initials}
                      </div>
                      <span className="absolute bottom-0 right-0 size-3.5 rounded-full bg-[oklch(0.78_0.13_160)] ring-2 ring-card" />
                    </div>
                    <p className="text-xs font-medium">
                      {t.name.split(" ")[0]}
                    </p>
                  </div>
                ))}
                <button className="size-14 rounded-full border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:text-primary hover:border-primary transition shrink-0">
                  <Plus className="size-5" />
                </button>
              </div>
            </section>
          </div>

          {/* Right panel */}
          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl p-6 bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-soft)] relative overflow-hidden">
              <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
              <p className="text-xs font-medium opacity-80">Today</p>
              <p className="text-3xl font-bold tracking-tight mt-1">12 tasks</p>
              <p className="text-xs opacity-80 mt-1">3 due before 5 PM</p>
              <button className="mt-4 text-xs font-medium px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur transition">
                View schedule
              </button>
            </div>

            <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Today&apos;s tasks</h3>
                <button className="text-muted-foreground hover:text-foreground">
                  <Plus className="size-4" />
                </button>
              </div>
              <ul className="flex flex-col gap-3">
                {todayTasks.map((t) => (
                  <li
                    key={t.title}
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition"
                  >
                    <div className="text-[11px] font-semibold text-primary px-2 py-1 rounded-full bg-[oklch(0.94_0.05_285)] shrink-0">
                      {t.time}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">
                        {t.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {t.tag}
                      </p>
                    </div>
                    <Circle className="size-4 text-muted-foreground mt-1" />
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Overdue</h3>
                <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-[oklch(0.94_0.07_20)] text-[oklch(0.5_0.18_20)]">
                  3 items
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {[
                  { t: "Update billing screen", d: "2 days ago" },
                  { t: "QA: payment flow", d: "1 day ago" },
                  { t: "Send sprint report", d: "5 hours ago" },
                ].map((o) => (
                  <li
                    key={o.t}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition"
                  >
                    <div className="size-8 rounded-xl bg-[oklch(0.94_0.07_20)] grid place-items-center text-[oklch(0.5_0.18_20)]">
                      <Flame className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{o.t}</p>
                      <p className="text-[11px] text-muted-foreground">{o.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-[var(--shadow-card)]">
              <h3 className="font-semibold mb-4">Recent activity</h3>
              <ul className="flex flex-col gap-4">
                {updates.map((u, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="size-8 rounded-full bg-[oklch(0.92_0.05_285)] grid place-items-center text-[10px] font-semibold text-[oklch(0.35_0.15_285)] shrink-0">
                      {u.who.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-snug">
                        <span className="font-semibold">{u.who}</span>{" "}
                        <span className="text-muted-foreground">{u.text}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                        <Clock className="size-3" /> {u.when} ago
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Quick stats</h3>
                <Settings className="size-4 text-muted-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="rounded-xl p-3 bg-[oklch(0.96_0.03_285)]">
                  <p className="text-[11px] text-muted-foreground">Velocity</p>
                  <p className="text-lg font-bold mt-0.5">+18%</p>
                </div>
                <div className="rounded-xl p-3 bg-[oklch(0.96_0.03_230)]">
                  <p className="text-[11px] text-muted-foreground">
                    Focus time
                  </p>
                  <p className="text-lg font-bold mt-0.5">4.2h</p>
                </div>
                <div className="rounded-xl p-3 bg-[oklch(0.96_0.03_350)]">
                  <p className="text-[11px] text-muted-foreground">Reviews</p>
                  <p className="text-lg font-bold mt-0.5">9</p>
                </div>
                <div className="rounded-xl p-3 bg-[oklch(0.96_0.03_160)]">
                  <p className="text-[11px] text-muted-foreground">Shipped</p>
                  <p className="text-lg font-bold mt-0.5">27</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
