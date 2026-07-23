# Drink Water Reminder

A small full-stack web app that reminds you to drink water at times you set.
Runs a check every second in the browser and fires a system notification when
a scheduled time comes up.


## Stack

- Frontend: React (Vite)
- Backend: FastAPI
- Database: SQLite
- Notifications: Web Notifications API

## Running it

Two processes, two terminals.

**Backend**
````
cd backend
python -m venv venv
venv\Scripts\activate # macOS/Linux: source venv/bin/activate
pip install fastapi uvicorn
uvicorn main:app --reload
````

Runs on http://localhost:8000. API docs at http://localhost:8000/docs.

**Frontend**
````
cd frontend
npm install
npm run dev
````

Runs on http://localhost:5173.

## Project structure
````
drink-water/
├── frontend/ React app
│ └── src/App.jsx all UI, state, and API calls
└── backend/
└── main.py FastAPI app, SQLite schema, CRUD endpoints
````

## API

| Method | Path           | Body              | Returns              |
|--------|----------------|-------------------|----------------------|
| GET    | /times         | —                 | list of reminders    |
| POST   | /times         | `{"time":"09:00"}`| updated full list    |
| DELETE | /times/{id}    | —                 | updated full list    |

## Design decisions

**The frontend keeps a local copy of the reminder list.**
The list rarely changes, but the app checks it every second to see whether a
reminder is due. Asking the backend once per second would be wasteful and would
break on any network hiccup. The backend stays the source of truth; the frontend
copy is a cache.
*Cost:* if the data changed elsewhere — another device, another tab — the
frontend wouldn't notice until the next reload.

**Writes use incremental endpoints (POST one, DELETE one) rather than replacing
the whole list.**
"The array is different now" doesn't tell you what happened — you can't
reverse-engineer "the user added 09:00" from a state diff. Sending the action
instead of the resulting state keeps the intent explicit, and it doesn't get
slower as the list grows.
*Cost:* more endpoints to maintain than a single replace-everything call.

**Sorting happens in the backend.**
One place owns the ordering rule. If both sides sorted, the two could drift
apart and the UI would silently disagree with what's stored.
*Cost:* the frontend can't reorder anything without a round trip.

**`lastAlert` lives in localStorage, not in the database.**
It records whether a given reminder already fired today, so the same minute
doesn't alert twice. That’s a per-device runtime state — a reminder dismissed on
a laptop shouldn't count as dismissed on a phone. Only the reminder list itself
is worth persisting server-side.
*Cost:* clearing browser storage resets it.

**After a write, the frontend uses the list the backend returns instead of
computing the new state itself.**
The backend sorts and assigns IDs, so taking its response verbatim guarantees
the UI matches what's actually stored.
*Cost:* a visible delay of a few hundred milliseconds after each add or delete.
An optimistic update would hide it, but it would also mean writing rollback
logic for failed requests — not worth it for an action this infrequent.

## Known limitations

- The scheduling check runs in the browser, so nothing fires once the tab is
  closed. Real background delivery would need a service worker plus Web Push,
  or a native app.
- No user accounts. The API is unauthenticated, and every client reads and
  writes the same single list.
- The API base URL and the CORS origin are hardcoded to localhost. Nothing is
  configurable for deployment.
- `lastAlert` resets on reload, so a reminder can fire twice within the same
  minute.
- The schema is created with `CREATE TABLE IF NOT EXISTS` and there are no
  migrations — changing the table means deleting the database file.
