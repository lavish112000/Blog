/**
 * Enterprise Component Loader
 * Dynamic component loading, caching, and management system
 */

class ComponentLoader {
    constructor() {
        this.components = new Map();
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.observers = new Map();
        
        this.config = {
            baseUrl: '/src/components/',
            cacheStrategy: 'memory', // 'memory', 'localStorage', 'sessionStorage'
            lazyLoad: true,
            preload: [],
            retryAttempts: 3,
            timeout: 10000,
            compression: true
        };
        
        this.templates = new Map();
        this.styles = new Map();
        this.scripts = new Map();
        
        this.stats = {
            loaded: 0,
            cached: 0,
            failed: 0,
            loadTime: 0
        };
        
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.preloadCriticalComponents();
        this.setupEventListeners();
        this.loadStoredCache();
        
        console.log('📦 Component Loader initialized');
    }

    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window) || !this.config.lazyLoad) return;

        this.lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const componentName = element.getAttribute('data-component');
                    const componentData = element.getAttribute('data-component-data');
                    
                    if (componentName) {
                        this.loadComponent(componentName, {
                            element,
                            data: componentData ? JSON.parse(componentData) : {}
                        });
                        
                        this.lazyObserver.unobserve(element);
                    }
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.1
        });
    }

    setupEventListeners() {
        // Handle dynamic component requests
        document.addEventListener('click', async (e) => {
            const trigger = e.target.closest('[data-load-component]');
            if (!trigger) return;

            e.preventDefault();
            const componentName = trigger.getAttribute('data-load-component');
            const targetSelector = trigger.getAttribute('data-target');
            const componentData = trigger.getAttribute('data-component-data');
            
            const target = targetSelector ? document.querySelector(targetSelector) : trigger.parentElement;
            
            if (target && componentName) {
                try {
                    trigger.classList.add('loading');
                    await this.loadComponent(componentName, {
                        element: target,
                        data: componentData ? JSON.parse(componentData) : {},
                        replace: trigger.hasAttribute('data-replace')
                    });
                } catch (error) {
                    console.error('Failed to load component:', error);
                    this.showError(target, error);
                } finally {
                    trigger.classList.remove('loading');
                }
            }
        });

        // Handle component refresh
        document.addEventListener('click', async (e) => {
            const refresh = e.target.closest('[data-refresh-component]');
            if (!refresh) return;

            e.preventDefault();
            const componentName = refresh.getAttribute('data-refresh-component');
            await this.refreshComponent(componentName);
        });
    }

    async preloadCriticalComponents() {
        const criticalComponents = this.config.preload;
        
        for (const componentName of criticalComponents) {
            try {
                await this.loadComponent(componentName, { preload: true });
            } catch (error) {
                console.warn(`Failed to preload component ${componentName}:`, error);
            }
        }
    }

    async loadComponent(name, options = {}) {
        const startTime = performance.now();
        
        try {
            // Check if already loading
            if (this.loadingPromises.has(name)) {
                return await this.loadingPromises.get(name);
            }

            // Check cache first
            if (this.cache.has(name) && !options.refresh) {
                const cached = this.cache.get(name);
                this.stats.cached++;
                
                if (options.element && !options.preload) {
                    await this.renderComponent(cached, options);
                }
                
                return cached;
            }

            // Start loading
            const loadingPromise = this.fetchComponent(name);
            this.loadingPromises.set(name, loadingPromise);

            const component = await loadingPromise;
            
            // Cache the component
            this.cacheComponent(name, component);
            
            // Register the component
            this.components.set(name, component);
            
            // Render if needed
            if (options.element && !options.preload) {
                await this.renderComponent(component, options);
            }
            
            // Update stats
            this.stats.loaded++;
            this.stats.loadTime += performance.now() - startTime;
            
            // Clean up loading promise
            this.loadingPromises.delete(name);
            
            console.log(`✅ Component loaded: ${name} (${Math.round(performance.now() - startTime)}ms)`);
            
            return component;
            
        } catch (error) {
            this.stats.failed++;
            this.loadingPromises.delete(name);
            
            console.error(`❌ Failed to load component: ${name}`, error);
            throw error;
        }
    }

    async fetchComponent(name) {
        const componentUrl = `${this.config.baseUrl}${name}.html`;
        const response = await this.fetchWithRetry(componentUrl);
        
        if (!response.ok) {
            throw new Error(`Component not found: ${name} (${response.status})`);
        }
        
        const html = await response.text();
        const component = this.parseComponent(name, html);
        
        // Load associated resources
        await this.loadComponentResources(name, component);
        
        return component;
    }

    async fetchWithRetry(url) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
                
                const response = await fetch(url, {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'text/html',
                        ...(this.config.compression && { 'Accept-Encoding': 'gzip, deflate, br' })
                    }
                });
                
                clearTimeout(timeoutId);
                return response;
                
            } catch (error) {
                lastError = error;
                
                if (attempt < this.config.retryAttempts) {
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                    await this.sleep(delay);
                    console.warn(`Retrying component fetch (${attempt}/${this.config.retryAttempts}):`, url);
                }
            }
        }
        
        throw lastError;
    }

    parseComponent(name, html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const component = {
            name,
            html: html,
            template: doc.querySelector('template')?.innerHTML || html,
            styles: this.extractStyles(doc),
            scripts: this.extractScripts(doc),
            metadata: this.extractMetadata(doc),
            dependencies: this.extractDependencies(doc),
            timestamp: Date.now()
        };
        
        return component;
    }

    extractStyles(doc) {
        const styles = [];
        const styleElements = doc.querySelectorAll('style, link[rel="stylesheet"]');
        
        styleElements.forEach(element => {
            if (element.tagName === 'STYLE') {
                styles.push({
                    type: 'inline',
                    content: element.textContent,
                    media: element.media || 'all'
                });
            } else if (element.tagName === 'LINK') {
                styles.push({
                    type: 'external',
                    href: element.href,
                    media: element.media || 'all'
                });
            }
        });
        
        return styles;
    }

    extractScripts(doc) {
        const scripts = [];
        const scriptElements = doc.querySelectorAll('script');
        
        scriptElements.forEach(element => {
            if (element.src) {
                scripts.push({
                    type: 'external',
                    src: element.src,
                    async: element.async,
                    defer: element.defer
                });
            } else if (element.textContent.trim()) {
                scripts.push({
                    type: 'inline',
                    content: element.textContent,
                    async: element.async
                });
            }
        });
        
        return scripts;
    }

    extractMetadata(doc) {
        const metadata = {};
        const metaElement = doc.querySelector('meta[name="component"]');
        
        if (metaElement) {
            const content = metaElement.getAttribute('content');
            try {
                Object.assign(metadata, JSON.parse(content));
            } catch (e) {
                metadata.description = content;
            }
        }
        
        // Extract other relevant metadata
        const titleElement = doc.querySelector('title');
        if (titleElement) {
            metadata.title = titleElement.textContent;
        }
        
        return metadata;
    }

    extractDependencies(doc) {
        const dependencies = [];
        const depElements = doc.querySelectorAll('[data-depends]');
        
        depElements.forEach(element => {
            const deps = element.getAttribute('data-depends').split(',');
            dependencies.push(...deps.map(dep => dep.trim()));
        });
        
        return [...new Set(dependencies)];
    }

    async loadComponentResources(name, component) {
        // Load styles
        for (const style of component.styles) {
            await this.loadStyle(name, style);
        }
        
        // Load scripts
        for (const script of component.scripts) {
            await this.loadScript(name, script);
        }
        
        // Load dependencies
        for (const dependency of component.dependencies) {
            if (!this.components.has(dependency)) {
                await this.loadComponent(dependency, { preload: true });
            }
        }
    }

    async loadStyle(componentName, style) {
        const styleId = `component-style-${componentName}`;
        
        if (document.getElementById(styleId)) return;
        
        if (style.type === 'inline') {
            const styleElement = document.createElement('style');
            styleElement.id = styleId;
            styleElement.textContent = style.content;
            styleElement.media = style.media;
            document.head.appendChild(styleElement);
            
            this.styles.set(componentName, styleElement);
        } else if (style.type === 'external') {
            const linkElement = document.createElement('link');
            linkElement.id = styleId;
            linkElement.rel = 'stylesheet';
            linkElement.href = style.href;
            linkElement.media = style.media;
            
            document.head.appendChild(linkElement);
            
            // Wait for stylesheet to load
            await new Promise((resolve, reject) => {
                linkElement.onload = resolve;
                linkElement.onerror = reject;
                setTimeout(reject, this.config.timeout);
            });
            
            this.styles.set(componentName, linkElement);
        }
    }

    async loadScript(componentName, script) {
        const scriptId = `component-script-${componentName}`;
        
        if (script.type === 'inline') {
            try {
                // Execute inline script in controlled environment
                // Note: Using Function constructor for dynamic component loading (enterprise feature)
                // eslint-disable-next-line no-new-func
                const func = new Function(script.content);
                func();
            } catch (error) {
                console.error(`Error executing script for component ${componentName}:`, error);
            }
        } else if (script.type === 'external') {
            if (document.getElementById(scriptId)) return;
            
            const scriptElement = document.createElement('script');
            scriptElement.id = scriptId;
            scriptElement.src = script.src;
            scriptElement.async = script.async;
            scriptElement.defer = script.defer;
            
            document.head.appendChild(scriptElement);
            
            // Wait for script to load
            await new Promise((resolve, reject) => {
                scriptElement.onload = resolve;
                scriptElement.onerror = reject;
                setTimeout(reject, this.config.timeout);
            });
            
            this.scripts.set(componentName, scriptElement);
        }
    }

    async renderComponent(component, options) {
        const { element, data = {}, replace = false } = options;
        
        if (!element) return;
        
        try {
            // Process template with data
            let html = this.processTemplate(component.template, data);
            
            // Handle nested components
            html = await this.processNestedComponents(html);
            
            // Render the component
            if (replace) {
                element.outerHTML = html;
            } else {
                element.innerHTML = html;
            }
            
            // Initialize component behavior
            this.initializeComponentBehavior(element, component, data);
            
            // Trigger component loaded event
            this.triggerComponentEvent('loaded', {
                component: component.name,
                element,
                data
            });
            
        } catch (error) {
            console.error(`Error rendering component ${component.name}:`, error);
            this.showError(element, error);
        }
    }

    processTemplate(template, data) {
        // Simple template processing (can be extended with more sophisticated templating)
        let processed = template;
        
        // Replace {{key}} with data values
        processed = processed.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] !== undefined ? this.escapeHtml(data[key]) : match;
        });
        
        // Handle conditional blocks {{#if key}}...{{/if}}
        processed = processed.replace(/\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs, (match, key, content) => {
            return data[key] ? content : '';
        });
        
        // Handle loops {{#each items}}...{{/each}}
        processed = processed.replace(/\{\{#each\s+(\w+)\}\}(.*?)\{\{\/each\}\}/gs, (match, key, content) => {
            const items = data[key];
            if (!Array.isArray(items)) return '';
            
            return items.map(item => {
                return content.replace(/\{\{this\}\}/g, this.escapeHtml(item))
                             .replace(/\{\{(\w+)\}\}/g, (match, prop) => {
                                 return item[prop] !== undefined ? this.escapeHtml(item[prop]) : match;
                             });
            }).join('');
        });
        
        return processed;
    }

    async processNestedComponents(html) {
        const componentRegex = /<component\s+name="([^"]+)"(?:\s+data="([^"]+)")?\s*><\/component>/g;
        let processed = html;
        let match;
        
        while ((match = componentRegex.exec(html)) !== null) {
            const [fullMatch, componentName, componentData] = match;
            
            try {
                const nestedComponent = await this.loadComponent(componentName, { preload: true });
                const data = componentData ? JSON.parse(this.decodeHtml(componentData)) : {};
                const renderedHtml = this.processTemplate(nestedComponent.template, data);
                
                processed = processed.replace(fullMatch, renderedHtml);
            } catch (error) {
                console.error(`Failed to load nested component ${componentName}:`, error);
                processed = processed.replace(fullMatch, `<div class="component-error">Failed to load component: ${componentName}</div>`);
            }
        }
        
        return processed;
    }

    initializeComponentBehavior(element, component, data) {
        // Initialize lazy loading for child components
        const lazyComponents = element.querySelectorAll('[data-component]');
        lazyComponents.forEach(child => {
            if (this.lazyObserver) {
                this.lazyObserver.observe(child);
            }
        });
        
        // Initialize component-specific behavior
        const initScript = element.querySelector('script[data-init]');
        if (initScript) {
            try {
                // Note: Using Function constructor for dynamic component initialization (enterprise feature)
                // eslint-disable-next-line no-new-func
                const initFunction = new Function('element', 'data', 'component', initScript.textContent);
                initFunction(element, data, component);
            } catch (error) {
                console.error(`Error initializing component ${component.name}:`, error);
            }
        }
        
        // Trigger custom initialization event
        element.dispatchEvent(new CustomEvent('component:init', {
            detail: { component: component.name, data }
        }));
    }

    cacheComponent(name, component) {
        switch (this.config.cacheStrategy) {
            case 'memory':
                this.cache.set(name, component);
                break;
                
            case 'localStorage':
                try {
                    localStorage.setItem(`component_${name}`, JSON.stringify(component));
                } catch (error) {
                    console.warn('Failed to cache component in localStorage:', error);
                }
                break;
                
            case 'sessionStorage':
                try {
                    sessionStorage.setItem(`component_${name}`, JSON.stringify(component));
                } catch (error) {
                    console.warn('Failed to cache component in sessionStorage:', error);
                }
                break;
                
            default:
                // Default to memory caching
                this.cache.set(name, component);
                console.warn(`Unknown cache strategy: ${this.config.cacheStrategy}, defaulting to memory`);
                break;
        }
    }

    loadStoredCache() {
        if (this.config.cacheStrategy === 'localStorage') {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('component_')) {
                    const name = key.replace('component_', '');
                    try {
                        const component = JSON.parse(localStorage.getItem(key));
                        this.cache.set(name, component);
                    } catch (error) {
                        console.warn(`Failed to load cached component ${name}:`, error);
                    }
                }
            }
        }
    }

    async refreshComponent(name) {
        // Clear cache
        this.cache.delete(name);
        
        if (this.config.cacheStrategy === 'localStorage') {
            localStorage.removeItem(`component_${name}`);
        } else if (this.config.cacheStrategy === 'sessionStorage') {
            sessionStorage.removeItem(`component_${name}`);
        }
        
        // Reload component
        const component = await this.loadComponent(name, { refresh: true });
        
        // Re-render all instances
        const instances = document.querySelectorAll(`[data-component="${name}"]`);
        for (const instance of instances) {
            const data = instance.getAttribute('data-component-data');
            await this.renderComponent(component, {
                element: instance,
                data: data ? JSON.parse(data) : {}
            });
        }
        
        console.log(`🔄 Component refreshed: ${name}`);
    }

    unloadComponent(name) {
        // Remove from memory
        this.components.delete(name);
        this.cache.delete(name);
        
        // Remove styles
        const style = this.styles.get(name);
        if (style) {
            style.remove();
            this.styles.delete(name);
        }
        
        // Remove scripts
        const script = this.scripts.get(name);
        if (script) {
            script.remove();
            this.scripts.delete(name);
        }
        
        // Clear from storage
        if (this.config.cacheStrategy === 'localStorage') {
            localStorage.removeItem(`component_${name}`);
        } else if (this.config.cacheStrategy === 'sessionStorage') {
            sessionStorage.removeItem(`component_${name}`);
        }
        
        console.log(`🗑️ Component unloaded: ${name}`);
    }

    showError(element, _error) {
        element.innerHTML = `
            <div class="component-error" role="alert">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Failed to load component</span>
                <button class="retry-btn" onclick="location.reload()">Retry</button>
            </div>
        `;
    }

    triggerComponentEvent(eventType, detail) {
        document.dispatchEvent(new CustomEvent(`component:${eventType}`, { detail }));
    }

    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    decodeHtml(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API methods
    getStats() {
        return {
            ...this.stats,
            cached: this.cache.size,
            components: this.components.size,
            averageLoadTime: this.stats.loaded > 0 ? this.stats.loadTime / this.stats.loaded : 0
        };
    }

    getComponent(name) {
        return this.components.get(name);
    }

    isLoaded(name) {
        return this.components.has(name);
    }

    isCached(name) {
        return this.cache.has(name);
    }

    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    clearCache() {
        this.cache.clear();
        
        if (this.config.cacheStrategy === 'localStorage') {
            const keys = Object.keys(localStorage).filter(key => key.startsWith('component_'));
            keys.forEach(key => localStorage.removeItem(key));
        } else if (this.config.cacheStrategy === 'sessionStorage') {
            const keys = Object.keys(sessionStorage).filter(key => key.startsWith('component_'));
            keys.forEach(key => sessionStorage.removeItem(key));
        }
        
        console.log('🧹 Component cache cleared');
    }

    preloadComponents(components) {
        this.config.preload = [...new Set([...this.config.preload, ...components])];
        return Promise.all(components.map(name => this.loadComponent(name, { preload: true })));
    }

    // Development helpers
    listComponents() {
        console.table(Array.from(this.components.keys()).map(name => ({
            name,
            cached: this.cache.has(name),
            hasStyles: this.styles.has(name),
            hasScripts: this.scripts.has(name),
            metadata: this.components.get(name).metadata
        })));
    }

    debugComponent(name) {
        const component = this.components.get(name);
        if (!component) {
            console.error(`Component ${name} not found`);
            return;
        }
        
        console.group(`🔍 Component Debug: ${name}`);
        console.log('Component:', component);
        console.log('Template:', component.template);
        console.log('Styles:', component.styles);
        console.log('Scripts:', component.scripts);
        console.log('Dependencies:', component.dependencies);
        console.log('Metadata:', component.metadata);
        console.groupEnd();
    }
}

// Export for use in other modules
export default ComponentLoader;

// Auto-initialize if not imported as module
if (typeof module === 'undefined') {
    window.ComponentLoader = ComponentLoader;
}