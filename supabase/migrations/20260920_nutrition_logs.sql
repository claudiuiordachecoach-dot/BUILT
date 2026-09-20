-- Migratie tabel nutrition_logs pentru extragerea macros din Jurnal (poze MyFitnessPal)

CREATE TABLE IF NOT EXISTS public.nutrition_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id BIGINT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    journal_entry_id UUID REFERENCES public.client_journal(id) ON DELETE SET NULL,
    calories_goal INT,
    calories_consumed INT,
    protein_g INT,
    protein_target INT,
    carbs_g INT,
    carbs_target INT,
    fat_g INT,
    fat_target INT,
    activity_kcal INT,
    source TEXT DEFAULT 'vision' CHECK (source IN ('vision', 'manual')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(client_id, log_date)
);

CREATE INDEX IF NOT EXISTS nutrition_logs_client_date_idx ON public.nutrition_logs (client_id, log_date DESC);

-- Trigger pentru updated_at
DROP TRIGGER IF EXISTS trg_nutrition_logs_updated_at ON public.nutrition_logs;
CREATE TRIGGER trg_nutrition_logs_updated_at
  BEFORE UPDATE ON public.nutrition_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "single_user_all_nutrition_logs" ON public.nutrition_logs FOR ALL USING (true) WITH CHECK (true);

-- Notifica PostgREST sa reincarce schema cache
NOTIFY pgrst, 'reload schema';
