class ComponentsManager {
    constructor() {
        this.basePath = this.getPathPrefix();
        this.init();
    }

    getPathPrefix() {
        const path = window.location.pathname;
        return path.includes('/pages/') ? '../' : '';
    }

    init() {
        this.loadHeader();
        this.loadFooter();
        this.loadSidebar();
        this.initializeLazyLoading();
        this.initializeShareButtons();
        this.addNotificationStyles();
    }

    loadHeader() {
        const header = document.getElementById('header');
        if (!header) return;

        const bp = this.basePath;

        header.innerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-brand">
                        <a href="${bp}index.html" class="brand-logo">
                            <i class="fas fa-feather"></i>
                            <span>Vibrant Insights</span>
                        </a>
                    </div>

                    <div class="nav-menu" id="nav-menu">
                        <ul class="nav-list">
                            <li class="nav-item">
                                <a href="${bp}index.html" class="nav-link">Home</a>
                            </li>
                            <li class="nav-item">
                                <a href="${bp}pages/blog.html" class="nav-link">Blog</a>
                            </li>
                            <li class="nav-item dropdown">
                                <a href="#" class="nav-link dropdown-toggle">Categories <i class="fas fa-chevron-down"></i></a>
                                <ul class="dropdown-menu">
                                    <li><a href="${bp}pages/technology.html" class="dropdown-link">Technology</a></li>
                                    <li><a href="${bp}pages/design.html" class="dropdown-link">Design</a></li>
                                    <li><a href="${bp}pages/business.html" class="dropdown-link">Business</a></li>
                                    <li><a href="${bp}pages/lifestyle.html" class="dropdown-link">Lifestyle</a></li>
                                </ul>
                            </li>
                            <li class="nav-item">
                                <a href="${bp}pages/about.html" class="nav-link">About</a>
                            </li>
                            <li class="nav-item">
                                <a href="${bp}index.html#contact" class="nav-link">Contact</a>
                            </li>
                        </ul>
                    </div>

                    <div class="nav-actions">
                        <button class="search-toggle" id="search-toggle" title="Search">
                            <i class="fas fa-search"></i>
                        </button>
                        <button class="theme-toggle" id="theme-toggle" title="Toggle Theme">
                            <i class="fas fa-moon"></i>
                        </button>
                        <button class="nav-toggle" id="nav-toggle" title="Menu">
                            <i class="fas fa-bars"></i>
                        </button>
                    </div>
                </div>
            </nav>
        `;

        // Highlight active link
        const currentPath = window.location.pathname;
        const navLinks = header.querySelectorAll('.nav-link, .dropdown-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                const cleanHref = href.replace('../', '').replace('./', '');
                if (currentPath.endsWith(cleanHref) && cleanHref !== '') {
                    link.classList.add('active');
                    if (link.classList.contains('dropdown-link')) {
                        const parent = link.closest('.dropdown').querySelector('.dropdown-toggle');
                        if (parent) parent.classList.add('active');
                    }
                }
            }
        });
    }

    loadFooter() {
        const footer = document.getElementById('footer');
        if (!footer) return;

        const bp = this.basePath;

        footer.innerHTML = `
            <div class="container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>Vibrant Insights</h3>
                        <p>Discover extraordinary stories and cutting-edge insights that shape tomorrow's digital landscape.</p>
                        <div class="footer-social">
                            <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                            <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                            <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
                        </div>
                    </div>
                    
                    <div class="footer-section">
                        <h3>Quick Links</h3>
                        <ul class="footer-links">
                            <li><a href="${bp}index.html">Home</a></li>
                            <li><a href="${bp}pages/about.html">About Us</a></li>
                            <li><a href="${bp}index.html#contact">Contact</a></li>
                            <li><a href="${bp}index.html#privacy">Privacy Policy</a></li>
                            <li><a href="${bp}index.html#terms">Terms of Service</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h3>Categories</h3>
                        <ul class="footer-links">
                            <li><a href="${bp}pages/technology.html">Technology</a></li>
                            <li><a href="${bp}pages/design.html">Design</a></li>
                            <li><a href="${bp}pages/business.html">Business</a></li>
                            <li><a href="${bp}pages/lifestyle.html">Lifestyle</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h3>Newsletter</h3>
                        <p>Subscribe to get the latest updates and articles delivered to your inbox.</p>
                        <form class="newsletter-form" onsubmit="componentsManager.handleFooterNewsletter(event)">
                            <input type="email" placeholder="Your email address" required>
                            <button type="submit" class="btn btn-primary">Subscribe</button>
                        </form>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <p>&copy; 2024 Vibrant Insights. All rights reserved. Built with ❤️ for amazing content creators.</p>
                </div>
            </div>
        `;
    }

    loadSidebar() {
        const sidebar = document.querySelector('.sidebar') || document.getElementById('sidebar');
        if (!sidebar) return;

        sidebar.innerHTML = '';

        this.addSearchWidget(sidebar);
        this.addAuthorWidget(sidebar);
        this.addRecentCommentsWidget(sidebar);
        this.addCommunityWidget(sidebar);
    }

    addSearchWidget(sidebar) {
        const widget = `
            <div class="sidebar-widget search-widget">
                <h3 class="widget-title">
                    <i class="fas fa-search"></i> Quick Search
                </h3>
                <form class="sidebar-search-form" onsubmit="componentsManager.handleSidebarSearch(event)">
                    <div class="search-input-group">
                        <input type="text" placeholder="Search articles..." id="sidebar-search">
                        <button type="submit"><i class="fas fa-search"></i></button>
                    </div>
                </form>
                <div id="recent-searches" class="recent-searches">
                    <!-- Recent searches will be populated here -->
                </div>
            </div>
        `;
        sidebar.insertAdjacentHTML('beforeend', widget);
        this.updateRecentSearches();
    }

    addAuthorWidget(sidebar) {
        const widget = `
            <div class="sidebar-widget author-widget">
                <h3 class="widget-title">
                    <i class="fas fa-user-circle"></i> Featured Author
                </h3>
                <div class="author-bio">
                    <div class="author-bio-avatar">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="Featured Author">
                    </div>
                    <div class="author-bio-content">
                        <h3>Lalit</h3>
                        <p>Senior Technology Writer with 10+ years of experience in web development and digital innovation. Passionate about sharing knowledge and inspiring the next generation of developers.</p>
                        <div class="author-social">
                            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                            <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                            <a href="#" aria-label="GitHub"><i class="fab fa-github"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        sidebar.insertAdjacentHTML('beforeend', widget);
    }

    addRecentCommentsWidget(sidebar) {
        const comments = [
            { user: "Alex M.", text: "Great insights on the future of AI!", post: "The Future of AI" },
            { user: "Sarah J.", text: "I learned so much from this article.", post: "Web Design Trends" },
            { user: "Mike T.", text: "Thanks for sharing these tips.", post: "Remote Work Guide" }
        ];

        let commentsHtml = comments.map(c => `
            <div class="recent-comment">
                <div class="comment-author">
                    <div class="comment-avatar">${c.user.charAt(0)}</div>
                    <div class="comment-info">
                        <strong>${c.user}</strong>
                        <span class="comment-post">on ${c.post}</span>
                    </div>
                </div>
                <p class="comment-text">"${c.text}"</p>
            </div>
        `).join('');

        const widget = `
            <div class="sidebar-widget comments-widget">
                <h3 class="widget-title">
                    <i class="fas fa-comments"></i> Recent Comments
                </h3>
                <div class="recent-comments-list">
                    ${commentsHtml}
                </div>
            </div>
        `;
        sidebar.insertAdjacentHTML('beforeend', widget);
    }

    addCommunityWidget(sidebar) {
        const widget = `
            <div class="sidebar-widget community-widget">
                <h3 class="widget-title">
                    <i class="fas fa-users"></i> Join Our Community
                </h3>
                <div class="community-content">
                    <p>Join 50,000+ readers and creators. Get exclusive content and updates.</p>
                    <div class="social-links-vertical">
                        <a href="#" class="social-link facebook">
                            <i class="fab fa-facebook-f"></i>
                            <div class="social-info">
                                <span class="social-name">Facebook</span>
                                <span class="social-count">25K+ Likes</span>
                            </div>
                        </a>
                        <a href="#" class="social-link twitter">
                            <i class="fab fa-twitter"></i>
                            <div class="social-info">
                                <span class="social-name">Twitter</span>
                                <span class="social-count">15K+ Followers</span>
                            </div>
                        </a>
                        <a href="#" class="social-link linkedin">
                            <i class="fab fa-linkedin-in"></i>
                            <div class="social-info">
                                <span class="social-name">LinkedIn</span>
                                <span class="social-count">10K+ Connections</span>
                            </div>
                        </a>
                    </div>
                    <button class="btn btn-primary btn-block mt-3">Subscribe Now</button>
                </div>
            </div>
        `;
        sidebar.insertAdjacentHTML('beforeend', widget);
    }

    handleSidebarSearch(event) {
        event.preventDefault();
        const input = event.target.querySelector('input');
        const query = input.value.trim();

        if (query) {
            let searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
            if (!searches.includes(query)) {
                searches.unshift(query);
                if (searches.length > 5) searches.pop();
                localStorage.setItem('recentSearches', JSON.stringify(searches));
                this.updateRecentSearches();
            }
            this.showNotification(`Searching for: ${query}`, 'success');
            input.value = '';
        }
    }

    updateRecentSearches() {
        const container = document.getElementById('recent-searches');
        if (!container) return;

        const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        if (searches.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = `
            <div class="recent-searches-title">Recent Searches:</div>
            <div class="tags-cloud">
                ${searches.map(s => `<span class="tag" onclick="componentsManager.clickSearch('${s}')">${s}</span>`).join('')}
            </div>
        `;
    }

    clickSearch(query) {
        const input = document.getElementById('sidebar-search');
        if (input) {
            input.value = query;
        }
    }

    handleFooterNewsletter(event) {
        event.preventDefault();
        const email = event.target.querySelector('input[type="email"]').value;
        if (this.validateEmail(email)) {
            this.showNotification('Thank you for subscribing!', 'success');
            event.target.reset();
        } else {
            this.showNotification('Please enter a valid email.', 'error');
        }
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    addNotificationStyles() {
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed; top: 20px; right: 20px; background: #fff; color: #333;
                    padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    border-left: 4px solid #ec2F4B; z-index: 1000; display: flex; align-items: center; gap: 10px;
                    transform: translateX(120%); transition: transform 0.3s ease;
                }
                .notification.show { transform: translateX(0); }
                .notification-success { border-left-color: #43e97b; }
                .notification-error { border-left-color: #ff6b6b; }
                .notification-close { background: none; border: none; cursor: pointer; font-size: 1.2rem; margin-left: auto; }
                .recent-searches-title { font-size: 0.85rem; color: #666; margin: 10px 0 5px; }
                .tags-cloud { display: flex; flex-wrap: wrap; gap: 5px; }
                .tag { background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; cursor: pointer; transition: background 0.2s; }
                .tag:hover { background: #e0e0e0; }
                .community-content .btn { margin-top: 1rem; width: 100%; }
                .social-links-vertical { display: flex; flex-direction: column; gap: 0.8rem; margin-top: 1rem; }
                .social-link { display: flex; align-items: center; gap: 1rem; padding: 0.8rem; border-radius: 8px; text-decoration: none; color: white; transition: transform 0.2s; }
                .social-link:hover { transform: translateY(-2px); }
                .social-link.facebook { background: #3b5998; }
                .social-link.twitter { background: #1da1f2; }
                .social-link.linkedin { background: #0077b5; }
                .social-info { display: flex; flex-direction: column; line-height: 1.2; }
                .social-name { font-weight: 600; font-size: 0.9rem; }
                .social-count { font-size: 0.8rem; opacity: 0.9; }
            `;
            document.head.appendChild(style);
        }
    }

    initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });
            document.querySelectorAll('img[loading="lazy"]').forEach(img => observer.observe(img));
        }
    }

    initializeShareButtons() {
        // Implementation for share buttons if needed
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.componentsManager = new ComponentsManager();
});