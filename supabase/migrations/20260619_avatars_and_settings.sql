-- 20260619_avatars_and_settings.sql
-- Poze de profil clienți + setări aplicație (avatar coach).
-- Bucket-ul 'uploads' e creat deja prin API (public). Upload-ul trece prin
-- /api/upload cu service role, deci NU sunt necesare politici de storage.

-- Avatar client
alter table public.clients
  add column if not exists avatar_url text;

-- Setări globale (avatar coach etc.)
create table if not exists public.app_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);
