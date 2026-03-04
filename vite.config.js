import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5500,
    proxy: {
      // Proxy `/sheets/*` to Google to avoid CORS in the browser during development
      '/sheets': {
        target: 'https://docs.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sheets/, ''),
      },
    },
  },
})
