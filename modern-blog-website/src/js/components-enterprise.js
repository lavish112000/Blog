/**
 * Components Enterprise Module  
 * Enhanced component functionality for enterprise features
 */

class ComponentsEnterprise {
    constructor() {
        this.components = new Map();
        this.observers = new Map();
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            this.setupIntersectionObservers();
            this.initializeComponents();
            this.setupEventDelegation();
            this.setupAccessibility();
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize components enterprise:', error);
        }
    }

    setupIntersectionObservers() {
        // Lazy loading observer
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadComponent(entry.target);
                    lazyObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        // Animation observer
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                } else {
                    entry.target.classList.remove('animate-in');
                }
            });
        }, {
            threshold: 0.2
        });

        this.observers.set('lazy', lazyObserver);
        this.observers.set('animation', animationObserver);

        // Observe lazy-loadable elements
        document.querySelectorAll('[data-lazy]').forEach(el => {
            lazyObserver.observe(el);
        });

        // Observe animatable elements
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            animationObserver.observe(el);
        });
    }

    async loadComponent(element) {
        const componentName = element.dataset.component;
        const componentSrc = element.dataset.src;

        if (!componentName || this.components.has(componentName)) {
            return;
        }

        try {
            element.classList.add('loading');

            // Load component content
            if (componentSrc) {
                const response = await fetch(componentSrc);
                const html = await response.text();
                element.innerHTML = html;
            }

            // Initialize component behavior
            await this.initializeComponentBehavior(element, componentName);

            element.classList.remove('loading');
            element.classList.add('loaded');
            
            this.components.set(componentName, element);
        } catch (error) {
            console.error(`Failed to load component ${componentName}:`, error);
            element.classList.remove('loading');
            element.classList.add('error');
        }
    }

    async initializeComponentBehavior(element, componentName) {
        switch (componentName) {
            case 'newsletter':
                this.initializeNewsletter(element);
                break;
            case 'search':
                this.initializeSearch(element);
                break;
            case 'comments':
                this.initializeComments(element);
                break;
            case 'social-share':
                this.initializeSocialShare(element);
                break;
            case 'reading-progress':
                this.initializeReadingProgress(element);
                break;
            default:
                // Generic component initialization
                this.initializeGenericComponent(element);
        }
    }

    initializeNewsletter(element) {
        const form = element.querySelector('.newsletter-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = form.querySelector('input[type="email"]').value;
            const submitBtn = form.querySelector('button[type="submit"]');
            
            if (!email) return;

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Subscribing...';

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Show success message
                this.showNotification('Successfully subscribed to newsletter!', 'success');
                form.reset();
                
            } catch (error) {
                this.showNotification('Failed to subscribe. Please try again.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Subscribe';
            }
        });
    }

    initializeSearch(element) {
        const searchInput = element.querySelector('.search-input');
        const searchResults = element.querySelector('.search-results');
        
        if (!searchInput || !searchResults) return;

        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            
            searchTimeout = setTimeout(async () => {
                const query = e.target.value.trim();
                
                if (query.length < 3) {
                    searchResults.innerHTML = '';
                    return;
                }

                try {
                    searchResults.innerHTML = '<div class="search-loading">Searching...</div>';
                    
                    // Simulate search API call
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    const results = this.performSearch(query);
                    this.renderSearchResults(results, searchResults);
                    
                } catch (error) {
                    searchResults.innerHTML = '<div class="search-error">Search failed. Please try again.</div>';
                }
            }, 300);
        });
    }

    initializeComments(element) {
        const commentForm = element.querySelector('.comment-form');
        const commentsList = element.querySelector('.comments-list');
        
        if (!commentForm) return;

        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(commentForm);
            const comment = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message'),
                timestamp: new Date().toISOString()
            };

            try {
                // Simulate comment submission
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                this.addCommentToList(comment, commentsList);
                commentForm.reset();
                this.showNotification('Comment submitted successfully!', 'success');
                
            } catch (error) {
                this.showNotification('Failed to submit comment. Please try again.', 'error');
            }
        });
    }

    initializeSocialShare(element) {
        const shareButtons = element.querySelectorAll('.share-btn');
        
        shareButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const platform = btn.dataset.platform;
                const url = encodeURIComponent(window.location.href);
                const title = encodeURIComponent(document.title);
                
                let shareUrl = '';
                
                switch (platform) {
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                        break;
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                        break;
                    case 'linkedin':
                        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                        break;
                    case 'copy':
                        this.copyToClipboard(window.location.href);
                        return;
                    default:
                        console.warn('Unknown share platform:', platform);
                        return;
                }
                
                if (shareUrl) {
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                }
            });
        });
    }

    initializeReadingProgress(element) {
        const progressBar = element.querySelector('.progress-bar');
        if (!progressBar) return;

        const updateProgress = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress(); // Initial call
    }

    initializeGenericComponent(element) {
        // Handle generic interactive elements
        const buttons = element.querySelectorAll('button, .btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!btn.disabled) {
                    btn.classList.add('clicked');
                    setTimeout(() => btn.classList.remove('clicked'), 150);
                }
            });
        });

        // Handle form elements
        const forms = element.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    setTimeout(() => submitBtn.disabled = false, 2000);
                }
            });
        });
    }

    setupEventDelegation() {
        document.addEventListener('click', (e) => {
            // Handle dropdown toggles
            if (e.target.matches('.dropdown-toggle')) {
                e.preventDefault();
                this.toggleDropdown(e.target);
            }

            // Handle modal triggers
            if (e.target.matches('[data-modal]')) {
                e.preventDefault();
                this.openModal(e.target.dataset.modal);
            }

            // Handle tab navigation
            if (e.target.matches('.tab-btn')) {
                e.preventDefault();
                this.switchTab(e.target);
            }
        });
    }

    setupAccessibility() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllOverlays();
            }
        });

        // Focus management
        document.addEventListener('focusin', (e) => {
            if (e.target.matches('.modal, .dropdown, .overlay')) {
                e.target.classList.add('focus-within');
            }
        });

        document.addEventListener('focusout', (e) => {
            setTimeout(() => {
                if (!e.target.contains(document.activeElement)) {
                    e.target.classList.remove('focus-within');
                }
            }, 100);
        });
    }

    // Utility methods
    performSearch(query) {
        // Implement search logic here
        return [];
    }

    renderSearchResults(results, container) {
        if (results.length === 0) {
            container.innerHTML = '<div class="no-results">No results found.</div>';
            return;
        }

        const html = results.map(result => `
            <div class="search-result">
                <h4><a href="${result.url}">${result.title}</a></h4>
                <p>${result.excerpt}</p>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    addCommentToList(comment, container) {
        if (!container) return;

        const commentHTML = `
            <div class="comment">
                <div class="comment-header">
                    <strong>${comment.name}</strong>
                    <time>${new Date(comment.timestamp).toLocaleDateString()}</time>
                </div>
                <div class="comment-body">
                    <p>${comment.message}</p>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('afterbegin', commentHTML);
    }

    toggleDropdown(trigger) {
        const dropdown = trigger.nextElementSibling;
        if (!dropdown) return;

        const isOpen = dropdown.classList.contains('show');
        
        // Close all other dropdowns
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });

        if (!isOpen) {
            dropdown.classList.add('show');
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.classList.add('modal-open');
        }
    }

    closeAllOverlays() {
        document.querySelectorAll('.modal.show, .dropdown-menu.show, .overlay.show').forEach(overlay => {
            overlay.classList.remove('show');
        });
        document.body.classList.remove('modal-open');
    }

    switchTab(tabBtn) {
        const tabContainer = tabBtn.closest('.tabs');
        if (!tabContainer) return;

        const targetId = tabBtn.dataset.tab;
        const targetPanel = document.getElementById(targetId);
        
        if (!targetPanel) return;

        // Update tab buttons
        tabContainer.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        
        tabBtn.classList.add('active');
        tabBtn.setAttribute('aria-selected', 'true');

        // Update tab panels
        const tabPanels = document.querySelectorAll('.tab-panel');
        tabPanels.forEach(panel => {
            panel.classList.remove('active');
            panel.setAttribute('aria-hidden', 'true');
        });
        
        targetPanel.classList.add('active');
        targetPanel.setAttribute('aria-hidden', 'false');
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Link copied to clipboard!', 'success');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Link copied to clipboard!', 'success');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notificationContainer') || document.body;
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    destroy() {
        // Clean up observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.components.clear();
    }
}

// Initialize components enterprise
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.componentsEnterprise = new ComponentsEnterprise();
    });
} else {
    window.componentsEnterprise = new ComponentsEnterprise();
}

// Export for use in other modules
window.ComponentsEnterprise = ComponentsEnterprise;