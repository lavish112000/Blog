/**
 * =====================================
 * MODERN BLOG WEBSITE - MAIN JAVASCRIPT
 * =====================================
 */

class ModernBlog {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.handleLoadingScreen();
        this.setupScrollEffects();
        this.initializeTheme();
    }

    setupEventListeners() {
        // Navigation toggle
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }

        // Search functionality
        const searchToggle = document.getElementById('search-toggle');
        const searchOverlay = document.getElementById('search-overlay');
        const searchClose = document.getElementById('search-close');
        const searchInput = document.getElementById('search-input');

        if (searchToggle) {
            searchToggle.addEventListener('click', () => {
                searchOverlay.classList.add('active');
                setTimeout(() => searchInput.focus(), 100);
            });
        }

        if (searchClose) {
            searchClose.addEventListener('click', () => {
                searchOverlay.classList.remove('active');
            });
        }

        if (searchOverlay) {
            searchOverlay.addEventListener('click', (e) => {
                if (e.target === searchOverlay) {
                    searchOverlay.classList.remove('active');
                }
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Newsletter form
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                this.handleNewsletterSubmit(e);
            });
        }

        // Back to top button
        const backToTop = document.getElementById('back-to-top');
        if (backToTop) {
            backToTop.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }

        // Filter tabs
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleFilterTab(e.target);
            });
        });

        // Load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMorePosts();
            });
        }

        // Escape key handlers
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (searchOverlay.classList.contains('active')) {
                    searchOverlay.classList.remove('active');
                }
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            }
        });
    }

    initializeComponents() {
        // Initialize reading progress bar
        this.initReadingProgress();
        
        // Initialize intersection observer for animations
        this.initScrollAnimations();
        
        // Initialize search functionality
        this.initSearch();
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
                }, 1000);
            });
        }
    }

    setupScrollEffects() {
        const header = document.getElementById('header');
        const backToTop = document.getElementById('back-to-top');

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            // Header scroll effect
            if (header) {
                if (currentScrollY > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }

            // Back to top button
            if (backToTop) {
                if (currentScrollY > 300) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            }
        });
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('blog-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        this.updateThemeIcon();
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('blog-theme', newTheme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const themeToggle = document.getElementById('theme-toggle');
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        
        if (this.validateEmail(email)) {
            this.showNotification('Thank you for subscribing!', 'success');
            e.target.reset();
        } else {
            this.showNotification('Please enter a valid email address.', 'error');
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    handleFilterTab(clickedTab) {
        // Remove active class from all tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Add active class to clicked tab
        clickedTab.classList.add('active');
        
        // Filter posts based on selected category
        const filter = clickedTab.dataset.filter;
        this.filterPosts(filter);
    }

    filterPosts(filter) {
        const posts = document.querySelectorAll('.blog-card');
        
        posts.forEach(post => {
            if (filter === 'all' || post.dataset.category === filter) {
                post.style.display = 'block';
                post.classList.add('fade-in-up');
            } else {
                post.style.display = 'none';
            }
        });
    }

    loadMorePosts() {
        const loadMoreBtn = document.getElementById('load-more-btn');
        const postsGrid = document.getElementById('posts-grid');
        
        if (loadMoreBtn) {
            loadMoreBtn.textContent = 'Loading...';
            loadMoreBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // In a real application, you would fetch new posts from an API
                this.addMorePosts(postsGrid);
                
                loadMoreBtn.textContent = 'Load More Articles';
                loadMoreBtn.disabled = false;
            }, 1000);
        }
    }

    addMorePosts(container) {
        // This would typically fetch data from an API
        // For demo purposes, we'll add placeholder posts
        const newPosts = [
            {
                title: "Advanced CSS Grid Techniques",
                excerpt: "Discover advanced CSS Grid techniques that will revolutionize your layout design process.",
                author: "Sarah Wilson",
                date: "2024-01-15",
                category: "design"
            },
            {
                title: "Machine Learning Basics",
                excerpt: "An introduction to machine learning concepts and their practical applications.",
                author: "David Chen",
                date: "2024-01-14",
                category: "technology"
            }
        ];

        newPosts.forEach(post => {
            const postElement = this.createPostElement(post);
            container.appendChild(postElement);
        });
    }

    createPostElement(post) {
        const article = document.createElement('article');
        article.className = 'blog-card fade-in-up';
        article.dataset.category = post.category;
        
        article.innerHTML = `
            <div class="blog-card-image">
                <div class="blog-card-category">${post.category}</div>
            </div>
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <div class="blog-card-author">
                        <div class="author-avatar">${post.author.charAt(0)}</div>
                        <span>${post.author}</span>
                    </div>
                    <span class="blog-card-date">${post.date}</span>
                </div>
                <h3 class="blog-card-title">
                    <a href="#">${post.title}</a>
                </h3>
                <p class="blog-card-excerpt">${post.excerpt}</p>
                <div class="blog-card-footer">
                    <div class="blog-card-tags">
                        <a href="#" class="blog-tag">${post.category}</a>
                    </div>
                    <a href="#" class="read-more">
                        Read More <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
        
        return article;
    }

    initReadingProgress() {
        const progressBar = document.querySelector('.reading-progress-bar');
        if (!progressBar) return;

        window.addEventListener('scroll', () => {
            const totalHeight = document.body.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / totalHeight) * 100;
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        });
    }

    initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all elements that should animate on scroll
        document.querySelectorAll('.blog-card, .featured-card, .sidebar-widget').forEach(el => {
            observer.observe(el);
        });
    }

    initSearch() {
        const searchInput = document.getElementById('search-input');
        const searchSuggestions = document.getElementById('search-suggestions');
        
        if (!searchInput || !searchSuggestions) return;

        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length > 2) {
                searchTimeout = setTimeout(() => {
                    this.performSearch(query, searchSuggestions);
                }, 300);
            } else {
                searchSuggestions.innerHTML = '';
            }
        });
    }

    performSearch(query, suggestionsContainer) {
        // In a real application, this would make an API call
        const mockResults = [
            { title: "JavaScript Best Practices", type: "article" },
            { title: "CSS Grid Guide", type: "tutorial" },
            { title: "React Hooks", type: "article" }
        ].filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase())
        );

        suggestionsContainer.innerHTML = mockResults
            .map(result => `
                <div class="search-suggestion">
                    <i class="fas fa-search"></i>
                    <span>${result.title}</span>
                    <small>${result.type}</small>
                </div>
            `).join('');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the blog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ModernBlog();
});

// Export for use in other modules
window.ModernBlog = ModernBlog;
