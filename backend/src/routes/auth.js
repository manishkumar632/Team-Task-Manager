const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const rateLimit = require("express-rate-limit");
const { supabase } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(72),
  name: z.string().trim().min(1).max(80),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(72),
});

function signToken(profile) {
  return jwt.sign(
    { sub: profile.id, email: profile.email, role: profile.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicProfile(p) {
  return {
    id: p.id,
    email: p.email,
    name: p.name,
    role: p.role,
    avatar_url: p.avatar_url,
    created_at: p.created_at,
  };
}

// POST /api/auth/signup
router.post("/signup", authLimiter, async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
  }
  const { email, password, name } = parsed.data;

  const { data: existing, error: lookupErr } = await supabase()
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (lookupErr) return res.status(500).json({ error: "Database error" });
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const password_hash = await bcrypt.hash(password, 10);

  const { data: created, error: insertErr } = await supabase()
    .from("profiles")
    .insert({ email, password_hash, name, role: "member" })
    .select("*")
    .single();
  if (insertErr || !created) {
    console.error("[signup] insert error", insertErr);
    return res.status(500).json({ error: "Could not create account" });
  }

  const token = signToken(created);
  return res.status(201).json({ token, user: publicProfile(created) });
});

// POST /api/auth/login
router.post("/login", authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const { email, password } = parsed.data;

  const { data: profile, error } = await supabase()
    .from("profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) return res.status(500).json({ error: "Database error" });
  if (!profile) return res.status(401).json({ error: "Invalid email or password" });

  const ok = await bcrypt.compare(password, profile.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });

  const token = signToken(profile);
  return res.json({ token, user: publicProfile(profile) });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  const { data: profile, error } = await supabase()
    .from("profiles")
    .select("*")
    .eq("id", req.user.id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: "Database error" });
  if (!profile) return res.status(404).json({ error: "User not found" });
  return res.json({ user: publicProfile(profile) });
});

module.exports = router;
