/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */

/**
 * Service Worker for Enterprise Blog Platform
 * Handles caching, offline functionality, and background sync
 */

const CACHE_NAME = 'vibrant-insights-v2.0.0';
const STATIC_CACHE = 'static-v2.0.0';
const DYNAMIC_CACHE = 'dynamic-v2.0.0';
const IMAGE_CACHE = 'images-v2.0.0';

// Resources to cache immediately
const STATIC_RESOURCES = [
    '/',
    '/index.html',
    '/pages/about.html',
    '/pages/contact.html',
    '/css/main.css',
    '/css/components.css',
    '/css/responsive.css',
    '/js/main-enterprise.js',
    '/js/blog-enterprise.js',
    '/js/components-enterprise.js',
    '/js/analytics.js',
    '/js/pwa.js',
    '/data/posts.json',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    '/assets/icons/favicon.svg',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Resources to cache on demand (reserved for future use)
// const DYNAMIC_RESOURCES = [
//     '/pages/blog.html'
// ];

// Maximum age for cached resources (in milliseconds)
const CACHE_MAX_AGE = {
    static: 7 * 24 * 60 * 60 * 1000, // 7 days
    dynamic: 24 * 60 * 60 * 1000,    // 1 day
    images: 30 * 24 * 60 * 60 * 1000  // 30 days
};

// Install event - cache static resources
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Service Worker: Caching static resources');
                return cache.addAll(STATIC_RESOURCES);
            }),
            caches.open(DYNAMIC_CACHE),
            caches.open(IMAGE_CACHE)
        ]).then(() => {
            console.log('Service Worker: Installation complete');
            // Force activation of new service worker
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old caches
                    if (cacheName !== STATIC_CACHE && 
                        cacheName !== DYNAMIC_CACHE && 
                        cacheName !== IMAGE_CACHE) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                    return Promise.resolve();
                })
            );
        }).then(() => {
            console.log('Service Worker: Activation complete');
            // Take control of all pages immediately
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached resources with network fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests (except for fonts and CDN resources)
    if (url.origin !== location.origin && !isCDNResource(url)) {
        return;
    }
    
    event.respondWith(
        handleFetchRequest(request)
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered');
    
    if (event.tag === 'background-sync') {
        event.waitUntil(handleBackgroundSync());
    }
});

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New content available',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Content',
                icon: '/assets/icons/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/icons/xmark.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Vibrant Insights', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            self.clients.openWindow('/')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received:', event.data);
    
    switch (event.data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
            
        case 'UPDATE_CACHE':
            updateCache(event.data.resources).then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
            
        default:
            console.log('Unknown message type:', event.data.type);
            break;
    }
});

// Main fetch handler with caching strategies
async function handleFetchRequest(request) {
    const url = new URL(request.url);
    
    try {
        // Strategy 1: Cache First (for static assets)
        if (isStaticResource(url)) {
            return await cacheFirst(request, STATIC_CACHE);
        }
        
        // Strategy 2: Network First (for API calls and dynamic content)
        if (isAPIRequest(url) || isDynamicContent(url)) {
            return await networkFirst(request, DYNAMIC_CACHE);
        }
        
        // Strategy 3: Stale While Revalidate (for images)
        if (isImageRequest(url)) {
            return await staleWhileRevalidate(request, IMAGE_CACHE);
        }
        
        // Strategy 4: Network First with offline fallback (for pages)
        return await networkFirstWithOfflineFallback(request);
        
    } catch (error) {
        console.error('Service Worker: Fetch error:', error);
        return await getOfflineFallback(request);
    }
}

// Cache First strategy
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached && !isExpired(cached)) {
        return cached;
    }
    
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            const responseClone = response.clone();
            cache.put(request, responseClone);
        }
        
        return response;
    } catch (error) {
        if (cached) {
            return cached; // Return stale cache if network fails
        }
        throw error;
    }
}

// Network First strategy
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            const responseClone = response.clone();
            cache.put(request, responseClone);
        }
        
        return response;
    } catch (error) {
        const cached = await cache.match(request);
        
        if (cached) {
            return cached;
        }
        
        throw error;
    }
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    // Always try to fetch in background
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            const responseClone = response.clone();
            cache.put(request, responseClone);
        }
        return response;
    }).catch(() => {
        // Network failed, but we might have cache
        return null;
    });
    
    // Return cache immediately if available
    if (cached) {
        return cached;
    }
    
    // Wait for network if no cache
    return await fetchPromise || getOfflineFallback(request);
}

// Network First with Offline Fallback
async function networkFirstWithOfflineFallback(request) {
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            const responseClone = response.clone();
            cache.put(request, responseClone);
        }
        
        return response;
    } catch (error) {
        // Try cache
        const cache = await caches.open(DYNAMIC_CACHE);
        const cached = await cache.match(request);
        
        if (cached) {
            return cached;
        }
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return await getOfflinePage();
        }
        
        throw error;
    }
}

// Background sync handler
async function handleBackgroundSync() {
    try {
        // Get queued requests from IndexedDB or localStorage
        const queuedRequests = await getQueuedRequests();
        
        const results = await Promise.allSettled(
            queuedRequests.map(queuedRequest => 
                fetch(queuedRequest.url, queuedRequest.options)
            )
        );
        
        // Process results and clean up successful requests
        const successful = results.filter(result => result.status === 'fulfilled');
        const failed = results.filter(result => result.status === 'rejected');
        
        if (successful.length > 0) {
            await clearSuccessfulRequests(successful);
            
            // Notify main thread
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'BACKGROUND_SYNC',
                    successful: successful.length,
                    failed: failed.length
                });
            });
        }
        
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Offline fallback handlers
async function getOfflineFallback(request) {
    const url = new URL(request.url);
    
    if (request.mode === 'navigate') {
        return await getOfflinePage();
    }
    
    if (isImageRequest(url)) {
        return await getOfflineImage();
    }
    
    return new Response('Offline', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
    });
}

async function getOfflinePage() {
    const cache = await caches.open(STATIC_CACHE);
    
    // Try to get cached offline page
    let offlinePage = await cache.match('/offline.html');
    
    if (!offlinePage) {
        // Create basic offline page
        const offlineHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Offline - Vibrant Insights</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        text-align: center;
                    }
                    h1 { margin-bottom: 1rem; }
                    p { margin-bottom: 2rem; opacity: 0.9; }
                    .offline-icon { font-size: 4rem; margin-bottom: 2rem; }
                    .retry-btn {
                        padding: 12px 24px;
                        background: rgba(255,255,255,0.2);
                        border: 2px solid rgba(255,255,255,0.3);
                        border-radius: 8px;
                        color: white;
                        text-decoration: none;
                        font-weight: 500;
                        transition: all 0.3s ease;
                    }
                    .retry-btn:hover {
                        background: rgba(255,255,255,0.3);
                        transform: translateY(-2px);
                    }
                </style>
            </head>
            <body>
                <div class="offline-icon">📡</div>
                <h1>You're Offline</h1>
                <p>Please check your internet connection and try again.</p>
                <a href="javascript:window.location.reload()" class="retry-btn">Try Again</a>
            </body>
            </html>
        `;
        
        offlinePage = new Response(offlineHTML, {
            headers: { 'Content-Type': 'text/html' }
        });
        
        // Cache the offline page
        cache.put('/offline.html', offlinePage.clone());
    }
    
    return offlinePage;
}

async function getOfflineImage() {
    // Return a simple SVG placeholder
    const svg = `
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f0f0f0"/>
            <text x="50%" y="50%" text-anchor="middle" dy="0.3em" 
                  font-family="Arial, sans-serif" font-size="18" fill="#999">
                Image unavailable offline
            </text>
        </svg>
    `;
    
    return new Response(svg, {
        headers: { 'Content-Type': 'image/svg+xml' }
    });
}

// Utility functions
function isStaticResource(url) {
    return url.pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/) ||
           STATIC_RESOURCES.some(resource => url.pathname === resource);
}

function isAPIRequest(url) {
    return url.pathname.startsWith('/api/') || 
           url.pathname.endsWith('.json');
}

function isDynamicContent(url) {
    return url.pathname.startsWith('/pages/') ||
           url.searchParams.has('id') ||
           url.searchParams.has('category');
}

function isImageRequest(url) {
    return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/);
}

function isCDNResource(url) {
    const cdnDomains = [
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'cdnjs.cloudflare.com',
        'images.unsplash.com'
    ];
    
    return cdnDomains.some(domain => url.hostname.includes(domain));
}

function isExpired(response) {
    const cachedDate = response.headers.get('date');
    if (!cachedDate) return false;
    
    const cacheAge = Date.now() - new Date(cachedDate).getTime();
    const maxAge = CACHE_MAX_AGE.static; // Default to static cache max age
    
    return cacheAge > maxAge;
}

async function getQueuedRequests() {
    // This would typically use IndexedDB
    // For now, return empty array
    return [];
}

async function clearSuccessfulRequests(successful) {
    // Implementation for clearing successful requests
    console.log('Cleared', successful.length, 'successful requests');
}

async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
}

async function updateCache(resources) {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(resources);
}

// Log service worker events
console.log('Service Worker: Script loaded');