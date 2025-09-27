/**
 * Blog Enterprise Module
 * Enhanced blog functionality for enterprise features
 */

class BlogEnterprise {
    constructor() {
        this.isInitialized = false;
        this.posts = new Map();
        this.categories = new Set();
        this.tags = new Set();
        this.bookmarks = new Set();
        
        this.init();
    }

    async init() {
        try {
            await this.loadPosts();
            this.setupEventListeners();
            this.initializeFilters();
            this.setupBookmarks();
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize blog enterprise features:', error);
        }
    }

    async loadPosts() {
        try {
            const response = await fetch('data/posts.json');
            const data = await response.json();
            
            if (data && data.posts) {
                data.posts.forEach(post => {
                    this.posts.set(post.id, post);
                    
                    // Collect categories and tags
                    if (post.category) this.categories.add(post.category);
                    if (post.tags) post.tags.forEach(tag => this.tags.add(tag));
                });
            }
        } catch (error) {
            console.error('Failed to load posts:', error);
        }
    }

    setupEventListeners() {
        // Category filters
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-category]')) {
                e.preventDefault();
                this.filterByCategory(e.target.dataset.category);
            }
        });

        // Bookmark functionality
        document.addEventListener('click', (e) => {
            if (e.target.matches('.bookmark-btn') || e.target.closest('.bookmark-btn')) {
                e.preventDefault();
                const postId = e.target.closest('[data-post-id]')?.dataset.postId;
                if (postId) {
                    this.toggleBookmark(postId);
                }
            }
        });
    }

    filterByCategory(category) {
        const posts = document.querySelectorAll('.blog-post');
        
        posts.forEach(post => {
            const postCategory = post.dataset.category;
            
            if (!category || category === 'all' || postCategory === category) {
                post.style.display = 'block';
                post.classList.add('fade-in');
            } else {
                post.style.display = 'none';
                post.classList.remove('fade-in');
            }
        });

        // Update active category indicator
        document.querySelectorAll('[data-category]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
    }

    toggleBookmark(postId) {
        if (this.bookmarks.has(postId)) {
            this.bookmarks.delete(postId);
        } else {
            this.bookmarks.add(postId);
        }

        this.updateBookmarkUI(postId);
        this.saveBookmarks();
    }

    updateBookmarkUI(postId) {
        const bookmarkBtns = document.querySelectorAll(`[data-post-id="${postId}"] .bookmark-btn`);
        const isBookmarked = this.bookmarks.has(postId);

        bookmarkBtns.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark';
            }
            btn.setAttribute('aria-pressed', isBookmarked);
            btn.title = isBookmarked ? 'Remove bookmark' : 'Add bookmark';
        });

        // Update bookmark counter
        this.updateBookmarkCounter();
    }

    updateBookmarkCounter() {
        const counters = document.querySelectorAll('.bookmark-counter, .bookmark-count');
        counters.forEach(counter => {
            counter.textContent = this.bookmarks.size;
            counter.style.display = this.bookmarks.size > 0 ? 'inline' : 'none';
        });
    }

    saveBookmarks() {
        try {
            localStorage.setItem('blog-bookmarks', JSON.stringify([...this.bookmarks]));
        } catch (error) {
            console.error('Failed to save bookmarks:', error);
        }
    }

    loadBookmarks() {
        try {
            const saved = localStorage.getItem('blog-bookmarks');
            if (saved) {
                const bookmarks = JSON.parse(saved);
                this.bookmarks = new Set(bookmarks);
                this.updateBookmarkCounter();
            }
        } catch (error) {
            console.error('Failed to load bookmarks:', error);
        }
    }

    initializeFilters() {
        // Create category filter UI
        const filterContainer = document.querySelector('.category-filters');
        if (filterContainer && this.categories.size > 0) {
            const filterHTML = Array.from(this.categories)
                .map(category => `
                    <button class="filter-btn" data-category="${category}">
                        ${category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                `).join('');
            
            filterContainer.innerHTML = `
                <button class="filter-btn active" data-category="all">All</button>
                ${filterHTML}
            `;
        }
    }

    getPostsByCategory(category) {
        return Array.from(this.posts.values()).filter(post => 
            !category || category === 'all' || post.category === category
        );
    }

    getBookmarkedPosts() {
        return Array.from(this.bookmarks).map(id => this.posts.get(id)).filter(Boolean);
    }

    searchPosts(query) {
        const searchTerm = query.toLowerCase();
        return Array.from(this.posts.values()).filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.excerpt.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
    }
}

// Initialize blog enterprise features
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.blogEnterprise = new BlogEnterprise();
    });
} else {
    window.blogEnterprise = new BlogEnterprise();
}

// Export for use in other modules
window.BlogEnterprise = BlogEnterprise;