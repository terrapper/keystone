-- Add todoist_token to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS todoist_token text;

-- Add notification columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS quiet_hours_start time;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS quiet_hours_end time;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zen_mode boolean DEFAULT false;
