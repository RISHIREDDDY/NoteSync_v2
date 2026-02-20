# NoteSync — AI Vibe Coding Prompt

> An intelligent note and task management platform for students and early working professionals — built to help you organize, sync, and never miss a deadline again.

---

## What to Build

NoteSync is a web application where you create notes that contain smart task checklists. Set a due date on any task and NoteSync will automatically add it to your Google Calendar. If you haven't checked it off by the deadline, your calendar reminds you. Tasks glow 🔴 red when overdue and 🟢 green when done — all synced in real time across every device you own.
Built for people who lose track of to-dos buried in notes. No fluff, just focus.

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

