-- Migrare: adaugă metrici private Instagram + coloane Hook Score
ALTER TABLE instagram_media
  ADD COLUMN IF NOT EXISTS avg_watch_time_ms  integer,
  ADD COLUMN IF NOT EXISTS total_watch_time_ms integer,
  ADD COLUMN IF NOT EXISTS replays             integer,
  ADD COLUMN IF NOT EXISTS follows             integer,
  ADD COLUMN IF NOT EXISTS profile_visits      integer,
  ADD COLUMN IF NOT EXISTS hook_score          numeric(10,4),
  ADD COLUMN IF NOT EXISTS hook_diagnosis      text,
  ADD COLUMN IF NOT EXISTS hook_action         text,
  ADD COLUMN IF NOT EXISTS diagnosed_at        timestamptz;
