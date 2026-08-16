-- BUILT — Jurnal de Forță (dovada progresiei pe exerciții compuse)
-- Pilonul Base Strength: clientul notează ce ridică, vede progresia, coachul vede cine crește.
-- Rulează în Supabase: Project → SQL Editor → New query → Run.

create table if not exists public.strength_logs (
  id          uuid default gen_random_uuid() primary key,
  client_id   bigint references public.clients(id) on delete cascade,
  exercise    text not null,                 -- nume normalizat (ex: „Genuflexiuni")
  weight      numeric not null,              -- kg la setul de lucru/top
  reps        int,                           -- repetări la setul de top
  sets        int,                           -- nr seturi de lucru (opțional)
  logged_on   date not null default current_date,
  note        text,
  created_at  timestamptz default now()
);

create index if not exists strength_logs_client_ex_idx
  on public.strength_logs (client_id, exercise, logged_on desc);

-- RLS permisiv single-user (clientul scrie cu cheia anon, coachul citește cu service-role)
alter table public.strength_logs enable row level security;
drop policy if exists "single_user_all_strength_logs" on public.strength_logs;
create policy "single_user_all_strength_logs" on public.strength_logs
  for all using (true) with check (true);
