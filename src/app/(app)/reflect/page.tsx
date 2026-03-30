"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { Reflection } from "@/lib/types/database";

const reflectionPrompts = [
  "What went well today?",
  "What are you grateful for right now?",
  "What challenged you today, and how did you handle it?",
  "What did you learn about yourself today?",
  "What moment today would you want to remember?",
  "What would make tomorrow a good day?",
];

function getAdaptivePrompt(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "What are you looking forward to today?";
  if (hour < 17) return "What's going well so far today?";
  return reflectionPrompts[Math.floor(Math.random() * reflectionPrompts.length)];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const d = new Date(dateStr + "T00:00:00");
  d.setHours(0, 0, 0, 0);

  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === yesterday.getTime()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

type TypeBadge = { label: string; color: string };
const typeBadges: Record<string, TypeBadge> = {
  gratitude: { label: "Gratitude", color: "bg-amber-warm/10 text-amber-warm" },
  reflection: {
    label: "Reflection",
    color: "bg-indigo-soft/10 text-indigo-soft",
  },
  letter: { label: "Letter", color: "bg-green-sage/10 text-green-sage" },
  weekly_review: {
    label: "Weekly Review",
    color: "bg-[#9B6FA8]/10 text-[#9B6FA8]",
  },
};

export default function ReflectPage() {
  const supabase = useSupabase();
  const [userId, setUserId] = useState<string | null>(null);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [gratitudeText, setGratitudeText] = useState("");
  const [reflectionText, setReflectionText] = useState("");
  const [savingGratitude, setSavingGratitude] = useState(false);
  const [savingReflection, setSavingReflection] = useState(false);
  const [savedGratitude, setSavedGratitude] = useState(false);
  const [savedReflection, setSavedReflection] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adaptivePrompt] = useState(getAdaptivePrompt);

  const today = new Date().toISOString().split("T")[0];

  const loadData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data } = await supabase
      .from("reflections")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (data) {
      setReflections(data);

      // Check if already submitted today
      const todayGratitude = data.find(
        (r) => r.date === today && r.type === "gratitude"
      );
      const todayReflection = data.find(
        (r) => r.date === today && r.type === "reflection"
      );
      if (todayGratitude) setSavedGratitude(true);
      if (todayReflection) setSavedReflection(true);
    }

    setLoading(false);
  }, [supabase, today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function saveEntry(type: "gratitude" | "reflection", content: string) {
    if (!userId || !content.trim()) return;

    const setter = type === "gratitude" ? setSavingGratitude : setSavingReflection;
    setter(true);

    const { data } = await supabase
      .from("reflections")
      .insert({
        user_id: userId,
        date: today,
        type,
        content: content.trim(),
      })
      .select()
      .single();

    if (data) {
      setReflections((prev) => [data, ...prev]);
      if (type === "gratitude") {
        setGratitudeText("");
        setSavedGratitude(true);
      } else {
        setReflectionText("");
        setSavedReflection(true);
      }
    }

    setter(false);
  }

  // Group reflections by date
  const grouped = reflections.reduce<Record<string, Reflection[]>>(
    (acc, ref) => {
      if (!acc[ref.date]) acc[ref.date] = [];
      acc[ref.date].push(ref);
      return acc;
    },
    {}
  );

  const dates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 pt-4">
        <div className="h-8 bg-sand-stone/20 rounded w-1/3" />
        <div className="h-24 bg-sand-stone/20 rounded-keystone" />
        <div className="h-24 bg-sand-stone/20 rounded-keystone" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-slate-deep font-bold">
        Reflect
      </h1>

      {/* Gratitude prompt */}
      <div className="card-keystone">
        <h3 className="font-display text-sm text-amber-warm font-semibold uppercase tracking-wider mb-2">
          Daily Gratitude
        </h3>
        {savedGratitude ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-green-sage"
          >
            <span>✓</span>
            <span className="text-sm font-medium">
              Gratitude captured for today
            </span>
          </motion.div>
        ) : (
          <>
            <p className="text-sm text-sand-stone mb-3">
              Name one thing from today.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={gratitudeText}
                onChange={(e) => setGratitudeText(e.target.value)}
                placeholder="I'm grateful for..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && gratitudeText.trim()) {
                    saveEntry("gratitude", gratitudeText);
                  }
                }}
                className="flex-1 px-4 py-2.5 rounded-keystone border border-sand-stone/50 bg-white
                           text-slate-deep placeholder:text-sand-stone/60 focus:outline-none
                           focus:ring-2 focus:ring-amber-warm/50 font-body text-sm"
              />
              <button
                onClick={() => saveEntry("gratitude", gratitudeText)}
                disabled={!gratitudeText.trim() || savingGratitude}
                className="btn-primary py-2 px-4 text-sm disabled:opacity-40"
              >
                {savingGratitude ? "..." : "Save"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Reflection prompt */}
      <div className="card-keystone">
        <h3 className="font-display text-sm text-indigo-soft font-semibold uppercase tracking-wider mb-2">
          Daily Reflection
        </h3>
        {savedReflection ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-green-sage"
          >
            <span>✓</span>
            <span className="text-sm font-medium">
              Reflection captured for today
            </span>
          </motion.div>
        ) : (
          <>
            <p className="text-sm text-sand-stone mb-3">{adaptivePrompt}</p>
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="Take a moment to reflect..."
              rows={3}
              className="w-full px-4 py-3 rounded-keystone border border-sand-stone/50 bg-white
                         text-slate-deep placeholder:text-sand-stone/60 focus:outline-none
                         focus:ring-2 focus:ring-indigo-soft/50 font-body text-sm resize-none"
            />
            <button
              onClick={() => saveEntry("reflection", reflectionText)}
              disabled={!reflectionText.trim() || savingReflection}
              className="btn-primary w-full mt-3 text-sm disabled:opacity-40"
            >
              {savingReflection ? "Saving..." : "Save Reflection"}
            </button>
          </>
        )}
      </div>

      {/* Weekly review placeholder */}
      <div className="card-keystone border-dashed border-sand-stone/40 text-center py-5">
        <span className="text-2xl mb-2 block">📊</span>
        <h3 className="font-display text-sm text-slate-deep font-semibold">
          Weekly Review
        </h3>
        <p className="text-xs text-sand-stone mt-1">
          Coming soon — check back Sunday
        </p>
      </div>

      {/* Journal entries */}
      {dates.length > 0 && (
        <div>
          <h2 className="font-display text-sm text-slate-deep font-semibold uppercase tracking-wider mb-3">
            Journal
          </h2>
          <div className="space-y-4">
            {dates.map((date) => (
              <div key={date}>
                <h3 className="text-xs text-sand-stone font-medium mb-2">
                  {formatDate(date)}
                </h3>
                <div className="space-y-2">
                  {grouped[date].map((entry) => {
                    const badge = typeBadges[entry.type] || typeBadges.reflection;
                    const isExpanded = expandedId === entry.id;

                    return (
                      <motion.button
                        key={entry.id}
                        layout
                        onClick={() =>
                          setExpandedId(isExpanded ? null : entry.id)
                        }
                        className="w-full text-left card-keystone"
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                          <p
                            className={`text-sm text-slate-deep/90 leading-relaxed ${
                              isExpanded ? "" : "line-clamp-2"
                            }`}
                          >
                            {entry.content}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
