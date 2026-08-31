import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'cashier-route-plugin',
        configureServer(server: any) {
          server.middlewares.use((req: any, res: any, next: any) => {
            const url = new URL(req.url || '/', 'http://localhost');
            if (url.pathname === '/cashier' || url.pathname === '/cashier/' || url.pathname.startsWith('/cashier?')) {
              req.url = '/cashier.html' + url.search;
            }
            if (url.pathname === '/cashier.html' || url.pathname === '/version.json') {
              res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
              res.setHeader('Pragma', 'no-cache');
              res.setHeader('Expires', '0');
            }
            next();
          });
        },
      },
    ],
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          cashier: path.resolve(__dirname, 'cashier.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
