-- 20260620_daily_logs.sql
-- Checklist zilnic al clientului ("Azi"): execuția pe sistem, nu auto-raportare la check-in.
create table if not exists public.daily_logs (
  id uuid default gen_random_uuid() primary key,
  client_id bigint references clients(id) on delete cascade,
  log_date date not null,
  items jsonb default '{}'::jsonb,
  updated_at timestamptz default now(),
  unique (client_id, log_date)
);

create index if not exists daily_logs_client_date_idx
  on public.daily_logs (client_id, log_date desc);
