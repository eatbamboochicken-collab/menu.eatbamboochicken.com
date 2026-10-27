/**
 * Bamboo Chicken - Production Progressive Web App Service Worker
 * Scope: /
 * Strict API and Order Safety: Never caches live orders, payments, GPS or Cloudflare Workers APIs.
 */

const CACHE_NAME = 'bamboo-chicken-shell-v1.1.1';

// Essential static application shell to precache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/pwa.js',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32.png',
  '/images/ecocash-logo.png',
  '/vendor/leaflet/leaflet.css',
  '/vendor/leaflet/leaflet.js'
];

// Domains and endpoints that must NEVER be cached by the service worker
const BYPASS_URL_PATTERNS = [
  /\/api\//i,
  /workers\.dev/i,
  /bamboo-orders/i,
  /shopystreet/i,
  /router\.project-osrm\.org/i,
  /wa\.me/i,
  /whatsapp\.com/i,
  /maps\.google\.com/i,
  /nominatim\.openstreetmap\.org/i
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Precache assets resiliently
      for (const asset of PRECACHE_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('[PWA SW] Precache non-critical item failed:', asset, err);
        }
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Purge obsolete caches
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME && key.startsWith('bamboo-')) {
              console.log('[PWA SW] Deleting obsolete cache:', key);
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 1. Never intercept non-GET requests (Order submissions, Cashier updates, POST/PUT/DELETE)
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // 2. CRITICAL API & ORDER SAFETY: Bypass all Cloudflare Workers, APIs, live order status, and GPS telemetry
  const shouldBypass = BYPASS_URL_PATTERNS.some((pattern) => pattern.test(request.url));
  if (shouldBypass) {
    return;
  }

  // 3. Navigation requests (HTML documents) - Network First with Cache Fallback
  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback to cached app shell
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const fallbackShell = await caches.match('/');
          if (fallbackShell) return fallbackShell;
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 4. Same-origin static assets (CSS, JS, Icons, Local Leaflet vendor) - Stale-While-Revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Network failure is fine if cached
            return null;
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 5. Default: Network with graceful fallback
  event.respondWith(
    fetch(request).catch(async () => {
      const match = await caches.match(request);
      if (match) return match;
      return new Response('Network unavailable', { status: 503, statusText: 'Service Unavailable' });
    })
  );
});

// Allow application code to trigger immediate activation
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
