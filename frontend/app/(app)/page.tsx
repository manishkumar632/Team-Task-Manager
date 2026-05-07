"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Circle,
  Flame,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getDisplayName,
} from "@/lib/user-utils";
import { PageHeader } from "@/components/page-header";
import { api, type Activity as ActivityItem, type StatsOverview, type Task } from "@/lib/api";
import { memberInitials, relativeTime, statusBadge } from "@/lib/format";

type Bucket = { key: keyof StatsOverview["buckets"]; label: string; icon: LucideIcon; accent: string };
const BUCKETS: Bucket[] = [
  { key: "todo", label: "To Do", icon: Circle, accent: "bg-[oklch(0.94_0.05_230)] text-[oklch(0.4_0.15_230)]" },
  { key: "in_progress", label: "In Progress", icon: Activity, accent: "bg-[oklch(0.94_0.06_285)] text-[oklch(0.4_0.18_285)]" },
  { key: "done", label: "Done", icon: CheckCircle2, accent: "bg-[oklch(0.94_0.07_160)] text-[oklch(0.38_0.13_160)]" },
  { key: "overdue", label: "Overdue", icon: Flame, accent: "bg-[oklch(0.94_0.07_20)] text-[oklch(0.5_0.18_20)]" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);

  useEffect(() => {
    api.overview().then(setStats).catch(console.error);
    api.listActivity(10).then(setActivity).catch(console.error);
    api
      .listTasks({ assignee: "me" })
      .then((tasks) => {
        const today = new Date();
        const sameDay = (d: string | null) =>
          d &&
          new Date(d).toDateString() === today.toDateString();
        setTodayTasks(tasks.filter((t) => t.status !== "done" && sameDay(t.due_date)).slice(0, 5));
      })
      .catch(console.error);
  }, []);

  const firstName = user ? getDisplayName(user).split(" ")[0] : "";
  const maxBar = Math.max(1, ...(stats?.week.completed ?? [0]));

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${firstName} — here's what your team is shipping today.`}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        <div className="flex flex-col gap-6 min-w-0">
          {/* Buckets */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {BUCKETS.map((b) => (
              <div
                key={b.key}
                className="rounded-2xl bg-card border border-border/60 p-5 shadow-[var(--shadow-card)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] transition"
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${b.accent}`}>
                    <b.icon className="size-3" />
                    {b.label}
                  </span>
                  <MoreHorizontal className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight">
                  {stats ? stats.buckets[b.key] : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {b.key === "overdue" ? "needs attention" : "tasks assigned to you"}
                </p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
            {/* Activity bars */}
            <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Task activity</h2>
                  <p className="text-xs text-muted-foreground">Tasks completed this week</p>
                </div>
              </div>
              <div className="flex items-end justify-between gap-4 h-48">
                {(stats?.week.completed ?? Array(7).fill(0)).map((v, i) => {
                  const peak = v === maxBar && v > 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full flex justify-center">
                        {peak && (
                          <span className="absolute -top-7 text-[11px] font-semibold px-2 py-1 rounded-full bg-foreground text-background">
                            {v}
                          </span>
                        )}
                        <div
                          className={`w-7 rounded-xl transition-all ${
                            peak
                              ? "bg-[image:var(--gradient-primary)] shadow-[var(--shadow-soft)]"
                              : "bg-[oklch(0.94_0.04_285)]"
                          }`}
                          style={{ height: `${(v / maxBar) * 160 + 8}px` }}
                        />
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {stats?.week.days[i] ?? ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sprint donut */}
            <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Workspace progress</h2>
                <span className="text-[11px] px-2 py-1 rounded-full bg-[oklch(0.94_0.07_160)] text-[oklch(0.38_0.13_160)] font-medium">
                  {stats?.sprint.pct ?? 0}% done
                </span>
              </div>
              <p className="text-xs text-muted-foreground">All tasks across projects</p>
              <div className="relative grid place-items-center my-5">
                <svg viewBox="0 0 120 120" className="size-40 -rotate-90">
                  <circle cx="60" cy="60" r="50" stroke="oklch(0.94 0.04 285)" strokeWidth="12" fill="none" />
                  <circle
                    cx="60" cy="60" r="50" stroke="url(#g)" strokeWidth="12" fill="none" strokeLinecap="round"
                    strokeDasharray={`${((stats?.sprint.pct ?? 0) / 100) * 314} 314`}
                  />
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.2 285)" />
                      <stop offset="100%" stopColor="oklch(0.74 0.14 260)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <p className="text-3xl font-bold tracking-tight">{stats?.sprint.pct ?? 0}%</p>
                  <p className="text-[11px] text-muted-foreground">completed</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-muted/60 py-2">
                  <p className="text-sm font-semibold">{stats?.sprint.done ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground">Done</p>
                </div>
                <div className="rounded-xl bg-muted/60 py-2">
                  <p className="text-sm font-semibold">{stats?.sprint.active ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground">Active</p>
                </div>
                <div className="rounded-xl bg-muted/60 py-2">
                  <p className="text-sm font-semibold">{stats?.sprint.backlog ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground">Backlog</p>
                </div>
              </div>
            </div>
          </section>

          {/* Today's tasks */}
          <section className="rounded-2xl bg-card border border-border/60 p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-semibold mb-4">Due today</h2>
            {todayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing due today. 🎉</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {todayTasks.map((t) => {
                  const s = statusBadge(t.status);
                  return (
                    <li key={t.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-muted/40">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{t.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {t.project?.name ?? "No project"}
                        </p>
                      </div>
                      <span className={`text-[11px] px-2 py-1 rounded-full ${s.className}`}>{s.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Right column: activity */}
        <aside className="flex flex-col gap-6 min-w-0">
          <section className="rounded-2xl bg-card border border-border/60 p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-semibold mb-4">Live updates</h2>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-start gap-3">
                    <div className="size-8 rounded-full bg-[oklch(0.92_0.04_285)] grid place-items-center text-[10px] font-semibold text-[oklch(0.35_0.15_285)] overflow-hidden shrink-0">
                      {a.actor.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.actor.avatar_url} alt={a.actor.name} className="size-full object-cover" />
                      ) : (
                        memberInitials(a.actor)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{a.actor.name}</span>{" "}
                        <span className="text-muted-foreground">{a.message}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">{relativeTime(a.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
