-- Add delta views tracking and sync timestamp to instagram_media
ALTER TABLE public.instagram_media
  ADD COLUMN IF NOT EXISTS views_previous integer,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;
