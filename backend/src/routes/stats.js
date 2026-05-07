const express = require("express");
const { supabase } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = (x.getUTCDay() + 6) % 7; // Mon=0
  x.setUTCDate(x.getUTCDate() - day);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

// GET /api/stats/overview — sidebar/dashboard headline numbers
router.get("/overview", async (req, res) => {
  const sb = supabase();
  const { data: tasks, error } = await sb
    .from("tasks")
    .select("id,status,due_date,completed_at,assignee_id,created_at");
  if (error) return res.status(500).json({ error: error.message });

  const now = new Date();
  const me = req.user.id;
  const myTasks = tasks.filter((t) => t.assignee_id === me);

  const buckets = {
    todo: myTasks.filter((t) => t.status === "todo").length,
    in_progress: myTasks.filter((t) => t.status === "in_progress").length,
    done: myTasks.filter((t) => t.status === "done").length,
    overdue: myTasks.filter(
      (t) => t.status !== "done" && t.due_date && new Date(t.due_date) < now
    ).length,
  };

  // weekly bars (Mon..Sun) — count of tasks completed per day this week
  const weekStart = startOfWeek(now);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setUTCDate(d.getUTCDate() + i);
    return d;
  });
  const completedByDay = days.map((d) => {
    const next = new Date(d);
    next.setUTCDate(next.getUTCDate() + 1);
    return tasks.filter(
      (t) =>
        t.completed_at &&
        new Date(t.completed_at) >= d &&
        new Date(t.completed_at) < next
    ).length;
  });

  // sprint-ish completion across all tasks
  const total = tasks.length;
  const totalDone = tasks.filter((t) => t.status === "done").length;
  const sprintPct = total === 0 ? 0 : Math.round((totalDone / total) * 100);

  res.json({
    buckets,
    week: { days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], completed: completedByDay },
    sprint: {
      done: totalDone,
      active: tasks.filter((t) => t.status === "in_progress").length,
      backlog: tasks.filter((t) => t.status === "todo").length,
      pct: sprintPct,
    },
    counts: {
      tasks_total: total,
      my_tasks: myTasks.length,
    },
  });
});

module.exports = router;
