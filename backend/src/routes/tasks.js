const express = require("express");
const { z } = require("zod");
const { supabase } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { logActivity } = require("../lib/activity");

const router = express.Router();
router.use(requireAuth);

const taskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  project_id: z.string().uuid().nullable().optional(),
  assignee_id: z.string().uuid().nullable().optional(),
  due_date: z.string().datetime().nullable().optional(),
});

const updateSchema = taskSchema.partial();

const SELECT = `
  id, title, description, status, priority, due_date, completed_at,
  created_at, updated_at, project_id, assignee_id, creator_id,
  project:project_id(id,name,tag,color),
  assignee:assignee_id(id,name,email,avatar_url),
  creator:creator_id(id,name,email,avatar_url)
`;

// GET /api/tasks?status=&assignee=me&project_id=&overdue=1
router.get("/", async (req, res) => {
  const sb = supabase();
  let q = sb.from("tasks").select(SELECT).order("created_at", { ascending: false });

  if (req.query.status) q = q.eq("status", req.query.status);
  if (req.query.project_id) q = q.eq("project_id", req.query.project_id);
  if (req.query.assignee === "me") q = q.eq("assignee_id", req.user.id);
  else if (req.query.assignee) q = q.eq("assignee_id", req.query.assignee);
  if (req.query.overdue === "1") {
    q = q.lt("due_date", new Date().toISOString()).neq("status", "done");
  }

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ tasks: data });
});

// POST /api/tasks
router.post("/", async (req, res) => {
  const parsed = taskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });

  const sb = supabase();
  const { data, error } = await sb
    .from("tasks")
    .insert({ ...parsed.data, creator_id: req.user.id })
    .select(SELECT)
    .single();
  if (error) return res.status(500).json({ error: error.message });

  logActivity({
    actorId: req.user.id,
    verb: "created",
    targetType: "task",
    targetId: data.id,
    message: `created task "${data.title}"`,
  });
  res.status(201).json({ task: data });
});

// PATCH /api/tasks/:id
router.patch("/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });

  const sb = supabase();
  const patch = { ...parsed.data, updated_at: new Date().toISOString() };
  if (parsed.data.status === "done") patch.completed_at = new Date().toISOString();
  if (parsed.data.status && parsed.data.status !== "done") patch.completed_at = null;

  const { data, error } = await sb
    .from("tasks")
    .update(patch)
    .eq("id", req.params.id)
    .select(SELECT)
    .single();
  if (error || !data) return res.status(500).json({ error: error?.message || "Not found" });

  if (parsed.data.status === "done") {
    logActivity({
      actorId: req.user.id,
      verb: "completed",
      targetType: "task",
      targetId: data.id,
      message: `completed "${data.title}"`,
    });
  } else if (parsed.data.status) {
    logActivity({
      actorId: req.user.id,
      verb: "moved",
      targetType: "task",
      targetId: data.id,
      message: `moved "${data.title}" to ${parsed.data.status.replace("_", " ")}`,
    });
  }

  res.json({ task: data });
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  const sb = supabase();
  const { error } = await sb.from("tasks").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

module.exports = router;
