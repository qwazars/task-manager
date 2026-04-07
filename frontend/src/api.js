const apiBase = () => import.meta.env.VITE_API_URL || ''

function parseErrorDetail(detail) {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail))
    return detail.map((e) => e.msg || JSON.stringify(e)).join(', ')
  return 'Request failed'
}

export async function apiFetch(path, options = {}) {
  const url = `${apiBase()}${path}`
  const method = (options.method || 'GET').toUpperCase()
  const headers = { ...options.headers }
  if (
    options.body != null &&
    ['POST', 'PUT', 'PATCH'].includes(method)
  ) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }
  const res = await fetch(url, { ...options, headers })
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { detail: text || res.statusText }
  }
  if (!res.ok) {
    const msg = data?.detail ? parseErrorDetail(data.detail) : res.statusText
    const err = new Error(msg)
    err.status = res.status
    throw err
  }
  return data
}
