-- Add new check-in metrics: sleep, hydration, stress
-- Replaces: mood (kept for backwards compat, just hidden in UI)

alter table public.client_checkins
  add column if not exists sleep_hours  numeric(4,1) check (sleep_hours between 0 and 24),
  add column if not exists hydration_l  numeric(4,1) check (hydration_l between 0 and 10),
  add column if not exists stress_level int         check (stress_level between 1 and 10);
