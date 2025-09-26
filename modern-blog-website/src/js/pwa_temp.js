/**
 * Progressive Web App Manager
 * Handles PWA functionality, service worker, offline support
 */

export class PWAManager {
    constructor() {
        this.isSupported = 'serviceWorker' in navigator;
        this.installPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.offlineQueue = [];
        
        this.init();
    }

    async init() {
        if (!this.isSupported) {
            // Service Workers not supported - PWA features disabled
            return;
        }

        try {
            // Register service worker
            await this.registerServiceWorker();
            
            // Setup PWA event listeners
            this.setupEventListeners();
            
            // Check if app is already installed
            this.checkInstallStatus();
            
            // Setup offline functionality
            this.setupOfflineSupport();
            
            // Create install button
            this.createInstallButton();
            
            // PWA Manager initialized successfully
            
        } catch (error) {
            // PWA initialization failed - continuing without PWA features
        }
    }

    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js', {
                scope: './'
            });

            // Handle service worker updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateNotification();
                    }
                });
            });

            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                this.handleServiceWorkerMessage(event.data);
            });

            // Service Worker registered successfully
            return registration;
            
        } catch (error) {
            // Service Worker registration failed
            throw error;
        }
    }

    setupEventListeners() {
        // Install prompt handling
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.installPrompt = e;
            this.showInstallPrompt();
        });

        // App installed
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.hideInstallPrompt();
            this.trackInstallation();
            this.showInstallSuccessMessage();
        });

        // Online/Offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleOnlineStatus();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleOfflineStatus();
        });

        // Page visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isOnline) {
                this.syncOfflineData();
            }
        });
    }

    checkInstallStatus() {
        // Check if running as PWA
        if (window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone ||
            document.referrer.includes('android-app://')) {
            this.isInstalled = true;
            this.handleInstalledState();
        }
    }

    setupOfflineSupport() {
        // Cache critical resources
        this.cacheResources();
        
        // Setup offline page handling
        this.setupOfflinePageHandling();
        
        // Setup background sync
        this.setupBackgroundSync();
    }

    async cacheResources() {
        if (!('caches' in window)) return;

        const criticalResources = [
            './',
            './index.html',
            './css/main.css',
            './css/components.css',
            './css/responsive.css',
            './js/main-enterprise.js',
            './js/blog-enterprise.js',
            './js/components-enterprise.js',
            './data/posts.json',
            './assets/icons/icon-192x192.png',
            './assets/icons/icon-512x512.png'
        ];

        try {
            const cache = await caches.open('blog-v1');
            await cache.addAll(criticalResources);
            // PWA log message removed for production
        } catch (error) {
            // PWA error handling - silent in production
        }
    }

    setupOfflinePageHandling() {
        // Create offline indicator
        const offlineIndicator = document.createElement('div');
        offlineIndicator.id = 'offline-indicator';
        offlineIndicator.className = 'offline-indicator hidden';
        offlineIndicator.innerHTML = `
            <div class="offline-content">
                <i class="fas fa-wifi-slash"></i>
                <span>You're offline</span>
                <div class="offline-queue-count" style="display: none;">
                    <span class="queue-count">0</span> actions queued
                </div>
            </div>
        `;
        document.body.appendChild(offlineIndicator);

        // Handle failed requests
        this.interceptFailedRequests();
    }

    interceptFailedRequests() {
        // Override fetch for offline handling
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                
                if (!response.ok && !this.isOnline) {
                    // Queue request for later
                    this.queueRequest(args);
                }
                
                return response;
            } catch (error) {
                if (!this.isOnline) {
                    this.queueRequest(args);
                    return this.createOfflineResponse(args[0]);
                }
                throw error;
            }
        };
    }

    queueRequest(requestArgs) {
        this.offlineQueue.push({
            args: requestArgs,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        });
        
        this.updateOfflineQueueDisplay();
        this.saveOfflineQueue();
    }

    createOfflineResponse(_url) {
        // Return cached response or offline message
        return new Response(
            JSON.stringify({
                error: 'Offline',
                message: 'This request will be processed when you\'re back online',
                queued: true
            }),
            {
                status: 202,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then((registration) => {
                // Register for background sync
                return registration.sync.register('background-sync');
            }).catch((error) => {
                // PWA error handling - silent in production
            });
        }
    }

    showInstallPrompt() {
        const installButton = document.getElementById('pwa-install-button');
        if (installButton) {
            installButton.style.display = 'block';
            installButton.classList.add('pulse-animation');
        }
    }

    hideInstallPrompt() {
        const installButton = document.getElementById('pwa-install-button');
        if (installButton) {
            installButton.style.display = 'none';
        }
    }

    createInstallButton() {
        // Create install button
        const installButton = document.createElement('button');
        installButton.id = 'pwa-install-button';
        installButton.className = 'pwa-install-button hidden';
        installButton.innerHTML = `
            <i class="fas fa-download"></i>
            <span>Install App</span>
        `;
        
        installButton.addEventListener('click', () => {
            this.promptInstall();
        });

        // Add to page
        document.body.appendChild(installButton);

        // Show if install prompt is available
        if (this.installPrompt) {
            this.showInstallPrompt();
        }
    }

    async promptInstall() {
        if (!this.installPrompt) {
            this.showManualInstallInstructions();
            return;
        }

        try {
            const result = await this.installPrompt.prompt();
            
            if (result.outcome === 'accepted') {
                // PWA log message removed for production
            } else {
                // PWA log message removed for production
            }
            
            this.installPrompt = null;
            
        } catch (error) {
            // PWA error handling - silent in production
        }
    }

    showManualInstallInstructions() {
        const instructions = this.getInstallInstructions();
        
        // Show modal with instructions
        const modal = document.createElement('div');
        modal.className = 'install-instructions-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Install Vibrant Insights</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${instructions}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    getInstallInstructions() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (userAgent.includes('chrome')) {
            return `
                <div class="install-steps">
                    <h4>Chrome (Desktop)</h4>
                    <ol>
                        <li>Click the three dots menu (⋮) in the top right</li>
                        <li>Select "Install Vibrant Insights..."</li>
                        <li>Click "Install" in the popup</li>
                    </ol>
                    
                    <h4>Chrome (Mobile)</h4>
                    <ol>
                        <li>Tap the three dots menu (⋮)</li>
                        <li>Tap "Add to Home screen"</li>
                        <li>Tap "Add" to confirm</li>
                    </ol>
                </div>
            `;
        } else if (userAgent.includes('safari')) {
            return `
                <div class="install-steps">
                    <h4>Safari (iOS)</h4>
                    <ol>
                        <li>Tap the Share button (📤)</li>
                        <li>Scroll down and tap "Add to Home Screen"</li>
                        <li>Tap "Add" to confirm</li>
                    </ol>
                </div>
            `;
        } else {
            return `
                <div class="install-steps">
                    <p>To install this app, look for an "Install" or "Add to Home Screen" option in your browser's menu.</p>
                </div>
            `;
        }
    }

    handleInstalledState() {
        // Hide install button
        this.hideInstallPrompt();
        
        // Add PWA-specific styles
        document.body.classList.add('pwa-installed');
        
        // Enable PWA-specific features
        this.enablePWAFeatures();
    }

    enablePWAFeatures() {
        // Add status bar styling
        const statusBarMeta = document.createElement('meta');
        statusBarMeta.name = 'theme-color';
        statusBarMeta.content = '#667eea';
        document.head.appendChild(statusBarMeta);
        
        // Enable full-screen experience
        if ('fullscreen' in document) {
            document.addEventListener('click', () => {
                if (document.fullscreenElement) return;
                document.documentElement.requestFullscreen?.();
            }, { once: true });
        }
    }

    handleOnlineStatus() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
        
        // Sync offline data
        this.syncOfflineData();
        
        // Show online notification
        this.showNotification('Back online!', 'success');
    }

    handleOfflineStatus() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.classList.remove('hidden');
        }
        
        // Show offline notification
        this.showNotification('You\'re offline. Some features may be limited.', 'warning');
    }

    async syncOfflineData() {
        if (this.offlineQueue.length === 0) return;
        
        const syncPromises = this.offlineQueue.map(async (queuedRequest) => {
            try {
                const response = await fetch(...queuedRequest.args);
                
                if (response.ok) {
                    // Remove from queue
                    this.offlineQueue = this.offlineQueue.filter(
                        item => item.id !== queuedRequest.id
                    );
                    return { success: true, id: queuedRequest.id };
                }
                
                return { success: false, id: queuedRequest.id, error: 'Request failed' };
                
            } catch (error) {
                return { success: false, id: queuedRequest.id, error: error.message };
            }
        });
        
        const results = await Promise.allSettled(syncPromises);
        
        // Update UI
        this.updateOfflineQueueDisplay();
        this.saveOfflineQueue();
        
        // Notify user of sync results
        const successful = results.filter(r => r.value?.success).length;
        const failed = results.length - successful;
        
        if (successful > 0) {
            this.showNotification(`Synced ${successful} queued actions`, 'success');
        }
        
        if (failed > 0) {
            this.showNotification(`${failed} actions failed to sync`, 'error');
        }
    }

    updateOfflineQueueDisplay() {
        const queueCounter = document.querySelector('.offline-queue-count');
        const countElement = document.querySelector('.queue-count');
        
        if (queueCounter && countElement) {
            if (this.offlineQueue.length > 0) {
                countElement.textContent = this.offlineQueue.length;
                queueCounter.style.display = 'block';
            } else {
                queueCounter.style.display = 'none';
            }
        }
    }

    saveOfflineQueue() {
        try {
            localStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
        } catch (error) {
            // PWA warning removed for production
        }
    }

    loadOfflineQueue() {
        try {
            const queue = localStorage.getItem('offlineQueue');
            if (queue) {
                this.offlineQueue = JSON.parse(queue);
                this.updateOfflineQueueDisplay();
            }
        } catch (error) {
            // PWA warning removed for production
        }
    }

    handleServiceWorkerMessage(data) {
        switch (data.type) {
            case 'CACHE_UPDATED':
                this.showNotification('App updated! Refresh to see changes.', 'info');
                break;
                
            case 'OFFLINE_PAGE':
                // PWA log message removed for production
                break;
                
            case 'BACKGROUND_SYNC':
                this.syncOfflineData();
                break;
                
            default:
                // PWA log message removed for production
        }
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-sync-alt"></i>
                <span>A new version is available!</span>
                <button class="update-button">Update Now</button>
                <button class="dismiss-button">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Handle update
        notification.querySelector('.update-button').addEventListener('click', () => {
            window.location.reload();
        });
        
        // Handle dismiss
        notification.querySelector('.dismiss-button').addEventListener('click', () => {
            document.body.removeChild(notification);
        });
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 10000);
    }

    showInstallSuccessMessage() {
        this.showNotification('App installed successfully! 🎉', 'success');
    }

    trackInstallation() {
        if (window.enterpriseBlog?.analytics) {
            window.enterpriseBlog.analytics.track('pwa_installed', {
                platform: this.getPlatform(),
                timestamp: Date.now()
            });
        }
    }

    getPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (userAgent.includes('android')) return 'android';
        if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
        if (userAgent.includes('windows')) return 'windows';
        if (userAgent.includes('mac')) return 'macos';
        if (userAgent.includes('linux')) return 'linux';
        
        return 'unknown';
    }

    showNotification(message, type = 'info') {
        // Use the notification manager if available
        if (window.enterpriseBlog?.notifications) {
            window.enterpriseBlog.notifications.show(message, type);
        } else {
            // PWA log message removed for production
        }
    }

    // Public API
    async install() {
        return this.promptInstall();
    }

    isAppInstalled() {
        return this.isInstalled;
    }

    getOfflineQueueCount() {
        return this.offlineQueue.length;
    }

    clearOfflineQueue() {
        this.offlineQueue = [];
        this.updateOfflineQueueDisplay();
        this.saveOfflineQueue();
    }

    async requestPersistentStorage() {
        if ('storage' in navigator && 'persist' in navigator.storage) {
            const granted = await navigator.storage.persist();
            // PWA log message removed for production
            return granted;
        }
        return false;
    }

    async getStorageUsage() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            return {
                used: estimate.usage,
                available: estimate.quota,
                percentage: Math.round((estimate.usage / estimate.quota) * 100)
            };
        }
        return null;
    }
}
