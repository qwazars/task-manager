import { useCallback, useState } from 'react'
import { apiFetch } from './api'

export function AdminPanel({ onBackToApp }) {
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [admin, setAdmin] = useState(null)
  const [loginStatus, setLoginStatus] = useState('')
  const [users, setUsers] = useState([])
  const [createStatus, setCreateStatus] = useState('')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [deleteStatus, setDeleteStatus] = useState('')

  const creds = { credentials: 'include' }

  const loadUsers = useCallback(async () => {
    try {
      const list = await apiFetch('/users/', { ...creds })
      setUsers(Array.isArray(list) ? list : [])
    } catch {
      setUsers([])
    }
  }, [])

  const login = async () => {
    setLoginStatus('Logging in...')
    try {
      const payload = await apiFetch('/admins/login', {
        method: 'POST',
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
        ...creds,
      })
      setAdmin(payload)
      setLoginStatus(`Logged in as ${payload.username}`)
      await loadUsers()
    } catch {
      setLoginStatus('Login failed. Check credentials.')
    }
  }

  const logout = async () => {
    try {
      await apiFetch('/admins/logout', { method: 'POST', ...creds })
    } catch {
      /* ignore */
    }
    setAdmin(null)
    setUsers([])
    setLoginStatus('')
  }

  const createUser = async () => {
    setCreateStatus('Creating user...')
    try {
      await apiFetch('/users/admin/create', {
        method: 'POST',
        body: JSON.stringify(form),
        ...creds,
      })
      setCreateStatus('User created')
      setForm({ username: '', email: '', password: '' })
      await loadUsers()
    } catch (e) {
      setCreateStatus(e.message || 'Failed to create user')
    }
  }

  const deleteUser = async (userId) => {
    try {
      await apiFetch(`/users/${userId}`, { method: 'DELETE', ...creds })
      await loadUsers()
    } catch {
      /* ignore */
      setDeleteStatus('Failed to delete user')
    }
  }
  return (
    <div className="app admin-app">
      <p className="admin-nav">
        <button type="button" className="link-button" onClick={onBackToApp}>
          ← Task app
        </button>
      </p>
      <h1>Task Manager Admin</h1>
      <p className="subtitle">Manage users (requires admin cookie session).</p>

      {!admin ? (
        <section className="card">
          <h2>Admin login</h2>
          <input
            placeholder="Admin email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Admin password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />
          <button type="button" onClick={login}>
            Log in
          </button>
          <p className="status">{loginStatus}</p>
        </section>
      ) : (
        <>
          <section className="card admin-session">
            <p className="status">
              Session: <strong>{admin.username}</strong>
            </p>
            <button type="button" className="btn-secondary" onClick={logout}>
              Admin log out
            </button>
          </section>

          <section className="card">
            <h2>Create user</h2>
            <input
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="button" onClick={createUser}>
              Create user
            </button>
            <p className="status">{createStatus}</p>
          </section>

          <section className="card">
            <div className="users-header">
              <h2>Users</h2>
              <button type="button" className="btn-secondary" onClick={loadUsers}>
                Refresh
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <button type="button" className="btn-secondary" onClick={() => deleteUser(user.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  )
}
