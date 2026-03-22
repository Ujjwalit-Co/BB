import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: 'public',
  server: {
    fs: {
      // Allow serving files from node_modules
      allow: ['..', 'node_modules/pyodide']
    }
  },
  // Copy pyodide files to public folder on build
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('pyodide')) {
            return 'pyodide';
          }
        }
      }
    }
  }
})
