const CACHE_NAME = 'kohsel-esl-cache-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/login.html',
  '/dashboard.html',
  '/lessons.html',
  '/tools.html',
  '/videos.html',
  '/css/style.css',
  '/js/app.js',
  '/js/firebase-init.js',
  '/js/login-logic.js',
  '/js/protect.js',
  '/js/quiz-logic.js',
  '/dashboard-logic.js',
  '/images/logo.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/manifest.json',
  
  // Lesson PDFs (add all of them)
  '/lessons/Lesson 1_ Introduction and The Elevator Pitch (fixed).pdf',
  '/lessons/Lesson 2_ Short Vowel Sounds.pdf',
  '/lessons/Lesson 3_ Long Vowel Sounds.pdf',
  '/lessons/Lesson 4_ Consonant Sounds and Blends.pdf',
  '/lessons/Lesson 5_ More Consonant Sounds and Blends.pdf',
  '/lessons/Lesson 6_ Correcting Consonant Sounds.pdf',
  '/lessons/Lesson 7_ Diphthongs and Advanced Vowels.pdf',
  '/lessons/Lesson 8_ The _ED_ and _S_ Endings.pdf',
  '/lessons/Lesson 9_ Final Consonant Sounds.pdf',
  '/lessons/Lesson 10_ Linking Words and Sentences.pdf',
  '/lessons/Lesson 11_ Word and Sentence Stress.pdf',
  '/lessons/Lesson 12_ Unit 1 Review and Assessment.pdf',
  '/lessons/Lesson 13_ Polite Greetings and Introductions.pdf',
  '/lessons/Lesson 14_ Giving and Receiving Information.pdf',
  '/lessons/Lesson 15_ The Elevator Pitch (Part 1).pdf',
  '/lessons/Lesson 16_ The Elevator Pitch (Part 2).pdf',
  '/lessons/Lesson 18_ Professional Email Communication.pdf',
  '/lessons/Lesson 19_ Case Study 1.pdf'
  // Add all other lesson PDFs here
];

// Install event: precache all main assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache. Caching files...');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
      .catch(err => {
        console.error('Failed to cache files:', err);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('kohsel-esl-cache-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: serve from cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit - return response
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(err => {
          console.error('Fetch failed:', err);
          // You could return a fallback offline page here if you want
        });
      })
  );
});
