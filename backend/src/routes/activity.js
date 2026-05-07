const express = require("express");
const { supabase } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/activity?limit=50&before=<iso>&q=<search>&verb=<verb>
router.get("/", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 25, 100);
  const sb = supabase();
  let q = sb
    .from("activity_log")
    .select("id, verb, target_type, target_id, message, created_at, actor:actor_id(id,name,email,avatar_url)")
    .order("created_at", { ascending: false })
    .limit(limit + 1);
  if (req.query.before) q = q.lt("created_at", req.query.before);
  if (req.query.verb) q = q.eq("verb", req.query.verb);
  if (req.query.q) q = q.ilike("message", `%${req.query.q}%`);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].created_at : null;
  res.json({ activity: items, nextCursor });
});

module.exports = router;
