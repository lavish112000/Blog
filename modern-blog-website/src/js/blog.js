/**
 * =====================================
 * BLOG FUNCTIONALITY MODULE
 * =====================================
 */

class BlogManager {
    constructor() {
        this.posts = [];
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadPosts();
        this.renderFeaturedPosts();
        this.renderBlogPosts();
        this.renderSidebar();
        this.setupSearchFunctionality();
    }

    async loadPosts() {
        try {
            // In a real application, this would fetch from an API
            const response = await fetch('./data/posts.json');
            this.posts = await response.json();
        } catch (error) {
            console.error('Error loading posts:', error);
            // Fallback to sample data
            this.posts = this.getSamplePosts();
        }
    }

    getSamplePosts() {
        return [
            {
                id: 1,
                title: "The Future of Web Development: Trends to Watch in 2024",
                content: "Web development is evolving rapidly, with new technologies and frameworks emerging every day. In this comprehensive guide, we explore the cutting-edge trends that are shaping the future of web development and how developers can stay ahead of the curve. From WebAssembly to AI-powered development tools, discover what's coming next.",
                excerpt: "Explore the cutting-edge trends shaping the future of web development in 2024, from WebAssembly to AI-powered tools.",
                author: "Jane Doe",
                authorAvatar: "JD",
                date: "2024-01-15",
                readTime: "8 min read",
                tags: ["Web Development", "Technology", "Trends", "Future"],
                category: "technology",
                featured: true,
                image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
                views: 1250,
                comments: 45
            },
            {
                id: 2,
                title: "Understanding JavaScript Closures: A Deep Dive",
                content: "Closures are a fundamental concept in JavaScript that allow functions to maintain access to their lexical scope. This comprehensive post dives deep into closures, providing practical examples and use cases to help you understand their importance and power in modern JavaScript development.",
                excerpt: "Master JavaScript closures with practical examples and learn how they work under the hood.",
                author: "John Smith",
                authorAvatar: "JS",
                date: "2024-01-12",
                readTime: "6 min read",
                tags: ["JavaScript", "Programming", "Closures", "Development"],
                category: "technology",
                featured: false,
                image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800",
                views: 890,
                comments: 23
            },
            {
                id: 3,
                title: "A Complete Guide to Responsive Design Principles",
                content: "Responsive design is crucial for creating websites that look great on all devices. In this comprehensive guide, we cover the fundamental principles of responsive design and provide practical tips for implementing it effectively across different screen sizes and devices.",
                excerpt: "Learn the essential principles of responsive design and create websites that work perfectly on any device.",
                author: "Emily Johnson",
                authorAvatar: "EJ",
                date: "2024-01-10",
                readTime: "10 min read",
                tags: ["Design", "Responsive", "UX", "CSS"],
                category: "design",
                featured: true,
                image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
                views: 1580,
                comments: 67
            },
            {
                id: 4,
                title: "Exploring CSS Grid Layout: Advanced Techniques",
                content: "CSS Grid Layout is a powerful tool for creating complex web layouts with ease. This post explores advanced CSS Grid techniques, providing practical examples and best practices to help you create sophisticated layouts that were previously impossible or difficult to achieve.",
                excerpt: "Discover advanced CSS Grid techniques and create sophisticated layouts with ease.",
                author: "Michael Brown",
                authorAvatar: "MB",
                date: "2024-01-08",
                readTime: "7 min read",
                tags: ["CSS", "Grid", "Layout", "Web Design"],
                category: "design",
                featured: false,
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
                views: 720,
                comments: 31
            },
            {
                id: 5,
                title: "Building Scalable Business Solutions",
                content: "As businesses grow, their software needs become more complex. This article explores strategies for building scalable business solutions that can grow with your organization, covering architecture patterns, technology choices, and best practices for enterprise development.",
                excerpt: "Learn how to build business solutions that scale with your organization's growth.",
                author: "Sarah Wilson",
                authorAvatar: "SW",
                date: "2024-01-05",
                readTime: "9 min read",
                tags: ["Business", "Scalability", "Enterprise", "Architecture"],
                category: "business",
                featured: true,
                image: "https://images.unsplash.com/photo-1560472355-a9a6e19f4b13?w=800",
                views: 950,
                comments: 19
            },
            {
                id: 6,
                title: "Modern Lifestyle and Digital Wellness",
                content: "In our increasingly digital world, maintaining a healthy balance between technology use and personal wellbeing is more important than ever. This article explores practical strategies for achieving digital wellness in modern life.",
                excerpt: "Discover strategies for maintaining digital wellness in our connected world.",
                author: "Alex Chen",
                authorAvatar: "AC",
                date: "2024-01-03",
                readTime: "5 min read",
                tags: ["Lifestyle", "Digital Wellness", "Health", "Balance"],
                category: "lifestyle",
                featured: false,
                image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800",
                views: 630,
                comments: 12
            }
        ];
    }

    renderFeaturedPosts() {
        const featuredGrid = document.getElementById('featured-grid');
        if (!featuredGrid) return;

        const featuredPosts = this.posts.filter(post => post.featured).slice(0, 3);
        
        featuredGrid.innerHTML = featuredPosts.map(post => `
            <article class="featured-card" data-category="${post.category}">
                <div class="featured-card-content">
                    <div class="featured-badge">
                        <i class="fas fa-star"></i>
                        Featured
                    </div>
                    <h3 class="featured-card-title">
                        <a href="#" onclick="blogManager.openPost(${post.id})">${post.title}</a>
                    </h3>
                    <p class="featured-card-excerpt">${post.excerpt}</p>
                    <div class="blog-card-meta">
                        <div class="blog-card-author">
                            <div class="author-avatar">${post.authorAvatar}</div>
                            <span>${post.author}</span>
                        </div>
                        <span class="blog-card-date">${this.formatDate(post.date)}</span>
                        <span class="read-time">${post.readTime}</span>
                    </div>
                    <div class="blog-card-footer">
                        <div class="blog-card-tags">
                            ${post.tags.slice(0, 2).map(tag => 
                                `<a href="#" class="blog-tag" onclick="blogManager.filterByTag('${tag}')">${tag}</a>`
                            ).join('')}
                        </div>
                        <a href="#" class="read-more" onclick="blogManager.openPost(${post.id})">
                            Read More <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </article>
        `).join('');
    }

    renderBlogPosts() {
        const postsGrid = document.getElementById('posts-grid');
        if (!postsGrid) return;

        let filteredPosts = this.posts;
        
        if (this.currentFilter !== 'all') {
            filteredPosts = this.posts.filter(post => 
                post.category === this.currentFilter || 
                post.tags.some(tag => tag.toLowerCase().includes(this.currentFilter.toLowerCase()))
            );
        }

        const startIndex = 0;
        const endIndex = this.currentPage * this.postsPerPage;
        const postsToShow = filteredPosts.slice(startIndex, endIndex);

        postsGrid.innerHTML = postsToShow.map(post => `
            <article class="blog-card fade-in-up" data-category="${post.category}">
                <div class="blog-card-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                    <div class="blog-card-category">${post.category}</div>
                </div>
                <div class="blog-card-content">
                    <div class="blog-card-meta">
                        <div class="blog-card-author">
                            <div class="author-avatar">${post.authorAvatar}</div>
                            <span>${post.author}</span>
                        </div>
                        <span class="blog-card-date">${this.formatDate(post.date)}</span>
                        <span class="read-time">${post.readTime}</span>
                    </div>
                    <h3 class="blog-card-title">
                        <a href="#" onclick="blogManager.openPost(${post.id})">${post.title}</a>
                    </h3>
                    <p class="blog-card-excerpt">${post.excerpt}</p>
                    <div class="blog-card-stats">
                        <span><i class="fas fa-eye"></i> ${post.views}</span>
                        <span><i class="fas fa-comments"></i> ${post.comments}</span>
                    </div>
                    <div class="blog-card-footer">
                        <div class="blog-card-tags">
                            ${post.tags.slice(0, 3).map(tag => 
                                `<a href="#" class="blog-tag" onclick="blogManager.filterByTag('${tag}')">${tag}</a>`
                            ).join('')}
                        </div>
                        <a href="#" class="read-more" onclick="blogManager.openPost(${post.id})">
                            Read More <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </article>
        `).join('');

        // Show/hide load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            const hasMorePosts = filteredPosts.length > endIndex;
            loadMoreBtn.style.display = hasMorePosts ? 'block' : 'none';
        }
    }

    renderSidebar() {
        this.renderPopularPosts();
        this.renderCategories();
        this.renderTagsCloud();
        this.renderNewsletterWidget();
    }

    renderPopularPosts() {
        const popularPostsContainer = document.querySelector('.popular-posts-widget');
        if (!popularPostsContainer) {
            this.createPopularPostsWidget();
            return;
        }

        const popularPosts = [...this.posts]
            .sort((a, b) => b.views - a.views)
            .slice(0, 5);

        const widget = `
            <div class="sidebar-widget">
                <h3 class="widget-title">
                    <i class="fas fa-fire"></i>
                    Popular Posts
                </h3>
                <div class="popular-posts">
                    ${popularPosts.map(post => `
                        <div class="popular-post">
                            <div class="popular-post-image">
                                <img src="${post.image}" alt="${post.title}">
                            </div>
                            <div class="popular-post-content">
                                <h4 class="popular-post-title">
                                    <a href="#" onclick="blogManager.openPost(${post.id})">${post.title}</a>
                                </h4>
                                <div class="popular-post-date">${this.formatDate(post.date)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.querySelector('.sidebar').insertAdjacentHTML('beforeend', widget);
    }

    renderCategories() {
        const categories = [...new Set(this.posts.map(post => post.category))];
        const categoryCounts = categories.map(category => ({
            name: category,
            count: this.posts.filter(post => post.category === category).length
        }));

        const widget = `
            <div class="sidebar-widget">
                <h3 class="widget-title">
                    <i class="fas fa-folder"></i>
                    Categories
                </h3>
                <ul class="category-list">
                    ${categoryCounts.map(category => `
                        <li class="category-item">
                            <a href="#" class="category-link" onclick="blogManager.filterPosts('${category.name}')">
                                ${this.capitalize(category.name)}
                            </a>
                            <span class="category-count">${category.count}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;

        document.querySelector('.sidebar').insertAdjacentHTML('beforeend', widget);
    }

    renderTagsCloud() {
        const allTags = this.posts.flatMap(post => post.tags);
        const tagCounts = {};
        
        allTags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });

        const sortedTags = Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 15);

        const widget = `
            <div class="sidebar-widget">
                <h3 class="widget-title">
                    <i class="fas fa-tags"></i>
                    Popular Tags
                </h3>
                <div class="tags-cloud">
                    ${sortedTags.map(([tag, count]) => `
                        <a href="#" class="tag-cloud-item" onclick="blogManager.filterByTag('${tag}')">
                            ${tag}
                        </a>
                    `).join('')}
                </div>
            </div>
        `;

        document.querySelector('.sidebar').insertAdjacentHTML('beforeend', widget);
    }

    renderNewsletterWidget() {
        const widget = `
            <div class="sidebar-widget">
                <h3 class="widget-title">
                    <i class="fas fa-envelope"></i>
                    Subscribe to Newsletter
                </h3>
                <p>Get the latest updates and articles delivered to your inbox.</p>
                <form class="newsletter-form" onsubmit="blogManager.handleNewsletterSubmit(event)">
                    <input type="email" placeholder="Your email address" required>
                    <button type="submit" class="btn btn-primary">Subscribe</button>
                </form>
            </div>
        `;

        document.querySelector('.sidebar').insertAdjacentHTML('beforeend', widget);
    }

    filterPosts(category) {
        this.currentFilter = category;
        this.currentPage = 1;
        
        // Update active filter tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.filter === category) {
                tab.classList.add('active');
            }
        });

        this.renderBlogPosts();
        this.animateFilterChange();
    }

    filterByTag(tag) {
        this.currentFilter = tag.toLowerCase();
        this.currentPage = 1;
        
        // Update filter tabs to show "all" as active since we're filtering by tag
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.filter === 'all') {
                tab.classList.add('active');
            }
        });

        this.renderBlogPosts();
        this.animateFilterChange();
    }

    animateFilterChange() {
        const postsGrid = document.getElementById('posts-grid');
        if (postsGrid) {
            postsGrid.style.opacity = '0';
            setTimeout(() => {
                postsGrid.style.opacity = '1';
                // Re-trigger scroll animations
                document.querySelectorAll('.blog-card').forEach(card => {
                    card.classList.add('fade-in-up');
                });
            }, 150);
        }
    }

    loadMorePosts() {
        this.currentPage++;
        this.renderBlogPosts();
    }

    openPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        // In a real application, this would navigate to a post detail page
        // For now, we'll show a modal or alert
        this.showPostModal(post);
    }

    showPostModal(post) {
        const modal = document.createElement('div');
        modal.className = 'post-modal';
        modal.innerHTML = `
            <div class="post-modal-content">
                <div class="post-modal-header">
                    <h2>${post.title}</h2>
                    <button class="post-modal-close">&times;</button>
                </div>
                <div class="post-modal-meta">
                    <div class="post-author">
                        <div class="author-avatar">${post.authorAvatar}</div>
                        <span>${post.author}</span>
                    </div>
                    <span class="post-date">${this.formatDate(post.date)}</span>
                    <span class="read-time">${post.readTime}</span>
                </div>
                <div class="post-modal-body">
                    <img src="${post.image}" alt="${post.title}" class="post-image">
                    <div class="post-content">${post.content}</div>
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('post-modal-close')) {
                modal.remove();
            }
        });

        // Add escape key listener
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    setupSearchFunctionality() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim().toLowerCase();
            
            if (query.length > 2) {
                searchTimeout = setTimeout(() => {
                    this.performSearch(query);
                }, 300);
            } else if (query.length === 0) {
                this.currentFilter = 'all';
                this.renderBlogPosts();
            }
        });
    }

    performSearch(query) {
        const searchResults = this.posts.filter(post => 
            post.title.toLowerCase().includes(query) ||
            post.content.toLowerCase().includes(query) ||
            post.excerpt.toLowerCase().includes(query) ||
            post.tags.some(tag => tag.toLowerCase().includes(query)) ||
            post.author.toLowerCase().includes(query)
        );

        this.renderSearchResults(searchResults, query);
    }

    renderSearchResults(results, query) {
        const postsGrid = document.getElementById('posts-grid');
        if (!postsGrid) return;

        if (results.length === 0) {
            postsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>No articles found for "${query}". Try different keywords.</p>
                </div>
            `;
            return;
        }

        postsGrid.innerHTML = results.map(post => `
            <article class="blog-card search-result fade-in-up" data-category="${post.category}">
                <div class="blog-card-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                    <div class="blog-card-category">${post.category}</div>
                </div>
                <div class="blog-card-content">
                    <div class="blog-card-meta">
                        <div class="blog-card-author">
                            <div class="author-avatar">${post.authorAvatar}</div>
                            <span>${post.author}</span>
                        </div>
                        <span class="blog-card-date">${this.formatDate(post.date)}</span>
                    </div>
                    <h3 class="blog-card-title">
                        <a href="#" onclick="blogManager.openPost(${post.id})">${this.highlightSearchTerm(post.title, query)}</a>
                    </h3>
                    <p class="blog-card-excerpt">${this.highlightSearchTerm(post.excerpt, query)}</p>
                    <div class="blog-card-footer">
                        <div class="blog-card-tags">
                            ${post.tags.slice(0, 3).map(tag => 
                                `<a href="#" class="blog-tag">${tag}</a>`
                            ).join('')}
                        </div>
                        <a href="#" class="read-more" onclick="blogManager.openPost(${post.id})">
                            Read More <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </article>
        `).join('');

        // Hide load more button for search results
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }
    }

    highlightSearchTerm(text, term) {
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    handleNewsletterSubmit(event) {
        event.preventDefault();
        const email = event.target.querySelector('input[type="email"]').value;
        
        if (this.validateEmail(email)) {
            this.showNotification('Thank you for subscribing to our newsletter!', 'success');
            event.target.reset();
        } else {
            this.showNotification('Please enter a valid email address.', 'error');
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize blog manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.blogManager = new BlogManager();
});

// Export for use in other modules
window.BlogManager = BlogManager;

document.addEventListener('DOMContentLoaded', () => {
    const blogContainer = document.getElementById('blog-posts');
    const postsUrl = '../data/posts.json';

    // Function to load blog posts
    const loadBlogPosts = async () => {
        try {
            const response = await fetch(postsUrl);
            const posts = await response.json();
            displayPosts(posts);
        } catch (error) {
            console.error('Error loading blog posts:', error);
        }
    };

    // Function to display blog posts
    const displayPosts = (posts) => {
        blogContainer.innerHTML = '';
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('blog-post');
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <p>${post.content.substring(0, 100)}...</p>
                <a href="blog.html?id=${post.id}" class="read-more">Read More</a>
            `;
            blogContainer.appendChild(postElement);
        });
    };

    // Load blog posts on page load
    loadBlogPosts();
});