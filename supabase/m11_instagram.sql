-- BUILT AI Command Center — M11 Instagram Connection
-- Rulează în Supabase SQL Editor (idempotent).

-- ════════════════════════════════════════════════════════════════════
-- Contul conectat (1 row — single-user)
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.instagram_account (
  id                bigserial primary key,
  ig_user_id        text unique not null,
  username          text,
  access_token      text not null,           -- long-lived token (60 zile)
  token_expires_at  timestamptz,
  followers_count   int,
  connected_at      timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════
-- Media (reels + posts) sync-uite din Instagram
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.instagram_media (
  id             bigserial primary key,
  ig_media_id    text unique not null,
  media_type     text,                       -- VIDEO, IMAGE, CAROUSEL_ALBUM
  timestamp      timestamptz,
  caption        text,
  permalink      text,
  thumbnail_url  text,
  -- Insights
  plays          int,                        -- video views (reels)
  likes          int,
  comments       int,
  saves          int,
  shares         int,
  reach          int,
  impressions    int,
  -- Link la reel generat în M2 (opțional)
  generated_output_id bigint references public.generated_outputs(id) on delete set null,
  synced_at      timestamptz not null default now()
);

create index if not exists ig_media_timestamp_idx on public.instagram_media (timestamp desc);

-- ════════════════════════════════════════════════════════════════════
-- RLS
-- ════════════════════════════════════════════════════════════════════

alter table public.instagram_account enable row level security;
alter table public.instagram_media    enable row level security;

drop policy if exists "single_user_all_ig_account" on public.instagram_account;
drop policy if exists "single_user_all_ig_media"   on public.instagram_media;

create policy "single_user_all_ig_account" on public.instagram_account for all using (true) with check (true);
create policy "single_user_all_ig_media"   on public.instagram_media   for all using (true) with check (true);

-- updated_at trigger pentru instagram_account
drop trigger if exists trg_ig_account_updated_at on public.instagram_account;
create trigger trg_ig_account_updated_at
  before update on public.instagram_account
  for each row execute function public.set_updated_at();

notify pgrst, 'reload schema';
