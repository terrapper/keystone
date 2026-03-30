export type TimeOfDay = "morning" | "afternoon" | "evening";
export type HabitCategory = "focus" | "movement" | "mindfulness" | "nutrition" | "sleep" | "productivity";
export type JourneyStatus = "active" | "paused" | "completed";
export type ChallengeStatus = "active" | "completed" | "abandoned";
export type ContentSource = "ai" | "curated" | "hybrid";
export type CoachingCategory = "anxiety" | "productivity" | "mindfulness" | "self-compassion" | "adhd" | "energy" | "motivation";
export type ContentType = "text" | "audio" | "both";
export type ReflectionType = "gratitude" | "reflection" | "letter" | "weekly_review";
export type NotificationMethod = "sms" | "push" | "both" | "off";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  phone_number: string | null;
  onboarding_complete: boolean;
  notification_preferences: Record<TimeOfDay, NotificationMethod>;
  accountability_level: string;
  onboarding_selections: string[];
  todoist_token: string | null;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  zen_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  icon: string;
  why_it_works: string;
  is_default: boolean;
  created_by: string | null;
  created_at: string;
}

export interface Routine {
  id: string;
  user_id: string;
  time_of_day: TimeOfDay;
  start_time: string;
  is_active: boolean;
  created_at: string;
}

export interface RoutineHabit {
  id: string;
  routine_id: string;
  habit_id: string;
  position: number;
  duration_minutes: number;
  created_at: string;
}

export interface RoutineHabitWithDetails extends RoutineHabit {
  habit: Habit;
}

export interface HabitCompletion {
  id: string;
  routine_habit_id: string;
  user_id: string;
  date: string;
  completed_at: string | null;
  skipped: boolean;
  skip_note: string | null;
  created_at: string;
}

export interface Journey {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_days: number;
  content_json: JourneyDay[];
  source: ContentSource;
  created_at: string;
}

export interface JourneyDay {
  day: number;
  title: string;
  coaching_text: string;
  coaching_audio_url?: string;
  action: string;
  reflection_prompt: string;
}

export interface UserJourney {
  id: string;
  user_id: string;
  journey_id: string;
  current_day: number;
  started_at: string;
  completed_at: string | null;
  status: JourneyStatus;
}

export interface CoachingSession {
  id: string;
  title: string;
  category: CoachingCategory;
  content_type: ContentType;
  content_text: string;
  audio_url: string | null;
  duration_seconds: number;
  source: ContentSource;
  created_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  freeze_used_this_week: boolean;
  updated_at: string;
}

export interface Reflection {
  id: string;
  user_id: string;
  date: string;
  type: ReflectionType;
  content: string;
  created_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  category: string;
  created_by: string | null;
  share_code: string | null;
  created_at: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  started_at: string;
  current_day: number;
  status: ChallengeStatus;
}

export interface FocusSession {
  id: string;
  user_id: string;
  started_at: string;
  duration_minutes: number;
  actual_minutes: number | null;
  distraction_count: number;
  ambient_sound: string | null;
  todoist_task_id: string | null;
  completed: boolean;
  created_at: string;
}

export interface AdaptiveSettings {
  id: string;
  user_id: string;
  preferred_times_json: Record<string, string>;
  engagement_pattern_json: Record<string, unknown>;
  auto_simplify_threshold: number;
  consecutive_missed_days: number;
  last_nudge_type: string | null;
  last_nudge_at: string | null;
  updated_at: string;
}
