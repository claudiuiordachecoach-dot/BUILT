-- ══════════════════════════════════════════
-- PROFILES (legat de auth.users)
-- ══════════════════════════════════════════
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('admin', 'client')),
  full_name text,
  avatar_initials text,
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    'client',
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
create policy "Users see own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

-- ══════════════════════════════════════════
-- AI CONVERSATIONS
-- ══════════════════════════════════════════
create table if not exists public.ai_conversations (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  source text not null check (source in (
    'ask_built_ai','dm_coach','reels','stories',
    'carusele','claude_import','gemini_import'
  )),
  title text,
  messages jsonb not null default '[]'::jsonb,
  summary text,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists ai_conv_user_idx on public.ai_conversations (user_id, created_at desc);

alter table public.ai_conversations enable row level security;
create policy "Users see own convos" on public.ai_conversations
  for all using (auth.uid() = user_id);

-- ══════════════════════════════════════════
-- INSTAGRAM MEDIA (reels proprii)
-- ══════════════════════════════════════════
create table if not exists public.instagram_media (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  instagram_id text unique,
  thumbnail_url text,
  caption text,
  format_type text check (format_type in (
    'TALKING_HEAD','RANT','TREND','TUTORIAL',
    'STORY_TIME','LIST','BEHIND_SCENES','OTHER'
  )),
  views int default 0,
  likes int default 0,
  comments int default 0,
  saves int default 0,
  shares int default 0,
  posted_at timestamptz,
  analysis jsonb,
  created_at timestamptz default now()
);

create index if not exists ig_media_user_idx on public.instagram_media (user_id, posted_at desc);

alter table public.instagram_media enable row level security;
create policy "Users see own media" on public.instagram_media
  for all using (auth.uid() = user_id);

-- ══════════════════════════════════════════
-- WEEKLY PACKAGES (scripturi săptămânale)
-- ══════════════════════════════════════════
create table if not exists public.weekly_packages (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  week_start date not null,
  intelligence_report jsonb,
  scripts jsonb default '[]'::jsonb,
  generated_at timestamptz default now()
);

create index if not exists weekly_pkg_user_idx on public.weekly_packages (user_id, week_start desc);

alter table public.weekly_packages enable row level security;
create policy "Users see own packages" on public.weekly_packages
  for all using (auth.uid() = user_id);

-- ══════════════════════════════════════════
-- WORKOUT PLANS
-- ══════════════════════════════════════════
create table if not exists public.workout_plans (
  id bigserial primary key,
  client_id bigint not null references public.clients(id) on delete cascade,
  week_start date not null,
  days jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists workout_client_idx on public.workout_plans (client_id, week_start desc);

alter table public.workout_plans enable row level security;
create policy "Allow all workout_plans" on public.workout_plans for all using (true) with check (true);

drop trigger if exists trg_workout_updated_at on public.workout_plans;
create trigger trg_workout_updated_at
  before update on public.workout_plans
  for each row execute function public.set_updated_at();

-- ══════════════════════════════════════════
-- NUTRITION PLANS
-- ══════════════════════════════════════════
create table if not exists public.nutrition_plans (
  id bigserial primary key,
  client_id bigint not null references public.clients(id) on delete cascade,
  calories int,
  protein_g int,
  carbs_g int,
  fat_g int,
  meals jsonb default '[]'::jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists nutrition_client_idx on public.nutrition_plans (client_id);

alter table public.nutrition_plans enable row level security;
create policy "Allow all nutrition_plans" on public.nutrition_plans for all using (true) with check (true);

drop trigger if exists trg_nutrition_updated_at on public.nutrition_plans;
create trigger trg_nutrition_updated_at
  before update on public.nutrition_plans
  for each row execute function public.set_updated_at();

-- ══════════════════════════════════════════
-- CLIENT MESSAGES
-- ══════════════════════════════════════════
create table if not exists public.client_messages (
  id bigserial primary key,
  client_id bigint not null references public.clients(id) on delete cascade,
  sender text not null check (sender in ('admin','client')),
  content text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists msg_client_idx on public.client_messages (client_id, created_at desc);

alter table public.client_messages enable row level security;
create policy "Allow all client_messages" on public.client_messages for all using (true) with check (true);

-- ══════════════════════════════════════════
-- CLIENTS — adaugă coloana auth_user_id
-- ══════════════════════════════════════════
alter table public.clients add column if not exists auth_user_id uuid references auth.users(id);
create index if not exists clients_auth_user_idx on public.clients (auth_user_id);

-- ══════════════════════════════════════════
-- COMPETITOR REELS
-- ══════════════════════════════════════════
create table if not exists public.competitor_reels (
  id bigserial primary key,
  competitor_handle text not null,
  instagram_id text unique,
  thumbnail_url text,
  caption text,
  views int default 0,
  likes int default 0,
  transcript text,
  posted_at timestamptz,
  created_at timestamptz default now()
);

alter table public.competitor_reels enable row level security;
create policy "Allow all competitor_reels" on public.competitor_reels for all using (true) with check (true);

-- ══════════════════════════════════════════
-- DM TEMPLATES
-- ══════════════════════════════════════════
create table if not exists public.dm_templates (
  id bigserial primary key,
  name text unique not null,
  content text not null,
  created_at timestamptz default now()
);

alter table public.dm_templates enable row level security;
create policy "Allow all dm_templates" on public.dm_templates for all using (true) with check (true);

notify pgrst, 'reload schema';

-- NOTE: Admin role must be assigned manually via SQL after user creation:
-- update public.profiles set role = 'admin' where id = '<user-uuid>';
