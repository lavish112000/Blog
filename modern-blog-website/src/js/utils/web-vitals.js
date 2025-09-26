/**
 * Web Vitals Monitoring for Performance Optimization
 */

export class WebVitals {
    constructor() {
        this.vitals = new Map();
        this.callbacks = [];
        this.observer = null;
        
        this.init();
    }

    async init() {
        // Import web-vitals library dynamically
        try {
            const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
            
            // Collect Core Web Vitals
            getCLS(this.onVital.bind(this));
            getFID(this.onVital.bind(this));
            getFCP(this.onVital.bind(this));
            getLCP(this.onVital.bind(this));
            getTTFB(this.onVital.bind(this));
            
            // Setup performance observer for additional metrics
            this.setupPerformanceObserver();
            
            // Web Vitals monitoring initialized successfully
        } catch (error) {
            // Web Vitals library not available - using basic metrics fallback
            this.initBasicMetrics();
        }
    }

    onVital(metric) {
        this.vitals.set(metric.name, metric);
        
        // Notify callbacks
        this.callbacks.forEach(callback => {
            try {
                callback(metric);
            } catch (error) {
                // Web Vitals callback error - handle silently in production
            }
        });

        // Log performance issues
        this.checkPerformanceThresholds(metric);
        
        // Send to analytics
        this.sendToAnalytics(metric);
    }

    checkPerformanceThresholds(metric) {
        const thresholds = {
            CLS: { good: 0.1, poor: 0.25 },
            FID: { good: 100, poor: 300 },
            FCP: { good: 1800, poor: 3000 },
            LCP: { good: 2500, poor: 4000 },
            TTFB: { good: 800, poor: 1800 }
        };

        const threshold = thresholds[metric.name];
        if (!threshold) return;

        let rating = 'good';
        if (metric.value > threshold.poor) {
            rating = 'poor';
        } else if (metric.value > threshold.good) {
            rating = 'needs-improvement';
        }

        if (rating !== 'good') {
            // Performance issue detected: ${metric.name} - value: ${metric.value}, rating: ${rating}
            // Consider optimization for better user experience
        }
    }

    sendToAnalytics(metric) {
        // Send to Google Analytics or other analytics service
        if (window.gtag) {
            window.gtag('event', metric.name, {
                event_category: 'Web Vitals',
                value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                event_label: metric.id,
                non_interaction: true
            });
        }

        // Send to custom analytics
        if (window.enterpriseBlog?.analytics) {
            window.enterpriseBlog.analytics.track('web_vital', {
                name: metric.name,
                value: metric.value,
                rating: this.getRating(metric)
            });
        }
    }

    getRating(metric) {
        const thresholds = {
            CLS: [0.1, 0.25],
            FID: [100, 300],
            FCP: [1800, 3000],
            LCP: [2500, 4000],
            TTFB: [800, 1800]
        };

        const [good, poor] = thresholds[metric.name] || [0, 0];
        
        if (metric.value <= good) return 'good';
        if (metric.value <= poor) return 'needs-improvement';
        return 'poor';
    }

    setupPerformanceObserver() {
        try {
            // Observe navigation timing
            const navObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.processNavigationEntry(entry);
                }
            });
            navObserver.observe({ entryTypes: ['navigation'] });

            // Observe resource timing
            const resourceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.processResourceEntry(entry);
                }
            });
            resourceObserver.observe({ entryTypes: ['resource'] });

            // Observe paint timing
            const paintObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.processPaintEntry(entry);
                }
            });
            paintObserver.observe({ entryTypes: ['paint'] });

        } catch (error) {
            // Performance Observer not supported - using fallback metrics
        }
    }

    processNavigationEntry(entry) {
        const metrics = {
            dns_lookup: entry.domainLookupEnd - entry.domainLookupStart,
            tcp_connect: entry.connectEnd - entry.connectStart,
            ssl_negotiation: entry.connectEnd - entry.secureConnectionStart,
            request_response: entry.responseEnd - entry.requestStart,
            dom_processing: entry.domContentLoadedEventStart - entry.responseEnd,
            load_complete: entry.loadEventEnd - entry.navigationStart
        };

        this.vitals.set('navigation_timing', metrics);
        
        // Check for performance issues
        Object.entries(metrics).forEach(([key, value]) => {
            if (value > this.getThreshold(key)) {
                // Performance warning: Slow ${key} - ${value}ms (consider optimization)
            }
        });
    }

    processResourceEntry(entry) {
        // Track slow resources
        const duration = entry.responseEnd - entry.requestStart;
        
        if (duration > 1000) { // Resources taking more than 1 second
            // Slow resource detected: ${entry.name} - ${duration}ms (size: ${entry.transferSize || 'unknown'})
            // Consider resource optimization or caching
        }

        // Track resource types
        const resourceType = this.getResourceType(entry.name);
        const resourceMetrics = this.vitals.get('resource_timing') || {};
        
        if (!resourceMetrics[resourceType]) {
            resourceMetrics[resourceType] = { count: 0, totalDuration: 0 };
        }
        
        resourceMetrics[resourceType].count++;
        resourceMetrics[resourceType].totalDuration += duration;
        
        this.vitals.set('resource_timing', resourceMetrics);
    }

    processPaintEntry(entry) {
        this.vitals.set(entry.name.replace('-', '_'), {
            name: entry.name,
            value: entry.startTime,
            startTime: entry.startTime
        });
    }

    getResourceType(url) {
        if (url.match(/\.(css)$/)) return 'css';
        if (url.match(/\.(js)$/)) return 'javascript';
        if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
        if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
        return 'other';
    }

    getThreshold(metric) {
        const thresholds = {
            dns_lookup: 200,
            tcp_connect: 200,
            ssl_negotiation: 200,
            request_response: 500,
            dom_processing: 1000,
            load_complete: 3000
        };
        return thresholds[metric] || 1000;
    }

    initBasicMetrics() {
        // Fallback for basic performance metrics
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            
            if (navigation) {
                const loadTime = navigation.loadEventEnd - navigation.navigationStart;
                const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
                
                this.vitals.set('page_load_time', {
                    name: 'PAGE_LOAD_TIME',
                    value: loadTime
                });
                
                this.vitals.set('dom_content_loaded', {
                    name: 'DOM_CONTENT_LOADED',
                    value: domContentLoaded
                });
            }
        });
    }

    // Public API
    subscribe(callback) {
        this.callbacks.push(callback);
    }

    unsubscribe(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }

    getVital(name) {
        return this.vitals.get(name);
    }

    getAllVitals() {
        return Object.fromEntries(this.vitals);
    }

    generateReport() {
        const vitals = this.getAllVitals();
        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            vitals: vitals,
            recommendations: this.generateRecommendations(vitals)
        };
        
        return report;
    }

    generateRecommendations(vitals) {
        const recommendations = [];
        
        // Check LCP
        const lcp = vitals.LCP;
        if (lcp && lcp.value > 2500) {
            recommendations.push({
                metric: 'LCP',
                issue: 'Largest Contentful Paint is slow',
                suggestions: [
                    'Optimize images and use modern formats (WebP, AVIF)',
                    'Implement lazy loading for below-fold images',
                    'Minimize render-blocking resources',
                    'Use a CDN for faster content delivery'
                ]
            });
        }

        // Check CLS
        const cls = vitals.CLS;
        if (cls && cls.value > 0.1) {
            recommendations.push({
                metric: 'CLS',
                issue: 'Cumulative Layout Shift is high',
                suggestions: [
                    'Set size attributes on images and videos',
                    'Reserve space for dynamic content',
                    'Avoid inserting content above existing content',
                    'Use CSS aspect-ratio for responsive media'
                ]
            });
        }

        // Check FID
        const fid = vitals.FID;
        if (fid && fid.value > 100) {
            recommendations.push({
                metric: 'FID',
                issue: 'First Input Delay is high',
                suggestions: [
                    'Break up long-running JavaScript tasks',
                    'Use web workers for heavy computations',
                    'Implement code splitting and lazy loading',
                    'Optimize third-party scripts'
                ]
            });
        }

        return recommendations;
    }

    exportData() {
        const report = this.generateReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `web-vitals-report-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}