const express = require("express");
const { z } = require("zod");
const { supabase } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { logActivity } = require("../lib/activity");

const router = express.Router();
router.use(requireAuth);

// GET /api/team — every profile in the workspace
router.get("/", async (_req, res) => {
  const sb = supabase();
  const { data: members, error } = await sb
    .from("profiles")
    .select("id,name,email,role,avatar_url,created_at")
    .order("created_at", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });

  const ids = members.map((m) => m.id);
  const { data: tasks = [] } = ids.length
    ? await sb.from("tasks").select("assignee_id,status").in("assignee_id", ids)
    : { data: [] };

  const enriched = members.map((m) => {
    const mine = tasks.filter((t) => t.assignee_id === m.id);
    return {
      ...m,
      open_tasks: mine.filter((t) => t.status !== "done").length,
      done_tasks: mine.filter((t) => t.status === "done").length,
    };
  });
  res.json({ members: enriched });
});

// PATCH /api/team/:id/role — admin only, change a member's role
const roleSchema = z.object({ role: z.enum(["admin", "member"]) });
router.patch("/:id/role", requireRole("admin"), async (req, res) => {
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid role" });
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: "You cannot change your own role" });
  }

  const sb = supabase();
  const { data, error } = await sb
    .from("profiles")
    .update({ role: parsed.data.role, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select("id,name,email,role,avatar_url,created_at")
    .single();
  if (error || !data) return res.status(500).json({ error: error?.message || "Not found" });

  logActivity({
    actorId: req.user.id,
    verb: "updated",
    targetType: "user",
    targetId: data.id,
    message: `set ${data.name}'s role to ${data.role}`,
  });
  res.json({ member: data });
});

module.exports = router;
