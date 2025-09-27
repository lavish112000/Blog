/**
 * Integration Manager
 * Ensures all components work together without overlapping or conflicts
 */

class IntegrationManager {
    constructor() {
        this.activeOverlays = new Set();
        this.eventListeners = new Map();
        this.componentStates = new Map();
        
        this.init();
    }

    init() {
        this.setupOverlayManagement();
        this.setupEventCoordination();
        this.setupKeyboardNavigation();
        this.setupAccessibilityFeatures();
        this.setupConflictResolution();
    }

    setupOverlayManagement() {
        // Central overlay management to prevent conflicts
        const overlayElements = [
            'search-overlay',
            'reading-settings-panel',
            'bookmarks-panel',
            'notifications-panel'
        ];

        overlayElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.setupOverlayBehavior(element, id);
            }
        });
    }

    setupOverlayBehavior(element, id) {
        // Track overlay state
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isActive = element.classList.contains('active') || 
                                   element.classList.contains('show');
                    
                    if (isActive) {
                        this.showOverlay(id);
                    } else {
                        this.hideOverlay(id);
                    }
                }
            });
        });

        observer.observe(element, { attributes: true });
    }

    showOverlay(overlayId) {
        // Close other overlays before showing new one
        this.activeOverlays.forEach(activeId => {
            if (activeId !== overlayId) {
                this.forceCloseOverlay(activeId);
            }
        });

        this.activeOverlays.add(overlayId);
        document.body.classList.add('modal-open');
        
        // Focus management
        this.manageFocus(overlayId);
    }

    hideOverlay(overlayId) {
        this.activeOverlays.delete(overlayId);
        
        if (this.activeOverlays.size === 0) {
            document.body.classList.remove('modal-open');
        }

        // Return focus to trigger element
        this.returnFocus(overlayId);
    }

    forceCloseOverlay(overlayId) {
        const element = document.getElementById(overlayId);
        if (element) {
            element.classList.remove('active', 'show');
            
            // Trigger close event for component cleanup
            const closeEvent = new CustomEvent('overlay:close', {
                detail: { overlayId }
            });
            element.dispatchEvent(closeEvent);
        }
    }

    setupEventCoordination() {
        // Coordinate events between components to prevent conflicts
        
        // Search coordination
        document.addEventListener('click', (e) => {
            // Search toggle
            if (e.target.matches('#search-toggle')) {
                e.preventDefault();
                this.toggleSearch();
            }
            
            // Reading settings toggle
            if (e.target.matches('#reading-settings-toggle')) {
                e.preventDefault();
                this.toggleReadingSettings();
            }
            
            // Bookmarks toggle
            if (e.target.matches('#bookmarks-toggle')) {
                e.preventDefault();
                this.toggleBookmarks();
            }
            
            // Theme toggle
            if (e.target.matches('#theme-toggle')) {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        // Close overlays when clicking outside
        document.addEventListener('click', (e) => {
            this.activeOverlays.forEach(overlayId => {
                const overlay = document.getElementById(overlayId);
                if (overlay && !overlay.contains(e.target) && !this.isOverlayTrigger(e.target, overlayId)) {
                    this.forceCloseOverlay(overlayId);
                }
            });
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Escape key closes all overlays
            if (e.key === 'Escape') {
                this.closeAllOverlays();
            }
            
            // Tab navigation management
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
            
            // Keyboard shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                    case '/':
                        e.preventDefault();
                        this.toggleSearch();
                        break;
                    case 'b':
                        e.preventDefault();
                        this.toggleBookmarks();
                        break;
                    default:
                        // No action for other keys
                        break;
                }
            }
        });
    }

    setupAccessibilityFeatures() {
        // ARIA management
        document.addEventListener('focusin', (e) => {
            // Update ARIA states based on focus
            this.updateAriaStates();
        });

        // Screen reader announcements
        this.setupScreenReaderAnnouncements();
    }

    setupConflictResolution() {
        // Resolve conflicts between similar features
        this.resolveDuplicateElements();
        this.coordinateAnimations();
        this.manageZIndexes();
    }

    // Public methods for component coordination

    toggleSearch() {
        const searchOverlay = document.getElementById('search-overlay');
        if (searchOverlay) {
            const isActive = searchOverlay.classList.contains('active');
            
            if (isActive) {
                this.forceCloseOverlay('search-overlay');
            } else {
                searchOverlay.classList.add('active');
                
                // Focus search input
                setTimeout(() => {
                    const searchInput = document.getElementById('search-input');
                    if (searchInput) {
                        searchInput.focus();
                    }
                }, 100);
            }
        }
    }

    toggleReadingSettings() {
        const panel = document.getElementById('reading-settings-panel');
        if (panel) {
            const isActive = panel.classList.contains('active');
            
            if (isActive) {
                this.forceCloseOverlay('reading-settings-panel');
            } else {
                panel.classList.add('active');
            }
        }
    }

    toggleBookmarks() {
        const panel = document.getElementById('bookmarks-panel');
        if (panel) {
            const isActive = panel.classList.contains('active');
            
            if (isActive) {
                this.forceCloseOverlay('bookmarks-panel');
            } else {
                panel.classList.add('active');
            }
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme toggle icon
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
        
        // Announce theme change
        this.announceToScreenReader(`Theme changed to ${newTheme} mode`);
    }

    closeAllOverlays() {
        this.activeOverlays.forEach(overlayId => {
            this.forceCloseOverlay(overlayId);
        });
    }

    isOverlayTrigger(element, overlayId) {
        const triggers = {
            'search-overlay': ['#search-toggle', '.search-toggle'],

            'reading-settings-panel': ['#reading-settings-toggle'],
            'bookmarks-panel': ['#bookmarks-toggle'],
            'notifications-panel': ['#notifications-toggle']
        };

        const overlayTriggers = triggers[overlayId] || [];
        return overlayTriggers.some(selector => element.matches(selector));
    }

    manageFocus(overlayId) {
        const overlay = document.getElementById(overlayId);
        if (!overlay) return;

        // Store current focus
        this.previousFocus = document.activeElement;

        // Find first focusable element in overlay
        const focusableElements = overlay.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    returnFocus(overlayId) {
        if (this.previousFocus && this.previousFocus !== document.body) {
            this.previousFocus.focus();
        }
    }

    handleTabNavigation(e) {
        // Trap focus within active overlays
        this.activeOverlays.forEach(overlayId => {
            const overlay = document.getElementById(overlayId);
            if (overlay) {
                this.trapFocus(overlay, e);
            }
        });
    }

    trapFocus(container, e) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    updateAriaStates() {
        // Update ARIA expanded states
        document.querySelectorAll('[aria-expanded]').forEach(element => {
            const isExpanded = element.classList.contains('active') || 
                              element.classList.contains('show');
            element.setAttribute('aria-expanded', isExpanded);
        });
    }

    setupScreenReaderAnnouncements() {
        const announcer = document.createElement('div');
        announcer.id = 'sr-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.position = 'absolute';
        announcer.style.left = '-10000px';
        announcer.style.width = '1px';
        announcer.style.height = '1px';
        announcer.style.overflow = 'hidden';
        
        document.body.appendChild(announcer);
    }

    announceToScreenReader(message) {
        const announcer = document.getElementById('sr-announcer');
        if (announcer) {
            announcer.textContent = message;
        }
    }

    resolveDuplicateElements() {
        // Remove duplicate bookmark counters, keeping only one
        const bookmarkCounters = document.querySelectorAll('.bookmark-counter, .bookmark-count');
        if (bookmarkCounters.length > 1) {
            // Keep the first one, remove others
            for (let i = 1; i < bookmarkCounters.length; i++) {
                bookmarkCounters[i].remove();
            }
        }
    }

    coordinateAnimations() {
        // Prevent conflicting animations
        let animationQueue = [];
        
        const processQueue = () => {
            if (animationQueue.length > 0) {
                const animation = animationQueue.shift();
                animation().then(() => {
                    setTimeout(processQueue, 100);
                });
            }
        };

        // Queue animations instead of running simultaneously
        this.queueAnimation = (animationFn) => {
            animationQueue.push(animationFn);
            if (animationQueue.length === 1) {
                processQueue();
            }
        };
    }

    manageZIndexes() {
        // Set proper z-index hierarchy
        const zIndexMap = {
            'header': 1000,
            'search-overlay': 1002,

            'reading-settings-panel': 1001,
            'bookmarks-panel': 1001,
            'notifications-panel': 1001,
            'pwa-install-banner': 10000,
            'notification': 10002
        };

        Object.entries(zIndexMap).forEach(([id, zIndex]) => {
            const element = document.getElementById(id) || document.querySelector(`.${id}`);
            if (element) {
                element.style.zIndex = zIndex;
            }
        });
    }

    // Utility methods
    getActiveOverlays() {
        return Array.from(this.activeOverlays);
    }

    isAnyOverlayActive() {
        return this.activeOverlays.size > 0;
    }

    destroy() {
        this.eventListeners.forEach((listener, element) => {
            element.removeEventListener(...listener);
        });
        this.eventListeners.clear();
        this.activeOverlays.clear();
        this.componentStates.clear();
    }
}

// Initialize integration manager
let integrationManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        integrationManager = new IntegrationManager();
    });
} else {
    integrationManager = new IntegrationManager();
}

// Export for external use
window.IntegrationManager = IntegrationManager;
window.integrationManager = integrationManager;