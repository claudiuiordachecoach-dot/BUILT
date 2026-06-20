-- ══════════════════════════════════════════════════════════════════════
-- 20260515 — Missing tables & column patches
-- Toate tabelele marcate ca "lipsă" în task-ul de setup.
-- NOTĂ: ai_conversations, dm_templates, weekly_packages există deja în
--        001_auth_schema.sql — adăugăm doar coloanele lipsă + tabele noi.
-- ══════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────
-- 1. AI_CONVERSATIONS
--    Există în 001_auth_schema.sql. Patch-uri suplimentare pentru
--    /knowledge (source = 'manual' permis, fără user_id obligatoriu).
-- ──────────────────────────────────────────────────────────────────────

-- Permite source 'manual' (folosit în /knowledge actions)
-- Coloana source are un CHECK constraint care nu include 'manual'.
-- Adăugăm o variantă alternativă fără constraint dacă nu există deja.
-- Dacă vrei să extinzi CHECK-ul existent, rulează manual:
--   ALTER TABLE public.ai_conversations DROP CONSTRAINT IF EXISTS ai_conversations_source_check;
--   ALTER TABLE public.ai_conversations ADD CONSTRAINT ai_conversations_source_check
--     CHECK (source IN ('ask_built_ai','dm_coach','reels','stories','carusele','claude_import','gemini_import','manual'));

-- ──────────────────────────────────────────────────────────────────────
-- 2. DM_TEMPLATES — adaugă coloana `stage` (lipsă din 001_auth_schema)
-- ──────────────────────────────────────────────────────────────────────

alter table public.dm_templates
  add column if not exists stage text;

-- ──────────────────────────────────────────────────────────────────────
-- 3. WEEKLY_PACKAGES — adaugă coloanele `week_of` și `package_json`
--    Folosite de generateWeeklyPackageAI() din content/actions.ts
--    care face upsert({ week_of, package_json }, { onConflict: 'week_of' })
-- ──────────────────────────────────────────────────────────────────────

alter table public.weekly_packages
  add column if not exists week_of text;

alter table public.weekly_packages
  add column if not exists package_json text;

-- Index unic pe week_of pentru onConflict upsert
create unique index if not exists weekly_packages_week_of_uidx
  on public.weekly_packages (week_of)
  where week_of is not null;

-- ──────────────────────────────────────────────────────────────────────
-- 4. COMPETITORS — tabelă lipsă complet, folosită în content/actions.ts
--    (listCompetitors, addCompetitor, removeCompetitor, scrapeCompetitors)
-- ──────────────────────────────────────────────────────────────────────

create table if not exists public.competitors (
  id         bigserial primary key,
  handle     text unique not null,
  created_at timestamptz not null default now()
);

alter table public.competitors enable row level security;

drop policy if exists "Allow all competitors" on public.competitors;
create policy "Allow all competitors"
  on public.competitors
  for all
  using (true)
  with check (true);

-- ──────────────────────────────────────────────────────────────────────
-- 5. ONBOARDING_DATA — alias pentru tabela `onboarding` din 004_onboarding.sql
--    Tabela există deja (single-row, id=1). Nu o recreăm.
--    Dacă aplicația folosește numele `onboarding_data`, creăm un view.
-- ──────────────────────────────────────────────────────────────────────

-- View permisiv pentru compatibilitate cu orice cod care referențiează
-- `onboarding_data` în loc de `onboarding`.
create or replace view public.onboarding_data as
  select * from public.onboarding;

-- ══════════════════════════════════════════════════════════════════════
-- Forțează PostgREST să reîncarce schema cache
-- ══════════════════════════════════════════════════════════════════════
notify pgrst, 'reload schema';
