-- BUILT AI Command Center — M6 Competitor Intelligence
-- Rulează în Supabase SQL Editor (idempotent, se poate rula de mai multe ori).

-- ════════════════════════════════════════════════════════════════════
-- M6 — COMPETITORS + REELS + WEEKLY INTELLIGENCE REPORTS
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.competitors (
  id               bigserial primary key,
  handle           text unique not null,           -- '@dan_toma_fitness'
  display_name     text,                           -- 'Dan Toma'
  niche_notes      text,                           -- 'fitness coach RO, vocal pe nutriție'
  followers_count  int,
  last_scraped_at  timestamptz,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

create index if not exists competitors_active_idx on public.competitors (is_active);

create table if not exists public.competitor_reels (
  id                bigserial primary key,
  competitor_id     bigint not null references public.competitors(id) on delete cascade,
  shortcode         text unique not null,         -- IG shortcode (DXYZabc...)
  url               text not null,                -- https://instagram.com/p/DXYZabc/
  posted_at         timestamptz,
  caption           text,
  transcript        text,                         -- output Whisper local
  thumbnail_url     text,
  video_url         text,
  views             int,
  likes             int,
  comments_count    int,
  duration_seconds  int,
  ai_analysis       jsonb,                        -- {hook_type, why_worked, format, ...}
  scraped_at        timestamptz not null default now()
);

create index if not exists reels_competitor_idx on public.competitor_reels (competitor_id, posted_at desc);
create index if not exists reels_posted_idx on public.competitor_reels (posted_at desc);

create table if not exists public.weekly_intelligence_reports (
  id                 bigserial primary key,
  week_start         date not null,
  week_end           date not null,
  total_reels        int,
  competitors_count  int,
  patterns           jsonb,                       -- {top_hooks, top_formats, common_themes}
  generated_scripts  jsonb,                       -- 7 script ideas for next week
  raw_summary        text,                        -- AI's free-form intel
  status             text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at         timestamptz not null default now()
);

create unique index if not exists reports_week_idx on public.weekly_intelligence_reports (week_start);

-- ════════════════════════════════════════════════════════════════════
-- RLS
-- ════════════════════════════════════════════════════════════════════

alter table public.competitors enable row level security;
alter table public.competitor_reels enable row level security;
alter table public.weekly_intelligence_reports enable row level security;

drop policy if exists "single_user_all_competitors" on public.competitors;
drop policy if exists "single_user_all_comp_reels"  on public.competitor_reels;
drop policy if exists "single_user_all_reports"     on public.weekly_intelligence_reports;

create policy "single_user_all_competitors" on public.competitors                 for all using (true) with check (true);
create policy "single_user_all_comp_reels"  on public.competitor_reels            for all using (true) with check (true);
create policy "single_user_all_reports"     on public.weekly_intelligence_reports for all using (true) with check (true);

notify pgrst, 'reload schema';
