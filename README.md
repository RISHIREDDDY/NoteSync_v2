# NoteSync — AI Vibe Coding Prompt

> An intelligent note and task management platform for students and early working professionals.

---

## What to Build

Build a web application called **NoteSync** — an intelligent note and task management platform for students and early working professionals.

---

## Core Features

### 1. Notes with Embedded Tasks

- Users can create notes with a title and free-form body
- Inside any note, users can add task/checklist items
- Each task has a checkbox (strike-through = done), a label, and an optional due date + time
- Tasks NOT checked off = **incomplete**; tasks checked off = **complete**

### 2. Smart Task Status Highlighting

- Any task that is incomplete and past its due date → highlight in **red**
- Any task that is completed (checkbox checked) → highlight in **green**
- This updates in real time as the user interacts

### 3. Google Calendar Integration

- When a user sets a due date/time on a task, automatically create a Google Calendar event for it
- If the task is still unchecked when the calendar event time arrives, Google Calendar will send the reminder (leverage GCal's built-in notification system)
- If the user later checks off the task, delete the corresponding Google Calendar event
- If the task is unchecked again after being completed, recreate the Google Calendar event
- Use Google Calendar API with OAuth 2.0 for authentication

### 4. Appearance Customization

- Light mode / Dark mode toggle
- Custom background color or gradient picker (let user choose their preferred background)
- Custom note card color picker per note (each note can have its own color)
- Save preferences to localStorage so they persist across sessions

### 5. Multi-device Sync

- Use **Supabase** as the backend database (PostgreSQL)
- Authenticate users with **Supabase Auth** (Google OAuth provider)
- All notes and tasks sync in real time across devices using Supabase Realtime subscriptions
- Store Google Calendar OAuth tokens securely in Supabase (encrypted, server-side)

---

## Supabase Database Schema

Create the following tables in Supabase:

> `users` is handled by Supabase Auth — use `auth.users`

### `notes`

| Column | Type | Details |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | Foreign key → `auth.users.id` |
| `title` | text | |
| `body` | text | |
| `card_color` | text | Hex color, default `#ffffff` |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### `tasks`

| Column | Type | Details |
|---|---|---|
| `id` | uuid | Primary key |
| `note_id` | uuid | Foreign key → `notes.id`, on delete cascade |
| `user_id` | uuid | Foreign key → `auth.users.id` |
| `label` | text | |
| `is_completed` | boolean | Default `false` |
| `due_at` | timestamp | Nullable |
| `gcal_event_id` | text | Nullable — stores the Google Calendar event ID |
| `created_at` | timestamp | |

### `user_preferences`

| Column | Type | Details |
|---|---|---|
| `user_id` | uuid | Primary key, foreign key → `auth.users.id` |
| `theme` | text | Default `light` — values: `light`, `dark`, `custom` |
| `background_color` | text | Nullable |
| `background_gradient` | text | Nullable |
| `updated_at` | timestamp | |

> Enable **Row Level Security (RLS)** on all tables so users can only read and write their own data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) |
| Calendar | Google Calendar API (REST) with OAuth 2.0 |
| State | Zustand |

---

## UI / UX Rules

- Clean, minimal card-based layout for notes (CSS grid, responsive)
- Each note card shows: title, first 2 lines of body, task completion count (e.g. `2/5 tasks done`), and the card's custom color
- Clicking a note opens a full editor modal/panel
- Inside the editor: note title, rich text body, and a task list section below
- Task list items have: checkbox | task label | due date-time picker | red/green highlight
- Top navbar: app logo "NoteSync", search bar, light/dark toggle, user avatar (Google profile pic)
- Settings panel (slide-in drawer): background color picker, theme switcher, account info, sign out
- No unnecessary pages — keep it single-page

---

## What NOT to Build

- No AI summarization
- No tags or labels system
- No sharing or collaboration features
- No mobile app — responsive web only
- No paid tiers or subscription UI

> Keep it focused: **notes + tasks + reminders + calendar sync + theming**

---

## Environment Variables

Create a `.env` file at the root of your project using the following keys:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

---

## Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to **Authentication → Providers** and enable **Google**
3. Run the SQL migration below in the **SQL Editor** to create all tables and RLS policies
4. Copy your **Project URL** and **Anon Key** from **Settings → API** into your `.env`

### SQL Migration

```sql
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
```

---

## Google Calendar OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) and create a new project
2. Navigate to **APIs & Services → Library** and enable the **Google Calendar API**
3. Go to **APIs & Services → Credentials** and create an **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Add your local and production URLs to **Authorized JavaScript origins** and **Authorized redirect URIs**
4. Copy the **Client ID** and **Client Secret** into your `.env`
5. In **OAuth consent screen**, add the scope: `https://www.googleapis.com/auth/calendar.events`

---

## Deliverables

- Full working React app (Vite)
- SQL migration file for all tables and RLS policies
- `.env.example` with all required environment variables listed
- Deployable to Vercel or Netlify with one command

---

## Quality Bar

- No placeholder "coming soon" sections — every feature listed above must work
- Task highlight colors (red/green) must be visible against any note card background color
- Google Calendar OAuth must work end-to-end (not mocked)
- Supabase Realtime must reflect changes across two open browser tabs instantly
- App must be fully usable on mobile screen sizes (responsive)
- RLS policies must be airtight — users must never see another user's notes or tasks
- Code must be clean, component-based, and easy to extend
