import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path,
        bypass: (req, res, options) => {
          // If dev-server not running, allow Vite to continue (404)
          // This enables graceful fallback
          if (req.headers.accept?.includes('application/json')) {
            return null;
          }
        },
      },
    },
  },
})
