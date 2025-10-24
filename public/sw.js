const CACHE_NAME = 'kohsel-english-v4'; // Incremented cache version
const URLS_TO_CACHE = [
  '/',
  '/login.html',
  '/index.html',
  '/lessons.html',
  '/videos.html',
  '/tools.html',
  '/css/styles.css',
  '/js/app.js',
  // REMOVED old auth/protect
  // ADDED new firebase scripts
  '/js/firebase-init.js',
  '/js/login-logic.js',
  '/js/protect.js',
  '/js/quiz-logic.js',
  '/manifest.json',
  '/images/logo.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
  // ADDED Firebase CDN scripts to cache
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'
];

// Install the service worker and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(err => {
        console.error('Failed to open cache: ', err);
      })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        // Important: Cache Firebase CDN requests if they're not already cached
        if (event.request.url.startsWith('https://www.gstatic.com/')) {
          return fetch(event.request).then(networkResponse => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          });
        }
        return fetch(event.request);
      }
    )
  );
});

// Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

