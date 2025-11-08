// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy all requests starting with /api to the Django backend
      '/api': {
        target: 'http://127.0.0.1:8000', // Your Django backend URL
        changeOrigin: true,
        // We are NOT rewriting the path, because our Django URLs also start with /api/
      }
    }
  }
})