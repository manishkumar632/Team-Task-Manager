require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const projectsRoutes = require("./routes/projects");
const tasksRoutes = require("./routes/tasks");
const teamRoutes = require("./routes/team");
const activityRoutes = require("./routes/activity");
const statsRoutes = require("./routes/stats");
const uploadsRoutes = require("./routes/uploads");

const app = express();

app.use(express.json({ limit: "100kb" }));
app.use(
  cors({
    origin: (process.env.FRONTEND_URL || "http://localhost:3000").split(","),
    credentials: true,
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/uploads", uploadsRoutes);

app.use((err, _req, res, _next) => {
  console.error("[server] unhandled", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
