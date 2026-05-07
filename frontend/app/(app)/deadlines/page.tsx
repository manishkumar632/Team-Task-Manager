"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { api, type Task } from "@/lib/api";
import { formatDateTime, isOverdue, priorityBadge } from "@/lib/format";

export default function DeadlinesPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listTasks().then((all) => {
      const upcoming = all
        .filter((t) => t.due_date && t.status !== "done")
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
      setTasks(upcoming);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="Deadlines" subtitle="Tasks ranked by due date." />
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          No upcoming deadlines.
        </div>
      ) : (
        <div className="rounded-2xl bg-card border border-border/60 shadow-[var(--shadow-card)] overflow-hidden">
          <ul className="divide-y divide-border/60">
            {tasks.map((t) => {
              const overdue = isOverdue(t.due_date, t.status);
              return (
                <li key={t.id} className="flex items-center gap-4 px-5 py-4">
                  <div className={`size-2.5 rounded-full ${overdue ? "bg-destructive" : "bg-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {t.project?.name ?? "No project"} · {t.assignee?.name ?? "Unassigned"}
                    </p>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${priorityBadge(t.priority)}`}>{t.priority}</span>
                  <span className={`text-xs ${overdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                    {formatDateTime(t.due_date)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
