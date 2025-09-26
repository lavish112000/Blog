/**
 * Enterprise Performance Monitor
 * Advanced performance tracking, optimization, and reporting
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            navigation: {},
            resources: [],
            vitals: {},
            custom: {},
            memory: {},
            network: {}
        };
        
        this.observers = [];
        this.thresholds = {
            fcp: { good: 1800, poor: 3000 },
            lcp: { good: 2500, poor: 4000 },
            fid: { good: 100, poor: 300 },
            cls: { good: 0.1, poor: 0.25 },
            ttfb: { good: 600, poor: 1500 }
        };
        
        this.optimizations = {
            lazyLoading: true,
            resourceHints: true,
            criticalCSS: true,
            imageOptimization: true,
            caching: true
        };
        
        this.isMonitoring = false;
        this.reportingEndpoint = '/api/performance';
        
        this.init();
    }

    init() {
        this.startMonitoring();
        this.setupPerformanceObservers();
        this.trackNavigationTiming();
        this.trackResourceTiming();
        this.trackMemoryUsage();
        this.trackNetworkInformation();
        this.setupOptimizations();
        this.createPerformanceIndicator();
        
        console.log('⚡ Performance Monitor initialized');
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.startTime = performance.now();
        
        // Monitor every 5 seconds
        this.monitoringInterval = setInterval(() => {
            this.collectCurrentMetrics();
        }, 5000);
        
        // Report every 30 seconds
        this.reportingInterval = setInterval(() => {
            this.reportMetrics();
        }, 30000);
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        if (this.reportingInterval) {
            clearInterval(this.reportingInterval);
        }
        
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }

    setupPerformanceObservers() {
        if (!('PerformanceObserver' in window)) return;

        // Largest Contentful Paint (LCP)
        this.createObserver(['largest-contentful-paint'], (entries) => {
            const lastEntry = entries[entries.length - 1];
            this.metrics.vitals.lcp = {
                value: Math.round(lastEntry.startTime),
                element: lastEntry.element?.tagName || 'unknown',
                url: lastEntry.url || '',
                rating: this.getRating('lcp', lastEntry.startTime)
            };
            this.updatePerformanceIndicator();
        });

        // First Input Delay (FID)
        this.createObserver(['first-input'], (entries) => {
            const firstInput = entries[0];
            const fid = firstInput.processingStart - firstInput.startTime;
            this.metrics.vitals.fid = {
                value: Math.round(fid),
                inputType: firstInput.name,
                rating: this.getRating('fid', fid)
            };
            this.updatePerformanceIndicator();
        });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        this.createObserver(['layout-shift'], (entries) => {
            for (const entry of entries) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            this.metrics.vitals.cls = {
                value: Math.round(clsValue * 1000) / 1000,
                rating: this.getRating('cls', clsValue)
            };
            this.updatePerformanceIndicator();
        });

        // First Contentful Paint (FCP)
        this.createObserver(['paint'], (entries) => {
            for (const entry of entries) {
                if (entry.name === 'first-contentful-paint') {
                    this.metrics.vitals.fcp = {
                        value: Math.round(entry.startTime),
                        rating: this.getRating('fcp', entry.startTime)
                    };
                }
            }
            this.updatePerformanceIndicator();
        });

        // Long Tasks
        this.createObserver(['longtask'], (entries) => {
            entries.forEach(entry => {
                const longTask = {
                    duration: Math.round(entry.duration),
                    startTime: Math.round(entry.startTime),
                    name: entry.name,
                    attribution: entry.attribution ? entry.attribution[0] : null
                };
                
                if (!this.metrics.custom.longTasks) {
                    this.metrics.custom.longTasks = [];
                }
                this.metrics.custom.longTasks.push(longTask);
                
                // Warn about long tasks
                if (entry.duration > 100) {
                    console.warn('⚠️ Long task detected:', longTask);
                }
            });
        });

        // Resource loading
        this.createObserver(['resource'], (entries) => {
            entries.forEach(entry => {
                const resource = {
                    name: entry.name,
                    type: entry.initiatorType,
                    duration: Math.round(entry.duration),
                    size: entry.transferSize || 0,
                    cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
                    startTime: Math.round(entry.startTime)
                };
                
                this.metrics.resources.push(resource);
                this.analyzeResourcePerformance(resource);
            });
        });
    }

    createObserver(entryTypes, callback) {
        try {
            const observer = new PerformanceObserver((list) => {
                callback(list.getEntries());
            });
            
            observer.observe({ entryTypes });
            this.observers.push(observer);
        } catch (error) {
            console.warn(`Failed to create PerformanceObserver for ${entryTypes}:`, error);
        }
    }

    trackNavigationTiming() {
        if (!performance.navigation || !performance.timing) return;

        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.metrics.navigation = {
                type: performance.navigation.type,
                redirectCount: performance.navigation.redirectCount,
                dns: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
                tcp: Math.round(navigation.connectEnd - navigation.connectStart),
                request: Math.round(navigation.responseStart - navigation.requestStart),
                response: Math.round(navigation.responseEnd - navigation.responseStart),
                processing: Math.round(navigation.domContentLoadedEventStart - navigation.responseEnd),
                load: Math.round(navigation.loadEventEnd - navigation.navigationStart),
                ttfb: Math.round(navigation.responseStart - navigation.navigationStart)
            };

            // Calculate ratings
            this.metrics.navigation.ttfbRating = this.getRating('ttfb', this.metrics.navigation.ttfb);
            
            this.identifyBottlenecks();
        }
    }

    trackResourceTiming() {
        const resources = performance.getEntriesByType('resource');
        
        resources.forEach(resource => {
            if (this.metrics.resources.find(r => r.name === resource.name)) return; // Already tracked
            
            const resourceMetric = {
                name: resource.name,
                type: resource.initiatorType,
                duration: Math.round(resource.duration),
                size: resource.transferSize || 0,
                cached: resource.transferSize === 0 && resource.decodedBodySize > 0,
                startTime: Math.round(resource.startTime),
                dns: Math.round(resource.domainLookupEnd - resource.domainLookupStart),
                tcp: Math.round(resource.connectEnd - resource.connectStart),
                request: Math.round(resource.responseStart - resource.requestStart),
                response: Math.round(resource.responseEnd - resource.responseStart)
            };
            
            this.metrics.resources.push(resourceMetric);
            this.analyzeResourcePerformance(resourceMetric);
        });
    }

    trackMemoryUsage() {
        if (!('memory' in performance)) return;

        const memory = performance.memory;
        this.metrics.memory = {
            used: Math.round(memory.usedJSHeapSize / 1048576), // MB
            total: Math.round(memory.totalJSHeapSize / 1048576), // MB
            limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
            usage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
        };

        // Warn about high memory usage
        if (this.metrics.memory.usage > 80) {
            console.warn('⚠️ High memory usage detected:', this.metrics.memory);
        }
    }

    trackNetworkInformation() {
        if (!('connection' in navigator)) return;

        const connection = navigator.connection;
        this.metrics.network = {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
        };
    }

    collectCurrentMetrics() {
        this.trackMemoryUsage();
        this.trackNetworkInformation();
        
        // Collect current performance metrics
        const now = performance.now();
        this.metrics.custom.timestamp = Date.now();
        this.metrics.custom.uptime = Math.round(now - this.startTime);
        
        // Check for performance degradation
        this.checkPerformanceDegradation();
    }

    analyzeResourcePerformance(resource) {
        // Identify slow resources
        if (resource.duration > 1000) {
            console.warn('⚠️ Slow resource detected:', resource.name, `${resource.duration}ms`);
            
            if (!this.metrics.custom.slowResources) {
                this.metrics.custom.slowResources = [];
            }
            
            this.metrics.custom.slowResources.push({
                name: resource.name,
                duration: resource.duration,
                type: resource.type,
                size: resource.size
            });
        }

        // Identify large resources
        if (resource.size > 1048576) { // 1MB
            console.warn('⚠️ Large resource detected:', resource.name, `${Math.round(resource.size / 1024)}KB`);
            
            if (!this.metrics.custom.largeResources) {
                this.metrics.custom.largeResources = [];
            }
            
            this.metrics.custom.largeResources.push({
                name: resource.name,
                size: resource.size,
                type: resource.type
            });
        }
    }

    identifyBottlenecks() {
        const nav = this.metrics.navigation;
        const bottlenecks = [];

        if (nav.dns > 200) {
            bottlenecks.push({ type: 'DNS', value: nav.dns, suggestion: 'Consider using DNS prefetch' });
        }
        
        if (nav.tcp > 500) {
            bottlenecks.push({ type: 'TCP', value: nav.tcp, suggestion: 'Consider using connection preconnect' });
        }
        
        if (nav.request > 1000) {
            bottlenecks.push({ type: 'Request', value: nav.request, suggestion: 'Optimize server response time' });
        }
        
        if (nav.response > 2000) {
            bottlenecks.push({ type: 'Response', value: nav.response, suggestion: 'Enable compression and optimize payload' });
        }

        if (bottlenecks.length > 0) {
            this.metrics.custom.bottlenecks = bottlenecks;
            console.warn('⚠️ Performance bottlenecks detected:', bottlenecks);
        }
    }

    checkPerformanceDegradation() {
        const vitals = this.metrics.vitals;
        const issues = [];

        if (vitals.lcp && vitals.lcp.rating === 'poor') {
            issues.push('Poor Largest Contentful Paint');
        }
        
        if (vitals.fid && vitals.fid.rating === 'poor') {
            issues.push('Poor First Input Delay');
        }
        
        if (vitals.cls && vitals.cls.rating === 'poor') {
            issues.push('Poor Cumulative Layout Shift');
        }

        if (this.metrics.memory.usage > 90) {
            issues.push('High memory usage');
        }

        if (issues.length > 0) {
            this.metrics.custom.performanceIssues = issues;
            
            // Notify if performance issues detected
            if (window.NotificationManager) {
                window.NotificationManager.warning(
                    'Performance Issues Detected',
                    `${issues.length} issues found. Check developer console for details.`
                );
            }
        }
    }

    setupOptimizations() {
        if (this.optimizations.lazyLoading) {
            this.enableLazyLoading();
        }
        
        if (this.optimizations.resourceHints) {
            this.addResourceHints();
        }
        
        if (this.optimizations.imageOptimization) {
            this.optimizeImages();
        }
        
        if (this.optimizations.caching) {
            this.optimizeCaching();
        }
    }

    enableLazyLoading() {
        // Enable lazy loading for images and iframes
        const lazyElements = document.querySelectorAll('img[data-src], iframe[data-src]');
        
        if ('IntersectionObserver' in window) {
            const lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const src = element.getAttribute('data-src');
                        
                        if (src) {
                            element.src = src;
                            element.removeAttribute('data-src');
                            element.classList.add('loaded');
                            lazyObserver.unobserve(element);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });

            lazyElements.forEach(element => lazyObserver.observe(element));
        }
    }

    addResourceHints() {
        // Add DNS prefetch for external domains
        const externalDomains = this.getExternalDomains();
        externalDomains.forEach(domain => {
            this.addResourceHint('dns-prefetch', `//${domain}`);
        });

        // Add preconnect for critical third-party resources
        const criticalDomains = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'];
        criticalDomains.forEach(domain => {
            this.addResourceHint('preconnect', `https://${domain}`, { crossorigin: true });
        });
    }

    addResourceHint(rel, href, options = {}) {
        const existing = document.querySelector(`link[rel="${rel}"][href="${href}"]`);
        if (existing) return;

        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        
        if (options.crossorigin) {
            link.crossOrigin = 'anonymous';
        }

        document.head.appendChild(link);
    }

    getExternalDomains() {
        const domains = new Set();
        const currentDomain = window.location.hostname;
        
        // Extract domains from resources
        this.metrics.resources.forEach(resource => {
            try {
                const url = new URL(resource.name);
                if (url.hostname !== currentDomain) {
                    domains.add(url.hostname);
                }
            } catch (e) {
                // Ignore invalid URLs
            }
        });

        return Array.from(domains);
    }

    optimizeImages() {
        // Add loading="lazy" to images if not present
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            // Don't lazy load images in viewport
            const rect = img.getBoundingClientRect();
            if (rect.top > window.innerHeight) {
                img.loading = 'lazy';
            }
        });

        // Optimize image formats for modern browsers
        if ('loading' in HTMLImageElement.prototype) {
            this.checkWebPSupport();
        }
    }

    checkWebPSupport() {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
            const supported = webP.height === 2;
            document.documentElement.classList.toggle('webp-supported', supported);
            
            if (supported) {
                console.log('✅ WebP image format supported');
            }
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    }

    optimizeCaching() {
        // Implement intelligent caching strategies
        if ('serviceWorker' in navigator) {
            this.setupServiceWorkerCaching();
        }
        
        // Cache static resources in memory
        this.setupMemoryCache();
    }

    setupServiceWorkerCaching() {
        // This would typically be handled by the service worker
        // Here we just track cache performance
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                this.metrics.custom.cacheCount = cacheNames.length;
            });
        }
    }

    setupMemoryCache() {
        // Simple in-memory cache for API responses
        if (!window.performanceCache) {
            window.performanceCache = new Map();
        }
    }

    createPerformanceIndicator() {
        if (document.getElementById('performance-monitor')) return;

        const indicator = document.createElement('div');
        indicator.id = 'performance-monitor';
        indicator.className = 'performance-monitor';
        indicator.innerHTML = `
            <div class="perf-indicator" title="Performance Score">
                <i class="fas fa-tachometer-alt"></i>
                <span class="perf-score">--</span>
            </div>
        `;

        document.body.appendChild(indicator);

        // Toggle detailed view on click
        indicator.addEventListener('click', () => {
            this.showPerformanceDetails();
        });
    }

    updatePerformanceIndicator() {
        const score = this.calculatePerformanceScore();
        const indicator = document.querySelector('.perf-score');
        
        if (indicator) {
            indicator.textContent = score;
            
            // Update color based on score
            const monitor = document.getElementById('performance-monitor');
            monitor.className = `performance-monitor ${this.getScoreClass(score)}`;
        }
    }

    calculatePerformanceScore() {
        const vitals = this.metrics.vitals;
        let score = 100;
        let _factorCount = 0;

        // Factor in Core Web Vitals
        if (vitals.lcp) {
            _factorCount++;
            if (vitals.lcp.rating === 'poor') score -= 30;
            else if (vitals.lcp.rating === 'needs-improvement') score -= 15;
        }

        if (vitals.fid) {
            _factorCount++;
            if (vitals.fid.rating === 'poor') score -= 25;
            else if (vitals.fid.rating === 'needs-improvement') score -= 10;
        }

        if (vitals.cls) {
            _factorCount++;
            if (vitals.cls.rating === 'poor') score -= 25;
            else if (vitals.cls.rating === 'needs-improvement') score -= 10;
        }

        if (vitals.fcp) {
            _factorCount++;
            if (vitals.fcp.rating === 'poor') score -= 20;
            else if (vitals.fcp.rating === 'needs-improvement') score -= 10;
        }

        // Factor in resource performance
        const slowResources = this.metrics.custom.slowResources?.length || 0;
        const largeResources = this.metrics.custom.largeResources?.length || 0;
        score -= (slowResources * 5) + (largeResources * 3);

        // Factor in memory usage
        if (this.metrics.memory.usage > 80) {
            score -= 15;
        }

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    getScoreClass(score) {
        if (score >= 90) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'fair';
        return 'poor';
    }

    showPerformanceDetails() {
        const details = this.generatePerformanceReport();
        
        if (window.NotificationManager) {
            window.NotificationManager.info(
                'Performance Report',
                'Check developer console for detailed performance metrics',
                {
                    persistent: true,
                    actions: [
                        {
                            text: 'View Details',
                            action: () => console.table(details)
                        }
                    ]
                }
            );
        }
        
        console.group('🚀 Performance Report');
        console.table(details);
        console.groupEnd();
    }

    generatePerformanceReport() {
        const report = {
            score: this.calculatePerformanceScore(),
            vitals: this.metrics.vitals,
            navigation: this.metrics.navigation,
            memory: this.metrics.memory,
            network: this.metrics.network,
            resources: {
                total: this.metrics.resources.length,
                slow: this.metrics.custom.slowResources?.length || 0,
                large: this.metrics.custom.largeResources?.length || 0
            },
            issues: this.metrics.custom.performanceIssues || [],
            bottlenecks: this.metrics.custom.bottlenecks || [],
            recommendations: this.generateRecommendations()
        };

        return report;
    }

    generateRecommendations() {
        const recommendations = [];
        const vitals = this.metrics.vitals;

        if (vitals.lcp && vitals.lcp.rating !== 'good') {
            recommendations.push('Optimize Largest Contentful Paint by reducing server response times and optimizing critical resources');
        }

        if (vitals.fid && vitals.fid.rating !== 'good') {
            recommendations.push('Improve First Input Delay by reducing JavaScript execution time and splitting long tasks');
        }

        if (vitals.cls && vitals.cls.rating !== 'good') {
            recommendations.push('Reduce Cumulative Layout Shift by setting explicit dimensions for images and dynamic content');
        }

        if (this.metrics.custom.slowResources?.length > 0) {
            recommendations.push('Optimize slow-loading resources or consider lazy loading');
        }

        if (this.metrics.custom.largeResources?.length > 0) {
            recommendations.push('Compress large resources or implement progressive loading');
        }

        if (this.metrics.memory.usage > 70) {
            recommendations.push('Consider optimizing memory usage to prevent performance degradation');
        }

        return recommendations;
    }

    reportMetrics() {
        if (!navigator.onLine) return;

        const report = this.generatePerformanceReport();
        
        // Send to analytics endpoint
        fetch(this.reportingEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...report,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            }),
            keepalive: true
        }).catch(error => {
            console.warn('Failed to report performance metrics:', error);
        });
    }

    getRating(metric, value) {
        const threshold = this.thresholds[metric];
        if (!threshold) return 'unknown';

        if (value <= threshold.good) return 'good';
        if (value <= threshold.poor) return 'needs-improvement';
        return 'poor';
    }

    // Public API methods
    getMetrics() {
        return { ...this.metrics };
    }

    getPerformanceScore() {
        return this.calculatePerformanceScore();
    }

    addCustomMetric(name, value) {
        this.metrics.custom[name] = {
            value,
            timestamp: Date.now()
        };
    }

    measureFunction(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        this.addCustomMetric(`function_${name}`, end - start);
        
        return result;
    }

    async measureAsync(name, promise) {
        const start = performance.now();
        const result = await promise;
        const end = performance.now();
        
        this.addCustomMetric(`async_${name}`, end - start);
        
        return result;
    }

    enableOptimization(optimization) {
        this.optimizations[optimization] = true;
        this.setupOptimizations();
    }

    disableOptimization(optimization) {
        this.optimizations[optimization] = false;
    }
}

// Export for use in other modules
export default PerformanceMonitor;

// Auto-initialize if not imported as module
if (typeof module === 'undefined') {
    window.PerformanceMonitor = PerformanceMonitor;
}