-- Fișa de Start (intake onboarding) — funnel de onboarding BUILT
-- Token unic de intake pe client (link ne-enumerabil)
alter table public.clients
  add column if not exists intake_token uuid not null default gen_random_uuid();

-- Răspunsurile Fișei de Start (1 rând per client)
create table if not exists public.client_intake (
  id           bigserial primary key,
  client_id    bigint not null references public.clients(id) on delete cascade,
  answers      jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  unique (client_id)
);

create index if not exists idx_client_intake_client on public.client_intake(client_id);

-- RLS activ. Scrierea/citirea se fac din server actions cu service role (bypass RLS),
-- la fel ca restul tabelelor client_*. Fără policy pentru anon.
alter table public.client_intake enable row level security;
