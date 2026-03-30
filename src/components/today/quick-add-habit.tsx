"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { Habit, HabitCategory } from "@/lib/types/database";

const CATEGORIES: { id: HabitCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "focus", label: "Focus" },
  { id: "movement", label: "Movement" },
  { id: "mindfulness", label: "Mindfulness" },
  { id: "nutrition", label: "Nutrition" },
  { id: "sleep", label: "Sleep" },
  { id: "productivity", label: "Productivity" },
];

interface QuickAddHabitProps {
  open: boolean;
  onClose: () => void;
  routineId: string;
  routineName: string;
  existingHabitIds: string[];
  onAdded: () => void;
}

export function QuickAddHabit({
  open,
  onClose,
  routineId,
  routineName,
  existingHabitIds,
  onAdded,
}: QuickAddHabitProps) {
  const supabase = useSupabase();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [filter, setFilter] = useState<HabitCategory | "all">("all");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadHabits = useCallback(async () => {
    const { data } = await supabase
      .from("habits")
      .select("*")
      .eq("is_default", true)
      .order("category");
    if (data) setHabits(data);
  }, [supabase]);

  useEffect(() => {
    if (open) loadHabits();
  }, [open, loadHabits]);

  const filtered = filter === "all" ? habits : habits.filter((h) => h.category === filter);
  const available = filtered.filter((h) => !existingHabitIds.includes(h.id));

  async function addHabit(habit: Habit) {
    setLoading(true);
    // Get current max position
    const { data: existing } = await supabase
      .from("routine_habits")
      .select("position")
      .eq("routine_id", routineId)
      .order("position", { ascending: false })
      .limit(1);

    const nextPos = existing && existing.length > 0 ? existing[0].position + 1 : 0;
    const duration = habit.category === "movement" ? 5 : habit.category === "mindfulness" ? 3 : 2;

    const { error } = await supabase.from("routine_habits").insert({
      routine_id: routineId,
      habit_id: habit.id,
      position: nextPos,
      duration_minutes: duration,
    });

    setLoading(false);

    if (!error) {
      setToast(`Added ${habit.name} to your ${routineName}`);
      onAdded();
      setTimeout(() => setToast(null), 2500);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-deep/40 z-50 flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white rounded-t-2xl p-5 w-full max-w-lg max-h-[75vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-slate-deep font-semibold">
                Add a habit
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-sand-stone/20 flex items-center justify-center text-slate-deep"
              >
                ✕
              </button>
            </div>

            {/* Category chips — horizontal scroll */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-3 -mx-1 px-1 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filter === cat.id
                      ? "bg-amber-warm text-white"
                      : "bg-sand-stone/15 text-slate-deep"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Habit list */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {available.length === 0 ? (
                <p className="text-center text-sand-stone text-sm py-8">
                  {filtered.length === 0
                    ? "No habits in this category."
                    : "All habits in this category are already in your routine!"}
                </p>
              ) : (
                available.map((habit) => (
                  <button
                    key={habit.id}
                    onClick={() => !loading && addHabit(habit)}
                    disabled={loading}
                    className="w-full card-keystone flex items-center gap-3 text-left hover:border-amber-warm/50 transition-all active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 rounded-full bg-white-warm flex items-center justify-center border border-sand-stone/30 shrink-0">
                      <span className="text-lg">{habit.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-deep text-sm">
                        {habit.name}
                      </div>
                      <div className="text-xs text-sand-stone truncate">
                        {habit.description}
                      </div>
                    </div>
                    <span className="text-amber-warm text-lg shrink-0">+</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>

          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-deep text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg z-[60]"
              >
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
