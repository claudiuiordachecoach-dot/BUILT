create extension if not exists "uuid-ossp";

create table if not exists push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  client_id bigint references clients(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

create table if not exists reminders (
  id uuid default gen_random_uuid() primary key,
  client_id bigint references clients(id) on delete cascade,
  next_trigger timestamptz not null,
  created_at timestamptz default now()
);
