-- NoteSync SQL Migration
-- Run this in the Supabase SQL Editor

-- Notes table
create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  body text,
  card_color text default '#ffffff',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Tasks table
create table tasks (
  id uuid primary key default gen_random_uuid(),
  note_id uuid references notes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  label text,
  is_completed boolean default false,
  due_at timestamp,
  gcal_event_id text,
  created_at timestamp default now()
);

-- User preferences table
create table user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text default 'light',
  background_color text,
  background_gradient text,
  updated_at timestamp default now()
);

-- Enable Row Level Security
alter table notes enable row level security;
alter table tasks enable row level security;
alter table user_preferences enable row level security;

-- RLS Policies
create policy "Users can manage their own notes"
  on notes for all using (auth.uid() = user_id);

create policy "Users can manage their own tasks"
  on tasks for all using (auth.uid() = user_id);

create policy "Users can manage their own preferences"
  on user_preferences for all using (auth.uid() = user_id);
