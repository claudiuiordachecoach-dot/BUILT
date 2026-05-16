-- ══════════════════════════════════════════════════════════════════════
-- 20260515 — Blueprint 2.0 tables: competitor_intel + profile_audits
-- ══════════════════════════════════════════════════════════════════════

-- Competitor intelligence cache
CREATE TABLE IF NOT EXISTS public.competitor_intel (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username    text UNIQUE NOT NULL,
  last_scraped timestamptz,
  top_hooks   text[],
  avg_views_last_7_days bigint,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.competitor_intel ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all competitor_intel" ON public.competitor_intel;
CREATE POLICY "Allow all competitor_intel"
  ON public.competitor_intel FOR ALL
  USING (true) WITH CHECK (true);

-- Profile audit results
CREATE TABLE IF NOT EXISTS public.profile_audits (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id),
  score           decimal(3,1),
  recommendations jsonb,
  new_bio         text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all profile_audits" ON public.profile_audits;
CREATE POLICY "Allow all profile_audits"
  ON public.profile_audits FOR ALL
  USING (true) WITH CHECK (true);

-- Coloana feedback loop: learnings AI per reel propriu
ALTER TABLE public.instagram_media
  ADD COLUMN IF NOT EXISTS ai_analysis jsonb;

NOTIFY pgrst, 'reload schema';
