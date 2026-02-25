const CACHE_NAME = 'kiblat-cache-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// Install event - caching static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
    );

    self.skipWaiting();
});

// Activate event - cleaning up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

// Fetch event - serving cached assets
self.addEventListener('fetch', event => {
    const requestURL = new URL(event.request.url);

// API Strategy (Network First)
if (requestURL.hostname.includes("api.aladhan.com")) {
    event.respondWith(networkFirst(event.request));
    return;
}

// CDN Strategy (Stale While Revalidate)
if (requestURL.hostname.includes("cdn.jsdelivr.net")) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
}

//static strategy (Cache First)
event.respondWith(cacheFirst(event.request));

});


//STRATEGIES
async function cacheFirst(request) {
    const cached = await caches.match(request);
    return cached || fetch(request);
}

async function networkFirst(request) {
    try {
        const fresh = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, fresh.clone());
        return fresh;
    }catch (err) {
        return caches.match(request);
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    const networkFetch = fetch(request)
    .then(response => {
        cache.put(request, response.clone());
        return response;
    })
    return cached || networkFetch;
}