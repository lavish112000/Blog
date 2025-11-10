# Performance Monitoring and Optimization

This guide outlines performance standards, monitoring practices, and optimization techniques for the Modern Blog Website.

## Table of Contents

- [Performance Targets](#performance-targets)
- [Monitoring Tools](#monitoring-tools)
- [Optimization Techniques](#optimization-techniques)
- [Performance Testing](#performance-testing)
- [Best Practices](#best-practices)

---

## Performance Targets

### Core Web Vitals

| Metric | Target | Good | Needs Improvement | Poor |
|--------|--------|------|-------------------|------|
| **Largest Contentful Paint (LCP)** | < 2.5s | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **First Input Delay (FID)** | < 100ms | < 100ms | 100ms - 300ms | > 300ms |
| **Cumulative Layout Shift (CLS)** | < 0.1 | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **Time to Interactive (TTI)** | < 3.8s | < 3.8s | 3.8s - 7.3s | > 7.3s |
| **First Contentful Paint (FCP)** | < 1.8s | < 1.8s | 1.8s - 3.0s | > 3.0s |

### Additional Targets

- **Page Load Time:** < 3 seconds
- **Time to First Byte (TTFB):** < 600ms
- **Bundle Size:** < 500KB (compressed)
- **Image Optimization:** < 200KB per image
- **Lighthouse Score:** > 90 (Performance)

---

## Monitoring Tools

### 1. Chrome DevTools

**Lighthouse Audit:**
```bash
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select Performance, Accessibility, Best Practices, SEO
4. Click "Generate report"
```

**Performance Tab:**
- Record page load
- Analyze timeline
- Identify bottlenecks
- Check JavaScript execution time

**Network Tab:**
- Monitor request waterfall
- Check resource sizes
- Identify slow requests
- Analyze caching

### 2. Web Vitals Extension

Install Chrome extension:
- Real-time Core Web Vitals
- Field data from real users
- Compare with lab data

### 3. npm Scripts for Performance

```json
{
  "scripts": {
    "build:analyze": "webpack --mode production --analyze",
    "perf:lighthouse": "lighthouse http://localhost:8080 --view",
    "perf:bundle": "webpack-bundle-analyzer dist/stats.json"
  }
}
```

### 4. Continuous Monitoring

Set up automated performance monitoring:

```yaml
# .github/workflows/performance.yml
name: Performance Monitoring

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:8080
          uploadArtifacts: true
```

---

## Optimization Techniques

### 1. JavaScript Optimization

#### Code Splitting

```javascript
// ✅ Good - Load on demand
const loadBlogModule = async () => {
  const blog = await import('./blog.js');
  blog.initialize();
};

// Trigger on user interaction
button.addEventListener('click', loadBlogModule);
```

#### Debouncing

```javascript
// ✅ Good - Reduce function calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Usage
const searchHandler = debounce((query) => {
  searchPosts(query);
}, 300);

input.addEventListener('input', (e) => searchHandler(e.target.value));
```

#### Lazy Loading

```javascript
// ✅ Good - Lazy load images
if ('loading' in HTMLImageElement.prototype) {
  // Native lazy loading
  images.forEach(img => {
    img.loading = 'lazy';
  });
} else {
  // Fallback with Intersection Observer
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}
```

### 2. CSS Optimization

#### Critical CSS

```html
<!-- Inline critical CSS -->
<style>
  /* Above-the-fold styles */
  body { margin: 0; font-family: sans-serif; }
  .header { background: #333; color: white; }
</style>

<!-- Load full CSS asynchronously -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>
```

#### CSS Containment

```css
/* ✅ Good - Improve rendering performance */
.blog-post {
  contain: content; /* Isolate from rest of document */
}

.sidebar {
  contain: layout style; /* Optimize layout calculations */
}
```

#### Avoid Layout Thrashing

```javascript
// ❌ Bad - Forces reflow multiple times
elements.forEach(el => {
  const height = el.clientHeight; // Read
  el.style.height = height + 10 + 'px'; // Write
});

// ✅ Good - Batch reads and writes
const heights = elements.map(el => el.clientHeight); // Read all
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px'; // Write all
});
```

### 3. Image Optimization

#### Responsive Images

```html
<!-- ✅ Good - Serve appropriate sizes -->
<picture>
  <source srcset="image-small.webp" media="(max-width: 768px)" type="image/webp">
  <source srcset="image-large.webp" media="(min-width: 769px)" type="image/webp">
  <source srcset="image-small.jpg" media="(max-width: 768px)">
  <img src="image-large.jpg" alt="Description" loading="lazy">
</picture>
```

#### Image Compression

```bash
# Use tools like:
- ImageOptim
- TinyPNG
- Squoosh
- Sharp (automated)

# Target sizes:
- Hero images: < 200KB
- Thumbnails: < 50KB
- Icons: < 10KB (or use SVG)
```

### 4. Asset Optimization

#### Webpack Configuration

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        }
      }
    },
    minimize: true,
    usedExports: true // Tree shaking
  },
  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
    hints: 'warning'
  }
};
```

### 5. Caching Strategy

#### Service Worker

```javascript
// sw.js - Cache static assets
const CACHE_NAME = 'blog-v1';
const urlsToCache = [
  '/',
  '/css/main.css',
  '/js/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

#### HTTP Caching Headers

```javascript
// Server configuration (Netlify)
// netlify.toml
[[headers]]
  for = "/css/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/js/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=3600"
```

---

## Performance Testing

### Local Testing

#### 1. Lighthouse CLI

```bash
# Install
npm install -g lighthouse

# Run audit
lighthouse http://localhost:8080 --view

# Generate JSON report
lighthouse http://localhost:8080 --output json --output-path ./report.json
```

#### 2. Build Size Analysis

```bash
# Analyze webpack bundle
npm run build
npx webpack-bundle-analyzer dist/stats.json
```

#### 3. Network Throttling

```javascript
// Chrome DevTools > Network tab
// Select throttling profile:
- Fast 3G
- Slow 3G
- Offline

// Test with:
- Slow connection
- High latency
- Packet loss
```

### CI/CD Performance Checks

```yaml
# .github/workflows/performance.yml
- name: Build and analyze bundle
  run: |
    npm run build
    SIZE=$(du -sh dist | cut -f1)
    echo "Bundle size: $SIZE"
    
- name: Check bundle size
  run: |
    npm install -g bundlesize
    bundlesize
```

### Performance Budget

```json
// package.json
{
  "bundlesize": [
    {
      "path": "./dist/js/*.js",
      "maxSize": "250 KB"
    },
    {
      "path": "./dist/css/*.css",
      "maxSize": "100 KB"
    }
  ]
}
```

---

## Best Practices

### 1. Resource Loading Priority

```html
<!-- Preconnect to external domains -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://api.example.com">

<!-- Preload critical resources -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/css/critical.css" as="style">

<!-- Defer non-critical scripts -->
<script src="/js/analytics.js" defer></script>
```

### 2. Font Optimization

```css
/* ✅ Good - Font loading strategy */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* Show fallback immediately */
  font-weight: 400;
  font-style: normal;
}

/* Use system fonts as fallback */
body {
  font-family: 'CustomFont', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### 3. JavaScript Best Practices

```javascript
// ✅ Avoid memory leaks
class Component {
  constructor() {
    this.handler = this.handleClick.bind(this);
  }
  
  mount() {
    document.addEventListener('click', this.handler);
  }
  
  unmount() {
    document.removeEventListener('click', this.handler);
  }
}

// ✅ Use requestAnimationFrame for animations
function animate() {
  // Animation logic
  requestAnimationFrame(animate);
}

// ✅ Passive event listeners
document.addEventListener('scroll', handleScroll, { passive: true });
```

### 4. Reduce Third-Party Impact

```javascript
// ✅ Load third-party scripts efficiently
const loadGoogleAnalytics = () => {
  const script = document.createElement('script');
  script.src = 'https://www.google-analytics.com/analytics.js';
  script.async = true;
  document.head.appendChild(script);
};

// Load after page is interactive
if (document.readyState === 'complete') {
  loadGoogleAnalytics();
} else {
  window.addEventListener('load', loadGoogleAnalytics);
}
```

---

## Performance Checklist

### Before Deployment

- [ ] Run Lighthouse audit (score > 90)
- [ ] Check bundle size (< 500KB)
- [ ] Test on 3G connection
- [ ] Verify Core Web Vitals
- [ ] Check image optimization
- [ ] Test caching strategy
- [ ] Verify lazy loading works
- [ ] Test on mobile devices
- [ ] Check for memory leaks
- [ ] Validate service worker

### Regular Monitoring

**Weekly:**
- [ ] Review Lighthouse scores
- [ ] Check bundle size trends
- [ ] Monitor Core Web Vitals

**Monthly:**
- [ ] Audit dependencies
- [ ] Review performance budget
- [ ] Update optimization strategies
- [ ] Test new performance features

---

## Performance Issues and Solutions

### Issue: Slow Initial Load

**Solutions:**
- Implement code splitting
- Optimize images
- Use CDN for static assets
- Enable compression (gzip/brotli)
- Reduce render-blocking resources

### Issue: Poor LCP

**Solutions:**
- Preload hero images
- Optimize server response time
- Use critical CSS
- Reduce JavaScript execution time

### Issue: High CLS

**Solutions:**
- Reserve space for images (width/height attributes)
- Avoid inserting content above existing content
- Use CSS transforms for animations
- Load fonts with font-display: swap

### Issue: Large Bundle Size

**Solutions:**
- Remove unused dependencies
- Enable tree shaking
- Code split by route
- Lazy load heavy components

---

## Resources

### Tools

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)

### Documentation

- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [MDN Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [Webpack Optimization](https://webpack.js.org/guides/build-performance/)

---

## Questions?

For performance-related questions:
1. Review this guide
2. Run Lighthouse audit
3. Check Chrome DevTools
4. Consult with team

**Remember:** Performance is a feature. Monitor and optimize continuously!
