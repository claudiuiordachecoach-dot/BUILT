-- Adaugă coloana progress_gallery la tabela clients
alter table public.clients add column if not exists progress_gallery jsonb default '[]'::jsonb;
