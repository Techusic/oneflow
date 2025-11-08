// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
<<<<<<< HEAD
export default defineConfig({
  plugins: [react()],
=======
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Add this proxy configuration
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // Your Django backend
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
>>>>>>> parent of eb607d3 (Working Update 1)
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