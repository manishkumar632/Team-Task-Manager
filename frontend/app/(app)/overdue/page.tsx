"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { api, type Task } from "@/lib/api";
import { formatDateTime, priorityBadge } from "@/lib/format";

export default function OverduePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listTasks({ overdue: "1" }).then(setTasks).finally(() => setLoading(false));
  }, []);

  const markDone = async (t: Task) => {
    const updated = await api.updateTask(t.id, { status: "done" });
    setTasks((ts) => ts.filter((x) => x.id !== updated.id));
  };

  return (
    <>
      <PageHeader title="Overdue Alerts" subtitle="Tasks past their due date that need attention." />
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          🎉 Nothing overdue. Great job.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {tasks.map((t) => (
            <div key={t.id} className="rounded-2xl bg-card border border-[oklch(0.88_0.07_20)]/60 p-5 shadow-[var(--shadow-card)] flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[oklch(0.94_0.07_20)] text-[oklch(0.5_0.18_20)]">
                  <Flame className="size-3" /> Overdue
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${priorityBadge(t.priority)}`}>{t.priority}</span>
              </div>
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-[11px] text-muted-foreground">{t.project?.name ?? "No project"} · {t.assignee?.name ?? "Unassigned"}</p>
              </div>
              <p className="text-xs text-destructive">Was due {formatDateTime(t.due_date)}</p>
              <button onClick={() => markDone(t)}
                className="mt-auto h-9 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                Mark as done
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
