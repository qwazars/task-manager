import { useState } from 'react'
import { apiFetch } from './api'

export function Auth({ onAuthed }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setStatus('')
    setLoading(true)
    try {
      if (mode === 'register') {
        const user = await apiFetch('/users/register', {
          method: 'POST',
          body: JSON.stringify({ username, email, password }),
        })
        onAuthed(user)
      } else {
        const user = await apiFetch('/users/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        onAuthed(user)
      }
    } catch (err) {
      setStatus(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card auth-card">
      <h1 className="auth-title">Task Manager</h1>
      <p className="subtitle">Sign in or create an account to manage your tasks.</p>

      <div className="tabs" role="tablist">
        <button
          type="button"
          className={mode === 'login' ? 'tab active' : 'tab'}
          onClick={() => setMode('login')}
        >
          Log in
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'tab active' : 'tab'}
          onClick={() => setMode('register')}
        >
          Register
        </button>
      </div>

      <form className="auth-form" onSubmit={submit}>
        {mode === 'register' && (
          <label className="field">
            <span>Username</span>
            <input
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
        )}
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Log in'}
        </button>
      </form>
      <p className="status" role="status">
        {status}
      </p>
    </section>
  )
}
