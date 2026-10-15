import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
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

            // Serve manifest.webmanifest with correct MIME type
            if (url.pathname === '/manifest.webmanifest') {
              const manifestPath = path.resolve(__dirname, 'manifest.webmanifest');
              if (fs.existsSync(manifestPath)) {
                res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
                res.setHeader('Cache-Control', 'no-cache');
                return res.end(fs.readFileSync(manifestPath, 'utf-8'));
              }
            }

            // Serve sw.js with correct MIME type and scope
            if (url.pathname === '/sw.js') {
              const swPath = path.resolve(__dirname, 'sw.js');
              if (fs.existsSync(swPath)) {
                res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
                res.setHeader('Service-Worker-Allowed', '/');
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                return res.end(fs.readFileSync(swPath, 'utf-8'));
              }
            }

            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');

            // Backward compatibility fallbacks if legacy nested paths are requested
            if (url.pathname === '/css/style.css') {
              req.url = '/style.css' + url.search;
            } else if (url.pathname === '/js/app.js') {
              req.url = '/app.js' + url.search;
            } else if (url.pathname === '/js/cashier.js') {
              req.url = '/cashier.js' + url.search;
            } else if (url.pathname === '/js/pwa.js') {
              req.url = '/pwa.js' + url.search;
            }

            if (url.pathname === '/cashier' || url.pathname === '/cashier/' || url.pathname.startsWith('/cashier?')) {
              req.url = '/cashier.html' + url.search;
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
      watch: {},
    },
  };
});
