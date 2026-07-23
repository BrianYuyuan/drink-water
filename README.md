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

