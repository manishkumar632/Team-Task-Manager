"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { api, type Project, type Task, type TeamMember } from "@/lib/api";
import { formatDateTime, isOverdue, priorityBadge, statusBadge } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";

const STATUSES: Task["status"][] = ["todo", "in_progress", "done"];

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<"me" | "all">("me");

  const load = async () => {
    setLoading(true);
    const params: Record<string, string> = scope === "me" ? { assignee: "me" } : {};
    const [t, p, m] = await Promise.all([
      api.listTasks(params),
      api.listProjects(),
      api.listTeam(),
    ]);
    setTasks(t);
    setProjects(p);
    setTeam(m);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [scope]);

  const grouped = useMemo(() => {
    return STATUSES.map((s) => ({ status: s, items: tasks.filter((t) => t.status === s) }));
  }, [tasks]);

  const move = async (task: Task, status: Task["status"]) => {
    const updated = await api.updateTask(task.id, { status });
    setTasks((ts) => ts.map((t) => (t.id === task.id ? updated : t)));
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    await api.deleteTask(id);
    setTasks((ts) => ts.filter((t) => t.id !== id));
  };

  return (
    <>
      <PageHeader
        title={scope === "me" ? "My Tasks" : "All Tasks"}
        subtitle="Organize and move work across the workflow."
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-full bg-muted text-xs">
              {(["me", "all"] as const).map((s) => (
                <button key={s} onClick={() => setScope(s)}
                  className={`px-3 py-1.5 rounded-full transition ${scope === s ? "bg-card shadow-[var(--shadow-card)] font-medium" : "text-muted-foreground"}`}>
                  {s === "me" ? "Mine" : "All"}
                </button>
              ))}
            </div>
            <button onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 h-11 px-4 rounded-full bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-[var(--shadow-soft)] hover:opacity-95">
              <Plus className="size-4" /> New task
            </button>
          </div>
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {grouped.map((g) => {
            const sb = statusBadge(g.status);
            return (
              <div key={g.status} className="rounded-2xl bg-card border border-border/60 p-4 shadow-[var(--shadow-card)] flex flex-col gap-3 min-h-[200px]">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${sb.className}`}>{sb.label}</span>
                  <span className="text-xs text-muted-foreground">{g.items.length}</span>
                </div>
                {g.items.length === 0 && <p className="text-xs text-muted-foreground py-6 text-center">Nothing here.</p>}
                {g.items.map((t) => (
                  <div key={t.id} className="rounded-xl border border-border/50 bg-background p-3 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{t.title}</p>
                      <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    {t.description && <p className="text-[11px] text-muted-foreground line-clamp-2">{t.description}</p>}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`px-2 py-0.5 rounded-full ${priorityBadge(t.priority)}`}>{t.priority}</span>
                      <span className={isOverdue(t.due_date, t.status) ? "text-destructive" : "text-muted-foreground"}>
                        {t.due_date ? formatDateTime(t.due_date) : "No due"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                      <span className="text-[11px] text-muted-foreground truncate">
                        {t.project?.name ?? "—"} · {t.assignee?.name ?? "Unassigned"}
                      </span>
                      <select
                        value={t.status}
                        onChange={(e) => move(t, e.target.value as Task["status"])}
                        className="text-[11px] bg-transparent border border-border/60 rounded px-1.5 py-0.5"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{statusBadge(s).label}</option>)}
                      </select>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Assigned by: <span className="font-medium text-foreground">
                        {t.creator
                          ? t.creator.id === t.assignee?.id
                            ? "themselves"
                            : t.creator.name
                          : "Unknown"}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {open && user && (
        <NewTaskModal
          projects={projects}
          team={team}
          defaultAssignee={user.id}
          onClose={() => setOpen(false)}
          onCreated={(t) => {
            setTasks((ts) => [t, ...ts]);
            setOpen(false);
            // If user created a task that won't show in current view, switch to "All"
            if (scope === "me" && t.assignee_id !== user.id) {
              setScope("all");
            }
          }}
        />
      )}
    </>
  );
}

function NewTaskModal({
  projects, team, defaultAssignee, onClose, onCreated,
}: {
  projects: Project[];
  team: TeamMember[];
  defaultAssignee: string;
  onClose: () => void;
  onCreated: (t: Task) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [projectId, setProjectId] = useState<string>("");
  const [assigneeId, setAssigneeId] = useState<string>(defaultAssignee);
  const [due, setDue] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const t = await api.createTask({
        title,
        description: description || null,
        priority,
        project_id: projectId || null,
        assignee_id: assigneeId || null,
        due_date: due ? new Date(due).toISOString() : null,
      });
      onCreated(t);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 backdrop-blur-sm p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="w-full max-w-md rounded-3xl bg-card border border-border/60 p-6 shadow-[var(--shadow-soft)] flex flex-col gap-4">
        <h2 className="text-lg font-semibold">New task</h2>
        <label className="flex flex-col gap-1.5"><span className="text-xs font-medium">Title</span>
          <input required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)}
            className="h-11 px-4 rounded-xl bg-background border border-border/60 text-sm outline-none focus:border-ring" />
        </label>
        <label className="flex flex-col gap-1.5"><span className="text-xs font-medium">Description</span>
          <textarea maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="px-4 py-3 rounded-xl bg-background border border-border/60 text-sm outline-none focus:border-ring resize-none" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5"><span className="text-xs font-medium">Priority</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])}
              className="h-11 px-4 rounded-xl bg-background border border-border/60 text-sm">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5"><span className="text-xs font-medium">Due</span>
            <input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)}
              className="h-11 px-4 rounded-xl bg-background border border-border/60 text-sm" />
          </label>
        </div>
        <label className="flex flex-col gap-1.5"><span className="text-xs font-medium">Project <span className="text-muted-foreground">(for progress tracking)</span></span>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}
            className="h-11 px-4 rounded-xl bg-background border border-border/60 text-sm">
            <option value="">— No project (won&apos;t count toward any progress) —</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5"><span className="text-xs font-medium">Assignee <span className="text-muted-foreground">(determines whose &ldquo;My Tasks&rdquo; it appears in)</span></span>
          <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}
            className="h-11 px-4 rounded-xl bg-background border border-border/60 text-sm">
            <option value="">— Unassigned (only shows in &ldquo;All&rdquo;) —</option>
            {team.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
        {err && <p className="text-xs text-destructive">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-full text-sm text-muted-foreground hover:bg-muted">Cancel</button>
          <button disabled={busy || !title} type="submit"
            className="h-10 px-5 rounded-full bg-[image:var(--gradient-primary)] text-white text-sm font-medium disabled:opacity-50">
            {busy ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
