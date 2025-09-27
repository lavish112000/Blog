/**
 * Analytics Module
 * Standalone analytics functionality for the blog platform
 */

class Analytics {
    constructor() {
        this.events = [];
        this.pageViews = [];
        this.userSession = {
            startTime: Date.now(),
            pageViews: 0,
            events: 0,
            scrollDepth: 0,
            timeOnPage: 0
        };
        
        this.init();
    }

    init() {
        try {
            this.setupPageTracking();
            this.setupScrollTracking();
            this.setupClickTracking();
            this.setupPerformanceTracking();
            this.setupEngagementTracking();
            
            // Track initial page view
            this.trackPageView();
        } catch (error) {
            console.error('Analytics initialization failed:', error);
        }
    }

    setupPageTracking() {
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('page_hidden', {
                    timeOnPage: Date.now() - this.userSession.startTime
                });
            } else {
                this.trackEvent('page_visible');
            }
        });

        // Track page unload
        window.addEventListener('beforeunload', () => {
            this.trackEvent('page_unload', {
                sessionDuration: Date.now() - this.userSession.startTime,
                totalPageViews: this.userSession.pageViews,
                totalEvents: this.userSession.events
            });
        });
    }

    setupScrollTracking() {
        let maxScrollDepth = 0;
        let scrollTimeout;

        const trackScroll = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);
            
            if (scrollPercent > maxScrollDepth) {
                maxScrollDepth = scrollPercent;
                this.userSession.scrollDepth = maxScrollDepth;

                // Track milestone scroll depths
                if (maxScrollDepth >= 25 && maxScrollDepth < 50) {
                    this.trackEvent('scroll_depth_25');
                } else if (maxScrollDepth >= 50 && maxScrollDepth < 75) {
                    this.trackEvent('scroll_depth_50');
                } else if (maxScrollDepth >= 75 && maxScrollDepth < 100) {
                    this.trackEvent('scroll_depth_75');
                } else if (maxScrollDepth >= 100) {
                    this.trackEvent('scroll_depth_100');
                }
            }
        };

        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(trackScroll, 100);
        }, { passive: true });
    }

    setupClickTracking() {
        document.addEventListener('click', (e) => {
            // Track navigation clicks
            if (e.target.matches('.nav-link')) {
                this.trackEvent('navigation_click', {
                    section: e.target.textContent.trim(),
                    url: e.target.href
                });
            }

            // Track CTA button clicks
            if (e.target.matches('.btn, .button, .cta')) {
                this.trackEvent('cta_click', {
                    text: e.target.textContent.trim(),
                    type: e.target.className
                });
            }

            // Track external links
            if (e.target.matches('a[href^="http"]')) {
                const url = new URL(e.target.href);
                if (url.hostname !== window.location.hostname) {
                    this.trackEvent('external_link_click', {
                        url: e.target.href,
                        text: e.target.textContent.trim()
                    });
                }
            }

            // Track social media clicks
            if (e.target.matches('.share-btn, .social-link')) {
                this.trackEvent('social_share', {
                    platform: e.target.dataset.platform || 'unknown',
                    url: window.location.href
                });
            }

            // Track search interactions
            if (e.target.matches('.search-toggle, .search-btn')) {
                this.trackEvent('search_initiated');
            }

            // Track feature usage
            if (e.target.matches('.theme-toggle')) {
                this.trackEvent('theme_toggle');
            }

            if (e.target.matches('.voice-search-toggle')) {
                this.trackEvent('voice_search_initiated');
            }

            if (e.target.matches('.bookmark-btn, .bookmarks-toggle')) {
                this.trackEvent('bookmark_interaction');
            }
        });
    }

    setupPerformanceTracking() {
        // Track page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    this.trackEvent('page_performance', {
                        loadTime: Math.round(perfData.loadEventEnd - perfData.fetchStart),
                        domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
                        firstByte: Math.round(perfData.responseStart - perfData.fetchStart)
                    });
                }
            }, 0);
        });

        // Track Web Vitals if available
        if ('web-vitals' in window) {
            // This would integrate with the web-vitals library
            this.trackWebVitals();
        }
    }

    setupEngagementTracking() {
        let engagementTimer;
        let isEngaged = false;

        const startEngagement = () => {
            if (!isEngaged) {
                isEngaged = true;
                engagementTimer = setTimeout(() => {
                    this.trackEvent('engaged_user', {
                        timeToEngagement: Date.now() - this.userSession.startTime
                    });
                }, 30000); // 30 seconds
            }
        };

        const resetEngagement = () => {
            if (engagementTimer) {
                clearTimeout(engagementTimer);
                isEngaged = false;
            }
        };

        // Track user interaction events that indicate engagement
        ['click', 'scroll', 'keydown', 'mousemove'].forEach(event => {
            document.addEventListener(event, startEngagement, { once: true, passive: true });
        });

        // Reset on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                resetEngagement();
            }
        });
    }

    trackPageView(page = window.location.pathname) {
        const pageData = {
            page,
            title: document.title,
            url: window.location.href,
            referrer: document.referrer,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`
        };

        this.pageViews.push(pageData);
        this.userSession.pageViews++;

        // Send to analytics service
        this.sendToAnalytics('pageview', pageData);
    }

    trackEvent(eventName, eventData = {}) {
        const event = {
            name: eventName,
            data: eventData,
            timestamp: Date.now(),
            page: window.location.pathname,
            sessionId: this.getSessionId()
        };

        this.events.push(event);
        this.userSession.events++;

        // Send to analytics service
        this.sendToAnalytics('event', event);
    }

    trackWebVitals() {
        // Track Core Web Vitals
        const vitalsToTrack = ['CLS', 'FCP', 'FID', 'LCP', 'TTFB'];
        
        vitalsToTrack.forEach(vital => {
            if (window.webVitals && window.webVitals[vital]) {
                window.webVitals[vital]((metric) => {
                    this.trackEvent('web_vital', {
                        name: metric.name,
                        value: metric.value,
                        rating: metric.rating,
                        delta: metric.delta
                    });
                });
            }
        });
    }

    sendToAnalytics(type, data) {
        try {
            // Send to Google Analytics if available
            if (typeof window.gtag !== 'undefined') {
                if (type === 'pageview') {
                    window.gtag('config', 'GA_MEASUREMENT_ID', {
                        page_path: data.page,
                        page_title: data.title
                    });
                } else if (type === 'event') {
                    window.gtag('event', data.name, {
                        event_category: 'engagement',
                        event_label: data.page,
                        custom_parameters: data.data
                    });
                }
            }

            // Send to custom analytics endpoint
            this.sendToCustomEndpoint(type, data);

        } catch (error) {
            console.error('Analytics sending failed:', error);
        }
    }

    sendToCustomEndpoint(type, data) {
        // Only send in production and respect user privacy
        if (this.shouldSendAnalytics()) {
            const payload = {
                type,
                data,
                timestamp: Date.now(),
                session: this.getSessionId()
            };

            // Use sendBeacon for reliability
            if (navigator.sendBeacon) {
                const success = navigator.sendBeacon('/api/analytics', JSON.stringify(payload));
                if (!success) {
                    this.storeLocally(type, data);
                }
            } else {
                // Fallback to fetch
                fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).catch(error => {
                    // Store locally if API unavailable
                    this.storeLocally(type, data);
                });
            }
        }
    }

    shouldSendAnalytics() {
        // Check for user consent, do-not-track, etc.
        if (navigator.doNotTrack === '1') return false;
        if (localStorage.getItem('analytics-consent') === 'false') return false;
        if (window.location.hostname === 'localhost') return false;
        
        return true;
    }

    storeLocally(type, data) {
        try {
            const localEvents = JSON.parse(localStorage.getItem('analytics-queue') || '[]');
            localEvents.push({
                type,
                data,
                timestamp: Date.now(),
                session: this.getSessionId()
            });
            
            // Keep only last 100 events to prevent storage overflow
            if (localEvents.length > 100) {
                localEvents.splice(0, localEvents.length - 100);
            }
            
            localStorage.setItem('analytics-queue', JSON.stringify(localEvents));
        } catch (error) {
            console.warn('Unable to store analytics locally:', error);
        }
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('analytics-session-id');
        if (!sessionId) {
            sessionId = this.generateId();
            sessionStorage.setItem('analytics-session-id', sessionId);
        }
        return sessionId;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Public API methods
    getEvents() {
        return [...this.events];
    }

    getPageViews() {
        return [...this.pageViews];
    }

    getSessionData() {
        return {
            ...this.userSession,
            currentTime: Date.now(),
            sessionDuration: Date.now() - this.userSession.startTime
        };
    }

    // Custom event tracking for external use
    track(eventName, eventData) {
        this.trackEvent(eventName, eventData);
    }

    // Privacy methods
    optOut() {
        localStorage.setItem('analytics-consent', 'false');
        this.clearData();
    }

    optIn() {
        localStorage.setItem('analytics-consent', 'true');
    }

    clearData() {
        this.events = [];
        this.pageViews = [];
        sessionStorage.removeItem('analytics-session-id');
    }
}

// Initialize analytics
let analytics;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        analytics = new Analytics();
    });
} else {
    analytics = new Analytics();
}

// Export for external use
window.Analytics = Analytics;
window.analytics = analytics;