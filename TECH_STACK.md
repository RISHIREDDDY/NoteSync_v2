# NoteSync — Tech Stack

## Frontend
| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 19 | UI framework |
| [Vite](https://vite.dev) | 6 | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility-first styling |
| [React Icons](https://react-icons.github.io/react-icons/) | 5 | Icon library (HeroIcons) |
| [date-fns](https://date-fns.org) | 4 | Date formatting & comparison |

## State Management
| Technology | Purpose |
|---|---|
| [Zustand](https://zustand-demo.pmnd.rs) | Lightweight global state (notes, tasks, auth, preferences) |

## Backend & Auth
| Technology | Purpose |
|---|---|
| [Supabase](https://supabase.com) | Postgres database, Auth (Google OAuth), Realtime subscriptions |
| Google OAuth 2.0 | Sign-in via Google via Supabase |

## Integrations
| Technology | Purpose |
|---|---|
| [Google Calendar API](https://developers.google.com/calendar) | Create/delete calendar events for task reminders |
| [Google Cloud Console](https://console.cloud.google.com) | OAuth credentials & API management |

## Project Structure
```
NoteSync/
├── src/
│   ├── App.jsx              # Root layout (sidebar + editor split)
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global styles + layout classes
│   ├── components/
│   │   ├── Navbar.jsx       # Sidebar header (logo, search, actions)
│   │   ├── NotesList.jsx    # Sidebar scrollable notes list
│   │   ├── NoteCard.jsx     # Individual note list item
│   │   ├── NoteEditor.jsx   # Inline right-panel editor
│   │   ├── TaskItem.jsx     # Task row with checkbox, due date
│   │   ├── ColorPicker.jsx  # Note card color selector
│   │   ├── Login.jsx        # Google sign-in page
│   │   └── SettingsDrawer.jsx  # Theme & background settings
│   ├── stores/
│   │   ├── authStore.js     # Auth state (Supabase)
│   │   ├── noteStore.js     # Notes CRUD + realtime
│   │   ├── taskStore.js     # Tasks CRUD + realtime
│   │   └── preferencesStore.js  # Theme, background preferences
│   └── lib/
│       ├── supabase.js      # Supabase client
│       └── googleCalendar.js  # Google Calendar API helpers
├── .env                     # Environment variables (gitignored)
├── .env.example             # Env variable template
└── TECH_STACK.md            # This file
```

## Environment Variables
```env
VITE_SUPABASE_URL=           # Supabase project URL
VITE_SUPABASE_ANON_KEY=      # Supabase anon public key
VITE_GOOGLE_CLIENT_ID=       # Google OAuth Client ID
VITE_GOOGLE_CLIENT_SECRET=   # Google OAuth Client Secret
```

## Database (Supabase / Postgres)
| Table | Columns |
|---|---|
| `notes` | `id`, `user_id`, `title`, `body`, `card_color`, `created_at`, `updated_at` |
| `tasks` | `id`, `note_id`, `user_id`, `label`, `is_completed`, `due_at`, `gcal_event_id`, `created_at` |
| `preferences` | `user_id`, `theme`, `background_color`, `background_gradient` |
