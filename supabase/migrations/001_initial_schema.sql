-- Keystone: Complete Database Schema
-- Run this in your Supabase SQL editor or via supabase db push

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  phone_number text,
  onboarding_complete boolean not null default false,
  notification_preferences jsonb not null default '{"morning": "sms", "afternoon": "off", "evening": "off"}'::jsonb,
  accountability_level text not null default 'balanced',
  onboarding_selections jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- HABITS
-- ============================================
create table public.habits (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null default '',
  category text not null check (category in ('focus', 'movement', 'mindfulness', 'nutrition', 'sleep', 'productivity')),
  icon text not null default 'circle',
  why_it_works text not null default '',
  is_default boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================
-- ROUTINES
-- ============================================
create table public.routines (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  time_of_day text not null check (time_of_day in ('morning', 'afternoon', 'evening')),
  start_time time not null default '07:00',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(user_id, time_of_day)
);

-- ============================================
-- ROUTINE HABITS (join table, ordered)
-- ============================================
create table public.routine_habits (
  id uuid primary key default uuid_generate_v4(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  position integer not null default 0,
  duration_minutes integer not null default 5,
  created_at timestamptz not null default now()
);

-- ============================================
-- HABIT COMPLETIONS
-- ============================================
create table public.habit_completions (
  id uuid primary key default uuid_generate_v4(),
  routine_habit_id uuid not null references public.routine_habits(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  completed_at timestamptz,
  skipped boolean not null default false,
  skip_note text,
  created_at timestamptz not null default now(),
  unique(routine_habit_id, date)
);

-- ============================================
-- JOURNEYS
-- ============================================
create table public.journeys (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null default '',
  category text not null,
  duration_days integer not null,
  content_json jsonb not null default '[]'::jsonb,
  source text not null default 'ai' check (source in ('ai', 'curated', 'hybrid')),
  created_at timestamptz not null default now()
);

-- ============================================
-- USER JOURNEYS
-- ============================================
create table public.user_journeys (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  journey_id uuid not null references public.journeys(id) on delete cascade,
  current_day integer not null default 1,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'active' check (status in ('active', 'paused', 'completed'))
);

-- ============================================
-- COACHING SESSIONS
-- ============================================
create table public.coaching_sessions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null check (category in ('anxiety', 'productivity', 'mindfulness', 'self-compassion', 'adhd', 'energy', 'motivation')),
  content_type text not null default 'text' check (content_type in ('text', 'audio', 'both')),
  content_text text not null default '',
  audio_url text,
  duration_seconds integer not null default 120,
  source text not null default 'ai' check (source in ('ai', 'curated')),
  created_at timestamptz not null default now()
);

-- ============================================
-- STREAKS
-- ============================================
create table public.streaks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_completed_date date,
  freeze_used_this_week boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ============================================
-- REFLECTIONS
-- ============================================
create table public.reflections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  type text not null check (type in ('gratitude', 'reflection', 'letter', 'weekly_review')),
  content text not null default '',
  created_at timestamptz not null default now()
);

-- ============================================
-- CHALLENGES
-- ============================================
create table public.challenges (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null default '',
  duration_days integer not null,
  category text not null,
  created_by uuid references public.profiles(id) on delete set null,
  share_code text unique,
  created_at timestamptz not null default now()
);

-- ============================================
-- USER CHALLENGES
-- ============================================
create table public.user_challenges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  started_at timestamptz not null default now(),
  current_day integer not null default 1,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned'))
);

-- ============================================
-- FOCUS SESSIONS
-- ============================================
create table public.focus_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  duration_minutes integer not null default 25,
  actual_minutes integer,
  distraction_count integer not null default 0,
  ambient_sound text,
  todoist_task_id text,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================
-- ADAPTIVE SETTINGS
-- ============================================
create table public.adaptive_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  preferred_times_json jsonb not null default '{}'::jsonb,
  engagement_pattern_json jsonb not null default '{}'::jsonb,
  auto_simplify_threshold float not null default 0.4,
  consecutive_missed_days integer not null default 0,
  last_nudge_type text,
  last_nudge_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Profiles: users can only read/update their own
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Habits: users can read all defaults + their own custom
alter table public.habits enable row level security;
create policy "Users can view default habits" on public.habits for select using (is_default = true);
create policy "Users can view own custom habits" on public.habits for select using (created_by = auth.uid());
create policy "Users can create custom habits" on public.habits for insert with check (created_by = auth.uid() and is_default = false);
create policy "Users can update own custom habits" on public.habits for update using (created_by = auth.uid());
create policy "Users can delete own custom habits" on public.habits for delete using (created_by = auth.uid());

-- Routines: users own their routines
alter table public.routines enable row level security;
create policy "Users can manage own routines" on public.routines for all using (user_id = auth.uid());

-- Routine habits: through routine ownership
alter table public.routine_habits enable row level security;
create policy "Users can manage own routine habits" on public.routine_habits for all
  using (routine_id in (select id from public.routines where user_id = auth.uid()));

-- Habit completions: users own their completions
alter table public.habit_completions enable row level security;
create policy "Users can manage own completions" on public.habit_completions for all using (user_id = auth.uid());

-- Journeys: readable by all authenticated users
alter table public.journeys enable row level security;
create policy "Authenticated users can view journeys" on public.journeys for select using (auth.role() = 'authenticated');

-- User journeys: users own their enrollments
alter table public.user_journeys enable row level security;
create policy "Users can manage own journey enrollments" on public.user_journeys for all using (user_id = auth.uid());

-- Coaching sessions: readable by all authenticated users
alter table public.coaching_sessions enable row level security;
create policy "Authenticated users can view coaching" on public.coaching_sessions for select using (auth.role() = 'authenticated');

-- Streaks: users own their streaks
alter table public.streaks enable row level security;
create policy "Users can manage own streaks" on public.streaks for all using (user_id = auth.uid());

-- Reflections: users own their reflections
alter table public.reflections enable row level security;
create policy "Users can manage own reflections" on public.reflections for all using (user_id = auth.uid());

-- Challenges: readable by all, creatable by authenticated
alter table public.challenges enable row level security;
create policy "Authenticated users can view challenges" on public.challenges for select using (auth.role() = 'authenticated');
create policy "Users can create challenges" on public.challenges for insert with check (created_by = auth.uid());

-- User challenges: users own their enrollments
alter table public.user_challenges enable row level security;
create policy "Users can manage own challenge enrollments" on public.user_challenges for all using (user_id = auth.uid());

-- Focus sessions: users own their sessions
alter table public.focus_sessions enable row level security;
create policy "Users can manage own focus sessions" on public.focus_sessions for all using (user_id = auth.uid());

-- Adaptive settings: users own their settings
alter table public.adaptive_settings enable row level security;
create policy "Users can manage own adaptive settings" on public.adaptive_settings for all using (user_id = auth.uid());

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile, streak, and adaptive_settings on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));

  insert into public.streaks (user_id)
  values (new.id);

  insert into public.adaptive_settings (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamps
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger streaks_updated_at before update on public.streaks
  for each row execute function public.update_updated_at();

create trigger adaptive_settings_updated_at before update on public.adaptive_settings
  for each row execute function public.update_updated_at();

-- ============================================
-- SEED: Default Habits
-- ============================================
insert into public.habits (name, description, category, icon, why_it_works, is_default) values
  ('Drink Water', 'Start your day with a full glass of water', 'nutrition', 'droplet', 'Rehydrating after sleep improves cognitive function and energy levels within 30 minutes.', true),
  ('Stretch', '5 minutes of gentle stretching', 'movement', 'stretch', 'Morning stretching activates your parasympathetic nervous system and reduces cortisol.', true),
  ('Breathe', '2-minute breathing exercise', 'mindfulness', 'wind', 'Box breathing (4-4-4-4) activates the vagus nerve, shifting your nervous system from fight-or-flight to rest-and-digest.', true),
  ('Gratitude', 'Write 3 things you''re grateful for', 'mindfulness', 'heart', 'Gratitude journaling rewires your brain''s negativity bias. Neuroscience shows it increases dopamine and serotonin.', true),
  ('Move', '10-minute walk or workout', 'movement', 'footprints', 'Just 10 minutes of movement increases BDNF, a protein that supports memory, focus, and mood regulation.', true),
  ('Read', '15 minutes of reading', 'focus', 'book', 'Reading activates multiple brain regions simultaneously, improving focus stamina and reducing stress by 68% (University of Sussex).', true),
  ('Meditate', '5-minute guided meditation', 'mindfulness', 'brain', '8 weeks of regular meditation measurably thickens the prefrontal cortex — the brain region responsible for executive function.', true),
  ('Plan Your Day', 'Review your tasks and set priorities', 'productivity', 'clipboard', 'Writing down your top 3 priorities reduces decision fatigue throughout the day and improves task initiation.', true),
  ('No Phone', '30 minutes without your phone after waking', 'focus', 'phone-off', 'Checking your phone first thing puts your brain in reactive mode. Delaying it keeps you in intentional mode.', true),
  ('Journal', '10 minutes of free writing', 'mindfulness', 'pencil', 'Expressive writing reduces intrusive thoughts and frees up working memory — especially helpful for ADHD brains.', true),
  ('Cold Shower', '30 seconds of cold water', 'movement', 'snowflake', 'Cold exposure increases norepinephrine by 200-300%, improving alertness, mood, and focus for hours.', true),
  ('Healthy Breakfast', 'Eat a balanced breakfast', 'nutrition', 'apple', 'Protein and healthy fats at breakfast stabilize blood sugar, preventing the mid-morning energy crash that derails focus.', true),
  ('Wind Down', '15-minute screen-free wind-down routine', 'sleep', 'moon', 'Blue light suppresses melatonin production. A screen-free buffer before bed improves both sleep onset and sleep quality.', true),
  ('Tidy Space', '5-minute desk or room tidy', 'productivity', 'sparkle', 'Physical clutter competes for your attention. A Princeton study found that clutter reduces working memory and focus.', true),
  ('Deep Work Block', '25-minute focused work session', 'focus', 'target', 'The Pomodoro Technique leverages timeboxing to overcome task initiation paralysis — the hardest part for ADHD brains.', true);
