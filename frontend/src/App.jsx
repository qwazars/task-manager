import { useCallback, useEffect, useState } from 'react'
import { Auth } from './Auth.jsx'
import { Todos } from './Todos.jsx'
import { AdminPanel } from './AdminPanel.jsx'
import './App.css'

const STORAGE_KEY = 'taskmanager_user'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const u = JSON.parse(raw)
    if (u && typeof u.id === 'number' && u.username && u.email) return u
    return null
  } catch {
    return null
  }
}

function isAdminPath(pathname) {
  return pathname === '/admin-panel' || pathname.startsWith('/admin-panel/')
}

export default function App() {
  const [user, setUser] = useState(null)
  const [path, setPath] = useState(() => window.location.pathname)

  useEffect(() => {
    setUser(readStoredUser())
  }, [])

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to) => {
    window.history.pushState({}, '', to)
    setPath(window.location.pathname)
  }, [])

  const onAuthed = useCallback((u) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    setUser(u)
  }, [])

  const onLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  if (isAdminPath(path)) {
    return <AdminPanel onBackToApp={() => navigate('/')} />
  }

  return (
    <div className="app">
      {!user ? <Auth onAuthed={onAuthed} /> : <Todos user={user} onLogout={onLogout} />}
    </div>
  )
}
