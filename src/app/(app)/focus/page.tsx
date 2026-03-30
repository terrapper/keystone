"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/components/providers/supabase-provider";
import { IconCheck, IconSilence, IconDroplet, IconCoffee, IconTreePine, IconVolume, IconMusic, IconBubble } from "@/components/ui/icons";
import type { FocusSession } from "@/lib/types/database";

type TimerState = "setup" | "breathing" | "running" | "complete";
type AmbientSound = "rain" | "cafe" | "forest" | "brown-noise" | "lo-fi" | "none";

const DURATION_PRESETS = [15, 25, 45, 60];

const ambientSounds: { id: AmbientSound; label: string; Icon: React.FC<{ size?: number; color?: string }> }[] = [
  { id: "none", label: "Silence", Icon: IconSilence },
  { id: "rain", label: "Rain", Icon: IconDroplet },
  { id: "cafe", label: "Cafe", Icon: IconCoffee },
  { id: "forest", label: "Forest", Icon: IconTreePine },
  { id: "brown-noise", label: "Brown Noise", Icon: IconVolume },
  { id: "lo-fi", label: "Lo-fi", Icon: IconMusic },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getEncouragingMessage(duration: number, distractions: number): string {
  if (distractions === 0) {
    if (duration >= 45) return "Zero distractions in a long session. That's elite focus.";
    return "Zero distractions. Clean session.";
  }
  if (distractions <= 2) return `${duration} minutes focused, ${distractions} distraction${distractions > 1 ? "s" : ""}. That's a strong session.`;
  if (distractions <= 5) return `${duration} minutes in the chair with ${distractions} distractions noticed. Awareness is the skill.`;
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
  const [distractionCount, setDistractionCount] = useState(0);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathSeconds, setBreathSeconds] = useState(0);
  const [recentSessions, setRecentSessions] = useState<FocusSession[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data } = await supabase.from("focus_sessions").select("*").eq("user_id", user.id).gte("started_at", sevenDaysAgo.toISOString()).order("started_at", { ascending: false });
    if (data) setRecentSessions(data);
  }, [supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (timerState === "running" && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => { if (prev <= 1) { clearInterval(timerRef.current!); setTimerState("complete"); return 0; } return prev - 1; });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerState, secondsRemaining]);

  useEffect(() => {
    if (timerState === "breathing") {
      let elapsed = 0;
      breathRef.current = setInterval(() => {
        elapsed++;
        setBreathSeconds(elapsed);
        const cyclePos = elapsed % 12;
        if (cyclePos < 4) setBreathPhase("inhale");
        else if (cyclePos < 8) setBreathPhase("hold");
        else setBreathPhase("exhale");
        if (elapsed >= 30) { clearInterval(breathRef.current!); setTimerState("running"); setSecondsRemaining(duration * 60); setSessionStartTime(new Date()); }
      }, 1000);
    }
    return () => { if (breathRef.current) clearInterval(breathRef.current); };
  }, [timerState, duration]);

  function startSession() {
    setDistractionCount(0);
    if (breathingEnabled) { setTimerState("breathing"); setBreathSeconds(0); setBreathPhase("inhale"); }
    else { setTimerState("running"); setSecondsRemaining(duration * 60); setSessionStartTime(new Date()); }
  }

  function stopSession() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (breathRef.current) clearInterval(breathRef.current);
    setTimerState("setup");
  }

  function logDistraction() { setDistractionCount((prev) => prev + 1); }

  async function saveSession() {
    if (!userId || !sessionStartTime) return;
    const actualMinutes = Math.round((duration * 60 - secondsRemaining) / 60);
    const { data } = await supabase.from("focus_sessions").insert({
      user_id: userId, started_at: sessionStartTime.toISOString(), duration_minutes: duration,
      actual_minutes: actualMinutes || duration, distraction_count: distractionCount,
      ambient_sound: ambientSound === "none" ? null : ambientSound, completed: true,
    }).select().single();
    if (data) setRecentSessions((prev) => [data, ...prev]);
    setTimerState("setup");
  }

  const progress = timerState === "running" ? 1 - secondsRemaining / (duration * 60) : timerState === "complete" ? 1 : 0;
  const circumference = 2 * Math.PI * 120;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-slate-deep font-bold tracking-tight">Focus</h1>

      {/* Setup state */}
      {timerState === "setup" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Duration picker */}
          <div className="card-keystone">
            <h3 className="section-label">Duration</h3>
            <div className="flex gap-2">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setDuration(preset)}
                  className={`flex-1 py-3.5 rounded-[12px] text-sm font-semibold transition-all duration-300 ${
                    duration === preset ? "text-white" : "text-slate-deep"
                  }`}
                  style={duration === preset
                    ? { background: "linear-gradient(135deg, #6B7FD7 0%, #5568C0 100%)", boxShadow: "0 2px 12px rgba(107, 127, 215, 0.3)" }
                    : { background: "rgba(196, 168, 130, 0.08)" }
                  }
                >
                  {preset}m
                </button>
              ))}
            </div>
          </div>

          {/* Ambient sound selector */}
          <div className="card-keystone">
            <h3 className="section-label">Ambient Sound</h3>
            <div className="grid grid-cols-3 gap-2">
              {ambientSounds.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => setAmbientSound(sound.id)}
                  className={`ambient-card ${ambientSound === sound.id ? "active" : ""}`}
                >
                  <sound.Icon size={22} color={ambientSound === sound.id ? "#6B7FD7" : "#C4A882"} />
                  <span className="text-xs font-medium">{sound.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Breathing intro toggle */}
          <div className="card-keystone flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-deep">Breathing Intro</h3>
              <p className="text-xs text-sand-stone mt-0.5">30-second breathing exercise before timer starts</p>
            </div>
            <button
              onClick={() => setBreathingEnabled(!breathingEnabled)}
              className={`toggle-track ${breathingEnabled ? "bg-indigo-soft" : "bg-sand-stone/25"}`}
            >
              <motion.div
                animate={{ x: breathingEnabled ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="toggle-thumb"
              />
            </button>
          </div>

          <button onClick={startSession} className="btn-primary w-full text-lg">
            Start Focus Session
          </button>
        </motion.div>
      )}

      {/* Breathing intro */}
      {timerState === "breathing" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
          <p className="text-sand-stone text-sm">Breathe with the circle. {30 - breathSeconds}s remaining.</p>
          <div className="relative">
            <motion.div
              animate={{
                scale: breathPhase === "inhale" ? [0.6, 1] : breathPhase === "hold" ? 1 : [1, 0.6],
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="w-44 h-44 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, rgba(107, 127, 215, 0.15) 0%, rgba(107, 127, 215, 0.05) 70%)",
                border: "2px solid rgba(107, 127, 215, 0.3)",
                boxShadow: "0 0 40px rgba(107, 127, 215, 0.15)",
              }}
            >
              <span className="text-indigo-soft font-display text-lg font-semibold">
                {breathPhase === "inhale" ? "Breathe in" : breathPhase === "hold" ? "Hold" : "Breathe out"}
              </span>
            </motion.div>
          </div>
          <button
            onClick={() => { if (breathRef.current) clearInterval(breathRef.current); setTimerState("running"); setSecondsRemaining(duration * 60); setSessionStartTime(new Date()); }}
            className="text-sand-stone text-sm font-medium"
          >
            Skip breathing
          </button>
        </motion.div>
      )}

      {/* Timer running */}
      {timerState === "running" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
          <div className="relative w-64 h-64">
            <svg className="w-64 h-64 -rotate-90" viewBox="0 0 264 264">
              <circle cx="132" cy="132" r="120" fill="none" stroke="rgba(196, 168, 130, 0.1)" strokeWidth="6" />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6B7FD7" />
                  <stop offset="100%" stopColor="#5568C0" />
                </linearGradient>
              </defs>
              <motion.circle
                cx="132" cy="132" r="120" fill="none" stroke="url(#timerGradient)" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: circumference * (1 - progress) }}
                transition={{ duration: 0.5, ease: "linear" }}
                style={{ filter: "drop-shadow(0 0 8px rgba(107, 127, 215, 0.3))" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-5xl text-slate-deep font-bold tracking-tight">{formatTime(secondsRemaining)}</span>
              {ambientSound !== "none" && (
                <span className="text-xs text-sand-stone mt-2 flex items-center gap-1">
                  {(() => { const s = ambientSounds.find((s) => s.id === ambientSound); return s ? <><s.Icon size={12} /> {s.label}</> : null; })()}
                </span>
              )}
            </div>
          </div>

          <motion.button whileTap={{ scale: 0.95 }} onClick={logDistraction} className="card-keystone flex items-center gap-3 px-6">
            <IconBubble size={20} color="#C4A882" />
            <div>
              <span className="font-medium text-slate-deep text-sm">Distraction</span>
              <span className="text-xs text-sand-stone ml-2">{distractionCount} logged</span>
            </div>
          </motion.button>

          <button onClick={stopSession} className="btn-secondary text-sm px-8">Stop Session</button>
        </motion.div>
      )}

      {/* Session complete */}
      {timerState === "complete" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7B9E6B 0%, #5C8A4A 100%)", boxShadow: "var(--shadow-glow-sage)" }}
          >
            <IconCheck size={40} color="white" />
          </motion.div>
          <h2 className="font-display text-2xl text-slate-deep font-bold text-center">Session Complete</h2>
          <div className="card-keystone w-full max-w-sm text-center">
            <p className="text-slate-deep/90 leading-relaxed font-body">{getEncouragingMessage(duration, distractionCount)}</p>
            <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-sand-stone/15">
              <div>
                <div className="font-display text-2xl font-bold text-indigo-soft">{duration}</div>
                <div className="text-xs text-sand-stone">minutes</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-amber-warm">{distractionCount}</div>
                <div className="text-xs text-sand-stone">distractions</div>
              </div>
            </div>
          </div>
          <button onClick={saveSession} className="btn-primary w-full max-w-sm">Save Session</button>
        </motion.div>
      )}

      {/* Recent sessions */}
      {timerState === "setup" && recentSessions.length > 0 && (
        <div>
          <p className="section-label">Recent Sessions</p>
          <div className="space-y-2">
            {recentSessions.slice(0, 7).map((session) => (
              <div key={session.id} className="card-keystone flex items-center gap-3 py-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "rgba(107, 127, 215, 0.08)" }}>
                  <span className="text-indigo-soft font-display font-bold text-sm">{session.actual_minutes || session.duration_minutes}m</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-deep font-medium">{session.actual_minutes || session.duration_minutes} minutes focused</div>
                  <div className="text-xs text-sand-stone">
                    {new Date(session.started_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    {session.ambient_sound && <> · {session.ambient_sound}</>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-sand-stone">{session.distraction_count} distraction{session.distraction_count !== 1 ? "s" : ""}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
