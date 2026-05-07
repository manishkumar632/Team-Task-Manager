const express = require("express");
const { z } = require("zod");
const { supabase } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { logActivity } = require("../lib/activity");

const router = express.Router();
router.use(requireAuth);

const projectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  tag: z.string().trim().min(1).max(40).default("General"),
  color: z.string().trim().min(1).max(40).default("violet"),
  due_date: z.string().date().nullable().optional(),
  member_ids: z.array(z.string().uuid()).max(50).optional(),
});

const updateSchema = projectSchema.partial();

// GET /api/projects — list projects with members + task counts
router.get("/", async (req, res) => {
  const sb = supabase();
  const { data: projects, error } = await sb
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  const ids = projects.map((p) => p.id);
  const [{ data: members = [] }, { data: tasks = [] }] = await Promise.all([
    ids.length
      ? sb
          .from("project_members")
          .select("project_id, user_id, profiles:user_id(id,name,email,avatar_url)")
          .in("project_id", ids)
      : Promise.resolve({ data: [] }),
    ids.length
      ? sb.from("tasks").select("project_id, status").in("project_id", ids)
      : Promise.resolve({ data: [] }),
  ]);

  const enriched = projects.map((p) => {
    const projMembers = members
      .filter((m) => m.project_id === p.id)
      .map((m) => m.profiles)
      .filter(Boolean);
    const projTasks = tasks.filter((t) => t.project_id === p.id);
    const total = projTasks.length;
    const done = projTasks.filter((t) => t.status === "done").length;
    return {
      ...p,
      members: projMembers,
      task_total: total,
      task_done: done,
      progress: total === 0 ? 0 : Math.round((done / total) * 100),
    };
  });

  res.json({ projects: enriched });
});

// POST /api/projects
router.post("/", async (req, res) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
  const { member_ids = [], ...rest } = parsed.data;

  const sb = supabase();
  const { data: project, error } = await sb
    .from("projects")
    .insert({ ...rest, owner_id: req.user.id })
    .select("*")
    .single();
  if (error) return res.status(500).json({ error: error.message });

  // owner is implicitly a member; merge unique
  const all = Array.from(new Set([req.user.id, ...member_ids]));
  if (all.length) {
    await sb
      .from("project_members")
      .insert(all.map((user_id) => ({ project_id: project.id, user_id })));
  }

  logActivity({
    actorId: req.user.id,
    verb: "created",
    targetType: "project",
    targetId: project.id,
    message: `created project "${project.name}"`,
  });

  res.status(201).json({ project });
});

// Helper: can the current user modify this project?
async function canManageProject(sb, user, projectId) {
  if (user.role === "admin") return true;
  const { data } = await sb
    .from("projects")
    .select("owner_id")
    .eq("id", projectId)
    .maybeSingle();
  return !!data && data.owner_id === user.id;
}

// PATCH /api/projects/:id — owner or admin
router.patch("/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
  const { member_ids, ...rest } = parsed.data;

  const sb = supabase();
  if (!(await canManageProject(sb, req.user, req.params.id))) {
    return res.status(403).json({ error: "Only the project owner or an admin can modify this project" });
  }

  const { data, error } = await sb
    .from("projects")
    .update({ ...rest, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select("*")
    .single();
  if (error || !data) return res.status(500).json({ error: error?.message || "Not found" });

  if (member_ids) {
    await sb.from("project_members").delete().eq("project_id", data.id);
    const all = Array.from(new Set([data.owner_id, ...member_ids]));
    if (all.length) {
      await sb
        .from("project_members")
        .insert(all.map((user_id) => ({ project_id: data.id, user_id })));
    }
  }

  res.json({ project: data });
});

// DELETE /api/projects/:id — admin only
router.delete("/:id", requireRole("admin"), async (req, res) => {
  const sb = supabase();
  const { error } = await sb.from("projects").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

module.exports = router;
