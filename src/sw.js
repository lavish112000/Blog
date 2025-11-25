const CACHE_NAME = "vibrant-blog-v3";
const STATIC_ASSETS = [
    "/",
    "/index.html",
    "/css/main.css",
    "/css/components.css",
    "/css/responsive.css",
    "/js/main.js",
    "/js/blog.js",
    "/js/components.js",
    "/assets/icons/favicon.svg",
    "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
];

// Install Service Worker
self.addEventListener("install", (event) => {
    self.skipWaiting(); // Force waiting SW to become active
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Activate Service Worker
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Force active SW to control clients
    );
});

// Fetch Strategy
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // Network First for Data/API
    if (url.pathname.includes("/data/") || url.pathname.includes(".json")) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clonedResponse);
                    });
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
    } else {
        // Cache First for Static Assets
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});