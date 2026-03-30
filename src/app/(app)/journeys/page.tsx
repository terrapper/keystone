"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/components/providers/supabase-provider";
import type {
  Journey,
  UserJourney,
  JourneyDay,
  CoachingSession,
} from "@/lib/types/database";

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  focus: { bg: "bg-indigo-soft/10", text: "text-indigo-soft", border: "border-indigo-soft/30" },
  mindfulness: { bg: "bg-green-sage/10", text: "text-green-sage", border: "border-green-sage/30" },
  habits: { bg: "bg-amber-warm/10", text: "text-amber-warm", border: "border-amber-warm/30" },
  adhd: { bg: "bg-[#9B6FA8]/10", text: "text-[#9B6FA8]", border: "border-[#9B6FA8]/30" },
  energy: { bg: "bg-amber-warm/10", text: "text-amber-warm", border: "border-amber-warm/30" },
  productivity: { bg: "bg-indigo-soft/10", text: "text-indigo-soft", border: "border-indigo-soft/30" },
};

const categoryIcons: Record<string, string> = {
  focus: "🎯",
  mindfulness: "🧘",
  habits: "⚡",
  adhd: "🧠",
  energy: "☀️",
  productivity: "📋",
};

export default function JourneysPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4 pt-4">
          <div className="h-8 bg-sand-stone/20 rounded w-1/3" />
          <div className="h-32 bg-sand-stone/20 rounded-keystone" />
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
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

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      .insert({
        user_id: userId,
        journey_id: journeyId,
        current_day: 1,
        started_at: new Date().toISOString(),
        status: "active",
      })
      .select()
      .single();

    if (data) {
      setUserJourneys((prev) => [...prev, data]);
      setActiveUserJourney(data);
    }
  }

  async function completeDay() {
    if (!activeUserJourney) return;

    const journey = getActiveJourney();
    if (!journey) return;

    const isLastDay = activeUserJourney.current_day >= journey.duration_days;

    if (isLastDay) {
      // Complete the journey
      const { data } = await supabase
        .from("user_journeys")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", activeUserJourney.id)
        .select()
        .single();

      if (data) {
        setUserJourneys((prev) =>
          prev.map((uj) => (uj.id === data.id ? data : uj))
        );
        setActiveUserJourney(null);
        setShowCompletion(true);
      }
    } else {
      // Advance to next day
      const { data } = await supabase
        .from("user_journeys")
        .update({
          current_day: activeUserJourney.current_day + 1,
        })
        .eq("id", activeUserJourney.id)
        .select()
        .single();

      if (data) {
        setUserJourneys((prev) =>
          prev.map((uj) => (uj.id === data.id ? data : uj))
        );
        setActiveUserJourney(data);
        setShowDayView(false);
      }
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

    if (hour < 12) {
      preferredCategories = ["productivity", "motivation", "energy", "adhd"];
    } else if (hour < 17) {
      preferredCategories = ["mindfulness", "productivity", "adhd", "energy"];
    } else {
      preferredCategories = ["anxiety", "self-compassion", "mindfulness", "motivation"];
    }

    const sorted = [...coachingSessions].sort((a, b) => {
      const aIdx = preferredCategories.indexOf(a.category);
      const bIdx = preferredCategories.indexOf(b.category);
      const aScore = aIdx === -1 ? 99 : aIdx;
      const bScore = bIdx === -1 ? 99 : bIdx;
      return aScore - bScore;
    });

    return sorted.slice(0, 5);
  }

  function formatDuration(seconds: number): string {
    const mins = Math.round(seconds / 60);
    return `${mins} min read`;
  }

  const cat = (category: string) =>
    categoryColors[category] || categoryColors.productivity;

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 pt-4">
        <div className="h-8 bg-sand-stone/20 rounded w-1/3" />
        <div className="h-32 bg-sand-stone/20 rounded-keystone" />
        <div className="h-32 bg-sand-stone/20 rounded-keystone" />
      </div>
    );
  }

  // Coaching session reading view
  if (showCoachingSession) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <button
          onClick={() => setShowCoachingSession(null)}
          className="text-amber-warm font-medium text-sm"
        >
          ← Back
        </button>

        <div>
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${cat(showCoachingSession.category).bg} ${cat(showCoachingSession.category).text} mb-3`}
          >
            {showCoachingSession.category}
          </span>
          <h1 className="font-display text-2xl text-slate-deep font-bold">
            {showCoachingSession.title}
          </h1>
          <p className="text-sand-stone text-sm mt-1">
            {formatDuration(showCoachingSession.duration_seconds)}
          </p>
        </div>

        <div className="prose prose-sm max-w-none">
          {showCoachingSession.content_text.split("\n\n").map((paragraph, i) => (
            <p
              key={i}
              className="text-slate-deep/90 leading-relaxed mb-4 font-body text-[15px]"
            >
              {paragraph.split("\n").map((line, j) => (
                <span key={j}>
                  {line.startsWith("**") && line.endsWith("**") ? (
                    <strong className="text-slate-deep font-semibold">
                      {line.replace(/\*\*/g, "")}
                    </strong>
                  ) : (
                    line
                  )}
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <button
          onClick={() => setShowDayView(false)}
          className="text-amber-warm font-medium text-sm"
        >
          ← Back to Journeys
        </button>

        <div>
          <p className="text-sand-stone text-sm">
            {journey.title} — Day {activeUserJourney.current_day} of{" "}
            {journey.duration_days}
          </p>
          <h1 className="font-display text-2xl text-slate-deep font-bold mt-1">
            {dayContent.title}
          </h1>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-sand-stone/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(activeUserJourney.current_day / journey.duration_days) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-indigo-soft rounded-full"
          />
        </div>

        {/* Coaching text */}
        <div className="card-keystone">
          <h3 className="font-display text-sm text-indigo-soft font-semibold uppercase tracking-wider mb-3">
            Today&apos;s Coaching
          </h3>
          {dayContent.coaching_text.split("\n\n").map((paragraph, i) => (
            <p
              key={i}
              className="text-slate-deep/90 leading-relaxed mb-3 font-body text-[15px]"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Action */}
        <div className="card-keystone border-l-4 border-l-amber-warm">
          <h3 className="font-display text-sm text-amber-warm font-semibold uppercase tracking-wider mb-2">
            Your Action
          </h3>
          <p className="text-slate-deep/90 leading-relaxed font-body text-[15px]">
            {dayContent.action}
          </p>
        </div>

        {/* Reflection prompt */}
        <div className="card-keystone border-l-4 border-l-green-sage">
          <h3 className="font-display text-sm text-green-sage font-semibold uppercase tracking-wider mb-2">
            Reflect
          </h3>
          <p className="text-slate-deep/90 leading-relaxed font-body text-[15px] italic">
            {dayContent.reflection_prompt}
          </p>
        </div>

        {/* Complete button */}
        <button onClick={completeDay} className="btn-primary w-full">
          {activeUserJourney.current_day >= journey.duration_days
            ? "Complete Journey"
            : "Complete Today"}
        </button>
      </motion.div>
    );
  }

  // Journey completion celebration
  if (showCompletion) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ repeat: 3, duration: 0.6 }}
          className="text-6xl"
        >
          🎉
        </motion.div>
        <h1 className="font-display text-3xl text-slate-deep font-bold">
          Journey Complete!
        </h1>
        <p className="text-sand-stone max-w-xs leading-relaxed">
          You showed up, day after day. The tools you built are yours to keep.
          This isn&apos;t an ending — it&apos;s a foundation.
        </p>
        <div className="card-keystone max-w-sm">
          <h3 className="font-display text-lg text-indigo-soft font-semibold mb-2">
            A Note from Your Future Self
          </h3>
          <p className="text-slate-deep/80 leading-relaxed text-sm italic">
            &ldquo;You did something most people only think about. You committed
            to growth, showed up when it was hard, and built real skills. I&apos;m
            proud of you. Keep going.&rdquo;
          </p>
        </div>
        <button
          onClick={() => setShowCompletion(false)}
          className="btn-primary"
        >
          Back to Journeys
        </button>
      </motion.div>
    );
  }

  // Main journeys page
  const activeJourney = getActiveJourney();
  const completedJourneys = userJourneys.filter(
    (uj) => uj.status === "completed"
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-slate-deep font-bold">
        Journeys
      </h1>

      {/* Tab selector */}
      <div className="flex bg-sand-stone/10 rounded-keystone p-1">
        <button
          onClick={() => setTab("journeys")}
          className={`flex-1 py-2 rounded-keystone text-sm font-medium transition-all ${
            tab === "journeys"
              ? "bg-white text-slate-deep shadow-sm"
              : "text-sand-stone"
          }`}
        >
          Journeys
        </button>
        <button
          onClick={() => setTab("coaching")}
          className={`flex-1 py-2 rounded-keystone text-sm font-medium transition-all ${
            tab === "coaching"
              ? "bg-white text-slate-deep shadow-sm"
              : "text-sand-stone"
          }`}
        >
          Coaching
        </button>
      </div>

      {tab === "journeys" ? (
        <div className="space-y-6">
          {/* Active journey */}
          {activeJourney && activeUserJourney && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="font-display text-sm text-slate-deep font-semibold uppercase tracking-wider mb-3">
                Your Active Journey
              </h2>
              <button
                onClick={() => {
                  setSelectedJourney(activeJourney);
                  setShowDayView(true);
                }}
                className={`w-full text-left card-keystone ${cat(activeJourney.category).border} border-2`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {categoryIcons[activeJourney.category] || "📚"}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-slate-deep">
                        {activeJourney.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cat(activeJourney.category).bg} ${cat(activeJourney.category).text}`}
                      >
                        {activeJourney.category}
                      </span>
                    </div>
                    <p className="text-sm text-sand-stone mt-1">
                      Day {activeUserJourney.current_day} of{" "}
                      {activeJourney.duration_days}
                    </p>
                    <div className="h-1.5 bg-sand-stone/20 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-indigo-soft rounded-full transition-all duration-500"
                        style={{
                          width: `${(activeUserJourney.current_day / activeJourney.duration_days) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-amber-warm font-medium text-sm mt-1">
                    Continue →
                  </span>
                </div>
              </button>
            </motion.div>
          )}

          {/* Available journeys */}
          <div>
            <h2 className="font-display text-sm text-slate-deep font-semibold uppercase tracking-wider mb-3">
              {activeJourney ? "Other Journeys" : "Available Journeys"}
            </h2>
            <div className="space-y-3">
              {journeys
                .filter((j) => j.id !== activeJourney?.id)
                .map((journey) => {
                  const uj = getUserJourneyForJourney(journey.id);
                  const isCompleted = uj?.status === "completed";

                  return (
                    <motion.div
                      key={journey.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`card-keystone ${cat(journey.category).border} ${isCompleted ? "opacity-80" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">
                          {categoryIcons[journey.category] || "📚"}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display font-bold text-slate-deep">
                              {journey.title}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cat(journey.category).bg} ${cat(journey.category).text}`}
                            >
                              {journey.category}
                            </span>
                            {isCompleted && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-sage/10 text-green-sage">
                                ✓ Completed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-sand-stone mt-1 leading-relaxed">
                            {journey.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-sand-stone">
                              {journey.duration_days} days
                            </span>
                            {!activeUserJourney && !isCompleted && (
                              <button
                                onClick={() => startJourney(journey.id)}
                                className="text-xs text-amber-warm font-semibold"
                              >
                                Start Journey →
                              </button>
                            )}
                            {activeUserJourney && !isCompleted && (
                              <span className="text-xs text-sand-stone/60 italic">
                                Finish your current journey first
                              </span>
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
          <p className="text-sand-stone text-sm">
            Curated sessions based on your time of day. Pick one that speaks to
            you.
          </p>
          {getContextualCoaching().map((session) => (
            <motion.button
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCoachingSession(session)}
              className="w-full text-left card-keystone"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${cat(session.category).bg}`}
                >
                  <span className="text-lg">
                    {categoryIcons[session.category] || "💡"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-deep text-sm">
                      {session.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cat(session.category).bg} ${cat(session.category).text}`}
                    >
                      {session.category}
                    </span>
                  </div>
                  <p className="text-xs text-sand-stone mt-0.5">
                    {formatDuration(session.duration_seconds)}
                  </p>
                  <p className="text-xs text-slate-deep/70 mt-1 line-clamp-2">
                    {session.content_text.slice(0, 120)}...
                  </p>
                </div>
                <span className="text-sand-stone text-sm">→</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
