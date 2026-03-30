"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/components/providers/supabase-provider";
import { getWelcomeBackMessage, shouldSuggestSimplification } from "@/lib/adaptive";

interface AdaptiveBannersProps {
  userId: string | null;
}

export function AdaptiveBanners({ userId }: AdaptiveBannersProps) {
  const supabase = useSupabase();
  const [welcomeBack, setWelcomeBack] = useState<string | null>(null);
  const [simplification, setSimplification] = useState<{
    message: string;
    topHabits: string[];
  } | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

    async function check() {
      // Check welcome back
      const wb = await getWelcomeBackMessage(supabase, userId!);
      if (wb) setWelcomeBack(wb);

      // Check simplification suggestion
      const simp = await shouldSuggestSimplification(supabase, userId!);
      if (simp.suggest && simp.message) {
        setSimplification({ message: simp.message, topHabits: simp.topHabits });
      }
    }

    check();
  }, [supabase, userId]);

  function dismiss(key: string) {
    setDismissed((prev) => new Set(prev).add(key));
  }

  return (
    <AnimatePresence>
      {/* Welcome back banner */}
      {welcomeBack && !dismissed.has("welcome") && (
        <motion.div
          key="welcome"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className="card-keystone bg-amber-warm/10 border-amber-warm/30"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">👋</span>
            <div className="flex-1">
              <p className="text-sm text-slate-deep font-medium">
                {welcomeBack}
              </p>
              <p className="text-xs text-sand-stone mt-1">
                You came back — that&apos;s the hard part.
              </p>
            </div>
            <button
              onClick={() => dismiss("welcome")}
              className="text-sand-stone text-xs hover:text-slate-deep"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* Simplification suggestion banner */}
      {simplification && !dismissed.has("simplify") && (
        <motion.div
          key="simplify"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className="card-keystone bg-indigo-soft/10 border-indigo-soft/30"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">💡</span>
            <div className="flex-1">
              <p className="text-sm text-slate-deep">
                {simplification.message}
              </p>
              {simplification.topHabits.length > 0 && (
                <p className="text-xs text-indigo-soft mt-1">
                  Your regulars: {simplification.topHabits.join(", ")}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss("simplify")}
              className="text-sand-stone text-xs hover:text-slate-deep"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
