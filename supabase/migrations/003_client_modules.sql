-- ══════════════════════════════════════════
-- CLIENT MODULES (Academia BUILT)
-- ══════════════════════════════════════════
create table if not exists public.client_modules (
  id bigserial primary key,
  client_id bigint not null references public.clients(id) on delete cascade,
  module_number int not null,
  title text not null,
  content_html text not null,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(client_id, module_number)
);

-- Indexare pentru căutare rapidă
create index if not exists module_client_idx on public.client_modules (client_id, module_number);

-- RLS Security
alter table public.client_modules enable row level security;

-- Admin poate face orice
drop policy if exists "Admin can manage all modules" on public.client_modules;
create policy "Admin can manage all modules" on public.client_modules
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Clienții își pot vedea modulele publicate
drop policy if exists "Clients can view own published modules" on public.client_modules;
create policy "Clients can view own published modules" on public.client_modules
  for select using (
    exists (
      select 1 from public.clients
      where id = client_modules.client_id
      and auth_user_id = auth.uid()
    )
    and is_published = true
  );

-- Funcție pentru set_updated_at (dacă nu există deja)
-- Notă: În 001 am văzut că se folosește set_updated_at(), deci presupunem că există.
drop trigger if exists trg_modules_updated_at on public.client_modules;
create trigger trg_modules_updated_at
  before update on public.client_modules
  for each row execute function public.set_updated_at();

notify pgrst, 'reload schema';
