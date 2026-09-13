import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Hosted landslide backend. Browser calls are proxied same-origin (dev +
// preview) because the backend does not send CORS headers yet. Once CORS is
// enabled on the server, the client can call the backend URL directly.
const NODES_BACKEND = 'https://landslideearlywarning-system-backend.onrender.com';

const nodesProxy = {
  '/nodes-api': {
    target: NODES_BACKEND,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/nodes-api/, ''),
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: nodesProxy,
  },
  preview: {
    proxy: nodesProxy,
  },
});
