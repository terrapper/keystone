"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/components/providers/supabase-provider";
import { IconCheck, IconChart } from "@/components/ui/icons";
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
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

type TypeBadge = { label: string; color: string; bg: string };
const typeBadges: Record<string, TypeBadge> = {
  gratitude: { label: "Gratitude", color: "text-amber-warm", bg: "bg-amber-warm/8" },
  reflection: { label: "Reflection", color: "text-indigo-soft", bg: "bg-indigo-soft/8" },
  letter: { label: "Letter", color: "text-green-sage", bg: "bg-green-sage/8" },
  weekly_review: { label: "Weekly Review", color: "text-[#9B6FA8]", bg: "bg-[#9B6FA8]/8" },
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data } = await supabase.from("reflections").select("*").eq("user_id", user.id).order("date", { ascending: false }).order("created_at", { ascending: false });
    if (data) {
      setReflections(data);
      if (data.find((r) => r.date === today && r.type === "gratitude")) setSavedGratitude(true);
      if (data.find((r) => r.date === today && r.type === "reflection")) setSavedReflection(true);
    }
    setLoading(false);
  }, [supabase, today]);

  useEffect(() => { loadData(); }, [loadData]);

  async function saveEntry(type: "gratitude" | "reflection", content: string) {
    if (!userId || !content.trim()) return;
    const setter = type === "gratitude" ? setSavingGratitude : setSavingReflection;
    setter(true);
    const { data } = await supabase.from("reflections").insert({ user_id: userId, date: today, type, content: content.trim() }).select().single();
    if (data) {
      setReflections((prev) => [data, ...prev]);
      if (type === "gratitude") { setGratitudeText(""); setSavedGratitude(true); }
      else { setReflectionText(""); setSavedReflection(true); }
    }
    setter(false);
  }

  const grouped = reflections.reduce<Record<string, Reflection[]>>((acc, ref) => {
    if (!acc[ref.date]) acc[ref.date] = [];
    acc[ref.date].push(ref);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 pt-4">
        <div className="h-8 bg-sand-stone/15 rounded-keystone w-1/3" />
        <div className="h-28 bg-sand-stone/10 rounded-keystone" />
        <div className="h-28 bg-sand-stone/10 rounded-keystone" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-slate-deep font-bold tracking-tight">Reflect</h1>

      {/* Gratitude prompt */}
      <div className="journal-card">
        <h3 className="section-label !text-amber-warm">Daily Gratitude</h3>
        {savedGratitude ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-sage">
            <IconCheck size={16} />
            <span className="text-sm font-medium">Gratitude captured for today</span>
          </motion.div>
        ) : (
          <>
            <p className="text-sm text-sand-stone mb-3">Name one thing from today.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={gratitudeText}
                onChange={(e) => setGratitudeText(e.target.value)}
                placeholder="I'm grateful for..."
                onKeyDown={(e) => { if (e.key === "Enter" && gratitudeText.trim()) saveEntry("gratitude", gratitudeText); }}
                className="input-keystone flex-1 text-sm"
              />
              <button
                onClick={() => saveEntry("gratitude", gratitudeText)}
                disabled={!gratitudeText.trim() || savingGratitude}
                className="btn-primary py-2.5 px-5 text-sm disabled:opacity-40"
              >
                {savingGratitude ? "..." : "Save"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Reflection prompt */}
      <div className="journal-card">
        <h3 className="section-label !text-indigo-soft">Daily Reflection</h3>
        {savedReflection ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-sage">
            <IconCheck size={16} />
            <span className="text-sm font-medium">Reflection captured for today</span>
          </motion.div>
        ) : (
          <>
            <p className="text-sm text-sand-stone mb-3 italic">{adaptivePrompt}</p>
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="Take a moment to reflect..."
              rows={3}
              className="input-keystone text-sm resize-none"
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
      <div className="card-keystone text-center py-6" style={{ borderStyle: "dashed", borderColor: "rgba(196, 168, 130, 0.3)" }}>
        <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: "rgba(196, 168, 130, 0.08)" }}>
          <IconChart size={22} color="#C4A882" />
        </div>
        <h3 className="font-display text-sm text-slate-deep font-semibold">Weekly Review</h3>
        <p className="text-xs text-sand-stone mt-1">Coming soon -- check back Sunday</p>
      </div>

      {/* Journal entries */}
      {dates.length > 0 && (
        <div>
          <p className="section-label">Journal</p>
          <div className="space-y-5">
            {dates.map((date) => (
              <div key={date}>
                <h3 className="text-xs text-sand-stone font-medium mb-2.5">{formatDate(date)}</h3>
                <div className="space-y-2">
                  {grouped[date].map((entry) => {
                    const badge = typeBadges[entry.type] || typeBadges.reflection;
                    const isExpanded = expandedId === entry.id;

                    return (
                      <motion.button
                        key={entry.id}
                        layout
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="w-full text-left journal-card"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${badge.bg} ${badge.color}`}>
                            {badge.label}
                          </span>
                          <p className={`text-sm text-slate-deep/85 leading-[1.7] ${isExpanded ? "" : "line-clamp-2"}`}>
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
