/**
 * Service Worker for Sudoku Solver
 * Strategy: Stale-While-Revalidate
 * - Serve cached version immediately (fast)
 * - Fetch fresh version in background
 * - Update cache for next visit
 */

const CACHE_NAME = 'sudoku-solver-v3';
const ASSETS = [
    '../index.html',
    '../app.js',
    '../solver.js',
    '../brute.js',
    'manifest.json',
    'icon-192.svg',
    'icon-512.svg'
];

/**
 * Install: Pre-cache all assets
 */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

/**
 * Activate: Clean up old caches
 */
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

/**
 * Fetch: Stale-While-Revalidate strategy
 */
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;
    
    // Only handle same-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;
    
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                // Fetch fresh version in background
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    // Update cache with fresh response
                    if (networkResponse.ok) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // Network failed, return nothing (cachedResponse will be used)
                    return null;
                });
                
                // Return cached response immediately, or wait for network
                return cachedResponse || fetchPromise;
            });
        })
    );
});
