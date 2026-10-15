// AyoBantu Service Worker v2
// Advanced caching with Workbox strategies

// Cache names
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `ayobantu-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `ayobantu-dynamic-${CACHE_VERSION}`;
const PAGES_CACHE = `ayobantu-pages-${CACHE_VERSION}`;

const OFFLINE_URL = '/offline';

// Cache expiry times (in seconds)
const CACHE_EXPIRY = {
  pages: 7 * 24 * 60 * 60, // 7 days
  static: 30 * 24 * 60 * 60, // 30 days
  api: 5 * 60, // 5 minutes
};

// Install event: cache offline essentials
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching offline page and core assets');
      return cache.addAll([
        '/',
        '/offline',
        '/manifest.json',
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event: cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => 
            name.startsWith('ayobantu-') && 
            name !== STATIC_CACHE && 
            name !== DYNAMIC_CACHE && 
            name !== PAGES_CACHE
          )
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: routing with different strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip admin routes (always online, auth-sensitive)
  if (url.pathname.startsWith('/admin')) {
    return;
  }

  // Skip API routes except safe reads (donations need fresh data)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Navigation requests (page loads)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Static assets (images, fonts, icons)
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Other requests: network-first with cache fallback
  event.respondWith(handleDynamicRequest(request));
});

// Handle navigation with stale-while-revalidate
async function handleNavigation(request) {
  const url = new URL(request.url);

  // Kampanye pages: stale-while-revalidate
  if (url.pathname === '/kampanye' || url.pathname.startsWith('/kampanye/')) {
    return staleWhileRevalidate(request, PAGES_CACHE);
  }

  // Lacak pages: network-first (prefer fresh)
  if (url.pathname.startsWith('/lacak/')) {
    return networkFirst(request, PAGES_CACHE);
  }

  // Other pages: network-first with offline fallback
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch {
    // Network failed, try cache
    const cached = await caches.match(request);
    if (cached) return cached;

    // Show offline page for navigation failures
    return caches.match(OFFLINE_URL);
  }
}

// Stale-while-revalidate: serve cache immediately, update in background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Fetch fresh version in background
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  // Return cached version immediately, or wait for network
  return cached || fetchPromise.catch(() => caches.match(OFFLINE_URL));
}

// Network-first: try network, fallback to cache
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match(OFFLINE_URL);
  }
}

// Handle static assets with cache-first
async function handleStaticAsset(request) {
  const cached = await caches.match(request);
  
  if (cached) {
    // Check if cache is expired
    const cacheTime = await getCacheTime(request);
    const now = Date.now();
    
    if (cacheTime && (now - cacheTime) < CACHE_EXPIRY.static * 1000) {
      return cached;
    }
  }

  // Fetch fresh version
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
      setCacheTime(request, Date.now());
    }
    
    return response;
  } catch {
    // Network failed, return cached even if expired
    return cached || new Response('Asset not available offline', { status: 503 });
  }
}

// Handle dynamic requests (default network-first)
async function handleDynamicRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Content not available offline', { status: 503 });
  }
}

// Check if request is for static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|ico)$/)
  );
}

// Cache time tracking (simple in-memory store)
const cacheTimeStore = new Map();

function setCacheTime(request, time) {
  cacheTimeStore.set(request.url, time);
}

function getCacheTime(request) {
  return cacheTimeStore.get(request.url);
}

// Message event: handle skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Log SW version on activation
console.log(`[SW] AyoBantu Service Worker ${CACHE_VERSION} activated`);
