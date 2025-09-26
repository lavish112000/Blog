/**
 * Enterprise Blog Manager
 * Advanced blog content management and display system
 */

import BlogSearch from './blog-search.js';
import BlogRenderer from './blog-renderer.js';
import BlogAnalytics from './blog-analytics.js';

class BlogManager {
    constructor() {
        this.posts = [];
        this.categories = new Set();
        this.tags = new Set();
        this.authors = new Map();
        this.postsPerPage = 10;
        this.currentPage = 1;
        this.sortBy = 'date';
        this.sortOrder = 'desc';
        this.filters = {
            category: null,
            tag: null,
            author: null,
            dateRange: null,
            readTime: null
        };
        
        this.searchManager = new BlogSearch();
        this.renderer = new BlogRenderer();
        this.analytics = new BlogAnalytics();
        
        this.bookmarks = new Set(JSON.parse(localStorage.getItem('blog_bookmarks') || '[]'));
        this.readingHistory = JSON.parse(localStorage.getItem('reading_history') || '[]');
        this.userPreferences = JSON.parse(localStorage.getItem('blog_preferences') || '{}');
        
        this.aiRecommendations = [];
        this.trendingPosts = [];
        this.relatedPosts = new Map();
        
        this.isLoading = false;
        this.cache = new Map();
        this.offlineStorage = 'blog_offline_posts';
        
        this.init();
    }

    async init() {
        await this.loadPosts();
        this.setupEventListeners();
        this.initializeFilters();
        this.generateRecommendations();
        this.calculateTrendingPosts();
        this.setupInfiniteScroll();
        this.setupOfflineSync();
        
        console.log('📝 Blog Manager initialized');
    }

    async loadPosts() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        try {
            // Try to load from cache first
            const cached = this.cache.get('posts');
            if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
                this.posts = cached.data;
                this.processPostsData();
                return;
            }
            
            // Load from data file
            const response = await fetch('/src/data/posts.json');
            if (!response.ok) {
                throw new Error(`Failed to load posts: ${response.status}`);
            }
            
            const data = await response.json();
            this.posts = this.enhancePosts(data.posts || []);
            
            // Cache the data
            this.cache.set('posts', {
                data: this.posts,
                timestamp: Date.now()
            });
            
            this.processPostsData();
            this.storeOfflinePosts();
            
            console.log(`✅ Loaded ${this.posts.length} blog posts`);
            
        } catch (error) {
            console.error('Failed to load posts:', error);
            
            // Try to load from offline storage
            const offlinePosts = localStorage.getItem(this.offlineStorage);
            if (offlinePosts) {
                this.posts = JSON.parse(offlinePosts);
                this.processPostsData();
                console.log('📱 Loaded posts from offline storage');
            }
        } finally {
            this.isLoading = false;
        }
    }

    enhancePosts(posts) {
        return posts.map(post => ({
            ...post,
            id: post.id || this.generateId(),
            publishedAt: new Date(post.publishedAt || post.date),
            updatedAt: new Date(post.updatedAt || post.publishedAt || post.date),
            readingTime: this.calculateReadingTime(post.content || post.excerpt || ''),
            wordCount: this.countWords(post.content || post.excerpt || ''),
            excerpt: post.excerpt || this.generateExcerpt(post.content || ''),
            slug: post.slug || this.generateSlug(post.title),
            featured: post.featured || false,
            trending: post.trending || false,
            viewCount: post.viewCount || 0,
            likeCount: post.likeCount || 0,
            commentCount: post.commentCount || 0,
            shareCount: post.shareCount || 0,
            bookmarked: this.bookmarks.has(post.id),
            readStatus: 'unread', // 'unread', 'reading', 'read'
            readProgress: 0,
            lastReadAt: null,
            seo: {
                metaTitle: post.metaTitle || post.title,
                metaDescription: post.metaDescription || post.excerpt,
                keywords: post.keywords || post.tags || [],
                canonicalUrl: post.canonicalUrl || `${window.location.origin}/blog/${post.slug}`
            }
        }));
    }

    processPostsData() {
        // Extract categories, tags, and authors
        this.posts.forEach(post => {
            if (post.category) this.categories.add(post.category);
            if (post.tags) post.tags.forEach(tag => this.tags.add(tag));
            if (post.author) {
                if (!this.authors.has(post.author.name || post.author)) {
                    this.authors.set(post.author.name || post.author, {
                        name: post.author.name || post.author,
                        avatar: post.author.avatar || '/assets/images/default-avatar.jpg',
                        bio: post.author.bio || '',
                        social: post.author.social || {},
                        postCount: 0
                    });
                }
                const author = this.authors.get(post.author.name || post.author);
                author.postCount++;
            }
        });
        
        // Update reading status from history
        this.updateReadingStatus();
        
        // Initialize search index
        this.searchManager.indexPosts(this.posts);
    }

    updateReadingStatus() {
        this.readingHistory.forEach(entry => {
            const post = this.posts.find(p => p.id === entry.postId);
            if (post) {
                post.readStatus = entry.status;
                post.readProgress = entry.progress || 0;
                post.lastReadAt = new Date(entry.timestamp);
            }
        });
    }

    setupEventListeners() {
        // Filter controls
        document.addEventListener('change', (e) => {
            if (e.target.matches('[data-filter]')) {
                const filterType = e.target.getAttribute('data-filter');
                const value = e.target.value || null;
                this.setFilter(filterType, value);
            }
        });

        // Sort controls
        document.addEventListener('change', (e) => {
            if (e.target.matches('[data-sort]')) {
                const sortBy = e.target.value;
                this.setSorting(sortBy);
            }
        });

        // Search input
        document.addEventListener('input', (e) => {
            if (e.target.matches('#blog-search')) {
                this.debounce(() => {
                    this.search(e.target.value);
                }, 300)();
            }
        });

        // Bookmark toggle
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-bookmark]')) {
                e.preventDefault();
                const postId = e.target.getAttribute('data-bookmark');
                this.toggleBookmark(postId);
            }
        });

        // Like button
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-like]')) {
                e.preventDefault();
                const postId = e.target.getAttribute('data-like');
                this.toggleLike(postId);
            }
        });

        // Share button
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-share]')) {
                e.preventDefault();
                const postId = e.target.getAttribute('data-share');
                this.sharePost(postId);
            }
        });

        // Read later
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-read-later]')) {
                e.preventDefault();
                const postId = e.target.getAttribute('data-read-later');
                this.addToReadLater(postId);
            }
        });

        // View tracking
        this.setupViewTracking();
    }

    setupViewTracking() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const postElement = entry.target;
                    const postId = postElement.getAttribute('data-post-id');
                    
                    if (postId) {
                        this.trackView(postId);
                        observer.unobserve(postElement);
                    }
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        });

        // Observe post cards
        document.querySelectorAll('[data-post-id]').forEach(post => {
            observer.observe(post);
        });
    }

    initializeFilters() {
        // Populate filter dropdowns
        this.populateFilterDropdowns();
        
        // Set initial filter state from URL
        this.setFiltersFromURL();
    }

    populateFilterDropdowns() {
        // Categories
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">All Categories</option>';
            Array.from(this.categories).sort().forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
        }

        // Tags
        const tagFilter = document.getElementById('tag-filter');
        if (tagFilter) {
            tagFilter.innerHTML = '<option value="">All Tags</option>';
            Array.from(this.tags).sort().forEach(tag => {
                const option = document.createElement('option');
                option.value = tag;
                option.textContent = tag;
                tagFilter.appendChild(option);
            });
        }

        // Authors
        const authorFilter = document.getElementById('author-filter');
        if (authorFilter) {
            authorFilter.innerHTML = '<option value="">All Authors</option>';
            Array.from(this.authors.keys()).sort().forEach(author => {
                const option = document.createElement('option');
                option.value = author;
                option.textContent = author;
                authorFilter.appendChild(option);
            });
        }
    }

    setFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);
        
        if (params.has('category')) this.setFilter('category', params.get('category'));
        if (params.has('tag')) this.setFilter('tag', params.get('tag'));
        if (params.has('author')) this.setFilter('author', params.get('author'));
        if (params.has('search')) this.search(params.get('search'));
        if (params.has('sort')) this.setSorting(params.get('sort'));
        if (params.has('page')) this.setPage(parseInt(params.get('page')));
    }

    setFilter(type, value) {
        this.filters[type] = value;
        this.currentPage = 1;
        this.updateURL();
        this.renderPosts();
        
        // Update filter UI
        const filterElement = document.querySelector(`[data-filter="${type}"]`);
        if (filterElement) {
            filterElement.value = value || '';
        }
    }

    setSorting(sortBy, order = null) {
        this.sortBy = sortBy;
        if (order) this.sortOrder = order;
        this.currentPage = 1;
        this.updateURL();
        this.renderPosts();
    }

    setPage(page) {
        this.currentPage = Math.max(1, page);
        this.updateURL();
        this.renderPosts();
    }

    search(query) {
        if (!query.trim()) {
            this.searchManager.clearSearch();
            this.renderPosts();
            return;
        }
        
        const results = this.searchManager.search(query);
        this.renderSearchResults(results, query);
        
        // Track search
        this.analytics.trackSearch(query, results.length);
    }

    getFilteredPosts() {
        let filtered = [...this.posts];
        
        // Apply filters
        if (this.filters.category) {
            filtered = filtered.filter(post => post.category === this.filters.category);
        }
        
        if (this.filters.tag) {
            filtered = filtered.filter(post => 
                post.tags && post.tags.includes(this.filters.tag)
            );
        }
        
        if (this.filters.author) {
            filtered = filtered.filter(post => 
                (post.author.name || post.author) === this.filters.author
            );
        }
        
        if (this.filters.dateRange) {
            const range = this.filters.dateRange;
            filtered = filtered.filter(post => {
                const postDate = new Date(post.publishedAt);
                return postDate >= range.start && postDate <= range.end;
            });
        }
        
        if (this.filters.readTime) {
            const maxTime = parseInt(this.filters.readTime);
            filtered = filtered.filter(post => post.readingTime <= maxTime);
        }
        
        return filtered;
    }

    getSortedPosts(posts) {
        return posts.sort((a, b) => {
            let valueA, valueB;
            
            switch (this.sortBy) {
                case 'title':
                    valueA = a.title.toLowerCase();
                    valueB = b.title.toLowerCase();
                    break;
                case 'author':
                    valueA = (a.author.name || a.author).toLowerCase();
                    valueB = (b.author.name || b.author).toLowerCase();
                    break;
                case 'category':
                    valueA = a.category.toLowerCase();
                    valueB = b.category.toLowerCase();
                    break;
                case 'readTime':
                    valueA = a.readingTime;
                    valueB = b.readingTime;
                    break;
                case 'views':
                    valueA = a.viewCount;
                    valueB = b.viewCount;
                    break;
                case 'likes':
                    valueA = a.likeCount;
                    valueB = b.likeCount;
                    break;
                case 'date':
                default:
                    valueA = new Date(a.publishedAt);
                    valueB = new Date(b.publishedAt);
                    break;
            }
            
            if (this.sortOrder === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        });
    }

    getPaginatedPosts(posts) {
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        return posts.slice(startIndex, endIndex);
    }

    async renderPosts() {
        const container = document.getElementById('blog-posts');
        if (!container) return;
        
        // Show loading state
        container.classList.add('loading');
        
        try {
            const filtered = this.getFilteredPosts();
            const sorted = this.getSortedPosts(filtered);
            const paginated = this.getPaginatedPosts(sorted);
            
            // Render posts
            const html = await this.renderer.renderPostList(paginated);
            container.innerHTML = html;
            
            // Update pagination
            this.renderPagination(filtered.length);
            
            // Update results count
            this.updateResultsCount(filtered.length, this.posts.length);
            
            // Setup view tracking for new posts
            this.setupViewTracking();
            
        } catch (error) {
            console.error('Error rendering posts:', error);
            container.innerHTML = '<div class="error">Failed to load posts</div>';
        } finally {
            container.classList.remove('loading');
        }
    }

    renderSearchResults(results, query) {
        const container = document.getElementById('blog-posts');
        if (!container) return;
        
        // Update search results header
        const searchHeader = document.getElementById('search-results-header');
        if (searchHeader) {
            searchHeader.innerHTML = `
                <h2>Search Results for "${query}" (${results.length} found)</h2>
                <button onclick="blogManager.clearSearch()" class="clear-search-btn">
                    <i class="fas fa-times"></i> Clear Search
                </button>
            `;
            searchHeader.style.display = 'block';
        }
        
        // Render search results
        this.renderer.renderSearchResults(results, query).then(html => {
            container.innerHTML = html;
            this.setupViewTracking();
        });
    }

    clearSearch() {
        const searchInput = document.getElementById('blog-search');
        if (searchInput) searchInput.value = '';
        
        const searchHeader = document.getElementById('search-results-header');
        if (searchHeader) searchHeader.style.display = 'none';
        
        this.searchManager.clearSearch();
        this.renderPosts();
    }

    renderPagination(totalPosts) {
        const pagination = document.getElementById('blog-pagination');
        if (!pagination) return;
        
        const totalPages = Math.ceil(totalPosts / this.postsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        const currentPage = this.currentPage;
        let html = '<div class="pagination">';
        
        // Previous button
        if (currentPage > 1) {
            html += `<button onclick="blogManager.setPage(${currentPage - 1})" class="pagination-btn">
                <i class="fas fa-chevron-left"></i> Previous
            </button>`;
        }
        
        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            html += `<button onclick="blogManager.setPage(1)" class="pagination-btn">1</button>`;
            if (startPage > 2) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === currentPage ? 'active' : '';
            html += `<button onclick="blogManager.setPage(${i})" class="pagination-btn ${isActive}">${i}</button>`;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
            html += `<button onclick="blogManager.setPage(${totalPages})" class="pagination-btn">${totalPages}</button>`;
        }
        
        // Next button
        if (currentPage < totalPages) {
            html += `<button onclick="blogManager.setPage(${currentPage + 1})" class="pagination-btn">
                Next <i class="fas fa-chevron-right"></i>
            </button>`;
        }
        
        html += '</div>';
        pagination.innerHTML = html;
    }

    updateResultsCount(filtered, total) {
        const counter = document.getElementById('results-count');
        if (counter) {
            if (filtered === total) {
                counter.textContent = `Showing all ${total} posts`;
            } else {
                counter.textContent = `Showing ${filtered} of ${total} posts`;
            }
        }
    }

    setupInfiniteScroll() {
        if (!this.userPreferences.infiniteScroll) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoading) {
                    const totalPages = Math.ceil(this.getFilteredPosts().length / this.postsPerPage);
                    if (this.currentPage < totalPages) {
                        this.loadMorePosts();
                    }
                }
            });
        });
        
        const sentinel = document.getElementById('infinite-scroll-sentinel');
        if (sentinel) {
            observer.observe(sentinel);
        }
    }

    async loadMorePosts() {
        this.currentPage++;
        const filtered = this.getFilteredPosts();
        const sorted = this.getSortedPosts(filtered);
        const newPosts = this.getPaginatedPosts(sorted);
        
        const html = await this.renderer.renderPostList(newPosts);
        const container = document.getElementById('blog-posts');
        container.insertAdjacentHTML('beforeend', html);
        
        this.setupViewTracking();
    }

    // Bookmark functionality
    toggleBookmark(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        if (this.bookmarks.has(postId)) {
            this.bookmarks.delete(postId);
            post.bookmarked = false;
        } else {
            this.bookmarks.add(postId);
            post.bookmarked = true;
        }
        
        // Save to localStorage
        localStorage.setItem('blog_bookmarks', JSON.stringify([...this.bookmarks]));
        
        // Update UI
        const bookmarkBtn = document.querySelector(`[data-bookmark="${postId}"]`);
        if (bookmarkBtn) {
            bookmarkBtn.classList.toggle('bookmarked', post.bookmarked);
            bookmarkBtn.title = post.bookmarked ? 'Remove bookmark' : 'Add bookmark';
        }
        
        // Track event
        this.analytics.trackBookmark(postId, post.bookmarked);
        
        // Show notification
        if (window.NotificationManager) {
            const message = post.bookmarked ? 'Post bookmarked' : 'Bookmark removed';
            window.NotificationManager.success(message, post.title);
        }
    }

    // Like functionality
    toggleLike(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        const liked = localStorage.getItem(`liked_${postId}`) === 'true';
        
        if (liked) {
            post.likeCount = Math.max(0, post.likeCount - 1);
            localStorage.removeItem(`liked_${postId}`);
        } else {
            post.likeCount++;
            localStorage.setItem(`liked_${postId}`, 'true');
        }
        
        // Update UI
        const likeBtn = document.querySelector(`[data-like="${postId}"]`);
        if (likeBtn) {
            likeBtn.classList.toggle('liked', !liked);
            const countSpan = likeBtn.querySelector('.like-count');
            if (countSpan) countSpan.textContent = post.likeCount;
        }
        
        // Track event
        this.analytics.trackLike(postId, !liked);
    }

    // Share functionality
    async sharePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        const shareData = {
            title: post.title,
            text: post.excerpt,
            url: `${window.location.origin}/blog/${post.slug}`
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                post.shareCount++;
                this.analytics.trackShare(postId, 'native');
            } else {
                // Fallback to clipboard
                await navigator.clipboard.writeText(shareData.url);
                
                if (window.NotificationManager) {
                    window.NotificationManager.success('Link copied!', 'Post link copied to clipboard');
                }
                
                post.shareCount++;
                this.analytics.trackShare(postId, 'clipboard');
            }
            
            // Update share count in UI
            const shareBtn = document.querySelector(`[data-share="${postId}"]`);
            if (shareBtn) {
                const countSpan = shareBtn.querySelector('.share-count');
                if (countSpan) countSpan.textContent = post.shareCount;
            }
            
        } catch (error) {
            console.error('Share failed:', error);
        }
    }

    // Reading functionality
    addToReadLater(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        const readLater = JSON.parse(localStorage.getItem('read_later') || '[]');
        
        if (!readLater.includes(postId)) {
            readLater.push(postId);
            localStorage.setItem('read_later', JSON.stringify(readLater));
            
            if (window.NotificationManager) {
                window.NotificationManager.success('Added to read later', post.title);
            }
            
            this.analytics.trackReadLater(postId);
        }
    }

    trackView(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        post.viewCount++;
        this.analytics.trackView(postId);
        
        // Update reading history
        this.updateReadingHistory(postId, 'viewed');
    }

    updateReadingHistory(postId, status, progress = 0) {
        const existingIndex = this.readingHistory.findIndex(entry => entry.postId === postId);
        const entry = {
            postId,
            status,
            progress,
            timestamp: Date.now()
        };
        
        if (existingIndex >= 0) {
            this.readingHistory[existingIndex] = entry;
        } else {
            this.readingHistory.push(entry);
        }
        
        // Keep only last 100 entries
        if (this.readingHistory.length > 100) {
            this.readingHistory = this.readingHistory.slice(-100);
        }
        
        localStorage.setItem('reading_history', JSON.stringify(this.readingHistory));
        
        // Update post status
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.readStatus = status;
            post.readProgress = progress;
            post.lastReadAt = new Date();
        }
    }

    // AI Recommendations
    generateRecommendations() {
        // Simple recommendation algorithm based on reading history and preferences
        const recentReads = this.readingHistory.slice(-10);
        const preferredCategories = this.getPreferredCategories(recentReads);
        const preferredTags = this.getPreferredTags(recentReads);
        
        this.aiRecommendations = this.posts
            .filter(post => !recentReads.some(read => read.postId === post.id))
            .sort((a, b) => {
                let scoreA = 0;
                let scoreB = 0;
                
                // Category preference
                if (preferredCategories.includes(a.category)) scoreA += 3;
                if (preferredCategories.includes(b.category)) scoreB += 3;
                
                // Tag preference
                const aTagScore = a.tags?.filter(tag => preferredTags.includes(tag)).length || 0;
                const bTagScore = b.tags?.filter(tag => preferredTags.includes(tag)).length || 0;
                scoreA += aTagScore * 2;
                scoreB += bTagScore * 2;
                
                // Popularity
                scoreA += a.viewCount * 0.01 + a.likeCount * 0.1;
                scoreB += b.viewCount * 0.01 + b.likeCount * 0.1;
                
                // Recency
                const daysSinceA = (Date.now() - new Date(a.publishedAt)) / (1000 * 60 * 60 * 24);
                const daysSinceB = (Date.now() - new Date(b.publishedAt)) / (1000 * 60 * 60 * 24);
                scoreA += Math.max(0, 30 - daysSinceA) * 0.1;
                scoreB += Math.max(0, 30 - daysSinceB) * 0.1;
                
                return scoreB - scoreA;
            })
            .slice(0, 5);
        
        this.renderRecommendations();
    }

    getPreferredCategories(readHistory) {
        const categoryCounts = {};
        readHistory.forEach(entry => {
            const post = this.posts.find(p => p.id === entry.postId);
            if (post && post.category) {
                categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
            }
        });
        
        return Object.keys(categoryCounts)
            .sort((a, b) => categoryCounts[b] - categoryCounts[a])
            .slice(0, 3);
    }

    getPreferredTags(readHistory) {
        const tagCounts = {};
        readHistory.forEach(entry => {
            const post = this.posts.find(p => p.id === entry.postId);
            if (post && post.tags) {
                post.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });
        
        return Object.keys(tagCounts)
            .sort((a, b) => tagCounts[b] - tagCounts[a])
            .slice(0, 5);
    }

    calculateTrendingPosts() {
        const now = Date.now();
        const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
        
        this.trendingPosts = this.posts
            .filter(post => new Date(post.publishedAt) > weekAgo)
            .sort((a, b) => {
                const scoreA = a.viewCount * 0.5 + a.likeCount * 2 + a.shareCount * 3;
                const scoreB = b.viewCount * 0.5 + b.likeCount * 2 + b.shareCount * 3;
                return scoreB - scoreA;
            })
            .slice(0, 5);
        
        this.renderTrending();
    }

    renderRecommendations() {
        const container = document.getElementById('ai-recommendations');
        if (!container || this.aiRecommendations.length === 0) return;
        
        this.renderer.renderRecommendations(this.aiRecommendations).then(html => {
            container.innerHTML = html;
        });
    }

    renderTrending() {
        const container = document.getElementById('trending-posts');
        if (!container || this.trendingPosts.length === 0) return;
        
        this.renderer.renderTrending(this.trendingPosts).then(html => {
            container.innerHTML = html;
        });
    }

    // Offline functionality
    storeOfflinePosts() {
        try {
            localStorage.setItem(this.offlineStorage, JSON.stringify(this.posts));
        } catch (error) {
            console.warn('Failed to store posts offline:', error);
        }
    }

    setupOfflineSync() {
        window.addEventListener('online', () => {
            this.syncOfflineData();
        });
    }

    async syncOfflineData() {
        console.log('📡 Syncing offline data...');
        
        // Sync analytics data
        await this.analytics.syncOfflineData();
        
        // Reload posts to get latest data
        this.cache.clear();
        await this.loadPosts();
        
        console.log('✅ Offline data synced');
    }

    // Utility methods
    calculateReadingTime(text) {
        const wordsPerMinute = 200;
        const wordCount = this.countWords(text);
        return Math.ceil(wordCount / wordsPerMinute);
    }

    countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    generateExcerpt(content, maxLength = 150) {
        const text = content.replace(/<[^>]*>/g, ''); // Strip HTML
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    updateURL() {
        const params = new URLSearchParams();
        
        if (this.filters.category) params.set('category', this.filters.category);
        if (this.filters.tag) params.set('tag', this.filters.tag);
        if (this.filters.author) params.set('author', this.filters.author);
        if (this.sortBy !== 'date') params.set('sort', this.sortBy);
        if (this.currentPage > 1) params.set('page', this.currentPage);
        
        const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState({}, '', newURL);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public API methods
    getPost(id) {
        return this.posts.find(post => post.id === id);
    }

    getPostBySlug(slug) {
        return this.posts.find(post => post.slug === slug);
    }

    getBookmarkedPosts() {
        return this.posts.filter(post => this.bookmarks.has(post.id));
    }

    getReadLaterPosts() {
        const readLater = JSON.parse(localStorage.getItem('read_later') || '[]');
        return this.posts.filter(post => readLater.includes(post.id));
    }

    getReadingHistory() {
        return this.readingHistory;
    }

    getStats() {
        return {
            totalPosts: this.posts.length,
            categories: this.categories.size,
            tags: this.tags.size,
            authors: this.authors.size,
            bookmarks: this.bookmarks.size,
            readingHistory: this.readingHistory.length
        };
    }

    exportData() {
        return {
            bookmarks: [...this.bookmarks],
            readingHistory: this.readingHistory,
            userPreferences: this.userPreferences,
            timestamp: Date.now()
        };
    }

    importData(data) {
        if (data.bookmarks) {
            this.bookmarks = new Set(data.bookmarks);
            localStorage.setItem('blog_bookmarks', JSON.stringify(data.bookmarks));
        }
        
        if (data.readingHistory) {
            this.readingHistory = data.readingHistory;
            localStorage.setItem('reading_history', JSON.stringify(data.readingHistory));
        }
        
        if (data.userPreferences) {
            this.userPreferences = data.userPreferences;
            localStorage.setItem('blog_preferences', JSON.stringify(data.userPreferences));
        }
        
        this.updateReadingStatus();
        this.renderPosts();
    }
}

// Export for use in other modules
export default BlogManager;

// Auto-initialize if not imported as module
if (typeof module === 'undefined') {
    window.BlogManager = BlogManager;
}