-- BUILT — adaugă coloana `remake` pe competitor_reels (idempotent)
-- Rulează în Supabase SQL Editor.
alter table public.competitor_reels add column if not exists remake jsonb;
notify pgrst, 'reload schema';
