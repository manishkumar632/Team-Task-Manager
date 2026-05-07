const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn(
    "[db] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars. " +
      "Auth endpoints will fail until these are set."
  );
}

// Service-role client. Backend-only. Bypasses RLS — never import from frontend.
const supabase = createClient(url || "", serviceKey || "", {
  auth: { persistSession: false, autoRefreshToken: false },
});

module.exports = { supabase };
