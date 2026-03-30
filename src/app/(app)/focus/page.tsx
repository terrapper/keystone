"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { FocusSession } from "@/lib/types/database";

type TimerState = "setup" | "breathing" | "running" | "complete" | "break" | "break-running";
type AmbientSound = "rain" | "cafe" | "forest" | "brown-noise" | "lo-fi" | "none";

const DURATION_PRESETS = [15, 25, 45, 60];
const BREAK_DURATION = 5 * 60; // 5 minutes in seconds

const QUICK_STARTS: { label: string; duration: number; description: string; icon: string }[] = [
  { label: "Quick Focus", duration: 15, description: "15 min sprint", icon: "⚡" },
  { label: "Deep Work", duration: 45, description: "45 min block", icon: "🎯" },
  { label: "Marathon", duration: 90, description: "90 min session", icon: "🏔️" },
];

const ambientSounds: { id: AmbientSound; label: string; icon: string; color: string }[] = [
  { id: "none", label: "Silence", icon: "🤫", color: "sand-stone" },
  { id: "rain", label: "Rain", icon: "🌧️", color: "indigo-soft" },
  { id: "cafe", label: "Cafe", icon: "☕", color: "amber-warm" },
  { id: "forest", label: "Forest", icon: "🌲", color: "green-sage" },
  { id: "brown-noise", label: "Brown Noise", icon: "🔊", color: "sand-stone" },
  { id: "lo-fi", label: "Lo-fi", icon: "🎵", color: "indigo-soft" },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getEncouragingMessage(
  duration: number,
  distractions: number
): string {
  if (distractions === 0) {
    if (duration >= 45)
      return "Zero distractions in a long session. That's elite focus.";
    return "Zero distractions. Clean session.";
  }
  if (distractions <= 2) {
    return `${duration} minutes focused, ${distractions} distraction${distractions > 1 ? "s" : ""}. That's a strong session.`;
  }
  if (distractions <= 5) {
    return `${duration} minutes in the chair with ${distractions} distractions noticed. Awareness is the skill.`;
  }
  return `${duration} minutes of practice. You noticed ${distractions} distractions — that awareness is what builds focus over time.`;
}

export default function FocusPage() {
  const supabase = useSupabase();
  const [userId, setUserId] = useState<string | null>(null);
  const [timerState, setTimerState] = useState<TimerState>("setup");
  const [duration, setDuration] = useState(25);
  const [ambientSound, setAmbientSound] = useState<AmbientSound>("none");
  const [breathingEnabled, setBreathingEnabled] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [breakSecondsRemaining, setBreakSecondsRemaining] = useState(0);
  const [distractionCount, setDistractionCount] = useState(0);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathSeconds, setBreathSeconds] = useState(0);
  const [recentSessions, setRecentSessions] = useState<FocusSession[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breakRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // Load recent sessions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data } = await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", user.id)
      .gte("started_at", sevenDaysAgo.toISOString())
      .order("started_at", { ascending: false });

    if (data) setRecentSessions(data);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Computed stats
  const stats = useMemo(() => {
    const totalMinutes = recentSessions.reduce(
      (sum, s) => sum + (s.actual_minutes || s.duration_minutes),
      0
    );
    const avgMinutes =
      recentSessions.length > 0
        ? Math.round(totalMinutes / recentSessions.length)
        : 0;
    const totalSessions = recentSessions.length;

    // Focus streak: consecutive days with at least one session (going back from today)
    const sessionDates = new Set(
      recentSessions.map((s) =>
        new Date(s.started_at).toISOString().split("T")[0]
      )
    );
    let streak = 0;
    const d = new Date();
    // Check today first
    const todayStr = d.toISOString().split("T")[0];
    if (sessionDates.has(todayStr)) {
      streak = 1;
      d.setDate(d.getDate() - 1);
      while (sessionDates.has(d.toISOString().split("T")[0])) {
        streak++;
        d.setDate(d.getDate() - 1);
      }
    } else {
      // Check if yesterday had one (streak not yet broken today)
      d.setDate(d.getDate() - 1);
      while (sessionDates.has(d.toISOString().split("T")[0])) {
        streak++;
        d.setDate(d.getDate() - 1);
      }
    }

    return { totalMinutes, avgMinutes, totalSessions, streak };
  }, [recentSessions]);

  // Timer logic
  useEffect(() => {
    if (timerState === "running" && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerState("complete");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState, secondsRemaining]);

  // Break timer logic
  useEffect(() => {
    if (timerState === "break-running" && breakSecondsRemaining > 0) {
      breakRef.current = setInterval(() => {
        setBreakSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(breakRef.current!);
            setTimerState("break"); // Break over, prompt for next round
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (breakRef.current) clearInterval(breakRef.current);
    };
  }, [timerState, breakSecondsRemaining]);

  // Breathing animation logic
  useEffect(() => {
    if (timerState === "breathing") {
      let elapsed = 0;
      const totalBreathDuration = 30;

      breathRef.current = setInterval(() => {
        elapsed++;
        setBreathSeconds(elapsed);

        const cyclePos = elapsed % 12;
        if (cyclePos < 4) {
          setBreathPhase("inhale");
        } else if (cyclePos < 8) {
          setBreathPhase("hold");
        } else {
          setBreathPhase("exhale");
        }

        if (elapsed >= totalBreathDuration) {
          clearInterval(breathRef.current!);
          setTimerState("running");
          setSecondsRemaining(duration * 60);
          setSessionStartTime(new Date());
        }
      }, 1000);
    }

    return () => {
      if (breathRef.current) clearInterval(breathRef.current);
    };
  }, [timerState, duration]);

  function startSession(overrideDuration?: number) {
    const dur = overrideDuration || duration;
    if (overrideDuration) setDuration(dur);
    setDistractionCount(0);
    setPomodoroCount((prev) => prev + 1);
    if (breathingEnabled) {
      setTimerState("breathing");
      setBreathSeconds(0);
      setBreathPhase("inhale");
    } else {
      setTimerState("running");
      setSecondsRemaining(dur * 60);
      setSessionStartTime(new Date());
    }
  }

  function stopSession() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (breathRef.current) clearInterval(breathRef.current);
    if (breakRef.current) clearInterval(breakRef.current);
    setTimerState("setup");
  }

  function logDistraction() {
    setDistractionCount((prev) => prev + 1);
  }

  function startBreak() {
    setBreakSecondsRemaining(BREAK_DURATION);
    setTimerState("break-running");
  }

  function startAnotherRound() {
    // Save the completed session first, then start a new one
    saveSession(true);
  }

  async function saveSession(continueAfter = false) {
    if (!userId || !sessionStartTime) return;

    const actualMinutes = Math.round(
      (duration * 60 - secondsRemaining) / 60
    );

    const { data } = await supabase
      .from("focus_sessions")
      .insert({
        user_id: userId,
        started_at: sessionStartTime.toISOString(),
        duration_minutes: duration,
        actual_minutes: actualMinutes || duration,
        distraction_count: distractionCount,
        ambient_sound: ambientSound === "none" ? null : ambientSound,
        completed: true,
      })
      .select()
      .single();

    if (data) {
      setRecentSessions((prev) => [data, ...prev]);
    }

    if (continueAfter) {
      // Start break, then offer another round
      startBreak();
    } else {
      setTimerState("setup");
    }
  }

  const progress =
    timerState === "running"
      ? 1 - secondsRemaining / (duration * 60)
      : timerState === "complete"
        ? 1
        : 0;

  const breakProgress =
    timerState === "break-running"
      ? 1 - breakSecondsRemaining / BREAK_DURATION
      : 0;

  const circumference = 2 * Math.PI * 120;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-slate-deep font-bold">
        Focus
      </h1>

      {/* Setup state */}
      {timerState === "setup" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Quick Start section */}
          <div>
            <h3 className="font-display text-sm text-slate-deep font-semibold uppercase tracking-wider mb-3">
              Quick Start
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {QUICK_STARTS.map((qs) => (
                <motion.button
                  key={qs.label}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startSession(qs.duration)}
                  className="card-keystone flex flex-col items-center gap-1.5 py-4 hover:border-indigo-soft/40 transition-all"
                >
                  <span className="text-2xl">{qs.icon}</span>
                  <span className="font-display text-sm font-semibold text-slate-deep">
                    {qs.label}
                  </span>
                  <span className="text-xs text-sand-stone">{qs.description}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Session statistics */}
          {recentSessions.length > 0 && (
            <div className="card-keystone">
              <h3 className="font-display text-sm text-slate-deep font-semibold uppercase tracking-wider mb-3">
                This Week
              </h3>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <div className="font-display text-xl text-indigo-soft font-bold">
                    {stats.totalMinutes}
                  </div>
                  <div className="text-xs text-sand-stone">total min</div>
                </div>
                <div>
                  <div className="font-display text-xl text-amber-warm font-bold">
                    {stats.avgMinutes}
                  </div>
                  <div className="text-xs text-sand-stone">avg min</div>
                </div>
                <div>
                  <div className="font-display text-xl text-green-sage font-bold">
                    {stats.totalSessions}
                  </div>
                  <div className="text-xs text-sand-stone">sessions</div>
                </div>
                <div>
                  <div className="font-display text-xl text-amber-warm font-bold flex items-center justify-center gap-1">
                    {stats.streak > 0 && <span className="text-sm">🔥</span>}
                    {stats.streak}
                  </div>
                  <div className="text-xs text-sand-stone">day streak</div>
                </div>
              </div>
            </div>
          )}

          {/* Duration picker */}
          <div className="card-keystone">
            <h3 className="font-display text-sm text-slate-deep font-semibold uppercase tracking-wider mb-3">
              Custom Duration
            </h3>
            <div className="flex gap-2">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setDuration(preset)}
                  className={`flex-1 py-3 rounded-keystone text-sm font-medium transition-all ${
                    duration === preset
                      ? "bg-indigo-soft text-white"
                      : "bg-sand-stone/10 text-slate-deep hover:bg-sand-stone/20"
                  }`}
                >
                  {preset}m
                </button>
              ))}
            </div>
          </div>

          {/* Ambient sound selector — visual cards */}
          <div className="card-keystone">
            <h3 className="font-display text-sm text-slate-deep font-semibold uppercase tracking-wider mb-3">
              Ambient Sound
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {ambientSounds.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => setAmbientSound(sound.id)}
                  className={`py-4 rounded-keystone text-sm transition-all flex flex-col items-center gap-1.5 ${
                    ambientSound === sound.id
                      ? `bg-${sound.color}/10 border-2 border-${sound.color} text-slate-deep shadow-sm`
                      : "bg-sand-stone/10 text-slate-deep border-2 border-transparent hover:bg-sand-stone/15"
                  }`}
                >
                  <span className="text-2xl">{sound.icon}</span>
                  <span className="text-xs font-medium">{sound.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Breathing intro toggle */}
          <div className="card-keystone flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm text-slate-deep font-semibold">
                Breathing Intro
              </h3>
              <p className="text-xs text-sand-stone mt-0.5">
                30-second breathing exercise before timer starts
              </p>
            </div>
            <button
              onClick={() => setBreathingEnabled(!breathingEnabled)}
              className={`w-12 h-7 rounded-full transition-all relative ${
                breathingEnabled ? "bg-indigo-soft" : "bg-sand-stone/30"
              }`}
            >
              <motion.div
                animate={{ x: breathingEnabled ? 20 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-5 h-5 rounded-full bg-white absolute top-1"
              />
            </button>
          </div>

          {/* Start button */}
          <button onClick={() => startSession()} className="btn-primary w-full text-lg">
            Start {duration}-Minute Session
          </button>
        </motion.div>
      )}

      {/* Breathing intro */}
      {timerState === "breathing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[50vh] space-y-8"
        >
          <p className="text-sand-stone text-sm">
            Breathe with the circle. {30 - breathSeconds}s remaining.
          </p>

          <div className="relative">
            <motion.div
              animate={{
                scale:
                  breathPhase === "inhale"
                    ? [0.6, 1]
                    : breathPhase === "hold"
                      ? 1
                      : [1, 0.6],
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="w-40 h-40 rounded-full bg-indigo-soft/20 border-2 border-indigo-soft flex items-center justify-center"
            >
              <span className="text-indigo-soft font-display text-lg font-semibold">
                {breathPhase === "inhale"
                  ? "Breathe in"
                  : breathPhase === "hold"
                    ? "Hold"
                    : "Breathe out"}
              </span>
            </motion.div>
          </div>

          <button
            onClick={() => {
              if (breathRef.current) clearInterval(breathRef.current);
              setTimerState("running");
              setSecondsRemaining(duration * 60);
              setSessionStartTime(new Date());
            }}
            className="text-sand-stone text-sm underline"
          >
            Skip breathing
          </button>
        </motion.div>
      )}

      {/* Timer running */}
      {timerState === "running" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[50vh] space-y-8"
        >
          {/* Timer circle */}
          <div className="relative w-64 h-64">
            <svg className="w-64 h-64 -rotate-90" viewBox="0 0 264 264">
              <circle
                cx="132"
                cy="132"
                r="120"
                fill="none"
                stroke="#C4A882"
                strokeWidth="6"
                opacity="0.15"
              />
              <motion.circle
                cx="132"
                cy="132"
                r="120"
                fill="none"
                stroke="#6B7FD7"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{
                  strokeDashoffset: circumference * (1 - progress),
                }}
                transition={{ duration: 0.5, ease: "linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-4xl text-slate-deep font-bold tracking-tight">
                {formatTime(secondsRemaining)}
              </span>
              {ambientSound !== "none" && (
                <span className="text-xs text-sand-stone mt-1">
                  {ambientSounds.find((s) => s.id === ambientSound)?.icon}{" "}
                  {ambientSounds.find((s) => s.id === ambientSound)?.label}
                </span>
              )}
            </div>
          </div>

          {/* Distraction counter */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={logDistraction}
            className="card-keystone flex items-center gap-3 px-6"
          >
            <span className="text-xl">🫧</span>
            <div>
              <span className="font-medium text-slate-deep text-sm">
                Distraction
              </span>
              <span className="text-xs text-sand-stone ml-2">
                {distractionCount} logged
              </span>
            </div>
          </motion.button>

          {/* Stop button */}
          <button
            onClick={stopSession}
            className="btn-secondary text-sm px-8"
          >
            Stop Session
          </button>
        </motion.div>
      )}

      {/* Session complete */}
      {timerState === "complete" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[50vh] space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-20 h-20 rounded-full bg-green-sage/20 flex items-center justify-center"
          >
            <span className="text-4xl">✓</span>
          </motion.div>

          <h2 className="font-display text-2xl text-slate-deep font-bold text-center">
            Session Complete
          </h2>

          <div className="card-keystone w-full max-w-sm text-center">
            <p className="text-slate-deep/90 leading-relaxed font-body">
              {getEncouragingMessage(duration, distractionCount)}
            </p>
            <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-sand-stone/20">
              <div>
                <div className="font-display text-xl text-indigo-soft font-bold">
                  {duration}
                </div>
                <div className="text-xs text-sand-stone">minutes</div>
              </div>
              <div>
                <div className="font-display text-xl text-amber-warm font-bold">
                  {distractionCount}
                </div>
                <div className="text-xs text-sand-stone">distractions</div>
              </div>
            </div>
          </div>

          {/* Pomodoro: offer break + another round */}
          <div className="w-full max-w-sm space-y-3">
            <button
              onClick={() => saveSession(true)}
              className="btn-primary w-full"
            >
              Take a 5-min break, then go again
            </button>
            <button onClick={() => saveSession(false)} className="btn-secondary w-full">
              Save &amp; finish
            </button>
          </div>
        </motion.div>
      )}

      {/* Break timer running */}
      {timerState === "break-running" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[50vh] space-y-8"
        >
          <p className="text-sand-stone text-sm font-medium">Break time — stretch, breathe, look away from the screen.</p>

          <div className="relative w-48 h-48">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="#C4A882" strokeWidth="5" opacity="0.15" />
              <motion.circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#7B9E6B"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 90}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 90 * (1 - breakProgress),
                }}
                transition={{ duration: 0.5, ease: "linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl mb-1">☕</span>
              <span className="font-display text-3xl text-slate-deep font-bold">
                {formatTime(breakSecondsRemaining)}
              </span>
            </div>
          </div>

          <button onClick={stopSession} className="text-sand-stone text-sm underline">
            Skip break
          </button>
        </motion.div>
      )}

      {/* Break finished — prompt next round */}
      {timerState === "break" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[50vh] space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-20 h-20 rounded-full bg-green-sage/20 flex items-center justify-center"
          >
            <span className="text-4xl">🔄</span>
          </motion.div>

          <h2 className="font-display text-2xl text-slate-deep font-bold text-center">
            Break over!
          </h2>
          <p className="text-sand-stone text-center">
            Round {pomodoroCount} complete. Ready for another?
          </p>

          <div className="w-full max-w-sm space-y-3">
            <button onClick={() => startSession()} className="btn-primary w-full">
              Start another {duration}-min round
            </button>
            <button onClick={() => setTimerState("setup")} className="btn-secondary w-full">
              Done for now
            </button>
          </div>
        </motion.div>
      )}

      {/* Recent sessions */}
      {timerState === "setup" && recentSessions.length > 0 && (
        <div>
          <h2 className="font-display text-sm text-slate-deep font-semibold uppercase tracking-wider mb-3">
            Recent Sessions
          </h2>
          <div className="space-y-2">
            {recentSessions.slice(0, 7).map((session) => (
              <div
                key={session.id}
                className="card-keystone flex items-center gap-3 py-3"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-soft/10 flex items-center justify-center">
                  <span className="text-indigo-soft font-display font-bold text-sm">
                    {session.actual_minutes || session.duration_minutes}m
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-deep font-medium">
                    {session.actual_minutes || session.duration_minutes} minutes
                    focused
                  </div>
                  <div className="text-xs text-sand-stone">
                    {new Date(session.started_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {session.ambient_sound && (
                      <>
                        {" "}
                        ·{" "}
                        {
                          ambientSounds.find(
                            (s) => s.id === session.ambient_sound
                          )?.icon
                        }{" "}
                        {session.ambient_sound}
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-sand-stone">
                    {session.distraction_count} distraction
                    {session.distraction_count !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
