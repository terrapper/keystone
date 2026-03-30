"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/components/providers/supabase-provider";
import { getStreakVisual } from "@/lib/streaks";
import type {
  Routine,
  RoutineHabitWithDetails,
  Habit,
  Streak,
  Profile,
  NotificationMethod,
  TimeOfDay,
} from "@/lib/types/database";

type Tab = "routines" | "library" | "settings";

export default function YouPage() {
  const supabase = useSupabase();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [routineHabits, setRoutineHabits] = useState<RoutineHabitWithDetails[]>([]);
  const [allHabits, setAllHabits] = useState<Habit[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [tab, setTab] = useState<Tab>("routines");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customIcon, setCustomIcon] = useState("✨");
  const [customDuration, setCustomDuration] = useState(5);
  const [customCategory, setCustomCategory] = useState<string>("productivity");

  // Settings state
  const [todoistToken, setTodoistToken] = useState("");
  const [todoistConnected, setTodoistConnected] = useState(false);
  const [todoistSaving, setTodoistSaving] = useState(false);
  const [todoistError, setTodoistError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notifPrefs, setNotifPrefs] = useState<Record<string, NotificationMethod>>({
    morning: "off",
    afternoon: "off",
    evening: "off",
  });
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("07:00");
  const [zenMode, setZenMode] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const ICONS = ["✨", "💪", "🧘", "📖", "🎯", "💧", "🏃", "🧠", "☕", "🌿", "🎵", "✏️"];
  const CATEGORIES = ["focus", "movement", "mindfulness", "nutrition", "sleep", "productivity"];

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [profileRes, routinesRes, streakRes, habitsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("routines").select("*").eq("user_id", user.id).order("time_of_day"),
      supabase.from("streaks").select("*").eq("user_id", user.id).single(),
      supabase.from("habits").select("*").order("category"),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
      // Hydrate settings state from profile
      setTodoistConnected(!!profileRes.data.todoist_token);
      setPhoneNumber(profileRes.data.phone_number || "");
      if (profileRes.data.notification_preferences) {
        setNotifPrefs(profileRes.data.notification_preferences as Record<string, NotificationMethod>);
      }
      if ((profileRes.data as Record<string, unknown>).quiet_hours_start) {
        setQuietHoursStart((profileRes.data as Record<string, unknown>).quiet_hours_start as string);
      }
      if ((profileRes.data as Record<string, unknown>).quiet_hours_end) {
        setQuietHoursEnd((profileRes.data as Record<string, unknown>).quiet_hours_end as string);
      }
      if ((profileRes.data as Record<string, unknown>).zen_mode !== undefined) {
        setZenMode(!!(profileRes.data as Record<string, unknown>).zen_mode);
      }
    }
    if (routinesRes.data) setRoutines(routinesRes.data);
    if (streakRes.data) setStreak(streakRes.data);
    if (habitsRes.data) setAllHabits(habitsRes.data);

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function loadRoutineHabits(routine: Routine) {
    setSelectedRoutine(routine);
    const { data } = await supabase
      .from("routine_habits")
      .select("*, habit:habits(*)")
      .eq("routine_id", routine.id)
      .order("position");
    if (data) setRoutineHabits(data as unknown as RoutineHabitWithDetails[]);
  }

  async function addHabitToRoutine(habitId: string) {
    if (!selectedRoutine) return;
    const maxPos = routineHabits.length;

    // Find the habit to get a reasonable default duration
    const habit = allHabits.find((h) => h.id === habitId);
    const duration = habit?.category === "movement" ? 5 : habit?.category === "mindfulness" ? 3 : 2;

    const { data } = await supabase
      .from("routine_habits")
      .insert({
        routine_id: selectedRoutine.id,
        habit_id: habitId,
        position: maxPos,
        duration_minutes: duration,
      })
      .select("*, habit:habits(*)")
      .single();

    if (data) {
      setRoutineHabits((prev) => [...prev, data as unknown as RoutineHabitWithDetails]);
    }
    setShowLibrary(false);
  }

  async function removeHabitFromRoutine(routineHabitId: string) {
    await supabase.from("routine_habits").delete().eq("id", routineHabitId);
    setRoutineHabits((prev) => prev.filter((rh) => rh.id !== routineHabitId));
  }

  async function moveHabit(routineHabitId: string, direction: "up" | "down") {
    const idx = routineHabits.findIndex((rh) => rh.id === routineHabitId);
    if (idx === -1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= routineHabits.length) return;

    const updated = [...routineHabits];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];

    // Update positions
    const promises = updated.map((rh, i) =>
      supabase.from("routine_habits").update({ position: i }).eq("id", rh.id)
    );
    await Promise.all(promises);
    setRoutineHabits(
      updated.map((rh, i) => ({ ...rh, position: i }))
    );
  }

  async function createCustomHabit() {
    if (!userId || !customName.trim()) return;

    const { data: newHabit } = await supabase
      .from("habits")
      .insert({
        name: customName.trim(),
        description: customDesc.trim() || "A custom habit",
        category: customCategory,
        icon: customIcon,
        why_it_works: "Custom habits reflect what matters most to you.",
        is_default: false,
        created_by: userId,
      })
      .select()
      .single();

    if (newHabit) {
      setAllHabits((prev) => [...prev, newHabit]);
      if (selectedRoutine) {
        await addHabitToRoutine(newHabit.id);
      }
    }

    setShowCustomForm(false);
    setCustomName("");
    setCustomDesc("");
    setCustomIcon("✨");
    setCustomDuration(5);
  }

  // Todoist handlers
  async function connectTodoist() {
    if (!todoistToken.trim()) return;
    setTodoistSaving(true);
    setTodoistError("");
    try {
      const res = await fetch("/api/todoist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_token", token: todoistToken.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setTodoistConnected(true);
        setTodoistToken("");
      } else {
        setTodoistError(data.error || "Failed to connect");
      }
    } catch {
      setTodoistError("Connection failed");
    } finally {
      setTodoistSaving(false);
    }
  }

  async function disconnectTodoist() {
    try {
      await fetch("/api/todoist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" }),
      });
      setTodoistConnected(false);
    } catch {
      // silently fail
    }
  }

  // Notification settings handlers
  async function saveNotificationSettings() {
    if (!userId) return;
    setSettingsSaving(true);
    try {
      await supabase
        .from("profiles")
        .update({
          phone_number: phoneNumber || null,
          notification_preferences: notifPrefs,
          quiet_hours_start: quietHoursStart || null,
          quiet_hours_end: quietHoursEnd || null,
          zen_mode: zenMode,
        })
        .eq("id", userId);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch {
      // silently fail
    } finally {
      setSettingsSaving(false);
    }
  }

  const streakVisual = streak ? getStreakVisual(streak.current_streak) : null;

  const timeLabels: Record<string, string> = {
    morning: "🌅 Morning",
    afternoon: "☀️ Afternoon",
    evening: "🌙 Evening",
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 pt-4">
        <div className="h-8 bg-sand-stone/20 rounded w-1/3" />
        <div className="h-24 bg-sand-stone/20 rounded-keystone" />
        <div className="h-24 bg-sand-stone/20 rounded-keystone" />
      </div>
    );
  }

  // Routine detail view
  if (selectedRoutine) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedRoutine(null);
              setRoutineHabits([]);
            }}
            className="text-amber-warm font-medium text-sm"
          >
            ← Back
          </button>
          <h1 className="font-display text-xl text-slate-deep font-bold">
            {timeLabels[selectedRoutine.time_of_day]} Routine
          </h1>
        </div>

        {routineHabits.length > 0 ? (
          <div className="space-y-2">
            {routineHabits.map((rh, idx) => (
              <motion.div
                key={rh.id}
                layout
                className="card-keystone flex items-center gap-3"
              >
                <span className="text-lg">{rh.habit?.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-deep text-sm">
                    {rh.habit?.name}
                  </div>
                  <div className="text-xs text-sand-stone">
                    {rh.duration_minutes} min
                    {rh.habit?.why_it_works && (
                      <> · {rh.habit.why_it_works}</>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveHabit(rh.id, "up")}
                    disabled={idx === 0}
                    className="w-7 h-7 rounded-full bg-sand-stone/10 flex items-center justify-center text-xs disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveHabit(rh.id, "down")}
                    disabled={idx === routineHabits.length - 1}
                    className="w-7 h-7 rounded-full bg-sand-stone/10 flex items-center justify-center text-xs disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeHabitFromRoutine(rh.id)}
                    className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-xs text-red-500"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card-keystone text-center py-6">
            <p className="text-sand-stone text-sm">
              No habits yet. Add one from the library.
            </p>
          </div>
        )}

        <button
          onClick={() => setShowLibrary(true)}
          className="btn-primary w-full"
        >
          + Add habit
        </button>

        {/* Habit Library Modal */}
        <AnimatePresence>
          {showLibrary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-deep/40 z-50 flex items-end justify-center"
              onClick={() => {
                setShowLibrary(false);
                setShowCustomForm(false);
              }}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white-warm rounded-t-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg text-slate-deep font-bold">
                    {showCustomForm ? "Create custom habit" : "Habit Library"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowLibrary(false);
                      setShowCustomForm(false);
                    }}
                    className="text-sand-stone text-lg"
                  >
                    ✕
                  </button>
                </div>

                {showCustomForm ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-deep mb-1">Name</label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="e.g., Read for 10 minutes"
                        className="w-full px-4 py-2.5 rounded-keystone border border-sand-stone/50 bg-white
                                   text-slate-deep placeholder:text-sand-stone/60 focus:outline-none
                                   focus:ring-2 focus:ring-amber-warm/50 font-body text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-deep mb-1">Description</label>
                      <input
                        type="text"
                        value={customDesc}
                        onChange={(e) => setCustomDesc(e.target.value)}
                        placeholder="A brief description"
                        className="w-full px-4 py-2.5 rounded-keystone border border-sand-stone/50 bg-white
                                   text-slate-deep placeholder:text-sand-stone/60 focus:outline-none
                                   focus:ring-2 focus:ring-amber-warm/50 font-body text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-deep mb-2">Icon</label>
                      <div className="flex flex-wrap gap-2">
                        {ICONS.map((icon) => (
                          <button
                            key={icon}
                            onClick={() => setCustomIcon(icon)}
                            className={`w-10 h-10 rounded-keystone flex items-center justify-center text-lg transition-all ${
                              customIcon === icon
                                ? "bg-amber-warm/20 ring-2 ring-amber-warm"
                                : "bg-white border border-sand-stone/30"
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-deep mb-1">Category</label>
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-keystone border border-sand-stone/50 bg-white
                                   text-slate-deep focus:outline-none focus:ring-2 focus:ring-amber-warm/50 font-body text-sm"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowCustomForm(false)}
                        className="btn-secondary flex-1 text-sm py-2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createCustomHabit}
                        disabled={!customName.trim()}
                        className="btn-primary flex-1 text-sm py-2 disabled:opacity-40"
                      >
                        Create & Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowCustomForm(true)}
                      className="w-full card-keystone text-center py-3 mb-4 text-amber-warm font-medium text-sm border-dashed border-amber-warm/40"
                    >
                      + Create custom habit
                    </button>

                    {CATEGORIES.map((category) => {
                      const categoryHabits = allHabits.filter(
                        (h) =>
                          h.category === category &&
                          !routineHabits.some((rh) => rh.habit_id === h.id)
                      );
                      if (categoryHabits.length === 0) return null;

                      return (
                        <div key={category} className="mb-4">
                          <h3 className="font-display text-sm text-slate-deep font-semibold uppercase tracking-wider mb-2">
                            {category}
                          </h3>
                          <div className="space-y-2">
                            {categoryHabits.map((habit) => (
                              <button
                                key={habit.id}
                                onClick={() => addHabitToRoutine(habit.id)}
                                className="w-full text-left card-keystone flex items-center gap-3 hover:border-amber-warm/40 transition-all"
                              >
                                <span className="text-lg">{habit.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-slate-deep text-sm">
                                    {habit.name}
                                  </div>
                                  {habit.why_it_works && (
                                    <div className="text-xs text-sand-stone mt-0.5">
                                      {habit.why_it_works}
                                    </div>
                                  )}
                                </div>
                                <span className="text-amber-warm text-sm">+</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Main You page
  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-amber-warm/20 rounded-full flex items-center justify-center">
          <span className="font-display text-xl text-amber-warm font-bold">
            {profile?.display_name?.[0]?.toUpperCase() || "?"}
          </span>
        </div>
        <div>
          <h1 className="font-display text-xl text-slate-deep font-bold">
            {profile?.display_name || "You"}
          </h1>
          {streakVisual && streak && streak.current_streak > 0 && (
            <div className="text-sm text-sand-stone flex items-center gap-1">
              <span>{streakVisual.emoji}</span>
              {streak.current_streak} day streak · Best: {streak.longest_streak}
            </div>
          )}
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex bg-sand-stone/10 rounded-keystone p-1">
        <button
          onClick={() => setTab("routines")}
          className={`flex-1 py-2 rounded-keystone text-sm font-medium transition-all ${
            tab === "routines"
              ? "bg-white text-slate-deep shadow-sm"
              : "text-sand-stone"
          }`}
        >
          Routines
        </button>
        <button
          onClick={() => setTab("library")}
          className={`flex-1 py-2 rounded-keystone text-sm font-medium transition-all ${
            tab === "library"
              ? "bg-white text-slate-deep shadow-sm"
              : "text-sand-stone"
          }`}
        >
          Library
        </button>
        <button
          onClick={() => setTab("settings")}
          className={`flex-1 py-2 rounded-keystone text-sm font-medium transition-all ${
            tab === "settings"
              ? "bg-white text-slate-deep shadow-sm"
              : "text-sand-stone"
          }`}
        >
          Settings
        </button>
      </div>

      {tab === "settings" ? (
        <div className="space-y-6">
          {/* Todoist Integration */}
          <div className="space-y-3">
            <h2 className="font-display text-base text-slate-deep font-semibold">
              Todoist
            </h2>
            {todoistConnected ? (
              <div className="card-keystone">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-sage rounded-full" />
                    <span className="text-sm text-slate-deep font-medium">
                      Connected
                    </span>
                  </div>
                  <button
                    onClick={disconnectTodoist}
                    className="text-xs text-sand-stone hover:text-red-500 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
                <p className="text-xs text-sand-stone mt-2">
                  Today&apos;s tasks will appear on your Today page.
                </p>
              </div>
            ) : (
              <div className="card-keystone space-y-3">
                <p className="text-sm text-sand-stone">
                  Connect your Todoist to see today&apos;s tasks in Keystone.
                </p>
                <div>
                  <label className="block text-xs text-sand-stone mb-1">
                    API Token (Settings → Integrations → Developer in Todoist)
                  </label>
                  <input
                    type="password"
                    value={todoistToken}
                    onChange={(e) => setTodoistToken(e.target.value)}
                    placeholder="Paste your Todoist API token"
                    className="w-full px-4 py-2.5 rounded-keystone border border-sand-stone/50 bg-white
                               text-slate-deep placeholder:text-sand-stone/60 focus:outline-none
                               focus:ring-2 focus:ring-amber-warm/50 font-body text-sm"
                  />
                </div>
                {todoistError && (
                  <p className="text-xs text-red-500">{todoistError}</p>
                )}
                <button
                  onClick={connectTodoist}
                  disabled={!todoistToken.trim() || todoistSaving}
                  className="btn-primary w-full text-sm py-2 disabled:opacity-40"
                >
                  {todoistSaving ? "Connecting..." : "Connect Todoist"}
                </button>
              </div>
            )}
          </div>

          {/* Notification Preferences */}
          <div className="space-y-3">
            <h2 className="font-display text-base text-slate-deep font-semibold">
              Notifications
            </h2>

            {/* Zen mode */}
            <div className="card-keystone">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-deep flex items-center gap-2">
                    Zen Mode
                    {zenMode && (
                      <span className="text-xs bg-indigo-soft/20 text-indigo-soft px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-sand-stone mt-0.5">
                    Turn off all notifications
                  </p>
                </div>
                <button
                  onClick={() => setZenMode(!zenMode)}
                  className={`w-12 h-7 rounded-full transition-all relative ${
                    zenMode ? "bg-indigo-soft" : "bg-sand-stone/30"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-all ${
                      zenMode ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Phone number */}
            <div className="card-keystone space-y-2">
              <label className="block text-sm font-medium text-slate-deep">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-2.5 rounded-keystone border border-sand-stone/50 bg-white
                           text-slate-deep placeholder:text-sand-stone/60 focus:outline-none
                           focus:ring-2 focus:ring-amber-warm/50 font-body text-sm"
              />
              <p className="text-xs text-sand-stone">
                For SMS reminders. We&apos;ll adapt to your rhythm over time.
              </p>
            </div>

            {/* Per-routine notification preferences */}
            <div className="card-keystone space-y-3">
              <h3 className="text-sm font-medium text-slate-deep">
                Routine Notifications
              </h3>
              {(["morning", "afternoon", "evening"] as TimeOfDay[]).map((tod) => (
                <div key={tod} className="flex items-center justify-between">
                  <span className="text-sm text-slate-deep">
                    {tod === "morning" ? "🌅" : tod === "afternoon" ? "☀️" : "🌙"}{" "}
                    {tod.charAt(0).toUpperCase() + tod.slice(1)}
                  </span>
                  <select
                    value={notifPrefs[tod] || "off"}
                    onChange={(e) =>
                      setNotifPrefs((prev) => ({
                        ...prev,
                        [tod]: e.target.value as NotificationMethod,
                      }))
                    }
                    className="px-3 py-1.5 rounded-keystone border border-sand-stone/50 bg-white
                               text-slate-deep font-body text-sm focus:outline-none focus:ring-2
                               focus:ring-amber-warm/50"
                  >
                    <option value="off">Off</option>
                    <option value="sms">SMS</option>
                    <option value="push">Push</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              ))}
            </div>

            {/* Quiet hours */}
            <div className="card-keystone space-y-3">
              <h3 className="text-sm font-medium text-slate-deep">
                Quiet Hours
              </h3>
              <p className="text-xs text-sand-stone">
                No notifications during this window.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-sand-stone mb-1">From</label>
                  <input
                    type="time"
                    value={quietHoursStart}
                    onChange={(e) => setQuietHoursStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-keystone border border-sand-stone/50 bg-white
                               text-slate-deep font-body text-sm focus:outline-none focus:ring-2
                               focus:ring-amber-warm/50"
                  />
                </div>
                <span className="text-sand-stone mt-4">to</span>
                <div className="flex-1">
                  <label className="block text-xs text-sand-stone mb-1">Until</label>
                  <input
                    type="time"
                    value={quietHoursEnd}
                    onChange={(e) => setQuietHoursEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-keystone border border-sand-stone/50 bg-white
                               text-slate-deep font-body text-sm focus:outline-none focus:ring-2
                               focus:ring-amber-warm/50"
                  />
                </div>
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={saveNotificationSettings}
              disabled={settingsSaving}
              className="btn-primary w-full text-sm py-2.5 disabled:opacity-60"
            >
              {settingsSaved
                ? "Saved!"
                : settingsSaving
                ? "Saving..."
                : "Save Notification Settings"}
            </button>
          </div>
        </div>
      ) : tab === "routines" ? (
        <div className="space-y-3">
          {routines.length > 0 ? (
            routines.map((routine) => (
              <motion.button
                key={routine.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => loadRoutineHabits(routine)}
                className="w-full text-left card-keystone flex items-center gap-4"
              >
                <span className="text-2xl">
                  {routine.time_of_day === "morning"
                    ? "🌅"
                    : routine.time_of_day === "afternoon"
                    ? "☀️"
                    : "🌙"}
                </span>
                <div className="flex-1">
                  <div className="font-medium text-slate-deep">
                    {routine.time_of_day.charAt(0).toUpperCase() +
                      routine.time_of_day.slice(1)}{" "}
                    Routine
                  </div>
                  <div className="text-xs text-sand-stone">
                    Starts at {routine.start_time} ·{" "}
                    {routine.is_active ? "Active" : "Paused"}
                  </div>
                </div>
                <span className="text-sand-stone">→</span>
              </motion.button>
            ))
          ) : (
            <div className="card-keystone text-center py-8">
              <p className="text-sand-stone mb-2">
                No routines yet.
              </p>
              <p className="text-sm text-sand-stone">
                Go through onboarding to set up your first routine.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {CATEGORIES.map((category) => {
            const categoryHabits = allHabits.filter(
              (h) => h.category === category
            );
            if (categoryHabits.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="font-display text-sm text-slate-deep font-semibold uppercase tracking-wider mb-2">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className="card-keystone flex items-center gap-3"
                    >
                      <span className="text-lg">{habit.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-deep text-sm">
                          {habit.name}
                        </div>
                        <div className="text-xs text-sand-stone">
                          {habit.description}
                        </div>
                        {habit.why_it_works && (
                          <div className="text-xs text-indigo-soft mt-1">
                            💡 {habit.why_it_works}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
