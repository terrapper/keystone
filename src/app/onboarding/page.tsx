"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/components/providers/supabase-provider";
import { IconSunrise, IconSun, IconMoon, IconCheck } from "@/components/ui/icons";
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
  { id: "morning" as const, label: "Morning", Icon: IconSunrise, desc: "Start your day right" },
  { id: "afternoon" as const, label: "Afternoon", Icon: IconSun, desc: "Midday recharge" },
  { id: "evening" as const, label: "Evening", Icon: IconMoon, desc: "Wind down well" },
] as const;

const slideVariants = {
  enter: { opacity: 0, x: 80, scale: 0.97 },
  center: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -80, scale: 0.97 },
};

const GRADIENTS = [
  "linear-gradient(160deg, #F5F0EB 0%, #F0E6D9 30%, #EDE0D0 100%)",
  "linear-gradient(160deg, #F5F0EB 0%, #EFE8DF 50%, #E8DED0 100%)",
  "linear-gradient(160deg, #F5F0EB 0%, #E8E2D8 30%, #F0E6D9 100%)",
  "linear-gradient(160deg, #F5F0EB 0%, #EDE4D8 40%, #F2EBE0 100%)",
  "linear-gradient(160deg, #F5F0EB 0%, #EBE3D6 30%, #EDE0D0 100%)",
  "linear-gradient(160deg, #F5F0EB 0%, #F0E8DC 30%, #E8DFD0 100%)",
  "linear-gradient(160deg, #EDF5EA 0%, #F0E6D9 50%, #F5F0EB 100%)",
];

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

      await supabase.from("profiles").upsert({
        id: user.id,
        display_name: displayName || "Friend",
        phone_number: phoneNumber || null,
        onboarding_complete: true,
        onboarding_selections: goals,
      });

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

        if (routine && block === "morning" && selectedHabit) {
          await supabase.from("routine_habits").insert({
            routine_id: routine.id,
            habit_id: selectedHabit,
            position: 0,
            duration_minutes: 2,
          });
        }
      }

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
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="flex flex-col items-center text-center min-h-[70vh] justify-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-24 h-24 mx-auto mb-8 flex items-center justify-center rounded-[24px]"
        style={{
          background: "linear-gradient(135deg, #E8985E 0%, #D4764E 100%)",
          boxShadow: "0 8px 32px rgba(232, 152, 94, 0.3), 0 0 64px rgba(232, 152, 94, 0.1)",
        }}
      >
        <span className="text-white font-display text-4xl font-bold">K</span>
      </motion.div>
      <h1 className="font-display text-4xl text-slate-deep font-bold mb-3 tracking-tight">
        Hey. This is Keystone.
      </h1>
      <p className="text-sand-stone text-lg max-w-xs leading-relaxed">
        A small app to help you build routines that actually stick. One habit at a time.
      </p>
      <div className="mt-14 w-full max-w-xs">
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
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="flex flex-col min-h-[70vh] justify-center"
    >
      <div className="text-center mb-2">
        <span className="text-6xl block mb-4">&#x1F44B;</span>
      </div>
      <h1 className="font-display text-3xl text-slate-deep font-bold mb-2 tracking-tight">
        First, a little about you.
      </h1>
      <p className="text-sand-stone mb-8 text-base">Just the basics.</p>

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
            className="input-keystone"
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
            className="input-keystone"
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
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="flex flex-col min-h-[70vh] justify-center"
    >
      <div className="text-center mb-2">
        <span className="text-6xl block mb-4">&#x1F3AF;</span>
      </div>
      <h1 className="font-display text-3xl text-slate-deep font-bold mb-2 tracking-tight">
        What&apos;s pulling you here?
      </h1>
      <p className="text-sand-stone mb-8 text-base">Pick as many as feel right.</p>

      <div className="flex flex-wrap gap-3">
        {GOALS.map((goal) => {
          const isSelected = goals.includes(goal);
          return (
            <motion.button
              key={goal}
              whileTap={{ scale: 0.93 }}
              onClick={() => toggleGoal(goal)}
              className={`chip ${isSelected ? "active" : ""}`}
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
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="flex flex-col min-h-[70vh] justify-center"
    >
      <div className="text-center mb-2">
        <span className="text-6xl block mb-4">&#x2728;</span>
      </div>
      <h1 className="font-display text-3xl text-slate-deep font-bold mb-2 tracking-tight">
        Your first keystone.
      </h1>
      <p className="text-sand-stone mb-8 text-base">
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
              className={`w-full text-left card-keystone flex items-center gap-4 transition-all duration-300 ${
                isSelected
                  ? "!border-amber-warm ring-2 ring-amber-warm/20"
                  : ""
              }`}
              style={isSelected ? {
                background: "linear-gradient(135deg, rgba(232, 152, 94, 0.06) 0%, rgba(232, 152, 94, 0.02) 100%)",
                boxShadow: "var(--shadow-card), 0 0 0 2px rgba(232, 152, 94, 0.15)",
              } : undefined}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                isSelected ? "bg-amber-warm/15" : "bg-white-warm"
              }`}>
                <span className="text-2xl">{habit.icon}</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-deep">{habit.name}</div>
                <div className="text-sm text-sand-stone">{habit.description}</div>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #E8985E 0%, #D4764E 100%)",
                    boxShadow: "0 2px 8px rgba(232, 152, 94, 0.3)",
                  }}
                >
                  <IconCheck size={14} color="white" />
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
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="flex flex-col min-h-[70vh] justify-center"
    >
      <div className="text-center mb-2">
        <span className="text-6xl block mb-4">&#x23F0;</span>
      </div>
      <h1 className="font-display text-3xl text-slate-deep font-bold mb-2 tracking-tight">
        Set your rhythm.
      </h1>
      <p className="text-sand-stone mb-8 text-base">
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
              className={`w-full text-left card-keystone flex items-center gap-4 transition-all duration-300 ${
                isActive ? "!border-amber-warm ring-2 ring-amber-warm/20" : ""
              }`}
              style={isActive ? {
                background: "linear-gradient(135deg, rgba(232, 152, 94, 0.06) 0%, rgba(232, 152, 94, 0.02) 100%)",
              } : undefined}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                isActive ? "bg-amber-warm/15" : "bg-white-warm"
              }`}>
                <block.Icon size={22} color={isActive ? "#E8985E" : "#C4A882"} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-deep">{block.label}</div>
                <div className="text-sm text-sand-stone">{block.desc}</div>
              </div>
              <div
                className={`toggle-track ${isActive ? "bg-amber-warm" : "bg-sand-stone/25"}`}
              >
                <motion.div
                  animate={{ x: isActive ? 22 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="toggle-thumb"
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
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="flex flex-col min-h-[70vh] justify-center"
    >
      <div className="text-center mb-2">
        <span className="text-6xl block mb-4">&#x1F514;</span>
      </div>
      <h1 className="font-display text-3xl text-slate-deep font-bold mb-2 tracking-tight">
        Stay in the loop.
      </h1>
      <p className="text-sand-stone mb-8 text-base">
        We can send you a gentle nudge when it&apos;s time for your routine. You
        can always change this later.
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
          className="input-keystone"
        />
        <p className="text-xs text-sand-stone mt-3">
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
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="flex flex-col items-center text-center min-h-[70vh] justify-center"
    >
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
        style={{
          background: "linear-gradient(135deg, #7B9E6B 0%, #5C8A4A 100%)",
          boxShadow: "0 8px 32px rgba(123, 158, 107, 0.3), 0 0 64px rgba(123, 158, 107, 0.1)",
        }}
      >
        <IconCheck size={40} color="white" />
      </motion.div>
      <h1 className="font-display text-4xl text-slate-deep font-bold mb-3 tracking-tight">
        You&apos;re in.
      </h1>
      <p className="text-sand-stone text-lg max-w-xs leading-relaxed mb-2">
        Your first morning is set.
        {displayName && ` See you tomorrow at ${wakeTime}, ${displayName}.`}
      </p>
      {selectedHabit && starterHabits.find((h) => h.id === selectedHabit) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-keystone mt-4 text-left inline-flex items-center gap-3 px-5 py-3"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <span className="text-xl">
            {starterHabits.find((h) => h.id === selectedHabit)?.icon}
          </span>
          <span className="font-medium text-slate-deep">
            {starterHabits.find((h) => h.id === selectedHabit)?.name}
          </span>
        </motion.div>
      )}

      <div className="mt-14 w-full max-w-xs">
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
    <div
      className="min-h-screen px-6 py-8"
      style={{ background: GRADIENTS[step] || GRADIENTS[0] }}
    >
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === step ? 28 : 8,
              backgroundColor:
                i === step
                  ? "#E8985E"
                  : i < step
                  ? "rgba(232, 152, 94, 0.35)"
                  : "rgba(196, 168, 130, 0.25)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="h-2 rounded-full"
          />
        ))}
      </div>

      <div className="max-w-sm mx-auto">
        <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
      </div>
    </div>
  );
}
