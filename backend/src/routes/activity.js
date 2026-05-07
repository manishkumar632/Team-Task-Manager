const express = require("express");
const { supabase } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/activity?limit=50
router.get("/", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  const sb = supabase();
  const { data, error } = await sb
    .from("activity_log")
    .select("id, verb, target_type, target_id, message, created_at, actor:actor_id(id,name,email,avatar_url)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ activity: data });
});

module.exports = router;
