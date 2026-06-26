-- BUILT — Registru de Încasări (doar pentru coach, invizibil pentru clienți)
-- Rulează în Supabase: Project → SQL Editor → New query → Run.
--
-- O singură tabelă: dealul agreat per client (total + monedă) + plățile ca jsonb
-- (același tipar ca progress_gallery / daily_logs.items — fără tabel separat de tranșe).

create table if not exists public.client_finance (
  client_id   bigint primary key references public.clients(id) on delete cascade,
  total       numeric not null default 0,          -- prețul total agreat al pachetului
  currency    text    not null default 'EUR',
  payments    jsonb   not null default '[]'::jsonb, -- [{ id, amount, date, method, note }]
  note        text,                                 -- ex: „avans Revolut, rest la prima ședință"
  updated_at  timestamptz not null default now()
);

-- RLS — single-user (același tipar ca restul tabelelor)
alter table public.client_finance enable row level security;
drop policy if exists "single_user_all_client_finance" on public.client_finance;
create policy "single_user_all_client_finance" on public.client_finance
  for all using (true) with check (true);
