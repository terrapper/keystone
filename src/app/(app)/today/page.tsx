"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/components/providers/supabase-provider";
import { updateStreak, getStreakVisual, getStreakScale } from "@/lib/streaks";
import { recordEngagement } from "@/lib/adaptive";
import { TodoistTasks } from "@/components/today/todoist-tasks";
import { AdaptiveBanners } from "@/components/today/adaptive-banners";
import { IconFlame, IconCheck, IconArrowRight } from "@/components/ui/icons";
import { habitIconMap } from "@/components/ui/icons";
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

function getCategoryAccent(category?: string): string {
  const map: Record<string, string> = {
    focus: "habit-accent-focus",
    mindfulness: "habit-accent-mindfulness",
    movement: "habit-accent-movement",
    nutrition: "habit-accent-nutrition",
    sleep: "habit-accent-sleep",
    productivity: "habit-accent-productivity",
  };
  return map[category || ""] || "habit-accent-productivity";
}

function getCategoryColor(category?: string): string {
  const map: Record<string, string> = {
    focus: "#6B7FD7",
    mindfulness: "#7B9E6B",
    movement: "#E8985E",
    nutrition: "#A3C293",
    sleep: "#9B6FA8",
    productivity: "#6B7FD7",
  };
  return map[category || ""] || "#6B7FD7";
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
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    if (profile?.display_name) setDisplayName(profile.display_name);

    const { data: streakData } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (streakData) setStreak(streakData);

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
      const { data: routineHabits } = await supabase
        .from("routine_habits")
        .select("*, habit:habits(*)")
        .eq("routine_id", currentRoutine.id)
        .order("position");

      if (routineHabits) setHabits(routineHabits as unknown as RoutineHabitWithDetails[]);

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

  async function toggleHabit(routineHabitId: string) {
    if (!userId) return;

    const existing = completions.find((c) => c.routine_habit_id === routineHabitId);

    if (existing) {
      const { error } = await supabase
        .from("habit_completions")
        .delete()
        .eq("id", existing.id);

      if (!error) {
        setCompletions((prev) => prev.filter((c) => c.id !== existing.id));
        const updatedStreak = await updateStreak(supabase, userId);
        if (updatedStreak) setStreak(updatedStreak);
      }
      return;
    }

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
      setJustCompleted(routineHabitId);
      setTimeout(() => setJustCompleted(null), 800);
      const updatedStreak = await updateStreak(supabase, userId);
      if (updatedStreak) setStreak(updatedStreak);
      recordEngagement(supabase, userId, getCurrentTimeOfDay());
    }
  }

  async function skipHabit(routineHabitId: string, note: string) {
    if (!userId) return;

    const existing = completions.find((c) => c.routine_habit_id === routineHabitId);

    if (existing) {
      const { error } = await supabase
        .from("habit_completions")
        .delete()
        .eq("id", existing.id);

      if (!error) {
        setCompletions((prev) => prev.filter((c) => c.id !== existing.id));
      }
      setSkipNoteFor(null);
      setSkipNote("");
      return;
    }

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
      <div className="animate-pulse space-y-6 pt-8">
        <div className="h-10 bg-sand-stone/15 rounded-keystone w-2/3" />
        <div className="h-5 bg-sand-stone/15 rounded-keystone w-1/2" />
        <div className="h-36 bg-sand-stone/10 rounded-keystone" />
        <div className="h-20 bg-sand-stone/10 rounded-keystone" />
        <div className="h-20 bg-sand-stone/10 rounded-keystone" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header area with warm gradient */}
      <div className="gradient-header -mx-4 -mt-6 px-4 pt-6 pb-4 mb-2">
        {/* Greeting */}
        <div className="mb-4">
          <h1 className="font-display text-3xl text-slate-deep font-bold tracking-tight leading-tight">
            {getGreeting(displayName)}
          </h1>
          {routine && (
            <p className="text-sand-stone mt-1 text-base">
              {getCurrentTimeOfDay().charAt(0).toUpperCase() + getCurrentTimeOfDay().slice(1)} routine
            </p>
          )}
        </div>

        {/* Streak ember */}
        {streak && streak.current_streak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="streak-container flex items-center gap-4"
          >
            <motion.div
              animate={{ scale: [streakScale, streakScale * 1.08, streakScale] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-12 h-12 rounded-full flex items-center justify-center relative"
              style={{
                background: "linear-gradient(135deg, rgba(232, 152, 94, 0.2) 0%, rgba(212, 118, 78, 0.15) 100%)",
                boxShadow: `0 0 ${8 + streak.current_streak * 2}px rgba(232, 152, 94, ${Math.min(0.4, 0.1 + streak.current_streak * 0.02)})`,
              }}
            >
              <IconFlame size={24} color="#E8985E" />
            </motion.div>
            <div>
              <div className="font-display text-xl text-slate-deep font-bold">
                {streak.current_streak} day{streak.current_streak !== 1 ? "s" : ""}
              </div>
              <div className="text-sm text-sand-stone">
                {streakVisual.label}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Adaptive banners */}
      <AdaptiveBanners userId={userId} />

      {/* Progress ring */}
      {totalCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-5"
        >
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90 progress-ring-gradient" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="27"
                fill="none"
                stroke="rgba(196, 168, 130, 0.15)"
                strokeWidth="5"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7B9E6B" />
                  <stop offset="100%" stopColor="#5C8A4A" />
                </linearGradient>
              </defs>
              <motion.circle
                cx="32"
                cy="32"
                r="27"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 27}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 27 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 27 * (1 - progressPct / 100),
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-deep">
                {completedCount}/{totalCount}
              </span>
            </div>
          </div>
          <div>
            <div className="text-base font-medium text-slate-deep">
              {completedCount === totalCount && totalCount > 0
                ? "All done! Nice work."
                : `${completedCount} of ${totalCount} done`}
            </div>
            <div className="text-sm text-sand-stone mt-0.5">
              {completedCount === 0
                ? "Ready when you are."
                : completedCount < totalCount
                ? "Keep going, you've got this."
                : "You showed up. That's the whole thing."}
            </div>
          </div>
        </motion.div>
      )}

      {/* Habit cards */}
      {habits.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {habits.map((rh, index) => {
              const completed = isCompleted(rh.id);
              const skipped = isSkipped(rh.id);
              const done = completed || skipped;
              const wasJustCompleted = justCompleted === rh.id;
              const category = rh.habit?.category;
              const catColor = getCategoryColor(category);
              const HabitIcon = rh.habit?.icon ? habitIconMap[rh.habit.icon] : null;

              return (
                <motion.div
                  key={rh.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={!done ? { scale: 0.97 } : undefined}
                  className={`card-keystone flex items-center gap-4 cursor-pointer select-none ${getCategoryAccent(category)} transition-all duration-400 ${
                    skipped ? "opacity-50" : ""
                  }`}
                  style={
                    completed
                      ? {
                          background: "linear-gradient(135deg, rgba(123, 158, 107, 0.08) 0%, rgba(92, 138, 74, 0.04) 100%)",
                          borderColor: "rgba(123, 158, 107, 0.2)",
                          boxShadow: wasJustCompleted ? "var(--shadow-glow-sage)" : "var(--shadow-soft)",
                        }
                      : undefined
                  }
                  onClick={() => toggleHabit(rh.id)}
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
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        className="w-11 h-11 rounded-full flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, #7B9E6B 0%, #5C8A4A 100%)",
                          boxShadow: "0 2px 8px rgba(123, 158, 107, 0.3)",
                        }}
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
                      <div className="w-11 h-11 bg-sand-stone/15 rounded-full flex items-center justify-center">
                        <span className="text-sand-stone text-sm font-medium">--</span>
                      </div>
                    ) : (
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300"
                        style={{ background: `${catColor}12`, border: `1.5px solid ${catColor}25` }}
                      >
                        {HabitIcon ? (
                          <HabitIcon size={20} color={catColor} />
                        ) : (
                          <span className="text-lg">{rh.habit?.icon}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium text-[15px] transition-all duration-300 ${
                        done ? "text-sand-stone line-through" : "text-slate-deep"
                      }`}
                    >
                      {rh.habit?.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: `${catColor}10`, color: catColor }}
                      >
                        {rh.duration_minutes} min
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card-keystone text-center py-10">
          <p className="text-sand-stone mb-3 text-base">No habits in this routine yet.</p>
          <Link href="/you" className="text-amber-warm font-semibold text-sm inline-flex items-center gap-1">
            Add some habits <IconArrowRight size={14} />
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
            className="fixed inset-0 z-50 flex items-end justify-center p-4"
            style={{ background: "rgba(45, 48, 71, 0.5)", backdropFilter: "blur(4px)" }}
            onClick={() => {
              setSkipNoteFor(null);
              setSkipNote("");
            }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-t-[24px] rounded-b-keystone p-6 w-full max-w-sm"
              style={{ boxShadow: "var(--shadow-elevated)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-lg text-slate-deep font-bold mb-2">
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
                className="input-keystone text-sm resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setSkipNoteFor(null);
                    setSkipNote("");
                  }}
                  className="btn-secondary flex-1 text-sm py-2.5"
                >
                  Cancel
                </button>
                <button
                  onClick={() => skipHabit(skipNoteFor, skipNote)}
                  className="btn-primary flex-1 text-sm py-2.5"
                >
                  Skip it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Todoist tasks section */}
      <TodoistTasks />

      {/* Boost button */}
      <Link
        href="/journeys?tab=coaching"
        className="block text-center py-4 text-amber-warm font-semibold text-sm hover:brightness-110 transition-all duration-300"
      >
        Need a boost? →
      </Link>
    </div>
  );
}
