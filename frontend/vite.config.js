import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

// Custom plugin: only inject COOP/COEP on /lab* routes.
// This allows WebContainer to use SharedArrayBuffer on the Lab page
// while keeping Razorpay's cross-origin iframes working on all other pages.
function conditionalIsolationHeaders() {
  return {
    name: 'conditional-isolation-headers',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        const referer = req.headers['referer'] || '';
        const isLabRoute = url.startsWith('/lab') || referer.includes('/lab');
        if (isLabRoute) {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), conditionalIsolationHeaders()],
  publicDir: 'public',
  server: {
    host: true, // Allow external access (ngrok, LAN)
    allowedHosts: true, // Allow all hosts (ngrok URLs change every restart)
    fs: {
      // Allow serving files from node_modules
      allow: ['..', 'node_modules/pyodide']
    },
    // NO global headers here — handled conditionally in the plugin above
    proxy: {
      '/api/v1': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
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