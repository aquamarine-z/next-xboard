// ==============================================================================
// Aqua VPS - High-Performance Service Worker (PWA Instant Launch Engine)
// Cache Version: v1-next-xboard
// ==============================================================================

const CACHE_VERSION = 'v1-next-xboard';
const STATIC_CACHE_NAME = `static-${CACHE_VERSION}`;
const PAGES_CACHE_NAME = `pages-${CACHE_VERSION}`;

// Pre-cached critical assets for instant cold start
const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/favicon.svg',
];

// 1. Install Event: Precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache asset fetch warning:', err);
      });
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// 2. Activate Event: Clean up legacy caches & take immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== PAGES_CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. Fetch Event: Multi-tiered caching strategy
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Bypass API and dynamic authentication routes (must always be live)
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/auth/')) {
    return;
  }

  // A. Static Assets (Scripts, CSS, Fonts, Images, Icons) -> Stale-While-Revalidate
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg');

  if (isStaticAsset) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        // Fetch in background to revalidate cache
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        // Return instant cached response if available, else await network
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // B. HTML Navigation Requests -> Network First with Cache Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(PAGES_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline or network timeout, fallback to cached page
          const cache = await caches.open(PAGES_CACHE_NAME);
          const cachedPage = await cache.match(request);
          if (cachedPage) {
            return cachedPage;
          }
          // Fallback to cached root
          const staticCache = await caches.open(STATIC_CACHE_NAME);
          const rootFallback = await staticCache.match('/');
          if (rootFallback) {
            return rootFallback;
          }
          return new Response('Offline - Please reconnect to the internet.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        })
    );
    return;
  }
});
