"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { Habit } from "@/lib/types/database";

const GOALS = [
  "Better focus",
  "Morning routine",
  "Less overwhelm",
  "Build habits",
  "Sleep better",
  "Daily structure",
] as const;

const TIME_BLOCKS = [
  { id: "morning" as const, label: "Morning", emoji: "🌅", desc: "Start your day right" },
  { id: "afternoon" as const, label: "Afternoon", emoji: "☀️", desc: "Midday recharge" },
  { id: "evening" as const, label: "Evening", emoji: "🌙", desc: "Wind down well" },
] as const;

const slideVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = useSupabase();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [goals, setGoals] = useState<string[]>([]);
  const [starterHabits, setStarterHabits] = useState<Habit[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [activeBlocks, setActiveBlocks] = useState<string[]>(["morning"]);
  const [phoneNumber, setPhoneNumber] = useState("");

  // Load starter habits from DB
  useEffect(() => {
    async function loadStarterHabits() {
      const { data } = await supabase
        .from("habits")
        .select("*")
        .eq("is_default", true)
        .in("name", [
          "Drink a glass of water",
          "Stretch for 2 minutes",
          "2-minute breathing",
          "Write 3 gratitudes",
        ]);
      if (data && data.length > 0) {
        setStarterHabits(data);
      } else {
        // Fallback: get any 4 default habits
        const { data: fallback } = await supabase
          .from("habits")
          .select("*")
          .eq("is_default", true)
          .limit(4);
        if (fallback) setStarterHabits(fallback);
      }
    }
    loadStarterHabits();
  }, [supabase]);

  function toggleGoal(goal: string) {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  function toggleBlock(block: string) {
    setActiveBlocks((prev) =>
      prev.includes(block) ? prev.filter((b) => b !== block) : [...prev, block]
    );
  }

  function next() {
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function finishOnboarding() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Update profile
      await supabase.from("profiles").upsert({
        id: user.id,
        display_name: displayName || "Friend",
        phone_number: phoneNumber || null,
        onboarding_complete: true,
        onboarding_selections: goals,
      });

      // Create routines for selected time blocks
      for (const block of activeBlocks) {
        let startTime = "07:00";
        if (block === "morning") startTime = wakeTime;
        else if (block === "afternoon") startTime = "12:00";
        else if (block === "evening") startTime = "20:00";

        const { data: routine } = await supabase
          .from("routines")
          .insert({
            user_id: user.id,
            time_of_day: block,
            start_time: startTime,
            is_active: true,
          })
          .select()
          .single();

        // Add selected habit to morning routine
        if (routine && block === "morning" && selectedHabit) {
          await supabase.from("routine_habits").insert({
            routine_id: routine.id,
            habit_id: selectedHabit,
            position: 0,
            duration_minutes: 2,
          });
        }
      }

      // Create initial streak record
      await supabase.from("streaks").insert({
        user_id: user.id,
        current_streak: 0,
        longest_streak: 0,
        last_completed_date: null,
        freeze_used_this_week: false,
      });

      router.push("/today");
    } catch (err) {
      console.error("Onboarding error:", err);
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    // Step 0: Welcome
    <motion.div
      key="welcome"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col items-center text-center min-h-[70vh] justify-center"
    >
      <div className="w-20 h-20 bg-amber-warm rounded-keystone mx-auto mb-6 flex items-center justify-center shadow-lg">
        <span className="text-white font-display text-3xl font-bold">K</span>
      </div>
      <h1 className="font-display text-3xl text-slate-deep font-bold mb-3">
        Hey. This is Keystone.
      </h1>
      <p className="text-sand-stone text-lg max-w-xs leading-relaxed">
        A small app to help you build routines that actually stick.
        One habit at a time.
      </p>
      <div className="mt-12 w-full max-w-xs">
        <button onClick={next} className="btn-primary w-full text-lg">
          Let&apos;s go
        </button>
      </div>
    </motion.div>,

    // Step 1: Quick profile
    <motion.div
      key="profile"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col min-h-[70vh] justify-center"
    >
      <h1 className="font-display text-2xl text-slate-deep font-bold mb-2">
        First, a little about you.
      </h1>
      <p className="text-sand-stone mb-8">Just the basics.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-deep mb-2">
            What should we call you?
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-keystone border border-sand-stone/50 bg-white
                       text-slate-deep placeholder:text-sand-stone/60 focus:outline-none
                       focus:ring-2 focus:ring-amber-warm/50 font-body"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-deep mb-2">
            What time does your day usually start?
          </label>
          <input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            className="w-full px-4 py-3 rounded-keystone border border-sand-stone/50 bg-white
                       text-slate-deep focus:outline-none focus:ring-2 focus:ring-amber-warm/50 font-body"
          />
        </div>
      </div>

      <div className="mt-10 flex gap-3">
        <button onClick={back} className="btn-secondary flex-1">
          Back
        </button>
        <button
          onClick={next}
          disabled={!displayName.trim()}
          className="btn-primary flex-1 disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </motion.div>,

    // Step 2: Goals
    <motion.div
      key="goals"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col min-h-[70vh] justify-center"
    >
      <h1 className="font-display text-2xl text-slate-deep font-bold mb-2">
        What&apos;s pulling you here?
      </h1>
      <p className="text-sand-stone mb-8">Pick as many as feel right.</p>

      <div className="flex flex-wrap gap-3">
        {GOALS.map((goal) => {
          const isSelected = goals.includes(goal);
          return (
            <motion.button
              key={goal}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleGoal(goal)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                isSelected
                  ? "bg-amber-warm text-white border-amber-warm shadow-sm"
                  : "bg-white text-slate-deep border-sand-stone/40 hover:border-amber-warm/60"
              }`}
            >
              {goal}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-10 flex gap-3">
        <button onClick={back} className="btn-secondary flex-1">
          Back
        </button>
        <button
          onClick={next}
          disabled={goals.length === 0}
          className="btn-primary flex-1 disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </motion.div>,

    // Step 3: Pick first habit
    <motion.div
      key="first-habit"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col min-h-[70vh] justify-center"
    >
      <h1 className="font-display text-2xl text-slate-deep font-bold mb-2">
        Your first keystone.
      </h1>
      <p className="text-sand-stone mb-8">
        Pick one small thing to do when you wake up tomorrow. Just one.
      </p>

      <div className="space-y-3">
        {starterHabits.map((habit) => {
          const isSelected = selectedHabit === habit.id;
          return (
            <motion.button
              key={habit.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedHabit(habit.id)}
              className={`w-full text-left card-keystone flex items-center gap-4 transition-all duration-200 ${
                isSelected
                  ? "border-amber-warm ring-2 ring-amber-warm/30 bg-amber-warm/5"
                  : "hover:border-sand-stone/60"
              }`}
            >
              <span className="text-2xl">{habit.icon}</span>
              <div className="flex-1">
                <div className="font-medium text-slate-deep">{habit.name}</div>
                <div className="text-sm text-sand-stone">{habit.description}</div>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 bg-amber-warm rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-sm">✓</span>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-10 flex gap-3">
        <button onClick={back} className="btn-secondary flex-1">
          Back
        </button>
        <button
          onClick={next}
          disabled={!selectedHabit}
          className="btn-primary flex-1 disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </motion.div>,

    // Step 4: Set rhythm
    <motion.div
      key="rhythm"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col min-h-[70vh] justify-center"
    >
      <h1 className="font-display text-2xl text-slate-deep font-bold mb-2">
        Set your rhythm.
      </h1>
      <p className="text-sand-stone mb-8">
        When do you want Keystone to show up for you?
      </p>

      <div className="space-y-3">
        {TIME_BLOCKS.map((block) => {
          const isActive = activeBlocks.includes(block.id);
          return (
            <motion.button
              key={block.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleBlock(block.id)}
              className={`w-full text-left card-keystone flex items-center gap-4 transition-all duration-200 ${
                isActive
                  ? "border-amber-warm ring-2 ring-amber-warm/30 bg-amber-warm/5"
                  : "hover:border-sand-stone/60"
              }`}
            >
              <span className="text-2xl">{block.emoji}</span>
              <div className="flex-1">
                <div className="font-medium text-slate-deep">{block.label}</div>
                <div className="text-sm text-sand-stone">{block.desc}</div>
              </div>
              <div
                className={`w-10 h-6 rounded-full transition-colors duration-200 relative ${
                  isActive ? "bg-amber-warm" : "bg-sand-stone/30"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    isActive ? "translate-x-4.5" : "translate-x-0.5"
                  }`}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-10 flex gap-3">
        <button onClick={back} className="btn-secondary flex-1">
          Back
        </button>
        <button
          onClick={next}
          disabled={activeBlocks.length === 0}
          className="btn-primary flex-1 disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </motion.div>,

    // Step 5: Notifications
    <motion.div
      key="notifications"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col min-h-[70vh] justify-center"
    >
      <h1 className="font-display text-2xl text-slate-deep font-bold mb-2">
        Stay in the loop.
      </h1>
      <p className="text-sand-stone mb-8">
        We can send you a gentle nudge when it&apos;s time for your routine.
        You can always change this later.
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-deep mb-2">
          Phone number for SMS reminders (optional)
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+1 (555) 123-4567"
          className="w-full px-4 py-3 rounded-keystone border border-sand-stone/50 bg-white
                     text-slate-deep placeholder:text-sand-stone/60 focus:outline-none
                     focus:ring-2 focus:ring-amber-warm/50 font-body"
        />
        <p className="text-xs text-sand-stone mt-2">
          We&apos;ll adapt to your rhythm over time. No spam, ever.
        </p>
      </div>

      <div className="mt-10 flex gap-3">
        <button onClick={back} className="btn-secondary flex-1">
          Back
        </button>
        <button onClick={next} className="btn-primary flex-1">
          {phoneNumber ? "Continue" : "Skip for now"}
        </button>
      </div>
    </motion.div>,

    // Step 6: You're in
    <motion.div
      key="done"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col items-center text-center min-h-[70vh] justify-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
        className="w-20 h-20 bg-green-sage rounded-full flex items-center justify-center mb-6 shadow-lg"
      >
        <span className="text-white text-3xl">✓</span>
      </motion.div>
      <h1 className="font-display text-3xl text-slate-deep font-bold mb-3">
        You&apos;re in.
      </h1>
      <p className="text-sand-stone text-lg max-w-xs leading-relaxed mb-2">
        Your first morning is set.
        {displayName && ` See you tomorrow at ${wakeTime}, ${displayName}.`}
      </p>
      {selectedHabit && starterHabits.find((h) => h.id === selectedHabit) && (
        <div className="card-keystone mt-4 text-left inline-flex items-center gap-3 px-5 py-3">
          <span className="text-xl">
            {starterHabits.find((h) => h.id === selectedHabit)?.icon}
          </span>
          <span className="font-medium text-slate-deep">
            {starterHabits.find((h) => h.id === selectedHabit)?.name}
          </span>
        </div>
      )}

      <div className="mt-12 w-full max-w-xs">
        <button
          onClick={finishOnboarding}
          disabled={loading}
          className="btn-primary w-full text-lg disabled:opacity-50"
        >
          {loading ? "Setting up..." : "Let's start"}
        </button>
      </div>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen bg-white-warm px-6 py-8">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === step
                ? "bg-amber-warm w-6"
                : i < step
                ? "bg-amber-warm/40"
                : "bg-sand-stone/30"
            }`}
          />
        ))}
      </div>

      <div className="max-w-sm mx-auto">
        <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
      </div>
    </div>
  );
}
