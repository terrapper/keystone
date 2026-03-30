"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/components/providers/supabase-provider";
import { IconArrowLeft, IconArrowRight, IconChevronRight, categoryIconMap } from "@/components/ui/icons";
import type {
  Journey,
  UserJourney,
  JourneyDay,
  CoachingSession,
} from "@/lib/types/database";

const categoryColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  focus: { bg: "bg-indigo-soft/10", text: "text-indigo-soft", border: "border-indigo-soft/30", gradient: "linear-gradient(135deg, #6B7FD7 0%, #5568C0 100%)" },
  mindfulness: { bg: "bg-green-sage/10", text: "text-green-sage", border: "border-green-sage/30", gradient: "linear-gradient(135deg, #7B9E6B 0%, #5C8A4A 100%)" },
  habits: { bg: "bg-amber-warm/10", text: "text-amber-warm", border: "border-amber-warm/30", gradient: "linear-gradient(135deg, #E8985E 0%, #D4764E 100%)" },
  adhd: { bg: "bg-[#9B6FA8]/10", text: "text-[#9B6FA8]", border: "border-[#9B6FA8]/30", gradient: "linear-gradient(135deg, #9B6FA8 0%, #7D5A8A 100%)" },
  energy: { bg: "bg-amber-warm/10", text: "text-amber-warm", border: "border-amber-warm/30", gradient: "linear-gradient(135deg, #E8985E 0%, #D4764E 100%)" },
  productivity: { bg: "bg-indigo-soft/10", text: "text-indigo-soft", border: "border-indigo-soft/30", gradient: "linear-gradient(135deg, #6B7FD7 0%, #5568C0 100%)" },
};

export default function JourneysPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4 pt-4">
          <div className="h-8 bg-sand-stone/15 rounded-keystone w-1/3" />
          <div className="h-40 bg-sand-stone/10 rounded-keystone" />
        </div>
      }
    >
      <JourneysPage />
    </Suspense>
  );
}

function JourneysPage() {
  const supabase = useSupabase();
  const searchParams = useSearchParams();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [userJourneys, setUserJourneys] = useState<UserJourney[]>([]);
  const [coachingSessions, setCoachingSessions] = useState<CoachingSession[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [activeUserJourney, setActiveUserJourney] = useState<UserJourney | null>(null);
  const [showDayView, setShowDayView] = useState(false);
  const [showCoachingSession, setShowCoachingSession] = useState<CoachingSession | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [tab, setTab] = useState<"journeys" | "coaching">(
    searchParams.get("tab") === "coaching" ? "coaching" : "journeys"
  );

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [journeysRes, userJourneysRes, coachingRes] = await Promise.all([
      supabase.from("journeys").select("*").order("duration_days"),
      supabase.from("user_journeys").select("*").eq("user_id", user.id),
      supabase.from("coaching_sessions").select("*").order("category"),
    ]);

    if (journeysRes.data) setJourneys(journeysRes.data);
    if (userJourneysRes.data) {
      setUserJourneys(userJourneysRes.data);
      const active = userJourneysRes.data.find((uj) => uj.status === "active");
      if (active) setActiveUserJourney(active);
    }
    if (coachingRes.data) setCoachingSessions(coachingRes.data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  function getActiveJourney(): Journey | null {
    if (!activeUserJourney) return null;
    return journeys.find((j) => j.id === activeUserJourney.journey_id) || null;
  }

  function getUserJourneyForJourney(journeyId: string): UserJourney | undefined {
    return userJourneys.find((uj) => uj.journey_id === journeyId);
  }

  async function startJourney(journeyId: string) {
    if (!userId || activeUserJourney) return;
    const { data } = await supabase
      .from("user_journeys")
      .insert({ user_id: userId, journey_id: journeyId, current_day: 1, started_at: new Date().toISOString(), status: "active" })
      .select().single();
    if (data) { setUserJourneys((prev) => [...prev, data]); setActiveUserJourney(data); }
  }

  async function completeDay() {
    if (!activeUserJourney) return;
    const journey = getActiveJourney();
    if (!journey) return;
    const isLastDay = activeUserJourney.current_day >= journey.duration_days;

    if (isLastDay) {
      const { data } = await supabase.from("user_journeys").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", activeUserJourney.id).select().single();
      if (data) { setUserJourneys((prev) => prev.map((uj) => (uj.id === data.id ? data : uj))); setActiveUserJourney(null); setShowCompletion(true); }
    } else {
      const { data } = await supabase.from("user_journeys").update({ current_day: activeUserJourney.current_day + 1 }).eq("id", activeUserJourney.id).select().single();
      if (data) { setUserJourneys((prev) => prev.map((uj) => (uj.id === data.id ? data : uj))); setActiveUserJourney(data); setShowDayView(false); }
    }
  }

  function getCurrentDayContent(): JourneyDay | null {
    const journey = getActiveJourney();
    if (!journey || !activeUserJourney) return null;
    const days = journey.content_json as JourneyDay[];
    return days.find((d) => d.day === activeUserJourney.current_day) || null;
  }

  function getContextualCoaching(): CoachingSession[] {
    const hour = new Date().getHours();
    let preferredCategories: string[];
    if (hour < 12) preferredCategories = ["productivity", "motivation", "energy", "adhd"];
    else if (hour < 17) preferredCategories = ["mindfulness", "productivity", "adhd", "energy"];
    else preferredCategories = ["anxiety", "self-compassion", "mindfulness", "motivation"];
    const sorted = [...coachingSessions].sort((a, b) => {
      const aIdx = preferredCategories.indexOf(a.category);
      const bIdx = preferredCategories.indexOf(b.category);
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });
    return sorted.slice(0, 5);
  }

  function formatDuration(seconds: number): string {
    return `${Math.round(seconds / 60)} min read`;
  }

  const cat = (category: string) => categoryColors[category] || categoryColors.productivity;

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 pt-4">
        <div className="h-8 bg-sand-stone/15 rounded-keystone w-1/3" />
        <div className="h-40 bg-sand-stone/10 rounded-keystone" />
        <div className="h-32 bg-sand-stone/10 rounded-keystone" />
      </div>
    );
  }

  // Coaching session reading view
  if (showCoachingSession) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <button onClick={() => setShowCoachingSession(null)} className="text-amber-warm font-semibold text-sm inline-flex items-center gap-1">
          <IconArrowLeft size={16} /> Back
        </button>
        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${cat(showCoachingSession.category).bg} ${cat(showCoachingSession.category).text} mb-3`}>
            {showCoachingSession.category}
          </span>
          <h1 className="font-display text-2xl text-slate-deep font-bold">{showCoachingSession.title}</h1>
          <p className="text-sand-stone text-sm mt-1">{formatDuration(showCoachingSession.duration_seconds)}</p>
        </div>
        <div className="journal-card">
          {showCoachingSession.content_text.split("\n\n").map((paragraph, i) => (
            <p key={i} className="text-slate-deep/90 leading-[1.8] mb-4 font-body text-[15px]">
              {paragraph.split("\n").map((line, j) => (
                <span key={j}>
                  {line.startsWith("**") && line.endsWith("**") ? (
                    <strong className="text-slate-deep font-semibold">{line.replace(/\*\*/g, "")}</strong>
                  ) : line}
                  {j < paragraph.split("\n").length - 1 && <br />}
                </span>
              ))}
            </p>
          ))}
        </div>
      </motion.div>
    );
  }

  // Journey day view
  if (showDayView && activeUserJourney) {
    const dayContent = getCurrentDayContent();
    const journey = getActiveJourney();
    if (!dayContent || !journey) return null;

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <button onClick={() => setShowDayView(false)} className="text-amber-warm font-semibold text-sm inline-flex items-center gap-1">
          <IconArrowLeft size={16} /> Back to Journeys
        </button>
        <div>
          <p className="text-sand-stone text-sm">{journey.title} — Day {activeUserJourney.current_day} of {journey.duration_days}</p>
          <h1 className="font-display text-2xl text-slate-deep font-bold mt-1">{dayContent.title}</h1>
        </div>
        {/* Progress bar */}
        <div className="h-2.5 bg-sand-stone/12 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(activeUserJourney.current_day / journey.duration_days) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: cat(journey.category).gradient }}
          />
        </div>
        {/* Coaching text */}
        <div className="journal-card">
          <h3 className="section-label !text-indigo-soft !mb-3">Today&apos;s Coaching</h3>
          {dayContent.coaching_text.split("\n\n").map((paragraph, i) => (
            <p key={i} className="text-slate-deep/90 leading-[1.8] mb-3 font-body text-[15px]">{paragraph}</p>
          ))}
        </div>
        {/* Action */}
        <div className="card-keystone habit-accent-movement pl-5">
          <h3 className="section-label !text-amber-warm !mb-2">Your Action</h3>
          <p className="text-slate-deep/90 leading-relaxed font-body text-[15px]">{dayContent.action}</p>
        </div>
        {/* Reflection */}
        <div className="card-keystone habit-accent-mindfulness pl-5">
          <h3 className="section-label !text-green-sage !mb-2">Reflect</h3>
          <p className="text-slate-deep/90 leading-relaxed font-body text-[15px] italic">{dayContent.reflection_prompt}</p>
        </div>
        <button onClick={completeDay} className="btn-primary w-full">
          {activeUserJourney.current_day >= journey.duration_days ? "Complete Journey" : "Complete Today"}
        </button>
      </motion.div>
    );
  }

  // Journey completion celebration
  if (showCompletion) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: 3, duration: 0.6 }}
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #E8985E 0%, #D4764E 100%)", boxShadow: "var(--shadow-glow-amber)" }}
        >
          <span className="text-white text-5xl">&#10024;</span>
        </motion.div>
        <h1 className="font-display text-3xl text-slate-deep font-bold">Journey Complete!</h1>
        <p className="text-sand-stone max-w-xs leading-relaxed">
          You showed up, day after day. The tools you built are yours to keep. This isn&apos;t an ending — it&apos;s a foundation.
        </p>
        <div className="journal-card max-w-sm">
          <h3 className="font-display text-lg text-indigo-soft font-semibold mb-2">A Note from Your Future Self</h3>
          <p className="text-slate-deep/80 leading-[1.8] text-sm italic">
            &ldquo;You did something most people only think about. You committed to growth, showed up when it was hard, and built real skills. I&apos;m proud of you. Keep going.&rdquo;
          </p>
        </div>
        <button onClick={() => setShowCompletion(false)} className="btn-primary">Back to Journeys</button>
      </motion.div>
    );
  }

  // Main journeys page
  const activeJourney = getActiveJourney();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-slate-deep font-bold tracking-tight">Journeys</h1>

      {/* Tab selector */}
      <div className="flex bg-sand-stone/8 rounded-keystone p-1.5" style={{ background: "rgba(196, 168, 130, 0.08)" }}>
        {(["journeys", "coaching"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-[12px] text-sm font-medium transition-all duration-300 ${
              tab === t ? "bg-white text-slate-deep" : "text-sand-stone"
            }`}
            style={tab === t ? { boxShadow: "var(--shadow-soft)" } : undefined}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "journeys" ? (
        <div className="space-y-6">
          {/* Active journey — hero card */}
          {activeJourney && activeUserJourney && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="section-label">Your Active Journey</p>
              <button
                onClick={() => { setSelectedJourney(activeJourney); setShowDayView(true); }}
                className="w-full text-left rounded-keystone p-5 transition-all duration-300"
                style={{
                  background: cat(activeJourney.category).gradient,
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    {(() => {
                      const CatIcon = categoryIconMap[activeJourney.category];
                      return CatIcon ? <CatIcon size={24} color="white" /> : <span className="text-white text-xl">&#x1F4DA;</span>;
                    })()}
                  </div>
                  <div className="flex-1">
                    <div className="font-display font-bold text-white text-lg">{activeJourney.title}</div>
                    <p className="text-white/70 text-sm mt-1">Day {activeUserJourney.current_day} of {activeJourney.duration_days}</p>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden mt-3">
                      <div className="h-full bg-white/80 rounded-full transition-all duration-500" style={{ width: `${(activeUserJourney.current_day / activeJourney.duration_days) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-white/80 font-medium text-sm mt-1 inline-flex items-center gap-1">
                    Continue <IconChevronRight size={14} color="white" />
                  </span>
                </div>
              </button>
            </motion.div>
          )}

          {/* Available journeys */}
          <div>
            <p className="section-label">{activeJourney ? "Other Journeys" : "Available Journeys"}</p>
            <div className="space-y-3">
              {journeys.filter((j) => j.id !== activeJourney?.id).map((journey, index) => {
                const uj = getUserJourneyForJourney(journey.id);
                const isCompleted = uj?.status === "completed";
                const CatIcon = categoryIconMap[journey.category];

                return (
                  <motion.div
                    key={journey.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`card-keystone ${isCompleted ? "opacity-70" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${cat(journey.category).gradient}`, opacity: 0.85 }}
                      >
                        {CatIcon ? <CatIcon size={20} color="white" /> : <span className="text-white">&#x1F4DA;</span>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-bold text-slate-deep">{journey.title}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${cat(journey.category).bg} ${cat(journey.category).text}`}>{journey.category}</span>
                          {isCompleted && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-sage/10 text-green-sage">Completed</span>
                          )}
                        </div>
                        <p className="text-sm text-sand-stone mt-1 leading-relaxed">{journey.description}</p>
                        <div className="flex items-center gap-3 mt-2.5">
                          <span className="text-xs text-sand-stone">{journey.duration_days} days</span>
                          {!activeUserJourney && !isCompleted && (
                            <button onClick={() => startJourney(journey.id)} className="text-xs text-amber-warm font-bold inline-flex items-center gap-0.5">
                              Start Journey <IconArrowRight size={12} />
                            </button>
                          )}
                          {activeUserJourney && !isCompleted && (
                            <span className="text-xs text-sand-stone/60 italic">Finish your current journey first</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Coaching tab */
        <div className="space-y-4">
          <p className="text-sand-stone text-sm">Curated sessions based on your time of day. Pick one that speaks to you.</p>
          {getContextualCoaching().map((session, index) => {
            const CatIcon = categoryIconMap[session.category];
            return (
              <motion.button
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCoachingSession(session)}
                className="w-full text-left card-keystone"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${cat(session.category).bg}`}>
                    {CatIcon ? <CatIcon size={20} /> : <span className="text-lg">&#x1F4A1;</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-deep text-sm">{session.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cat(session.category).bg} ${cat(session.category).text}`}>{session.category}</span>
                    </div>
                    <p className="text-xs text-sand-stone mt-0.5">{formatDuration(session.duration_seconds)}</p>
                    <p className="text-xs text-slate-deep/60 mt-1 line-clamp-2">{session.content_text.slice(0, 120)}...</p>
                  </div>
                  <IconChevronRight size={16} color="#C4A882" className="flex-shrink-0 mt-1" />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
