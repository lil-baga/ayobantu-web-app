// AyoBantu Service Worker
// Basic offline support with network-first strategy

const CACHE_NAME = 'ayobantu-v1';
const OFFLINE_URL = '/offline';
const CACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
];

// Install event: cache offline essentials
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching offline page and essentials');
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event: cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim(); // Take control immediately
});

// Fetch event: network-first with offline fallback
self.addEventListener('fetch', (event) => {
  // Only handle navigation requests (page loads)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Network failed, serve offline page
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // For other requests (assets, API), try network first, then cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response to cache it
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});

// Message event: handle skip waiting command from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
