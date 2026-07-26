import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Build optimizations
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code
          react: ['react', 'react-dom', 'react-router-dom'],
          framer: ['framer-motion'],
          lucide: ['lucide-react'],
        },
      },
    },
    // Increase chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Enable code splitting
    sourcemap: false,
  },

  // Dev server config
  server: {
    port: 3000,
    open: true,
    headers: {
      'Cache-Control': 'max-age=0',
    },
    proxy: {
      '/api/': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path,
        bypass: (req, res, options) => {
          if (req.headers.accept?.includes('application/json')) {
            return null;
          }
        },
      },
    },
  },

  // Optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react'],
  },
})
