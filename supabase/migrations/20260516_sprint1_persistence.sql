-- ============================================================
-- SPRINT 1: Persistenta reala pentru Calendar si DM Sales
-- ============================================================

-- 1. Tabel pentru ideile din Content Calendar
CREATE TABLE IF NOT EXISTS calendar_ideas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date        TEXT NOT NULL,          -- format: "2026-05-20"
  hook        TEXT NOT NULL,
  format      TEXT NOT NULL DEFAULT 'RANT',
  cta         TEXT NOT NULL DEFAULT 'DM BUILT',
  content_pillar TEXT,
  brief       TEXT,
  type        TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'ai'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS calendar_ideas_date_idx ON calendar_ideas(date);

-- 2. Tabel pentru DM log zilnic (outreach tracking)
CREATE TABLE IF NOT EXISTS dm_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect    TEXT NOT NULL,
  stage       TEXT NOT NULL DEFAULT 'initial_contact',
  outcome     TEXT NOT NULL DEFAULT 'neutral',  -- 'positive' | 'neutral' | 'negative'
  notes       TEXT,
  score       INTEGER,
  temperature TEXT,                  -- 'Hot' | 'Warm' | 'Cold'
  recommendation TEXT,
  logged_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dm_logs_logged_at_idx ON dm_logs(logged_at DESC);
