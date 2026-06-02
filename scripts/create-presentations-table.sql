-- Tabel pentru prezentările generate per prospect
CREATE TABLE IF NOT EXISTS presentations (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug       TEXT        UNIQUE NOT NULL,
  prospect_name TEXT     NOT NULL,
  html_content  TEXT     NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;

-- Doar utilizatorii autentificați pot crea prezentări
CREATE POLICY "Auth users can insert presentations"
  ON presentations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Oricine cu slug-ul poate citi dacă nu a expirat
CREATE POLICY "Public can read non-expired presentations"
  ON presentations FOR SELECT
  TO anon, authenticated
  USING (expires_at > NOW());
