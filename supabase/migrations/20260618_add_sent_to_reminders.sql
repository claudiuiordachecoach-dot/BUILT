-- 20260618_add_sent_to_reminders.sql
create extension if not exists "uuid-ossp";

alter table public.reminders
  add column if not exists sent boolean default false not null;
