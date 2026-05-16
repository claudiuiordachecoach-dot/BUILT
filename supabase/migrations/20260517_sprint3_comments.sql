-- Sprint 3: add comments column to competitor_reels
alter table public.competitor_reels
  add column if not exists comments jsonb default '[]'::jsonb;
