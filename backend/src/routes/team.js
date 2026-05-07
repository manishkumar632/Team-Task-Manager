const express = require("express");
const { supabase } = require("../db");
const { requireAuth } = require("../middleware/auth");

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

module.exports = router;
