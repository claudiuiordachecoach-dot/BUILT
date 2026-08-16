CREATE TABLE IF NOT EXISTS client_journal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'meal', 'training', 'steps', 'other'
    label TEXT,         -- optional description (e.g. 'Mic dejun')
    photo_url TEXT NOT NULL,
    note TEXT,          -- optional notes
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE client_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for everyone" ON client_journal FOR ALL USING (true) WITH CHECK (true);
