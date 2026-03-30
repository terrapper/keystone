"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/components/providers/supabase-provider";
import { updateStreak, getStreakVisual, getStreakScale } from "@/lib/streaks";
import type { Routine, RoutineHabitWithDetails, HabitCompletion, Streak } from "@/lib/types/database";
import Link from "next/link";

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Afternoon check-in`;
  return `Wind down time`;
}

function getCurrentTimeOfDay(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export default function TodayPage() {
  const supabase = useSupabase();
  const [displayName, setDisplayName] = useState("Friend");
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [habits, setHabits] = useState<RoutineHabitWithDetails[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [skipNoteFor, setSkipNoteFor] = useState<string | null>(null);
  const [skipNote, setSkipNote] = useState("");
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // Load profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    if (profile?.display_name) setDisplayName(profile.display_name);

    // Load streak
    const { data: streakData } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (streakData) setStreak(streakData);

    // Load current routine
    const timeOfDay = getCurrentTimeOfDay();
    const { data: routines } = await supabase
      .from("routines")
      .select("*")
      .eq("user_id", user.id)
      .eq("time_of_day", timeOfDay)
      .eq("is_active", true)
      .limit(1);

    const currentRoutine = routines?.[0] || null;
    setRoutine(currentRoutine);

    if (currentRoutine) {
      // Load routine habits with habit details
      const { data: routineHabits } = await supabase
        .from("routine_habits")
        .select("*, habit:habits(*)")
        .eq("routine_id", currentRoutine.id)
        .order("position");

      if (routineHabits) setHabits(routineHabits as unknown as RoutineHabitWithDetails[]);

      // Load today's completions
      const { data: completionData } = await supabase
        .from("habit_completions")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today);

      if (completionData) setCompletions(completionData);
    }

    setLoading(false);
  }, [supabase, today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function isCompleted(routineHabitId: string): boolean {
    return completions.some(
      (c) => c.routine_habit_id === routineHabitId && !c.skipped
    );
  }

  function isSkipped(routineHabitId: string): boolean {
    return completions.some(
      (c) => c.routine_habit_id === routineHabitId && c.skipped
    );
  }

  async function completeHabit(routineHabitId: string) {
    if (!userId || isCompleted(routineHabitId) || isSkipped(routineHabitId)) return;

    const { data } = await supabase
      .from("habit_completions")
      .insert({
        routine_habit_id: routineHabitId,
        user_id: userId,
        date: today,
        completed_at: new Date().toISOString(),
        skipped: false,
      })
      .select()
      .single();

    if (data) {
      setCompletions((prev) => [...prev, data]);
      // Update streak
      const updatedStreak = await updateStreak(supabase, userId);
      if (updatedStreak) setStreak(updatedStreak);
    }
  }

  async function skipHabit(routineHabitId: string, note: string) {
    if (!userId || isCompleted(routineHabitId) || isSkipped(routineHabitId)) return;

    const { data } = await supabase
      .from("habit_completions")
      .insert({
        routine_habit_id: routineHabitId,
        user_id: userId,
        date: today,
        completed_at: null,
        skipped: true,
        skip_note: note || null,
      })
      .select()
      .single();

    if (data) {
      setCompletions((prev) => [...prev, data]);
    }
    setSkipNoteFor(null);
    setSkipNote("");
  }

  function handlePointerDown(routineHabitId: string) {
    if (isCompleted(routineHabitId) || isSkipped(routineHabitId)) return;
    const timer = setTimeout(() => {
      setSkipNoteFor(routineHabitId);
    }, 500);
    setLongPressTimer(timer);
  }

  function handlePointerUp() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }

  const completedCount = habits.filter((h) => isCompleted(h.id)).length;
  const totalCount = habits.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const streakVisual = streak ? getStreakVisual(streak.current_streak) : getStreakVisual(0);
  const streakScale = streak ? getStreakScale(streak.current_streak) : 1;

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 pt-8">
        <div className="h-8 bg-sand-stone/20 rounded w-2/3" />
        <div className="h-4 bg-sand-stone/20 rounded w-1/2" />
        <div className="h-32 bg-sand-stone/20 rounded-keystone" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Streak ember */}
      {streak && streak.current_streak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2"
        >
          <motion.span
            animate={{ scale: [streakScale, streakScale * 1.1, streakScale] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-2xl"
          >
            {streakVisual.emoji}
          </motion.span>
          <span className="font-display text-lg text-slate-deep font-semibold">
            {streak.current_streak} day{streak.current_streak !== 1 ? "s" : ""}
          </span>
          <span className="text-sm text-sand-stone">
            {streakVisual.label}
          </span>
        </motion.div>
      )}

      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl text-slate-deep font-bold">
          {getGreeting(displayName)}
        </h1>
        {routine && (
          <p className="text-sand-stone mt-1">
            {getCurrentTimeOfDay().charAt(0).toUpperCase() + getCurrentTimeOfDay().slice(1)} routine
          </p>
        )}
      </div>

      {/* Progress ring */}
      {totalCount > 0 && (
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="#C4A882"
                strokeWidth="4"
                opacity="0.2"
              />
              <motion.circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="#7B9E6B"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 24}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                animate={{
                  strokeDashoffset:
                    2 * Math.PI * 24 * (1 - progressPct / 100),
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-deep">
              {completedCount}/{totalCount}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-deep">
              {completedCount === totalCount && totalCount > 0
                ? "All done! Nice work."
                : `${completedCount} of ${totalCount} done`}
            </div>
            <div className="text-xs text-sand-stone">
              {completedCount === 0
                ? "Ready when you are."
                : completedCount < totalCount
                ? "Keep going, you've got this."
                : "You showed up. That's the whole thing."}
            </div>
          </div>
        </div>
      )}

      {/* Habit cards */}
      {habits.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {habits.map((rh) => {
              const completed = isCompleted(rh.id);
              const skipped = isSkipped(rh.id);
              const done = completed || skipped;

              return (
                <motion.div
                  key={rh.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`card-keystone flex items-center gap-4 cursor-pointer select-none transition-all duration-300 ${
                    completed
                      ? "bg-green-sage/10 border-green-sage/30"
                      : skipped
                      ? "bg-sand-stone/10 border-sand-stone/30 opacity-60"
                      : "active:scale-[0.98]"
                  }`}
                  onClick={() => !done && completeHabit(rh.id)}
                  onPointerDown={() => handlePointerDown(rh.id)}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                >
                  {/* Icon / checkmark */}
                  <div className="relative">
                    {completed ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className="w-10 h-10 bg-green-sage rounded-full flex items-center justify-center"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          className="animate-check-draw"
                        >
                          <path
                            d="M4 10l4 4 8-8"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="24"
                            strokeDashoffset="0"
                          />
                        </svg>
                      </motion.div>
                    ) : skipped ? (
                      <div className="w-10 h-10 bg-sand-stone/30 rounded-full flex items-center justify-center">
                        <span className="text-sand-stone text-sm">—</span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-white-warm rounded-full flex items-center justify-center border border-sand-stone/30">
                        <span className="text-lg">{rh.habit?.icon}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium ${
                        done ? "text-sand-stone line-through" : "text-slate-deep"
                      }`}
                    >
                      {rh.habit?.name}
                    </div>
                    <div className="text-xs text-sand-stone">
                      {rh.duration_minutes} min
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card-keystone text-center py-8">
          <p className="text-sand-stone mb-3">No habits in this routine yet.</p>
          <Link href="/you" className="text-amber-warm font-medium text-sm">
            Add some habits →
          </Link>
        </div>
      )}

      {/* Skip note modal */}
      <AnimatePresence>
        {skipNoteFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-deep/40 z-50 flex items-end justify-center p-4"
            onClick={() => {
              setSkipNoteFor(null);
              setSkipNote("");
            }}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-t-2xl rounded-b-keystone p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-lg text-slate-deep mb-3">
                Skip this one?
              </h3>
              <p className="text-sm text-sand-stone mb-4">
                No judgment. Leave a quick note if you want.
              </p>
              <textarea
                value={skipNote}
                onChange={(e) => setSkipNote(e.target.value)}
                placeholder="Optional: what's going on?"
                rows={2}
                className="w-full px-4 py-3 rounded-keystone border border-sand-stone/50 bg-white
                           text-slate-deep placeholder:text-sand-stone/60 focus:outline-none
                           focus:ring-2 focus:ring-amber-warm/50 font-body text-sm resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setSkipNoteFor(null);
                    setSkipNote("");
                  }}
                  className="btn-secondary flex-1 text-sm py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => skipHabit(skipNoteFor, skipNote)}
                  className="btn-primary flex-1 text-sm py-2"
                >
                  Skip it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boost button */}
      <Link
        href="/focus"
        className="block text-center py-3 text-amber-warm font-medium text-sm hover:underline"
      >
        Need a boost? →
      </Link>
    </div>
  );
}
