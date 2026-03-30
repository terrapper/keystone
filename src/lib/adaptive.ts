/**
 * Adaptive Notification Engine
 *
 * Tracks user engagement patterns and adjusts notification timing
 * and messaging to be helpful without being annoying.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdaptiveSettings, TimeOfDay } from "@/lib/types/database";

interface EngagementEntry {
  timestamp: string;
  timeOfDay: TimeOfDay;
  hour: number;
  minute: number;
}

type NudgeStrategy =
  | { type: "normal"; message: string }
  | { type: "gentle"; message: string }
  | { type: "back_off"; message: string; sendEveryOtherDay: true }
  | { type: "welcome_back"; message: string };

/**
 * Record when a user engages with a routine (completes a habit).
 * Called from the Today page on habit completion.
 */
export async function recordEngagement(
  supabase: SupabaseClient,
  userId: string,
  timeOfDay: TimeOfDay,
  timestamp?: string
): Promise<void> {
  const now = timestamp ? new Date(timestamp) : new Date();
  const entry: EngagementEntry = {
    timestamp: now.toISOString(),
    timeOfDay,
    hour: now.getHours(),
    minute: now.getMinutes(),
  };

  // Get or create adaptive settings
  const { data: settings } = await supabase
    .from("adaptive_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!settings) {
    // Create new record with this as the first engagement
    await supabase.from("adaptive_settings").insert({
      user_id: userId,
      preferred_times_json: {},
      engagement_pattern_json: {
        entries: [entry],
      },
      auto_simplify_threshold: 0.4,
      consecutive_missed_days: 0,
      last_nudge_type: null,
      last_nudge_at: null,
    });
    return;
  }

  // Append to existing engagement patterns
  const patterns = (settings.engagement_pattern_json as { entries?: EngagementEntry[] }) || {};
  const entries = patterns.entries || [];
  entries.push(entry);

  // Keep only last 30 days of data
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const filtered = entries.filter(
    (e) => new Date(e.timestamp) > thirtyDaysAgo
  );

  // Reset missed days counter since user is engaging
  await supabase
    .from("adaptive_settings")
    .update({
      engagement_pattern_json: { entries: filtered },
      consecutive_missed_days: 0,
    })
    .eq("user_id", userId);
}

/**
 * Analyze engagement patterns over the last 14 days and return
 * the optimal notification time for a given time of day.
 *
 * Returns null if fewer than 7 days of data (use user's set time).
 */
export async function getOptimalNotificationTime(
  supabase: SupabaseClient,
  userId: string,
  timeOfDay: TimeOfDay
): Promise<{ hour: number; minute: number } | null> {
  const { data: settings } = await supabase
    .from("adaptive_settings")
    .select("engagement_pattern_json")
    .eq("user_id", userId)
    .single();

  if (!settings) return null;

  const patterns = (settings.engagement_pattern_json as { entries?: EngagementEntry[] }) || {};
  const entries = patterns.entries || [];

  // Filter to last 14 days and matching time of day
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const relevant = entries.filter(
    (e) =>
      e.timeOfDay === timeOfDay &&
      new Date(e.timestamp) > fourteenDaysAgo
  );

  // Need at least 7 data points for meaningful analysis
  if (relevant.length < 7) return null;

  // Calculate median engagement time
  const minutes = relevant
    .map((e) => e.hour * 60 + e.minute)
    .sort((a, b) => a - b);

  const mid = Math.floor(minutes.length / 2);
  const medianMinutes =
    minutes.length % 2 === 0
      ? Math.round((minutes[mid - 1] + minutes[mid]) / 2)
      : minutes[mid];

  // Round to nearest 15 minutes for cleaner notification times
  const rounded = Math.round(medianMinutes / 15) * 15;

  return {
    hour: Math.floor(rounded / 60),
    minute: rounded % 60,
  };
}

/**
 * Check consecutive missed days and return the appropriate nudge strategy.
 */
export async function getMissedDayResponse(
  supabase: SupabaseClient,
  userId: string
): Promise<NudgeStrategy> {
  const { data: settings } = await supabase
    .from("adaptive_settings")
    .select("consecutive_missed_days, last_nudge_type")
    .eq("user_id", userId)
    .single();

  const missed = settings?.consecutive_missed_days ?? 0;

  if (missed <= 1) {
    return {
      type: "normal",
      message: "Your {timeOfDay} Keystone is ready",
    };
  }

  if (missed === 2) {
    return {
      type: "gentle",
      message: "Just one thing today?",
    };
  }

  // 3+ days: back off to every other day
  return {
    type: "back_off",
    message: "Keystone is here when you're ready",
    sendEveryOtherDay: true,
  };
}

/**
 * Get the welcome-back response for users returning after 5+ missed days.
 * Call this from the Today page to check if we should show a welcome-back message.
 */
export async function getWelcomeBackMessage(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data: settings } = await supabase
    .from("adaptive_settings")
    .select("consecutive_missed_days")
    .eq("user_id", userId)
    .single();

  if (!settings || settings.consecutive_missed_days < 5) return null;

  return "Welcome back. Pick up where you left off, or start fresh with just one thing today.";
}

/**
 * Check if the user's completion rate is low enough to suggest simplification.
 * Returns the suggestion message or null.
 */
export async function shouldSuggestSimplification(
  supabase: SupabaseClient,
  userId: string
): Promise<{ suggest: boolean; message: string | null; topHabits: string[] }> {
  // Get completions from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  // Get the user's active routines
  const { data: routines } = await supabase
    .from("routines")
    .select("id, time_of_day")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (!routines || routines.length === 0) {
    return { suggest: false, message: null, topHabits: [] };
  }

  const routineIds = routines.map((r) => r.id);

  // Get all routine habits for active routines
  const { data: routineHabits } = await supabase
    .from("routine_habits")
    .select("id, habit_id, habit:habits(name)")
    .in("routine_id", routineIds);

  if (!routineHabits || routineHabits.length < 3) {
    // Not enough habits to simplify
    return { suggest: false, message: null, topHabits: [] };
  }

  const routineHabitIds = routineHabits.map((rh) => rh.id);

  // Get completions in the last 7 days
  const { data: completions } = await supabase
    .from("habit_completions")
    .select("routine_habit_id, skipped")
    .eq("user_id", userId)
    .gte("date", sevenDaysAgoStr)
    .in("routine_habit_id", routineHabitIds);

  if (!completions) {
    return { suggest: false, message: null, topHabits: [] };
  }

  // Calculate completion rate
  const totalPossible = routineHabits.length * 7; // habits * days
  const completed = completions.filter((c) => !c.skipped).length;
  const rate = totalPossible > 0 ? completed / totalPossible : 1;

  if (rate >= 0.4) {
    return { suggest: false, message: null, topHabits: [] };
  }

  // Find the top 2 most-completed habits
  const habitCounts: Record<string, number> = {};
  completions
    .filter((c) => !c.skipped)
    .forEach((c) => {
      habitCounts[c.routine_habit_id] = (habitCounts[c.routine_habit_id] || 0) + 1;
    });

  const topHabitIds = Object.entries(habitCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([id]) => id);

  const topHabitNames = topHabitIds
    .map((id) => {
      const rh = routineHabits.find((h) => h.id === id);
      const habit = rh?.habit as unknown as { name: string } | null | undefined;
      return habit?.name || "Unknown";
    })
    .filter(Boolean);

  const total = routineHabits.length;
  const topCount = topHabitNames.length;

  return {
    suggest: true,
    message: `Your routine has ${total} habits but you're consistently doing ${topCount}. Want to focus on just those for now?`,
    topHabits: topHabitNames,
  };
}

/**
 * Increment the missed days counter. Called by the notification scheduler
 * when a user doesn't engage on a given day.
 */
export async function incrementMissedDays(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { data: settings } = await supabase
    .from("adaptive_settings")
    .select("consecutive_missed_days")
    .eq("user_id", userId)
    .single();

  if (!settings) {
    await supabase.from("adaptive_settings").insert({
      user_id: userId,
      preferred_times_json: {},
      engagement_pattern_json: { entries: [] },
      auto_simplify_threshold: 0.4,
      consecutive_missed_days: 1,
      last_nudge_type: null,
      last_nudge_at: null,
    });
    return;
  }

  await supabase
    .from("adaptive_settings")
    .update({
      consecutive_missed_days: (settings.consecutive_missed_days || 0) + 1,
    })
    .eq("user_id", userId);
}
