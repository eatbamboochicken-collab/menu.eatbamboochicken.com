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
        name: 'bamboo-routes',
        configureServer(server: any) {
          server.middlewares.use((req: any, res: any, next: any) => {
            const url = new URL(req.url || '/', 'http://localhost');
            
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
            if (url.pathname === '/track' || url.pathname === '/track/' || url.pathname.startsWith('/track?')) {
              req.url = '/track.html' + url.search;
              return next();
            }
            if (url.pathname === '/system' || url.pathname === '/system/' || url.pathname.startsWith('/system?')) {
              req.url = '/system.html' + url.search;
              return next();
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
