import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from './api'

function isBenignEmptyTasksError(err) {
  const m = (err.message || '').toLowerCase()
  return m.includes('tasks not found') || m.includes('task not found')
}

export function Todos({ user, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const list = await apiFetch(`/tasks/user/${user.id}`)
      setTasks(Array.isArray(list) ? list : [])
    } catch (e) {
      if (isBenignEmptyTasksError(e)) {
        setTasks([])
        setError('')
      } else {
        setError(e.message)
        setTasks([])
      }
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    load()
  }, [load])

  const addTask = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setError('')
    try {
      await apiFetch('/tasks/create', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          completed: false,
          user_id: user.id,
        }),
      })
      setTitle('')
      setDescription('')
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const toggle = async (task) => {
    setError('')
    const nextCompleted = !task.completed
    try {
      const updated = await apiFetch(`/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          completed: nextCompleted,
          user_id: user.id,
        }),
      })
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, ...updated }
            : t,
        ),
      )
    } catch (e) {
      setError(e.message)
    }
  }

  const remove = async (id) => {
    setError('')
    try {
      await apiFetch(`/tasks/${id}`, { method: 'DELETE' })
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const startEdit = (task) => {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditDescription('')
  }

  const saveEdit = async (task) => {
    setError('')
    try {
      await apiFetch(`/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle.trim() || task.title,
          description: editDescription,
          completed: task.completed,
          user_id: user.id,
        }),
      })
      cancelEdit()
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="todo-shell">
      <header className="todo-header">
        <div>
          <h1>Your tasks</h1>
          <p className="subtitle">
            Signed in as <strong>{user.username}</strong> ({user.email})
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={onLogout}>
          Log out
        </button>
      </header>

      <section className="card">
        <h2>Add a task</h2>
        <form className="task-form" onSubmit={addTask}>
          <label className="field">
            <span>Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
            />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details"
            />
          </label>
          <button type="submit">Add task</button>
        </form>
      </section>

      <section className="card">
        <div className="tasks-toolbar">
          <h2>My list</h2>
          <button type="button" className="btn-secondary" onClick={load}>
            Refresh
          </button>
        </div>
        {loading ? (
          <p className="muted">Loading tasks…</p>
        ) : tasks.length === 0 ? (
          <p className="muted">No tasks yet. Add one above.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className={task.completed ? 'task done' : 'task'}>
                {editingId === task.id ? (
                  <div className="task-edit">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      aria-label="Edit title"
                    />
                    <textarea
                      rows={2}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      aria-label="Edit description"
                    />
                    <div className="task-actions">
                      <button type="button" onClick={() => saveEdit(task)}>
                        Save
                      </button>
                      <button type="button" className="btn-secondary" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <label className="task-check">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggle(task)}
                      />
                      <span className="task-body">
                        <span className="task-title">{task.title}</span>
                        {task.description ? (
                          <span className="task-desc">{task.description}</span>
                        ) : null}
                      </span>
                    </label>
                    <div className="task-actions">
                      <button type="button" className="btn-secondary" onClick={() => startEdit(task)}>
                        Edit
                      </button>
                      <button type="button" className="btn-danger" onClick={() => remove(task.id)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        {error ? (
          <p className="status error" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    </div>
  )
}
