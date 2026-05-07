"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { api, type Project, type TeamMember } from "@/lib/api";
import { COLOR_OPTIONS, formatDate, memberInitials, tagBg } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [p, t] = await Promise.all([api.listProjects(), api.listTeam()]);
      setProjects(p);
      setTeam(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onDelete = async (id: string) => {
    if (!confirm("Delete this project? Tasks will be unlinked.")) return;
    await api.deleteProject(id);
    setProjects((ps) => ps.filter((p) => p.id !== id));
  };

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="All workspaces and collaborative initiatives."
        action={
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-full bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-[var(--shadow-soft)] hover:opacity-95"
          >
            <Plus className="size-4" /> New project
          </button>
        }
      />

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          No projects yet. Click <span className="font-medium">New project</span> to create your first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((p) => {
            const canManage = !!user && (user.role === "admin" || user.id === p.owner_id);
            return (
            <div key={p.id} className="rounded-2xl bg-card border border-border/60 p-5 shadow-[var(--shadow-card)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] transition flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`inline-flex text-[11px] font-medium px-2.5 py-1 rounded-full ${tagBg(p.color)}`}>
                    {p.tag}
                  </span>
                  <h3 className="mt-2 font-semibold tracking-tight">{p.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  {canManage && (
                    <button
                      onClick={() => setEditing(p)}
                      className="text-muted-foreground hover:text-foreground p-1"
                      aria-label="Edit project"
                      title="Edit project & members"
                    >
                      <Pencil className="size-4" />
                    </button>
                  )}
                  {user?.role === "admin" && (
                    <button
                      onClick={() => onDelete(p.id)}
                      className="text-muted-foreground hover:text-destructive p-1"
                      aria-label="Delete project"
                      title="Delete (admin only)"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                  <span>{p.task_done}/{p.task_total} tasks</span>
                  <span>{p.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-[image:var(--gradient-primary)]" style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {p.members.slice(0, 4).map((m) => (
                    <div key={m.id} className="size-7 rounded-full bg-[oklch(0.92_0.04_285)] text-[oklch(0.35_0.15_285)] grid place-items-center text-[10px] font-semibold ring-2 ring-card overflow-hidden">
                      {m.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.avatar_url} alt={m.name} className="size-full object-cover" />
                      ) : memberInitials(m)}
                    </div>
                  ))}
                  {p.members.length > 4 && (
                    <div className="size-7 rounded-full bg-muted text-[10px] grid place-items-center ring-2 ring-card">
                      +{p.members.length - 4}
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground">Due {formatDate(p.due_date)}</span>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {open && (
        <NewProjectModal
          team={team}
          onClose={() => setOpen(false)}
          onCreated={(proj) => {
            setProjects((ps) => [proj, ...ps]);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

function NewProjectModal({
  team,
  onClose,
  onCreated,
}: {
  team: TeamMember[];
  onClose: () => void;
  onCreated: (p: Project) => void;
}) {
  const [name, setName] = useState("");
  const [tag, setTag] = useState("Design");
  const [color, setColor] = useState<(typeof COLOR_OPTIONS)[number]>("violet");
  const [due, setDue] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const proj = await api.createProject({
        name, tag, color,
        due_date: due || null,
        member_ids: memberIds,
      });
      // Backend returns project without enriched fields; re-fetch to get them.
      const all = await api.listProjects();
      const enriched = all.find((p) => p.id === proj.id) ?? proj;
      onCreated(enriched as Project);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to create project");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 backdrop-blur-sm p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl bg-card border border-border/60 p-6 shadow-[var(--shadow-soft)] flex flex-col gap-4"
      >
        <h2 className="text-lg font-semibold">New project</h2>

        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120}
            className="h-11 px-4 rounded-xl bg-background border border-border/60 text-sm outline-none focus:border-ring" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tag">
            <input value={tag} onChange={(e) => setTag(e.target.value)} maxLength={40}
              className="h-11 px-4 rounded-xl bg-background border border-border/60 text-sm outline-none focus:border-ring" />
          </Field>
          <Field label="Due date">
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)}
              className="h-11 px-4 rounded-xl bg-background border border-border/60 text-sm outline-none focus:border-ring" />
          </Field>
        </div>

        <Field label="Color">
          <div className="flex gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button type="button" key={c} onClick={() => setColor(c)}
                className={`text-[11px] px-3 py-1.5 rounded-full ${tagBg(c)} ${color === c ? "ring-2 ring-ring" : ""}`}>
                {c}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Members">
          <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
            {team.map((m) => {
              const on = memberIds.includes(m.id);
              return (
                <button type="button" key={m.id}
                  onClick={() => setMemberIds((ids) => on ? ids.filter((i) => i !== m.id) : [...ids, m.id])}
                  className={`text-xs px-3 py-1.5 rounded-full border ${on ? "bg-primary text-primary-foreground border-primary" : "border-border/60 text-muted-foreground"}`}>
                  {m.name}
                </button>
              );
            })}
          </div>
        </Field>

        {err && <p className="text-xs text-destructive">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-full text-sm text-muted-foreground hover:bg-muted">Cancel</button>
          <button disabled={busy || !name} type="submit"
            className="h-10 px-5 rounded-full bg-[image:var(--gradient-primary)] text-white text-sm font-medium disabled:opacity-50">
            {busy ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium">{label}</span>
      {children}
    </label>
  );
}
