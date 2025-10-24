const CACHE_NAME = 'kohsel-english-v6'; // Incremented cache version
const URLS_TO_CACHE = [
  // HTML Pages (relative paths)
  'login.html',
  'index.html',
  'lessons.html',
  'videos.html',
  'tools.html',
  'dashboard.html', 

  // Assets (relative paths)
  'css/styles.css',
  'js/app.js',
  'js/firebase-init.js',
  'js/login-logic.js',
  'js/protect.js',
  'js/quiz-logic.js',
  'js/dashboard-logic.js', 
  'manifest.json',
  'images/logo.png',
  'images/icon-192.png',
  'images/icon-512.png',
  
  // Firebase CDN (full paths - crucial to keep these absolute)
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'
];

// Install the service worker and cache assets
self.addEventListener('install', event => {
  console.log(`[SW ${CACHE_NAME}] Installing...`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log(`[SW ${CACHE_NAME}] Caching initial assets:`, URLS_TO_CACHE);
        // Use addAll for atomic caching. If one fails, none are cached.
        return cache.addAll(URLS_TO_CACHE); 
      })
      .then(() => {
         console.log(`[SW ${CACHE_NAME}] Installation complete. Skipping waiting.`);
         // Force the waiting service worker to become the active service worker.
         return self.skipWaiting(); 
      })
      .catch(err => {
        console.error(`[SW ${CACHE_NAME}] Failed to cache initial assets: `, err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
   console.log(`[SW ${CACHE_NAME}] Activating...`);
   // Ensure the new service worker takes control immediately
   event.waitUntil(clients.claim()); 

   // Clean up old caches
   event.waitUntil(
      caches.keys().then(cacheNames => {
         return Promise.all(
            cacheNames.map(cacheName => {
               if (cacheName !== CACHE_NAME) { // Delete any cache NOT matching the current version
                  console.log(`[SW ${CACHE_NAME}] Deleting old cache: ${cacheName}`);
                  return caches.delete(cacheName);
               }
            })
         );
      }).then(() => {
         console.log(`[SW ${CACHE_NAME}] Activation complete.`);
      })
   );
});


// Fetch event - serve from cache first, then network
self.addEventListener('fetch', event => {
   // Skip non-GET requests
   if (event.request.method !== 'GET') {
      return;
   }

   // Strategy: Cache First, then Network
   event.respondWith(
      caches.match(event.request)
         .then(cachedResponse => {
            if (cachedResponse) {
               // Cache hit - return response
               // console.log(`[SW ${CACHE_NAME}] Serving from cache: ${event.request.url}`);
               return cachedResponse;
            }

            // Not in cache - fetch from network
            // console.log(`[SW ${CACHE_NAME}] Fetching from network: ${event.request.url}`);
            return fetch(event.request).then(
               networkResponse => {
                  // Check if we received a valid response
                  if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                     // Don't cache invalid responses (e.g., Chrome extensions, errors)
                     return networkResponse;
                  }

                  // IMPORTANT: Clone the response. A response is a stream
                  // and because we want the browser to consume the response
                  // as well as the cache consuming the response, we need
                  // to clone it so we have two streams.
                  const responseToCache = networkResponse.clone();

                  caches.open(CACHE_NAME)
                     .then(cache => {
                        // console.log(`[SW ${CACHE_NAME}] Caching new resource: ${event.request.url}`);
                        cache.put(event.request, responseToCache);
                     });

                  return networkResponse;
               }
            ).catch(error => {
               console.error(`[SW ${CACHE_NAME}] Fetch failed for ${event.request.url}:`, error);
               // Optional: Return an offline fallback page here if appropriate
               // return caches.match('/offline.html'); 
            });
         })
   );
});

