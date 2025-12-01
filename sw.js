
const CACHE_NAME = 'jp-kirana-offline-v1';

// Precache the entry point
const PRECACHE_URLS = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Exclude Firebase API and GenAI API endpoints from caching to prevent stale data logic interference
  // Firestore handles its own persistence via SDK.
  if (url.hostname.includes('googleapis.com') || 
      url.hostname.includes('firebaseio.com') || 
      url.hostname.includes('firebase.com')) {
    return;
  }

  // Network First, Fallback to Cache Strategy
  // We try to fetch from the network to ensure the user gets the latest version of the app.
  // If the network fails (offline), we serve the cached asset.
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Check if we received a valid response
        // Note: Basic type is for same-origin, Cors is for valid cross-origin (CDN)
        if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
          return networkResponse;
        }

        // Clone the response because it can only be consumed once
        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      })
      .catch(() => {
        // Network failed, try to serve from cache
        return caches.match(event.request);
      })
  );
});
