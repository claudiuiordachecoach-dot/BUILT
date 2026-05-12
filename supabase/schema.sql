-- BUILT AI Command Center — Schema DB v0.1
-- Rulează în Supabase SQL Editor (Project → SQL → New query → Run)

-- ════════════════════════════════════════════════════════════════════
-- M1 — CREIERUL LUI CLAUDIU
-- ════════════════════════════════════════════════════════════════════

-- Cele 10 secțiuni ale creierului — fiecare editabilă independent.
create table if not exists public.creier_sections (
  id            bigserial primary key,
  key           text unique not null,           -- 'section_1_cine_esti'
  order_index   int not null,                   -- 1..10 (ordinea în UI)
  title         text not null,                  -- 'Cine ești'
  description   text,                           -- pentru cardul de UI
  content       jsonb not null default '{}'::jsonb,
  status        text not null default 'pending' check (status in ('completed', 'draft', 'pending')),
  updated_at    timestamptz not null default now()
);

create index if not exists creier_sections_order_idx on public.creier_sections (order_index);

-- Metadata creier (versiune, ultima sesiune, etc).
create table if not exists public.creier_metadata (
  key           text primary key,
  value         jsonb not null,
  updated_at    timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════
-- M2-M4 — OUTPUTS GENERATE (reels, stories, carusele)
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.generated_outputs (
  id            bigserial primary key,
  module        text not null check (module in ('M2_reel', 'M3_story', 'M4_carusel')),
  pillar        text check (pillar in ('B', 'U', 'I', 'L', 'T', 'mix')),
  hook          text,
  body          jsonb not null,                 -- structura completă (script, slides etc)
  status        text not null default 'draft' check (status in ('draft', 'edited', 'posted', 'archived')),
  scheduled_for date,                           -- pentru calendarul M5
  posted_at     timestamptz,
  performance   jsonb,                          -- views, likes, saves (umplut de M11)
  user_edits    jsonb,                          -- diff-ul față de varianta AI (pentru learning)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists outputs_module_idx on public.generated_outputs (module);
create index if not exists outputs_scheduled_idx on public.generated_outputs (scheduled_for);
create index if not exists outputs_status_idx on public.generated_outputs (status);

-- ════════════════════════════════════════════════════════════════════
-- M7 — DM CONVERSATIONS
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.dm_conversations (
  id            bigserial primary key,
  prospect_handle text not null,
  profile_type  text check (profile_type in ('antreprenor_inecat', 'tata_uitat', 'profesionista_postburnout', 'skinny_fat', 'unknown')),
  stage         text not null default 'opener' check (stage in ('opener', 'q1', 'q2', 'q3', 'call_booked', 'objection', 'post_call', 'lost', 'won')),
  red_flags     text[],
  last_message_at timestamptz,
  notes         text,
  created_at    timestamptz not null default now()
);

create table if not exists public.dm_messages (
  id              bigserial primary key,
  conversation_id bigint not null references public.dm_conversations(id) on delete cascade,
  direction       text not null check (direction in ('in', 'out')),
  content         text not null,
  created_at      timestamptz not null default now()
);

create index if not exists dm_messages_conv_idx on public.dm_messages (conversation_id, created_at);

-- ════════════════════════════════════════════════════════════════════
-- TRIGGER pentru updated_at automat
-- ════════════════════════════════════════════════════════════════════

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_creier_sections_updated_at on public.creier_sections;
create trigger trg_creier_sections_updated_at
  before update on public.creier_sections
  for each row execute function public.set_updated_at();

drop trigger if exists trg_outputs_updated_at on public.generated_outputs;
create trigger trg_outputs_updated_at
  before update on public.generated_outputs
  for each row execute function public.set_updated_at();

-- ════════════════════════════════════════════════════════════════════
-- M12 — CLIENȚI & RETENȚIE
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.clients (
  id            bigserial primary key,
  name          text not null,
  email         text,
  start_date    date not null default current_date,
  objectives    text,
  status        text not null default 'active' check (status in ('active', 'at_risk', 'completed', 'paused')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.client_checkins (
  id                  bigserial primary key,
  client_id           bigint not null references public.clients(id) on delete cascade,
  week_number         int not null,
  training_adherence  int check (training_adherence between 0 and 100),
  nutrition_adherence int check (nutrition_adherence between 0 and 100),
  energy_level        int check (energy_level between 1 and 10),
  mood                int check (mood between 1 and 10),
  notes               text,
  ai_feedback         text,
  created_at          timestamptz not null default now()
);

create index if not exists clients_status_idx on public.clients (status);
create index if not exists checkins_client_idx on public.client_checkins (client_id, week_number);

drop trigger if exists trg_clients_updated_at on public.clients;
create trigger trg_clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- ════════════════════════════════════════════════════════════════════
-- RLS — pentru moment, single-user (Claudiu). Activăm RLS dar permitem all
-- pentru anon key. Schimbăm dacă adăugăm auth multi-user.
-- ════════════════════════════════════════════════════════════════════

alter table public.creier_sections enable row level security;
alter table public.creier_metadata enable row level security;
alter table public.generated_outputs enable row level security;
alter table public.dm_conversations enable row level security;
alter table public.dm_messages enable row level security;
alter table public.clients enable row level security;
alter table public.client_checkins enable row level security;

drop policy if exists "single_user_all_creier"   on public.creier_sections;
drop policy if exists "single_user_all_meta"      on public.creier_metadata;
drop policy if exists "single_user_all_out"       on public.generated_outputs;
drop policy if exists "single_user_all_dm"        on public.dm_conversations;
drop policy if exists "single_user_all_dmmsg"     on public.dm_messages;
drop policy if exists "single_user_all_clients"   on public.clients;
drop policy if exists "single_user_all_checkins"  on public.client_checkins;

create policy "single_user_all_creier"   on public.creier_sections   for all using (true) with check (true);
create policy "single_user_all_meta"     on public.creier_metadata    for all using (true) with check (true);
create policy "single_user_all_out"      on public.generated_outputs  for all using (true) with check (true);
create policy "single_user_all_dm"       on public.dm_conversations   for all using (true) with check (true);
create policy "single_user_all_dmmsg"    on public.dm_messages        for all using (true) with check (true);
create policy "single_user_all_clients"  on public.clients            for all using (true) with check (true);
create policy "single_user_all_checkins" on public.client_checkins    for all using (true) with check (true);

-- Forțează PostgREST să reîncarce schema cache (după CREATE TABLE / RLS).
notify pgrst, 'reload schema';
