import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import worker from './worker.js';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'bamboo-api-and-routes',
        configureServer(server: any) {
          server.middlewares.use(async (req: any, res: any, next: any) => {
            const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
            
            // Rewrite html routes
            if (url.pathname === '/admin' || url.pathname === '/admin/' || url.pathname.startsWith('/admin?')) {
              req.url = '/admin.html' + url.search;
              return next();
            }
            if (url.pathname === '/cashier' || url.pathname === '/cashier/' || url.pathname.startsWith('/cashier?')) {
              req.url = '/cashier.html' + url.search;
              return next();
            }
            if (url.pathname === '/rider' || url.pathname === '/rider/' || url.pathname.startsWith('/rider?')) {
              req.url = '/rider.html' + url.search;
              return next();
            }
            if (url.pathname === '/kitchen' || url.pathname === '/kitchen/' || url.pathname.startsWith('/kitchen?')) {
              req.url = '/kitchen.html' + url.search;
              return next();
            }
            if (url.pathname === '/track' || url.pathname === '/track/' || url.pathname.startsWith('/track?')) {
              req.url = '/track.html' + url.search;
              return next();
            }
            if (url.pathname === '/system' || url.pathname === '/system/' || url.pathname.startsWith('/system?')) {
              req.url = '/system.html' + url.search;
              return next();
            }

            // Intercept API routes and serve via worker.js
            const apiRoutes = ['/orders', '/riders', '/rider-location', '/assign-rider', '/saved-locations', '/tracking', '/audit-logs', '/inventory', '/suppliers', '/reports', '/analytics', '/system-health', '/system/health'];
            const isApi = apiRoutes.some(route => url.pathname === route || url.pathname.startsWith(route + '/'));

            if (isApi) {
              try {
                let body = null;
                if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
                  const buffers = [];
                  for await (const chunk of req) {
                    buffers.push(chunk);
                  }
                  const rawBody = Buffer.concat(buffers).toString('utf-8');
                  body = rawBody ? rawBody : null;
                }

                const workerReq = new Request(url.href, {
                  method: req.method,
                  headers: req.headers,
                  body: body
                });

                const workerRes = await worker.fetch(workerReq, {});
                
                res.statusCode = workerRes.status;
                workerRes.headers.forEach((val, key) => {
                  res.setHeader(key, val);
                });

                const resText = await workerRes.text();
                res.end(resText);
                return;
              } catch (err: any) {
                console.error('Vite API Middleware error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message || 'Internal API Error' }));
                return;
              }
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
          admin: path.resolve(__dirname, 'admin.html'),
          cashier: path.resolve(__dirname, 'cashier.html'),
          kitchen: path.resolve(__dirname, 'kitchen.html'),
          rider: path.resolve(__dirname, 'rider.html'),
          track: path.resolve(__dirname, 'track.html'),
          system: path.resolve(__dirname, 'system.html'),
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
