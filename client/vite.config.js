import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/fitness-tracker/',
  server: {
    port: 3000,
    proxy: {
      '/fitness-tracker/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fitness-tracker\/api/, '/api')
      }
    }
  }
})
