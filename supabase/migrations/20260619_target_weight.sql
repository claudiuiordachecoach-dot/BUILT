-- 20260619_target_weight.sql
-- Obiectiv de greutate setat de coach (folosit la bara de progres din profilul clientului).
alter table public.clients
  add column if not exists target_weight_kg numeric;
