/**
 * Enterprise Accessibility Manager
 * Comprehensive accessibility features and WCAG compliance
 */

class AccessibilityManager {
    constructor() {
        this.settings = {
            reducedMotion: false,
            highContrast: false,
            focusVisible: true,
            screenReader: false,
            fontSize: 'normal',
            colorBlindSupport: false,
            keyboardNavigation: true
        };

        this.focusableElements = [
            'a[href]',
            'button',
            'input',
            'textarea',
            'select',
            'details',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ].join(',');

        this.init();
    }

    init() {
        this.loadSettings();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupScreenReaderSupport();
        this.setupMotionPreferences();
        this.setupContrastMode();
        this.setupFontScaling();
        this.setupColorBlindSupport();
        this.setupSkipLinks();
        this.setupARIA();
        this.monitorChanges();
        
        console.log('♿ Accessibility Manager initialized');
    }

    loadSettings() {
        const stored = localStorage.getItem('accessibilitySettings');
        if (stored) {
            this.settings = { ...this.settings, ...JSON.parse(stored) };
        }

        // Detect system preferences
        this.detectSystemPreferences();
        this.applySettings();
    }

    saveSettings() {
        localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
        this.applySettings();
    }

    detectSystemPreferences() {
        // Detect reduced motion preference
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.settings.reducedMotion = true;
        }

        // Detect high contrast preference
        if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
            this.settings.highContrast = true;
        }

        // Detect screen reader
        if (navigator.userAgent.includes('NVDA') || 
            navigator.userAgent.includes('JAWS') || 
            navigator.userAgent.includes('VoiceOver')) {
            this.settings.screenReader = true;
        }
    }

    applySettings() {
        const root = document.documentElement;

        // Apply reduced motion
        if (this.settings.reducedMotion) {
            root.classList.add('reduce-motion');
        } else {
            root.classList.remove('reduce-motion');
        }

        // Apply high contrast
        if (this.settings.highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }

        // Apply font scaling
        root.setAttribute('data-font-scale', this.settings.fontSize);

        // Apply color blind support
        if (this.settings.colorBlindSupport) {
            root.classList.add('colorblind-support');
        } else {
            root.classList.remove('colorblind-support');
        }

        // Apply focus visible
        if (this.settings.focusVisible) {
            root.classList.add('focus-visible-enabled');
        } else {
            root.classList.remove('focus-visible-enabled');
        }
    }

    setupKeyboardNavigation() {
        let isTabPressed = false;

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                isTabPressed = true;
                document.body.classList.add('keyboard-navigation');
            }

            // Handle escape key
            if (e.key === 'Escape') {
                this.handleEscape();
            }

            // Handle arrow key navigation in menus
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                this.handleArrowNavigation(e);
            }

            // Handle enter and space for custom buttons
            if ((e.key === 'Enter' || e.key === ' ') && e.target.hasAttribute('role')) {
                this.handleActivation(e);
            }
        });

        document.addEventListener('mousedown', () => {
            if (isTabPressed) {
                document.body.classList.remove('keyboard-navigation');
                isTabPressed = false;
            }
        });

        // Skip to main content
        this.setupSkipLinks();
    }

    setupFocusManagement() {
        // Focus trap for modals and overlays
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal.active, .overlay.active');
                if (modal) {
                    this.trapFocus(e, modal);
                }
            }
        });

        // Auto-focus management
        this.setupAutoFocus();
        
        // Focus indicators
        this.enhanceFocusIndicators();
    }

    trapFocus(event, container) {
        const focusableElements = container.querySelectorAll(this.focusableElements);
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                event.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                event.preventDefault();
            }
        }
    }

    setupAutoFocus() {
        // Auto-focus first interactive element in new content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const autoFocus = node.querySelector('[data-auto-focus]');
                        if (autoFocus) {
                            setTimeout(() => autoFocus.focus(), 100);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    enhanceFocusIndicators() {
        // Add custom focus indicators for better visibility
        const style = document.createElement('style');
        style.textContent = `
            .focus-visible-enabled *:focus-visible {
                outline: 3px solid var(--focus-color, #4A90E2) !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 5px rgba(74, 144, 226, 0.3) !important;
            }
            
            .high-contrast *:focus-visible {
                outline: 4px solid #FFFF00 !important;
                background-color: #000000 !important;
                color: #FFFF00 !important;
            }
        `;
        document.head.appendChild(style);
    }

    setupScreenReaderSupport() {
        // Live regions for dynamic content
        this.createLiveRegions();
        
        // Screen reader announcements
        this.setupAnnouncements();
        
        // Enhanced labels and descriptions
        this.enhanceLabels();
    }

    createLiveRegions() {
        // Create polite live region
        if (!document.getElementById('sr-live-polite')) {
            const politeRegion = document.createElement('div');
            politeRegion.id = 'sr-live-polite';
            politeRegion.setAttribute('aria-live', 'polite');
            politeRegion.setAttribute('aria-atomic', 'true');
            politeRegion.className = 'sr-only';
            document.body.appendChild(politeRegion);
        }

        // Create assertive live region
        if (!document.getElementById('sr-live-assertive')) {
            const assertiveRegion = document.createElement('div');
            assertiveRegion.id = 'sr-live-assertive';
            assertiveRegion.setAttribute('aria-live', 'assertive');
            assertiveRegion.setAttribute('aria-atomic', 'true');
            assertiveRegion.className = 'sr-only';
            document.body.appendChild(assertiveRegion);
        }
    }

    announce(message, priority = 'polite') {
        const region = document.getElementById(`sr-live-${priority}`);
        if (region) {
            region.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                region.textContent = '';
            }, 1000);
        }
    }

    setupAnnouncements() {
        // Announce page changes
        window.addEventListener('popstate', () => {
            this.announce(`Navigated to ${document.title}`, 'polite');
        });

        // Announce dynamic content updates
        this.observeContentChanges();
    }

    observeContentChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Announce new articles or content blocks
                            if (node.matches('.post-card, .article-card, .notification')) {
                                const title = node.querySelector('h1, h2, h3, .title')?.textContent;
                                if (title) {
                                    this.announce(`New content loaded: ${title}`, 'polite');
                                }
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.main || document.body, {
            childList: true,
            subtree: true
        });
    }

    enhanceLabels() {
        // Auto-enhance form controls without proper labels
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach((input) => {
            if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
                const placeholder = input.getAttribute('placeholder');
                const parentLabel = input.closest('label');
                
                if (placeholder && !parentLabel) {
                    input.setAttribute('aria-label', placeholder);
                }
            }
        });
    }

    setupMotionPreferences() {
        // Respect reduced motion preferences
        if (this.settings.reducedMotion) {
            const style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupContrastMode() {
        if (this.settings.highContrast) {
            const style = document.createElement('style');
            style.textContent = `
                .high-contrast {
                    filter: contrast(150%) brightness(120%);
                }
                
                .high-contrast * {
                    text-shadow: none !important;
                    box-shadow: none !important;
                }
                
                .high-contrast a {
                    text-decoration: underline !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupFontScaling() {
        const scales = {
            'small': '0.875',
            'normal': '1',
            'large': '1.125',
            'x-large': '1.25',
            'xx-large': '1.5'
        };

        if (scales[this.settings.fontSize]) {
            document.documentElement.style.fontSize = `${scales[this.settings.fontSize]}rem`;
        }
    }

    setupColorBlindSupport() {
        if (this.settings.colorBlindSupport) {
            // Add patterns and textures for color-blind users
            const style = document.createElement('style');
            style.textContent = `
                .colorblind-support .success { background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px); }
                .colorblind-support .warning { background-image: repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px); }
                .colorblind-support .error { background-image: repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.2) 2px, rgba(255,255,255,0.2) 4px); }
            `;
            document.head.appendChild(style);
        }
    }

    setupSkipLinks() {
        // Add skip links if they don't exist
        if (!document.querySelector('.skip-nav')) {
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.className = 'skip-nav';
            skipLink.textContent = 'Skip to main content';
            document.body.insertBefore(skipLink, document.body.firstChild);
        }

        // Handle skip link functionality
        document.addEventListener('click', (e) => {
            if (e.target.matches('.skip-nav')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    setupARIA() {
        // Auto-enhance ARIA attributes
        this.enhanceHeadings();
        this.enhanceNavigation();
        this.enhanceForms();
        this.enhanceButtons();
        this.enhanceImages();
    }

    enhanceHeadings() {
        // Ensure proper heading hierarchy
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let currentLevel = 0;
        
        headings.forEach((heading) => {
            const level = parseInt(heading.tagName.charAt(1));
            
            if (level > currentLevel + 1) {
                console.warn(`Accessibility: Heading level skip detected. Found h${level} after h${currentLevel}`);
            }
            
            currentLevel = level;
            
            // Add section role if not present
            if (!heading.getAttribute('role')) {
                heading.setAttribute('role', 'heading');
                heading.setAttribute('aria-level', level.toString());
            }
        });
    }

    enhanceNavigation() {
        // Enhance navigation landmarks
        const navElements = document.querySelectorAll('nav');
        navElements.forEach((nav, index) => {
            if (!nav.getAttribute('aria-label') && !nav.getAttribute('aria-labelledby')) {
                nav.setAttribute('aria-label', `Navigation ${index + 1}`);
            }
        });

        // Enhance breadcrumbs
        const breadcrumbs = document.querySelectorAll('.breadcrumb, .breadcrumbs');
        breadcrumbs.forEach((breadcrumb) => {
            if (!breadcrumb.getAttribute('aria-label')) {
                breadcrumb.setAttribute('aria-label', 'Breadcrumb navigation');
            }
        });
    }

    enhanceForms() {
        // Group related form controls
        const fieldsets = document.querySelectorAll('fieldset');
        fieldsets.forEach((fieldset) => {
            if (!fieldset.querySelector('legend')) {
                console.warn('Accessibility: Fieldset without legend detected');
            }
        });

        // Enhance error messages
        const errorElements = document.querySelectorAll('.error, .invalid, [data-error]');
        errorElements.forEach((error) => {
            if (!error.getAttribute('role')) {
                error.setAttribute('role', 'alert');
            }
        });
    }

    enhanceButtons() {
        // Enhance button accessibility
        const buttons = document.querySelectorAll('button, [role="button"]');
        buttons.forEach((button) => {
            // Ensure buttons have accessible names
            if (!button.textContent.trim() && 
                !button.getAttribute('aria-label') && 
                !button.getAttribute('aria-labelledby')) {
                console.warn('Accessibility: Button without accessible name detected', button);
            }

            // Add pressed state for toggle buttons
            if (button.hasAttribute('data-toggle')) {
                button.setAttribute('aria-pressed', 'false');
            }
        });
    }

    enhanceImages() {
        // Enhance image accessibility
        const images = document.querySelectorAll('img');
        images.forEach((img) => {
            if (!img.getAttribute('alt')) {
                // Check if image is decorative
                if (img.closest('.decoration, .background') || 
                    img.classList.contains('decorative')) {
                    img.setAttribute('alt', '');
                    img.setAttribute('role', 'presentation');
                } else {
                    console.warn('Accessibility: Image without alt text detected', img);
                }
            }
        });
    }

    monitorChanges() {
        // Monitor for new elements that need accessibility enhancements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.enhanceNewElement(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    enhanceNewElement(element) {
        // Enhance newly added elements
        if (element.matches('img') && !element.getAttribute('alt')) {
            element.setAttribute('alt', '');
        }

        if (element.matches('button') && !element.textContent.trim() && 
            !element.getAttribute('aria-label')) {
            console.warn('New button without accessible name:', element);
        }

        // Add focus management for new interactive elements
        const focusableElements = element.querySelectorAll(this.focusableElements);
        focusableElements.forEach((el) => {
            if (!el.hasAttribute('tabindex') && el.hasAttribute('data-keyboard-focusable')) {
                el.setAttribute('tabindex', '0');
            }
        });
    }

    handleEscape() {
        // Close modals, dropdowns, etc. on escape
        const openModal = document.querySelector('.modal.active, .overlay.active');
        if (openModal) {
            this.announceModalClose(openModal);
            const closeButton = openModal.querySelector('.close, [data-close]');
            if (closeButton) {
                closeButton.click();
            }
        }

        const openDropdown = document.querySelector('.dropdown.active, .menu.active');
        if (openDropdown) {
            openDropdown.classList.remove('active');
            const trigger = document.querySelector(`[aria-controls="${openDropdown.id}"]`);
            if (trigger) {
                trigger.focus();
                trigger.setAttribute('aria-expanded', 'false');
            }
        }
    }

    announceModalClose(modal) {
        const title = modal.querySelector('h1, h2, h3, .title')?.textContent || 'Dialog';
        this.announce(`${title} closed`, 'polite');
    }

    handleArrowNavigation(event) {
        const target = event.target;
        const menu = target.closest('[role="menu"], .menu, .dropdown-menu');
        
        if (menu) {
            event.preventDefault();
            const items = menu.querySelectorAll('[role="menuitem"], .menu-item, a, button');
            const currentIndex = Array.from(items).indexOf(target);
            let nextIndex;

            switch (event.key) {
                case 'ArrowDown':
                    nextIndex = (currentIndex + 1) % items.length;
                    break;
                case 'ArrowUp':
                    nextIndex = currentIndex - 1 < 0 ? items.length - 1 : currentIndex - 1;
                    break;
                case 'Home':
                    nextIndex = 0;
                    break;
                case 'End':
                    nextIndex = items.length - 1;
                    break;
                default:
                    return;
            }

            if (items[nextIndex]) {
                items[nextIndex].focus();
            }
        }
    }

    handleActivation(event) {
        const target = event.target;
        
        if (target.hasAttribute('role')) {
            const role = target.getAttribute('role');
            
            if (role === 'button' && !target.disabled) {
                event.preventDefault();
                target.click();
            }
            
            if (role === 'tab') {
                event.preventDefault();
                this.activateTab(target);
            }
        }
    }

    activateTab(tab) {
        const tabList = tab.closest('[role="tablist"]');
        if (!tabList) return;

        // Deactivate all tabs
        const allTabs = tabList.querySelectorAll('[role="tab"]');
        allTabs.forEach((t) => {
            t.setAttribute('aria-selected', 'false');
            t.classList.remove('active');
            
            const panel = document.getElementById(t.getAttribute('aria-controls'));
            if (panel) {
                panel.hidden = true;
            }
        });

        // Activate selected tab
        tab.setAttribute('aria-selected', 'true');
        tab.classList.add('active');
        
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) {
            panel.hidden = false;
        }

        this.announce(`${tab.textContent} tab selected`, 'polite');
    }

    // Public API methods
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.announce(`${key} setting updated`, 'polite');
    }

    getSettings() {
        return { ...this.settings };
    }

    toggleHighContrast() {
        this.updateSetting('highContrast', !this.settings.highContrast);
    }

    toggleReducedMotion() {
        this.updateSetting('reducedMotion', !this.settings.reducedMotion);
    }

    setFontSize(size) {
        this.updateSetting('fontSize', size);
    }

    checkCompliance() {
        // Run accessibility compliance checks
        const issues = [];
        
        // Check for missing alt text
        const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
        if (imagesWithoutAlt.length > 0) {
            issues.push(`${imagesWithoutAlt.length} images missing alt text`);
        }

        // Check for proper heading hierarchy
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;
        headings.forEach((heading) => {
            const level = parseInt(heading.tagName.charAt(1));
            if (level > lastLevel + 1) {
                issues.push(`Heading level skip: ${heading.tagName} after h${lastLevel}`);
            }
            lastLevel = level;
        });

        // Check for form labels
        const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
        if (inputsWithoutLabels.length > 0) {
            issues.push(`${inputsWithoutLabels.length} form inputs missing labels`);
        }

        return issues;
    }
}

// Export for use in other modules
export default AccessibilityManager;

// Auto-initialize if not imported as module
if (typeof module === 'undefined') {
    window.AccessibilityManager = AccessibilityManager;
}