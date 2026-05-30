-- BUILT AI Command Center — Migration v2
-- Tabele lipsă: client_modules, workout_plans, nutrition_plans, client_messages
-- + coloana auth_user_id pe clients
-- Rulează în Supabase → SQL Editor → New Query → Run

-- ════════════════════════════════════════════════════════════════════
-- 1. Adaugă auth_user_id pe clients (dacă nu există)
-- ════════════════════════════════════════════════════════════════════

alter table public.clients
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

-- ════════════════════════════════════════════════════════════════════
-- 2. client_modules — module educaționale per client
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.client_modules (
  id              bigserial primary key,
  client_id       bigint not null references public.clients(id) on delete cascade,
  module_number   int not null,
  title           text not null,
  content_html    text not null default '',
  is_published    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists client_modules_client_idx on public.client_modules (client_id, module_number);

drop trigger if exists trg_client_modules_updated_at on public.client_modules;
create trigger trg_client_modules_updated_at
  before update on public.client_modules
  for each row execute function public.set_updated_at();

alter table public.client_modules enable row level security;
drop policy if exists "all_client_modules" on public.client_modules;
create policy "all_client_modules" on public.client_modules for all using (true) with check (true);

-- ════════════════════════════════════════════════════════════════════
-- 3. workout_plans — planuri de antrenament per client per săptămână
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.workout_plans (
  id              bigserial primary key,
  client_id       bigint not null references public.clients(id) on delete cascade,
  week_start      date not null,
  days            jsonb not null default '{}'::jsonb,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (client_id, week_start)
);

create index if not exists workout_plans_client_idx on public.workout_plans (client_id, week_start desc);

drop trigger if exists trg_workout_plans_updated_at on public.workout_plans;
create trigger trg_workout_plans_updated_at
  before update on public.workout_plans
  for each row execute function public.set_updated_at();

alter table public.workout_plans enable row level security;
drop policy if exists "all_workout_plans" on public.workout_plans;
create policy "all_workout_plans" on public.workout_plans for all using (true) with check (true);

-- ════════════════════════════════════════════════════════════════════
-- 4. nutrition_plans — plan nutrițional per client
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.nutrition_plans (
  id              bigserial primary key,
  client_id       bigint not null references public.clients(id) on delete cascade unique,
  calories        int not null default 2000,
  protein_g       int not null default 150,
  carbs_g         int not null default 200,
  fat_g           int not null default 65,
  meals           jsonb not null default '[]'::jsonb,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_nutrition_plans_updated_at on public.nutrition_plans;
create trigger trg_nutrition_plans_updated_at
  before update on public.nutrition_plans
  for each row execute function public.set_updated_at();

alter table public.nutrition_plans enable row level security;
drop policy if exists "all_nutrition_plans" on public.nutrition_plans;
create policy "all_nutrition_plans" on public.nutrition_plans for all using (true) with check (true);

-- ════════════════════════════════════════════════════════════════════
-- 5. client_messages — chat asincron admin ↔ client
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.client_messages (
  id              bigserial primary key,
  client_id       bigint not null references public.clients(id) on delete cascade,
  sender          text not null check (sender in ('admin', 'client')),
  content         text not null,
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists client_messages_client_idx on public.client_messages (client_id, created_at);

alter table public.client_messages enable row level security;
drop policy if exists "all_client_messages" on public.client_messages;
create policy "all_client_messages" on public.client_messages for all using (true) with check (true);

-- ════════════════════════════════════════════════════════════════════
-- Forțează PostgREST să reîncarce schema cache
-- ════════════════════════════════════════════════════════════════════

notify pgrst, 'reload schema';
