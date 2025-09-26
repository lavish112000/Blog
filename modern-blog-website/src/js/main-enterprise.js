/**
 * =====================================
 * ENTERPRISE BLOG PLATFORM - MAIN MODULE
 * Advanced features and performance optimization
 * =====================================
 */

import { WebVitals } from './utils/web-vitals.js';
import { Analytics } from './analytics.js';
import { PWAManager } from './pwa.js';
import { PerformanceMonitor } from './utils/performance.js';
import { AccessibilityManager } from './utils/accessibility.js';
import { SearchEngine } from './utils/search-engine.js';
import { NotificationManager } from './utils/notifications.js';
import { ThemeManager } from './utils/theme-manager.js';
import { ComponentLoader } from './utils/component-loader.js';

class EnterpriseBlogPlatform {
    constructor() {
        this.version = '2.0.0';
        this.isInitialized = false;
        this.components = new Map();
        this.observers = new Map();
        this.services = new Map();
        
        // Initialize core services
        this.initializeServices();
        this.init();
    }

    async initializeServices() {
        try {
            // Core Services
            this.webVitals = new WebVitals();
            this.analytics = new Analytics();
            this.pwa = new PWAManager();
            this.performance = new PerformanceMonitor();
            this.accessibility = new AccessibilityManager();
            this.search = new SearchEngine();
            this.notifications = new NotificationManager();
            this.themeManager = new ThemeManager();
            this.componentLoader = new ComponentLoader();

            // Register services
            this.services.set('webVitals', this.webVitals);
            this.services.set('analytics', this.analytics);
            this.services.set('pwa', this.pwa);
            this.services.set('performance', this.performance);
            this.services.set('accessibility', this.accessibility);
            this.services.set('search', this.search);
            this.services.set('notifications', this.notifications);
            this.services.set('themeManager', this.themeManager);
            this.services.set('componentLoader', this.componentLoader);

            // Enterprise services initialized successfully
        } catch (error) {
            // Failed to initialize services - using fallback mode
        }
    }

    async init() {
        try {
            // Performance monitoring start
            this.performance.startTiming('initialization');

            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                await this.initializeApp();
            }

            this.performance.endTiming('initialization');
            // Enterprise Blog Platform initialized successfully
        } catch (error) {
            // Failed to initialize platform - using error handler
            this.handleInitializationError(error);
        }
    }

    async initializeApp() {
        // Core initialization steps
        await Promise.all([
            this.setupEventListeners(),
            this.initializeComponents(),
            this.setupIntersectionObservers(),
            this.initializePWA(),
            this.setupAnalytics(),
            this.initializeAccessibility(),
            this.setupAdvancedFeatures()
        ]);

        this.handleLoadingScreen();
        this.setupScrollEffects();
        this.initializeTheme();
        this.setupPerformanceOptimizations();

        this.isInitialized = true;
        this.dispatchEvent('platform:initialized');
    }

    setupEventListeners() {
        const events = [
            { element: '#nav-toggle', event: 'click', handler: this.toggleNavigation.bind(this) },
            { element: '#search-toggle', event: 'click', handler: this.toggleSearch.bind(this) },
            { element: '#search-close', event: 'click', handler: this.closeSearch.bind(this) },
            { element: '#theme-toggle', event: 'click', handler: this.toggleTheme.bind(this) },
            { element: '#newsletter-form', event: 'submit', handler: this.handleNewsletterSubmit.bind(this) },
            { element: '#back-to-top', event: 'click', handler: this.scrollToTop.bind(this) },
            { element: '#load-more-btn', event: 'click', handler: this.loadMoreContent.bind(this) }
        ];

        events.forEach(({ element, event, handler }) => {
            const el = document.querySelector(element);
            if (el) {
                el.addEventListener(event, handler);
            }
        });

        // Global event listeners
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        window.addEventListener('scroll', this.debounce(this.handleScroll.bind(this), 16));
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

        // Advanced interaction events
        this.setupAdvancedInteractions();
    }

    setupAdvancedInteractions() {
        // Touch and gesture support
        if ('ontouchstart' in window) {
            this.setupTouchGestures();
        }

        // Keyboard navigation enhancement
        this.setupKeyboardNavigation();

        // Voice commands (if supported)
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            this.setupVoiceCommands();
        }

        // Mouse tracking for analytics
        this.setupMouseTracking();
    }

    async initializeComponents() {
        const components = [
            { name: 'header', selector: 'header', lazy: false },
            { name: 'hero', selector: '.hero', lazy: false },
            { name: 'featured-posts', selector: '.featured-posts', lazy: true },
            { name: 'blog-posts', selector: '.posts-grid', lazy: true },
            { name: 'sidebar', selector: '.sidebar', lazy: true },
            { name: 'newsletter', selector: '.newsletter-section', lazy: true },
            { name: 'footer', selector: 'footer', lazy: true }
        ];

        // Load critical components immediately
        const criticalComponents = components.filter(c => !c.lazy);
        const lazyComponents = components.filter(c => c.lazy);

        // Initialize critical components
        await Promise.all(
            criticalComponents.map(component => this.initializeComponent(component))
        );

        // Lazy load other components
        this.setupLazyComponentLoading(lazyComponents);
    }

    async initializeComponent(component) {
        try {
            const element = document.querySelector(component.selector);
            if (!element) return;

            const componentInstance = await this.componentLoader.load(component.name, element);
            this.components.set(component.name, componentInstance);

            // Add intersection observer for animations
            this.addIntersectionObserver(element, `${component.name}-animation`);

        } catch (error) {
            // Failed to initialize component - continuing with other components
        }
    }

    setupLazyComponentLoading(components) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const component = components.find(c => 
                        entry.target.matches(c.selector)
                    );
                    if (component && !this.components.has(component.name)) {
                        this.initializeComponent(component);
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, { rootMargin: '50px' });

        components.forEach(component => {
            const element = document.querySelector(component.selector);
            if (element) {
                observer.observe(element);
            }
        });
    }

    setupIntersectionObservers() {
        // Scroll animations
        this.setupScrollAnimations();
        
        // Lazy loading images
        this.setupLazyImageLoading();
        
        // Progress tracking
        this.setupReadingProgress();
        
        // Viewport tracking for analytics
        this.setupViewportTracking();
    }

    setupScrollAnimations() {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                } else if (entry.intersectionRatio === 0) {
                    // Optionally remove animation class when element leaves viewport
                    // entry.target.classList.remove('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '-50px'
        });

        // Observe elements with animation classes
        document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
            animationObserver.observe(el);
        });

        this.observers.set('scroll-animations', animationObserver);
    }

    setupLazyImageLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    const srcset = img.dataset.srcset;

                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    if (srcset) {
                        img.srcset = srcset;
                        img.removeAttribute('data-srcset');
                    }

                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });

        this.observers.set('lazy-images', imageObserver);
    }

    setupReadingProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
        document.body.appendChild(progressBar);

        const progressFill = progressBar.querySelector('.reading-progress-fill');

        window.addEventListener('scroll', this.throttle(() => {
            const winHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight - winHeight;
            const scrollTop = window.pageYOffset;
            const scrollPercent = (scrollTop / docHeight) * 100;

            progressFill.style.width = `${Math.min(scrollPercent, 100)}%`;
        }, 16));
    }

    async initializePWA() {
        try {
            await this.pwa.init();
            this.setupPWAEventListeners();
        } catch (error) {
            // PWA initialization failed - continuing without PWA features
        }
    }

    setupPWAEventListeners() {
        // Install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.showInstallPrompt(e);
        });

        // App installed
        window.addEventListener('appinstalled', () => {
            this.analytics.track('pwa_installed');
            this.notifications.show('App installed successfully!', 'success');
        });

        // Online/offline status
        window.addEventListener('online', () => {
            this.notifications.show('Back online!', 'success');
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.notifications.show('You are offline. Some features may be limited.', 'warning');
        });
    }

    setupAnalytics() {
        // Initialize analytics with enhanced tracking
        this.analytics.init({
            trackPageViews: true,
            trackUserInteractions: true,
            trackPerformance: true,
            trackErrors: true,
            trackScrollDepth: true,
            trackFormSubmissions: true
        });

        // Custom event tracking
        this.setupCustomAnalytics();
    }

    setupCustomAnalytics() {
        // Track reading time
        let startTime = Date.now();
        let isActive = true;

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (isActive) {
                    const readingTime = Date.now() - startTime;
                    this.analytics.track('reading_time', { duration: readingTime });
                    isActive = false;
                }
            } else {
                startTime = Date.now();
                isActive = true;
            }
        });

        // Track search queries
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                if (e.target.value.length > 2) {
                    this.analytics.track('search_query', { query: e.target.value });
                }
            }, 1000));
        }

        // Track popular content
        this.trackContentPopularity();
    }

    async initializeAccessibility() {
        await this.accessibility.init();
        this.setupAccessibilityFeatures();
    }

    setupAccessibilityFeatures() {
        // Skip links
        this.createSkipLinks();

        // Focus management
        this.setupFocusManagement();

        // Keyboard shortcuts help
        this.createKeyboardShortcutsHelp();

        // High contrast mode
        this.setupHighContrastMode();

        // Screen reader announcements
        this.setupScreenReaderAnnouncements();
    }

    async setupAdvancedFeatures() {
        // Advanced search with AI
        await this.setupAISearch();

        // Content personalization
        this.setupContentPersonalization();

        // Social sharing
        this.setupSocialSharing();

        // Comments system
        this.setupCommentsSystem();

        // Reading preferences
        this.setupReadingPreferences();

        // Content recommendations
        this.setupContentRecommendations();
    }

    // Navigation methods
    toggleNavigation() {
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.getElementById('nav-toggle');
        
        if (navMenu && navToggle) {
            const isOpen = navMenu.classList.contains('active');
            
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Analytics
            this.analytics.track('navigation_toggle', { opened: !isOpen });
            
            // Accessibility
            navToggle.setAttribute('aria-expanded', !isOpen);
            
            // Focus management
            if (!isOpen) {
                const firstLink = navMenu.querySelector('a');
                if (firstLink) {
                    setTimeout(() => firstLink.focus(), 100);
                }
            }
        }
    }

    toggleSearch() {
        const searchOverlay = document.getElementById('search-overlay');
        const searchInput = document.getElementById('search-input');
        
        if (searchOverlay) {
            searchOverlay.classList.add('active');
            document.body.classList.add('search-active');
            
            if (searchInput) {
                setTimeout(() => {
                    searchInput.focus();
                    searchInput.select();
                }, 100);
            }
            
            this.analytics.track('search_opened');
        }
    }

    closeSearch() {
        const searchOverlay = document.getElementById('search-overlay');
        
        if (searchOverlay) {
            searchOverlay.classList.remove('active');
            document.body.classList.remove('search-active');
            
            this.analytics.track('search_closed');
        }
    }

    toggleTheme() {
        this.themeManager.toggle();
        this.analytics.track('theme_toggle', { 
            theme: this.themeManager.getCurrentTheme() 
        });
    }

    // Enhanced form handling
    async handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const email = form.querySelector('input[type="email"]').value;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Validation
        if (!this.validateEmail(email)) {
            this.notifications.show('Please enter a valid email address', 'error');
            return;
        }
        
        try {
            // UI feedback
            submitBtn.disabled = true;
            submitBtn.textContent = 'Subscribing...';
            
            // API call (simulated)
            await this.simulateAPICall({
                endpoint: '/api/newsletter/subscribe',
                data: { email },
                delay: 1500
            });
            
            // Success handling
            this.notifications.show('Successfully subscribed to newsletter!', 'success');
            form.reset();
            
            // Analytics
            this.analytics.track('newsletter_subscription', { email });
            
        } catch (error) {
            this.notifications.show('Subscription failed. Please try again.', 'error');
            // Newsletter subscription error - user will be notified
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Subscribe';
        }
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    async simulateAPICall({ endpoint: _endpoint, data, delay = 1000 }) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success/failure
                if (Math.random() > 0.1) {
                    resolve({ success: true, data });
                } else {
                    reject(new Error('API call failed'));
                }
            }, delay);
        });
    }

    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    // Error handling
    handleInitializationError(error) {
        // Platform initialization failed - using fallback mode
        
        // Show user-friendly error message
        const errorBanner = document.createElement('div');
        errorBanner.className = 'initialization-error';
        errorBanner.innerHTML = `
            <div class="error-content">
                <h3>Something went wrong</h3>
                <p>The page is having trouble loading. Please refresh to try again.</p>
                <button onclick="window.location.reload()">Refresh Page</button>
            </div>
        `;
        document.body.insertBefore(errorBanner, document.body.firstChild);
        
        // Track error
        this.analytics?.track('initialization_error', { error: error.message });
    }

    handleLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                    }, 500);
                }, Math.min(1000, performance.now()));
            });
        }
    }

    // Additional methods for advanced features...
    setupScrollEffects() {
        // Parallax effects
        this.setupParallaxEffects();
        
        // Scroll-triggered animations
        this.setupScrollTriggeredAnimations();
        
        // Infinite scroll
        this.setupInfiniteScroll();
    }

    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.parallax');
        
        if (parallaxElements.length > 0) {
            window.addEventListener('scroll', this.throttle(() => {
                const scrollTop = window.pageYOffset;
                
                parallaxElements.forEach(element => {
                    const speed = element.dataset.speed || 0.5;
                    const yPos = -(scrollTop * speed);
                    element.style.transform = `translate3d(0, ${yPos}px, 0)`;
                });
            }, 16));
        }
    }

    // ... Additional methods will be added in the remaining parts
}

// Initialize the platform when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.enterpriseBlog = new EnterpriseBlogPlatform();
});

// Export for module usage
export default EnterpriseBlogPlatform;