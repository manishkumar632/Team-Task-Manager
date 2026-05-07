"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { api, type Project, type StatsOverview } from "@/lib/api";
import { tagBg } from "@/lib/format";

export default function ProgressPage() {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.overview(), api.listProjects()])
      .then(([s, p]) => { setStats(s); setProjects(p); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="Progress Tracking" subtitle="Workspace and project completion at a glance." />

      {loading || !stats ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          <section className="rounded-2xl bg-card border border-border/60 p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-semibold mb-4">Overall</h2>
            <div className="relative grid place-items-center my-2">
              <svg viewBox="0 0 120 120" className="size-44 -rotate-90">
                <circle cx="60" cy="60" r="50" stroke="oklch(0.94 0.04 285)" strokeWidth="12" fill="none" />
                <circle cx="60" cy="60" r="50" stroke="url(#gp)" strokeWidth="12" fill="none" strokeLinecap="round"
                  strokeDasharray={`${(stats.sprint.pct / 100) * 314} 314`} />
                <defs>
                  <linearGradient id="gp" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.2 285)" />
                    <stop offset="100%" stopColor="oklch(0.74 0.14 260)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <p className="text-3xl font-bold">{stats.sprint.pct}%</p>
                <p className="text-[11px] text-muted-foreground">completed</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mt-4">
              <Stat n={stats.sprint.done} l="Done" />
              <Stat n={stats.sprint.active} l="Active" />
              <Stat n={stats.sprint.backlog} l="Backlog" />
            </div>
          </section>

          <section className="rounded-2xl bg-card border border-border/60 p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-semibold mb-4">By project</h2>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects yet.</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {projects.map((p) => (
                  <li key={p.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${tagBg(p.color)}`}>{p.tag}</span>
                        <span className="text-sm font-medium truncate">{p.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{p.task_done}/{p.task_total} · {p.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-[image:var(--gradient-primary)]" style={{ width: `${p.progress}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div className="rounded-xl bg-muted/60 py-2">
      <p className="text-sm font-semibold">{n}</p>
      <p className="text-[10px] text-muted-foreground">{l}</p>
    </div>
  );
}
