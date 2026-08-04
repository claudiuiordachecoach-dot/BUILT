-- BUILT — Blocare acces clienți (suspended / disabled)
-- Adăugăm statusuri noi la tabela clients:
--   'suspended' = plată restantă (blocare temporară cu pop-up)
--   'disabled'  = cont dezactivat permanent

ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_status_check;
ALTER TABLE public.clients ADD CONSTRAINT clients_status_check 
  CHECK (status IN ('active', 'at_risk', 'completed', 'paused', 'suspended', 'disabled'));
