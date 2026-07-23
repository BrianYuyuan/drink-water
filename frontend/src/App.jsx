import { useState, useEffect, useRef } from 'react'
import './App.css'

const API_BASE = 'http://localhost:8000'

const STORAGE_KEY = 'drinkWaterState';

function notify(message) {
    if (!('Notification' in window)) {
        alert(message);
        return;
    }
    if (Notification.permission === 'granted') {
        new Notification('Drink Water', { body: message });
    } else {
        alert(message);
    }
}

async function askNotificationPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'default') return;
    await Notification.requestPermission();
}

function App() {
  const [times, setTimes] = useState([])
  const [newTime, setNewTime] = useState('')
  const [message, setMessage] = useState('')
  const [lastAlert, setLastAlert] = useState('')
  const [isError, setIsError] = useState(false)

  const isFirstRender = useRef(true)

  // load times from backend
  useEffect(() => {
    async function loadTimes() {
      try {
        const res = await fetch(`${API_BASE}/times`)
        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`)
        }
        const data = await res.json()
        setTimes(data)
        
      } catch (error) {
        console.error('Failed to load times:', error)
        setMessage('Failed to load times, please try again')
        setIsError(true)
      }
    }
    loadTimes()
  }, [])

  // load lastAlert from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    setLastAlert(saved.lastAlert ?? '')
  }, [])

  // save lastAlert to localStorage
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lastAlert }))
  }, [lastAlert])

  // checkTime
  useEffect(() => {
    const id = setInterval(() => {
      const currentTime = new Date
      const currentDate = currentTime.getDate()
      const currentHr = currentTime.getHours()
      const currentMin = currentTime.getMinutes()
      const HH = String(currentHr).padStart(2, '0')
      const MM = String(currentMin).padStart(2, '0')
      const fullTime = HH + ':' + MM
      const stamp = String(currentDate) + ',' + fullTime

      if (times.some(t => t.time === fullTime) && lastAlert !== stamp) {
        notify('Time to drink water~')
        setLastAlert(stamp)
      }
    }, 1000)

    return () => clearInterval(id)
  }, [times, lastAlert])

  async function addTime() {
    if (!newTime) {
      setMessage('Please select a time first')
      setIsError(true)
      return
    }
    if (times.some(t => t.time === newTime)) {
      setMessage('This time has already been added')
      setIsError(true)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/times`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time: newTime }),
      })
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`)
      }

      const data = await res.json()
      setTimes(data)
      setMessage('')
      setIsError(false)
      askNotificationPermission()

    } catch (error) {
      console.error('Failed to add time:', error)
      setMessage('Failed to add time, please try again')
      setIsError(true)
    }
  }

  async function deleteTime(id) {
    try {
      const res = await fetch(`${API_BASE}/times/${id}`,{
        method: 'DELETE',
      })
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`)
      }

      const data = await res.json()
      setTimes(data)
      setMessage('')
      setIsError(false)

    } catch (error) {
      console.error('Failed to delete time:', error)
      setMessage('Failed to delete time, please try again')
      setIsError(true)
    }
  }

  return (
    <div>
      <h1>Drink Water</h1>

      <label htmlFor="input">Set your timer:</label>
      <input 
        type="time" 
        id="input" 
        value={newTime}
        onChange={e => setNewTime(e.target.value)}
      />
      <button id="addButton" onClick={addTime}>Add</button>

      <ul id="timeList">
        {times.map(t => (
          <li key={t.id}>
            {t.time} 
            <button onClick={() => deleteTime(t.id)}>×</button>
            </li>
        ))}
      </ul>

      <p id="statusText" className={isError ? 'error' : ''}>{message}</p>
    </div>
  )
}

export default App
