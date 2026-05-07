const { supabase } = require("../db");

async function logActivity({ actorId, verb, targetType, targetId, message }) {
  try {
    await supabase().from("activity_log").insert({
      actor_id: actorId,
      verb,
      target_type: targetType,
      target_id: targetId || null,
      message,
    });
  } catch (e) {
    console.error("[activity] insert failed", e);
  }
}

module.exports = { logActivity };
