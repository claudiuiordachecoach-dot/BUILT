-- BUILT — Tracker Prospecți (veriga lipsă între dm_conversations și clients)
-- Rulează în Supabase: Project → SQL Editor → New query → Run.

create table if not exists public.prospects (
  id              bigserial primary key,
  name            text not null unique,
  profile         text check (profile in ('salt_direct','ciclist','atlet_blocat')),
  status          text not null default 'dm'
                    check (status in ('dm','apel_programat','discovery','oferta','client','nu_acum','pierdut')),
  package         text check (package in ('200','400','700','cuplu')),
  next_step       text,
  next_step_date  date,
  notes           text,
  source          text,                          -- ex: 'instagram_dm'
  dm_conversation_id bigint,                      -- legătură opțională cu modulul DM
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists prospects_status_idx on public.prospects (status);
create index if not exists prospects_next_date_idx on public.prospects (next_step_date);

-- RLS — single-user (același tipar ca restul tabelelor)
alter table public.prospects enable row level security;
drop policy if exists "single_user_all_prospects" on public.prospects;
create policy "single_user_all_prospects" on public.prospects for all using (true) with check (true);

-- Seed: pipeline-ul real din apelurile iunie 2026 (idempotent prin unique(name))
insert into public.prospects (name, profile, status, package, next_step, next_step_date, notes, source) values
  ('Laura',     'atlet_blocat', 'oferta',    '400',  'Un singur follow-up, apoi stop', null, 'Dublu amânat — „start după vacanță". Asistentă exec, bani, foarte informată.', 'instagram_dm'),
  ('Victoria',  'ciclist',      'oferta',    null,   'Follow-up final, apoi mută în Pierdut', null, 'Obiecție de credință: „nu cred că merge pe mine". Antreprenoare, clacare.', 'instagram_dm'),
  ('Anastasia', 'atlet_blocat', 'discovery', null,   'Află rezultatul apelului 2 (era programat)', null, '−42kg, platou, mănâncă emoțional.', 'tiktok_dm'),
  ('Stefania',  'ciclist',      'discovery', null,   'Decizi: un mesaj de re-activare SAU o lași', null, 'Apel tăiat. Plătește deja antrenor 1000 lei/lună. Rezistentă la buget.', 'instagram_dm'),
  ('Bianca Gleizer', 'salt_direct', 'nu_acum', '400', 'NICIO acțiune — revine EA după analize. Unghi CUPLU pt viitor.', null, 'Bani + analize medicale. Amazon DE, gastrită. Ușă deschisă.', 'tiktok_dm'),
  ('Florin (Vasilica)', 'salt_direct', 'pierdut', null, null, null, 'Fără bani nici de avans. Descalificat la buget — nu urmări.', 'tiktok_dm')
on conflict (name) do nothing;
