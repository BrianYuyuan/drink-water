import sqlite3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ['http://localhost:5173'],
    allow_methods = ['*'],
    allow_headers = ['*']
)

def init_db():
    conn = sqlite3.connect('drinks.db')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS times(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

class TimeIn(BaseModel):
    time: str

@app.get('/times')
def get_times():
    conn = sqlite3.connect('drinks.db')
    rows = conn.execute('SELECT id, time FROM times ORDER BY time').fetchall()
    conn.close()
    return [{'id': r[0], 'time': r[1]} for r in rows]

@app.post('/times')
def add_time(payload: TimeIn):
    conn = sqlite3.connect('drinks.db')
    conn.execute('INSERT INTO times (time) VALUES (?)', (payload.time,))
    conn.commit()
    rows = conn.execute('SELECT id, time FROM times ORDER BY time').fetchall()
    conn.close()
    return [{'id': r[0], 'time': r[1]} for r in rows]

@app.delete('/times/{id}')
def delete_time(id: int):
    conn = sqlite3.connect('drinks.db')
    conn.execute('DELETE FROM times WHERE id = ?',(id,))
    conn.commit()
    rows = conn.execute('SELECT id, time FROM times ORDER BY time').fetchall()
    conn.close()
    return [{'id': r[0], 'time': r[1]} for r in rows]