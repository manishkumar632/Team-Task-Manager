require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");

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

app.use((err, _req, res, _next) => {
  console.error("[server] unhandled", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
