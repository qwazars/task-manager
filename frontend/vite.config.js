import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-fallback-admin',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const raw = req.url || ''
          const path = raw.split('?')[0]
          if (path === '/admin-panel' || path === '/admin-panel/') {
            const qs = raw.includes('?') ? '?' + raw.split('?').slice(1).join('?') : ''
            req.url = '/' + qs
          }
          next()
        })
      },
    },
  ],
  server: {
    proxy: {
      '/users': apiTarget,
      '/admins': apiTarget,
      '/tasks': apiTarget,
    },
  },
})
