-- BUILT — Antrenamentul live (sesiuni pe zi de antrenament)
-- Clientul alege ziua, loghează seturi (kg×reps) + pauză per exercițiu, salvează sesiunea.
-- Data viitoare la aceeași zi: exercițiile + numerele trecute se reportează automat,
-- iar dacă face mai puțin → atenționare de regresie.
-- Rulează în Supabase: Project → SQL Editor → New query → Run.

create table if not exists public.workout_sessions (
  id          uuid default gen_random_uuid() primary key,
  client_id   bigint references public.clients(id) on delete cascade,
  day_label   text not null,                 -- „A", „Piept + Spate", etc. (cum o numește clientul)
  logged_on   date not null default current_date,
  exercises   jsonb not null default '[]'::jsonb,  -- [{name, rest, sets:[{kg,reps}]}]
  note        text,
  created_at  timestamptz default now()
);

create index if not exists workout_sessions_client_day_idx
  on public.workout_sessions (client_id, day_label, logged_on desc);

-- RLS permisiv single-user (clientul scrie cu cheia anon, coachul citește cu service-role)
alter table public.workout_sessions enable row level security;
drop policy if exists "single_user_all_workout_sessions" on public.workout_sessions;
create policy "single_user_all_workout_sessions" on public.workout_sessions
  for all using (true) with check (true);
