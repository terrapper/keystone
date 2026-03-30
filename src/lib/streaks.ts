import type { SupabaseClient } from "@supabase/supabase-js";

export type StreakVisual = "ember" | "candle" | "campfire" | "bonfire" | "hearth";

export function getStreakVisual(streak: number): { level: StreakVisual; emoji: string; label: string } {
  if (streak >= 30) return { level: "hearth", emoji: "🏠", label: "Hearth" };
  if (streak >= 14) return { level: "bonfire", emoji: "🔥", label: "Bonfire" };
  if (streak >= 7) return { level: "campfire", emoji: "🏕️", label: "Campfire" };
  if (streak >= 3) return { level: "candle", emoji: "🕯️", label: "Candle" };
  return { level: "ember", emoji: "✨", label: "Ember" };
}

export function getStreakScale(streak: number): number {
  if (streak >= 30) return 1.8;
  if (streak >= 14) return 1.5;
  if (streak >= 7) return 1.3;
  if (streak >= 3) return 1.1;
  return 1.0;
}

/**
 * Update the user's streak after completing a habit.
 * Call this after any habit completion.
 * Returns the updated streak record.
 */
export async function updateStreak(supabase: SupabaseClient, userId: string) {
  const today = new Date().toISOString().split("T")[0];

  // Get or create streak record
  const { data: streak } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!streak) {
    // Create first streak record
    const { data: newStreak } = await supabase
      .from("streaks")
      .insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_completed_date: today,
        freeze_used_this_week: false,
      })
      .select()
      .single();
    return newStreak;
  }

  // Already completed today
  if (streak.last_completed_date === today) {
    return streak;
  }

  const lastDate = streak.last_completed_date ? new Date(streak.last_completed_date) : null;
  const todayDate = new Date(today);
  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newStreak = streak.current_streak;
  let freezeUsed = streak.freeze_used_this_week;

  if (lastDate && streak.last_completed_date === yesterdayStr) {
    // Consecutive day — increment
    newStreak = streak.current_streak + 1;
  } else if (lastDate) {
    // Missed at least one day
    const twoDaysAgo = new Date(todayDate);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().split("T")[0];

    if (streak.last_completed_date === twoDaysAgoStr && !streak.freeze_used_this_week) {
      // Missed exactly one day and freeze is available — auto-freeze
      newStreak = streak.current_streak + 1;
      freezeUsed = true;
    } else {
      // Streak broken — start fresh
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  // Reset freeze on Monday
  const dayOfWeek = todayDate.getDay(); // 0 = Sunday
  if (dayOfWeek === 1) {
    freezeUsed = false;
  }

  const longestStreak = Math.max(streak.longest_streak, newStreak);

  const { data: updated } = await supabase
    .from("streaks")
    .update({
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_completed_date: today,
      freeze_used_this_week: freezeUsed,
    })
    .eq("user_id", userId)
    .select()
    .single();

  return updated;
}
