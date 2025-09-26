/**
 * Advanced Analytics and User Behavior Tracking
 * Enterprise-level analytics with detailed user insights
 */

class AdvancedAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.pageViews = 0;
        this.interactions = [];
        this.userBehavior = {
            scrollDepth: 0,
            timeOnPage: 0,
            clickHeatmap: [],
            readingProgress: {},
            engagementScore: 0
        };
        
        this.init();
    }

    init() {
        this.setupGoogleAnalytics();
        this.trackPageView();
        this.setupScrollTracking();
        this.setupClickTracking();
        this.setupReadingTime();
        this.setupEngagementTracking();
        this.setupPerformanceTracking();
        
        // Track session duration
        window.addEventListener('beforeunload', () => this.trackSessionEnd());
        
        // Track visibility changes
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setupGoogleAnalytics() {
        // Enhanced GA4 configuration
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                custom_map: {
                    'custom_session_id': this.sessionId,
                    'custom_user_type': this.getUserType(),
                    'custom_device_type': this.getDeviceType()
                },
                send_page_view: false // We'll send custom page views
            });
        }
    }

    trackPageView(pageName = document.title, pageUrl = window.location.href) {
        this.pageViews++;
        
        const pageViewData = {
            page_title: pageName,
            page_location: pageUrl,
            page_referrer: document.referrer,
            session_id: this.sessionId,
            page_view_number: this.pageViews,
            timestamp: Date.now(),
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            connection_type: this.getConnectionType(),
            device_memory: navigator.deviceMemory || 'unknown',
            hardware_concurrency: navigator.hardwareConcurrency || 'unknown'
        };

        // Send to Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', pageViewData);
        }

        // Send to custom analytics
        this.sendCustomEvent('page_view', pageViewData);
        
        console.log('📊 Page view tracked:', pageViewData);
    }

    setupScrollTracking() {
        let scrollTimer;
        const scrollMilestones = [25, 50, 75, 90, 100];
        const trackedMilestones = new Set();

        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                const scrollPercent = Math.round(
                    (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
                );
                
                this.userBehavior.scrollDepth = Math.max(this.userBehavior.scrollDepth, scrollPercent);
                
                // Track scroll milestones
                scrollMilestones.forEach(milestone => {
                    if (scrollPercent >= milestone && !trackedMilestones.has(milestone)) {
                        trackedMilestones.add(milestone);
                        this.trackEvent('scroll_milestone', {
                            milestone: milestone,
                            page_url: window.location.href,
                            timestamp: Date.now()
                        });
                    }
                });
            }, 100);
        });
    }

    setupClickTracking() {
        document.addEventListener('click', (event) => {
            const element = event.target;
            const elementInfo = {
                tag: element.tagName.toLowerCase(),
                id: element.id || null,
                classes: Array.from(element.classList),
                text: element.textContent?.trim().substring(0, 100) || '',
                href: element.href || null,
                position: {
                    x: event.clientX,
                    y: event.clientY
                },
                timestamp: Date.now(),
                page_url: window.location.href
            };

            // Add to heatmap data
            this.userBehavior.clickHeatmap.push(elementInfo.position);

            // Track specific element types
            if (element.matches('a, button, .clickable')) {
                this.trackEvent('element_click', {
                    element_type: elementInfo.tag,
                    element_id: elementInfo.id,
                    element_text: elementInfo.text,
                    element_href: elementInfo.href,
                    click_position: elementInfo.position
                });
            }

            // Track article interactions
            if (element.closest('.post-card, .article-card')) {
                const articleElement = element.closest('.post-card, .article-card');
                const articleTitle = articleElement.querySelector('h3, h2, .title')?.textContent || 'Unknown';
                
                this.trackEvent('article_interaction', {
                    article_title: articleTitle,
                    interaction_type: 'click',
                    element_type: elementInfo.tag
                });
            }
        });
    }

    setupReadingTime() {
        const articles = document.querySelectorAll('article, .post-content, .article-content');
        
        articles.forEach((article, index) => {
            const articleId = article.id || `article_${index}`;
            this.userBehavior.readingProgress[articleId] = {
                startTime: null,
                endTime: null,
                timeSpent: 0,
                wordsRead: 0,
                readingSpeed: 0
            };

            // Track when article comes into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const progress = this.userBehavior.readingProgress[articleId];
                    
                    if (entry.isIntersecting && !progress.startTime) {
                        progress.startTime = Date.now();
                    } else if (!entry.isIntersecting && progress.startTime && !progress.endTime) {
                        progress.endTime = Date.now();
                        progress.timeSpent = progress.endTime - progress.startTime;
                        
                        // Calculate reading metrics
                        const wordCount = this.getWordCount(article);
                        progress.wordsRead = wordCount;
                        progress.readingSpeed = wordCount / (progress.timeSpent / 60000); // words per minute
                        
                        this.trackEvent('article_read', {
                            article_id: articleId,
                            time_spent: progress.timeSpent,
                            words_read: progress.wordsRead,
                            reading_speed: progress.readingSpeed
                        });
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(article);
        });
    }

    setupEngagementTracking() {
        let engagementScore = 0;
        let interactionCount = 0;
        let lastActivity = Date.now();

        // Track various engagement signals
        const engagementEvents = ['click', 'scroll', 'keydown', 'mousemove', 'touchstart'];
        
        engagementEvents.forEach(eventType => {
            document.addEventListener(eventType, () => {
                interactionCount++;
                lastActivity = Date.now();
                
                // Calculate engagement score based on various factors
                const timeOnPage = Date.now() - this.startTime;
                const scrollDepth = this.userBehavior.scrollDepth;
                const interactionRate = interactionCount / (timeOnPage / 1000); // interactions per second
                
                engagementScore = Math.min(100, Math.round(
                    (scrollDepth * 0.3) + 
                    (Math.min(interactionRate * 1000, 30) * 0.4) + 
                    (Math.min(timeOnPage / 1000 / 60 * 10, 30) * 0.3) // time factor
                ));
                
                this.userBehavior.engagementScore = engagementScore;
            }, { passive: true });
        });

        // Track engagement score periodically
        setInterval(() => {
            if (Date.now() - lastActivity < 30000) { // Active in last 30 seconds
                this.trackEvent('engagement_score', {
                    score: engagementScore,
                    interactions: interactionCount,
                    time_on_page: Date.now() - this.startTime,
                    scroll_depth: this.userBehavior.scrollDepth
                });
            }
        }, 30000);
    }

    setupPerformanceTracking() {
        // Track Core Web Vitals and performance metrics
        if ('PerformanceObserver' in window) {
            // Track Largest Contentful Paint (LCP)
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.trackEvent('core_web_vital', {
                    metric: 'LCP',
                    value: Math.round(lastEntry.startTime),
                    rating: lastEntry.startTime <= 2500 ? 'good' : lastEntry.startTime <= 4000 ? 'needs-improvement' : 'poor'
                });
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // Track First Input Delay (FID)
            new PerformanceObserver((entryList) => {
                const firstInput = entryList.getEntries()[0];
                
                this.trackEvent('core_web_vital', {
                    metric: 'FID',
                    value: Math.round(firstInput.processingStart - firstInput.startTime),
                    rating: firstInput.processingStart - firstInput.startTime <= 100 ? 'good' : 
                           firstInput.processingStart - firstInput.startTime <= 300 ? 'needs-improvement' : 'poor'
                });
            }).observe({ entryTypes: ['first-input'] });

            // Track Cumulative Layout Shift (CLS)
            let clsValue = 0;
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                
                this.trackEvent('core_web_vital', {
                    metric: 'CLS',
                    value: Math.round(clsValue * 1000) / 1000,
                    rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor'
                });
            }).observe({ entryTypes: ['layout-shift'] });
        }

        // Track page load performance
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            
            this.trackEvent('page_performance', {
                dns_lookup: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
                tcp_connect: Math.round(navigation.connectEnd - navigation.connectStart),
                request_response: Math.round(navigation.responseEnd - navigation.requestStart),
                dom_processing: Math.round(navigation.domContentLoadedEventStart - navigation.responseEnd),
                total_load_time: Math.round(navigation.loadEventEnd - navigation.navigationStart)
            });
        });
    }

    trackEvent(eventName, eventData = {}) {
        const eventPayload = {
            event_name: eventName,
            event_data: eventData,
            session_id: this.sessionId,
            timestamp: Date.now(),
            page_url: window.location.href,
            user_agent: navigator.userAgent
        };

        // Send to Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData);
        }

        // Send to custom analytics
        this.sendCustomEvent(eventName, eventPayload);
        
        // Store locally for offline sync
        this.storeEventLocally(eventPayload);
        
        console.log('📈 Event tracked:', eventName, eventData);
    }

    sendCustomEvent(eventName, eventData) {
        // Send to custom analytics endpoint
        if (navigator.onLine) {
            fetch('/api/analytics/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData),
                keepalive: true
            }).catch(error => {
                console.log('Analytics error:', error);
                // Store for retry when back online
                this.storeEventLocally(eventData);
            });
        } else {
            this.storeEventLocally(eventData);
        }
    }

    storeEventLocally(eventData) {
        try {
            const storedEvents = JSON.parse(localStorage.getItem('pendingAnalytics') || '[]');
            storedEvents.push(eventData);
            
            // Keep only last 100 events to prevent storage overflow
            if (storedEvents.length > 100) {
                storedEvents.splice(0, storedEvents.length - 100);
            }
            
            localStorage.setItem('pendingAnalytics', JSON.stringify(storedEvents));
        } catch (error) {
            console.log('Local storage error:', error);
        }
    }

    syncPendingEvents() {
        try {
            const pendingEvents = JSON.parse(localStorage.getItem('pendingAnalytics') || '[]');
            
            if (pendingEvents.length > 0 && navigator.onLine) {
                // Send all pending events
                pendingEvents.forEach(event => {
                    this.sendCustomEvent(event.event_name, event);
                });
                
                // Clear pending events
                localStorage.removeItem('pendingAnalytics');
                console.log(`📤 Synced ${pendingEvents.length} pending analytics events`);
            }
        } catch (error) {
            console.log('Sync error:', error);
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.trackEvent('page_hidden', {
                time_visible: Date.now() - this.startTime,
                engagement_score: this.userBehavior.engagementScore
            });
        } else {
            this.trackEvent('page_visible', {
                return_time: Date.now()
            });
            
            // Sync any pending events when page becomes visible
            this.syncPendingEvents();
        }
    }

    trackSessionEnd() {
        const sessionData = {
            session_duration: Date.now() - this.startTime,
            page_views: this.pageViews,
            max_scroll_depth: this.userBehavior.scrollDepth,
            total_interactions: this.interactions.length,
            engagement_score: this.userBehavior.engagementScore,
            click_heatmap: this.userBehavior.clickHeatmap.slice(0, 50), // Limit data size
            reading_progress: this.userBehavior.readingProgress
        };

        this.trackEvent('session_end', sessionData);
    }

    // Utility methods
    getUserType() {
        // Determine if user is new, returning, or subscriber
        const visits = parseInt(localStorage.getItem('visitCount') || '0') + 1;
        localStorage.setItem('visitCount', visits.toString());
        
        if (visits === 1) return 'new';
        if (visits <= 5) return 'returning';
        return 'loyal';
    }

    getDeviceType() {
        const width = window.innerWidth;
        if (width <= 768) return 'mobile';
        if (width <= 1024) return 'tablet';
        return 'desktop';
    }

    getConnectionType() {
        if ('connection' in navigator) {
            return navigator.connection.effectiveType || 'unknown';
        }
        return 'unknown';
    }

    getWordCount(element) {
        const text = element.textContent || element.innerText || '';
        return text.trim().split(/\s+/).length;
    }

    // Public API methods
    trackCustomEvent(eventName, eventData) {
        this.trackEvent(eventName, eventData);
    }

    getEngagementScore() {
        return this.userBehavior.engagementScore;
    }

    getSessionSummary() {
        return {
            sessionId: this.sessionId,
            duration: Date.now() - this.startTime,
            pageViews: this.pageViews,
            engagementScore: this.userBehavior.engagementScore,
            scrollDepth: this.userBehavior.scrollDepth,
            interactionCount: this.interactions.length
        };
    }
}

// Export for use in other modules
export default AdvancedAnalytics;

// Auto-initialize if not imported as module
if (typeof module === 'undefined') {
    window.AdvancedAnalytics = AdvancedAnalytics;
}