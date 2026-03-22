-- Run this in your Supabase SQL editor

-- Workouts table
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  activity text not null,
  duration integer not null check (duration > 0),
  date date not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security (open policy for single-user app)
alter table workouts enable row level security;
create policy "Allow all" on workouts for all using (true) with check (true);

-- Chat messages table
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

alter table chat_messages enable row level security;
create policy "Allow all" on chat_messages for all using (true) with check (true);
