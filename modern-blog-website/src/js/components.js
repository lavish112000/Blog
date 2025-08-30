/**
 * =====================================
 * COMPONENTS JAVASCRIPT MODULE
 * =====================================
 */

class ComponentsManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadHeader();
        this.loadFooter();
        this.loadSidebar();
        this.initializeComponents();
    }

    loadHeader() {
        const headerContent = `
            <!-- Reading Progress Bar -->
            <div class="reading-progress">
                <div class="reading-progress-bar"></div>
            </div>
        `;
        
        // Insert reading progress bar if not already present
        if (!document.querySelector('.reading-progress')) {
            document.body.insertAdjacentHTML('afterbegin', headerContent);
        }
    }

    loadFooter() {
        const footer = document.querySelector('.footer');
        if (!footer) return;

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
                            <li><a href="#home">Home</a></li>
                            <li><a href="pages/about.html">About Us</a></li>
                            <li><a href="#contact">Contact</a></li>
                            <li><a href="#privacy">Privacy Policy</a></li>
                            <li><a href="#terms">Terms of Service</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h3>Categories</h3>
                        <ul class="footer-links">
                            <li><a href="#" onclick="blogManager?.filterPosts('technology')">Technology</a></li>
                            <li><a href="#" onclick="blogManager?.filterPosts('design')">Design</a></li>
                            <li><a href="#" onclick="blogManager?.filterPosts('business')">Business</a></li>
                            <li><a href="#" onclick="blogManager?.filterPosts('lifestyle')">Lifestyle</a></li>
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
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;

        // Clear existing content
        sidebar.innerHTML = '';

        // Add search widget
        this.addSearchWidget(sidebar);
        
        // Add author info widget
        this.addAuthorWidget(sidebar);
        
        // Add recent comments widget
        this.addRecentCommentsWidget(sidebar);
        
        // Add social media widget
        this.addSocialMediaWidget(sidebar);
    }

    addSearchWidget(sidebar) {
        const searchWidget = `
            <div class="sidebar-widget">
                <h3 class="widget-title">
                    <i class="fas fa-search"></i>
                    Quick Search
                </h3>
                <form class="sidebar-search-form" onsubmit="componentsManager.handleSidebarSearch(event)">
                    <div class="search-input-group">
                        <input type="text" placeholder="Search articles..." id="sidebar-search">
                        <button type="submit">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </form>
            </div>
        `;
        sidebar.insertAdjacentHTML('beforeend', searchWidget);
    }

    addAuthorWidget(sidebar) {
        const authorWidget = `
            <div class="sidebar-widget">
                <h3 class="widget-title">
                    <i class="fas fa-user-circle"></i>
                    Featured Author
                </h3>
                <div class="author-bio">
                    <div class="author-bio-avatar">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="Featured Author">
                    </div>
                    <div class="author-bio-content">
                        <h3>Jane Doe</h3>
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
        sidebar.insertAdjacentHTML('beforeend', authorWidget);
    }

    addRecentCommentsWidget(sidebar) {
        const recentComments = [
            {
                author: "Mike Johnson",
                comment: "Great article! Really helped me understand the concepts better.",
                post: "Understanding JavaScript Closures",
                date: "2 hours ago"
            },
            {
                author: "Sarah Chen",
                comment: "The examples were perfect. Thanks for sharing!",
                post: "CSS Grid Layout Guide",
                date: "5 hours ago"
            },
            {
                author: "Alex Rodriguez",
                comment: "Looking forward to more content like this.",
                post: "Web Development Trends",
                date: "1 day ago"
            }
        ];

        const commentsWidget = `
            <div class="sidebar-widget">
                <h3 class="widget-title">
                    <i class="fas fa-comments"></i>
                    Recent Comments
                </h3>
                <div class="recent-comments">
                    ${recentComments.map(comment => `
                        <div class="recent-comment">
                            <div class="comment-author">
                                <div class="comment-avatar">${comment.author.charAt(0)}</div>
                                <div class="comment-info">
                                    <strong>${comment.author}</strong>
                                    <span class="comment-time">${comment.date}</span>
                                </div>
                            </div>
                            <p class="comment-text">${comment.comment}</p>
                            <div class="comment-post">On: <a href="#">${comment.post}</a></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        sidebar.insertAdjacentHTML('beforeend', commentsWidget);
    }

    addSocialMediaWidget(sidebar) {
        const socialWidget = `
            <div class="sidebar-widget">
                <h3 class="widget-title">
                    <i class="fas fa-share-alt"></i>
                    Follow Us
                </h3>
                <div class="social-media-links">
                    <a href="#" class="social-link facebook">
                        <i class="fab fa-facebook-f"></i>
                        <div class="social-info">
                            <span class="social-name">Facebook</span>
                            <span class="social-count">12.5K Followers</span>
                        </div>
                    </a>
                    <a href="#" class="social-link twitter">
                        <i class="fab fa-twitter"></i>
                        <div class="social-info">
                            <span class="social-name">Twitter</span>
                            <span class="social-count">8.3K Followers</span>
                        </div>
                    </a>
                    <a href="#" class="social-link linkedin">
                        <i class="fab fa-linkedin-in"></i>
                        <div class="social-info">
                            <span class="social-name">LinkedIn</span>
                            <span class="social-count">5.7K Connections</span>
                        </div>
                    </a>
                    <a href="#" class="social-link youtube">
                        <i class="fab fa-youtube"></i>
                        <div class="social-info">
                            <span class="social-name">YouTube</span>
                            <span class="social-count">15.2K Subscribers</span>
                        </div>
                    </a>
                </div>
            </div>
        `;
        sidebar.insertAdjacentHTML('beforeend', socialWidget);
    }

    initializeComponents() {
        this.initializeTooltips();
        this.initializeLazyLoading();
        this.initializeShareButtons();
        this.initializeReadingTime();
        this.addNotificationStyles();
    }

    initializeTooltips() {
        // Add tooltip functionality for elements with data-tooltip attribute
        document.addEventListener('mouseover', (e) => {
            if (e.target.hasAttribute('data-tooltip')) {
                this.showTooltip(e.target, e.target.getAttribute('data-tooltip'));
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.hasAttribute('data-tooltip')) {
                this.hideTooltip();
            }
        });
    }

    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        
        setTimeout(() => tooltip.classList.add('show'), 100);
    }

    hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    initializeShareButtons() {
        // Add share functionality to social share buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.social-share-btn')) {
                e.preventDefault();
                const shareBtn = e.target.closest('.social-share-btn');
                const platform = shareBtn.classList.contains('facebook') ? 'facebook' :
                               shareBtn.classList.contains('twitter') ? 'twitter' :
                               shareBtn.classList.contains('linkedin') ? 'linkedin' : 'pinterest';
                
                this.shareOnPlatform(platform);
            }
        });
    }

    shareOnPlatform(platform) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        const description = encodeURIComponent(document.querySelector('meta[name="description"]')?.content || '');
        
        let shareUrl = '';
        
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                break;
            case 'pinterest':
                shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&description=${description}`;
                break;
            default:
                console.warn(`Unknown social platform: ${platform}`);
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }

    initializeReadingTime() {
        // Calculate and display reading time for articles
        document.querySelectorAll('.blog-card-content, .post-content').forEach(content => {
            const text = content.textContent || content.innerText;
            const words = text.trim().split(/\s+/).length;
            const readingTime = Math.ceil(words / 200); // Assuming 200 words per minute
            
            const readTimeElement = content.querySelector('.read-time');
            if (!readTimeElement) {
                const metaSection = content.querySelector('.blog-card-meta, .post-meta');
                if (metaSection) {
                    metaSection.insertAdjacentHTML('beforeend', `<span class="read-time">${readingTime} min read</span>`);
                }
            }
        });
    }

    handleFooterNewsletter(event) {
        event.preventDefault();
        const email = event.target.querySelector('input[type="email"]').value;
        
        if (this.validateEmail(email)) {
            this.showNotification('Thank you for subscribing to our newsletter!', 'success');
            event.target.reset();
        } else {
            this.showNotification('Please enter a valid email address.', 'error');
        }
    }

    handleSidebarSearch(event) {
        event.preventDefault();
        const query = event.target.querySelector('#sidebar-search').value.trim();
        
        if (query) {
            // Trigger main search functionality
            const mainSearchInput = document.getElementById('search-input');
            if (mainSearchInput) {
                mainSearchInput.value = query;
                // Trigger search
                if (window.blogManager) {
                    window.blogManager.performSearch(query.toLowerCase());
                }
                
                // Close search overlay if open
                const searchOverlay = document.getElementById('search-overlay');
                if (searchOverlay.classList.contains('active')) {
                    searchOverlay.classList.remove('active');
                }
            }
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
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove after 4 seconds
        const autoRemove = setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(autoRemove);
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    addNotificationStyles() {
        // Add notification styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--white);
                    color: var(--gray-800);
                    padding: var(--spacing-lg) var(--spacing-xl);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-xl);
                    border-left: 4px solid var(--primary-color);
                    z-index: var(--z-toast);
                    opacity: 0;
                    transform: translateX(100%);
                    transition: all var(--transition-normal);
                    max-width: 400px;
                    min-width: 300px;
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                }
                
                .notification.show {
                    opacity: 1;
                    transform: translateX(0);
                }
                
                .notification.notification-success {
                    border-left-color: var(--success-color);
                }
                
                .notification.notification-error {
                    border-left-color: var(--error-color);
                }
                
                .notification.notification-warning {
                    border-left-color: var(--warning-color);
                }
                
                .notification i {
                    font-size: 1.25rem;
                    color: var(--primary-color);
                }
                
                .notification.notification-success i {
                    color: var(--success-color);
                }
                
                .notification.notification-error i {
                    color: var(--error-color);
                }
                
                .notification.notification-warning i {
                    color: var(--warning-color);
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: var(--gray-500);
                    font-size: 1.5rem;
                    cursor: pointer;
                    margin-left: auto;
                    padding: 0;
                    line-height: 1;
                }
                
                .notification-close:hover {
                    color: var(--gray-700);
                }
                
                .tooltip {
                    position: absolute;
                    background: var(--gray-900);
                    color: var(--white);
                    padding: var(--spacing-xs) var(--spacing-sm);
                    border-radius: var(--radius-sm);
                    font-size: 0.875rem;
                    z-index: var(--z-tooltip);
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity var(--transition-fast);
                }
                
                .tooltip.show {
                    opacity: 1;
                }
                
                .tooltip::after {
                    content: '';
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border: 4px solid transparent;
                    border-top-color: var(--gray-900);
                }
                
                .social-media-links {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-md);
                }
                
                .social-link {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                    padding: var(--spacing-md);
                    border-radius: var(--radius-lg);
                    text-decoration: none;
                    color: var(--white);
                    transition: var(--transition-fast);
                }
                
                .social-link.facebook {
                    background: #3b5998;
                }
                
                .social-link.twitter {
                    background: #1da1f2;
                }
                
                .social-link.linkedin {
                    background: #0077b5;
                }
                
                .social-link.youtube {
                    background: #ff0000;
                }
                
                .social-link:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }
                
                .social-link i {
                    font-size: 1.25rem;
                    width: 20px;
                    text-align: center;
                }
                
                .social-info {
                    display: flex;
                    flex-direction: column;
                }
                
                .social-name {
                    font-weight: 600;
                    margin-bottom: 2px;
                }
                
                .social-count {
                    font-size: 0.875rem;
                    opacity: 0.9;
                }
                
                .recent-comment {
                    padding: var(--spacing-md) 0;
                    border-bottom: 1px solid var(--gray-200);
                }
                
                .recent-comment:last-child {
                    border-bottom: none;
                }
                
                .comment-author {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    margin-bottom: var(--spacing-xs);
                }
                
                .comment-avatar {
                    width: 32px;
                    height: 32px;
                    background: var(--gradient-primary);
                    color: var(--white);
                    border-radius: var(--radius-full);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 0.875rem;
                }
                
                .comment-info strong {
                    color: var(--gray-900);
                    font-size: 0.875rem;
                }
                
                .comment-time {
                    color: var(--gray-500);
                    font-size: 0.75rem;
                }
                
                .comment-text {
                    font-size: 0.875rem;
                    color: var(--gray-600);
                    margin: var(--spacing-xs) 0;
                    line-height: 1.4;
                }
                
                .comment-post {
                    font-size: 0.75rem;
                    color: var(--gray-500);
                }
                
                .comment-post a {
                    color: var(--primary-color);
                    text-decoration: none;
                }
                
                .sidebar-search-form {
                    margin-bottom: 0;
                }
                
                .search-input-group {
                    display: flex;
                    border: 2px solid var(--gray-200);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    transition: var(--transition-fast);
                }
                
                .search-input-group:focus-within {
                    border-color: var(--primary-color);
                }
                
                .search-input-group input {
                    flex: 1;
                    border: none;
                    padding: var(--spacing-md);
                    font-size: 0.875rem;
                    background: var(--white);
                }
                
                .search-input-group input:focus {
                    outline: none;
                }
                
                .search-input-group button {
                    background: var(--primary-color);
                    border: none;
                    color: var(--white);
                    padding: var(--spacing-md);
                    cursor: pointer;
                    transition: var(--transition-fast);
                }
                
                .search-input-group button:hover {
                    background: var(--secondary-color);
                }
                
                .post-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                    z-index: var(--z-modal);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-lg);
                }
                
                .post-modal-content {
                    background: var(--white);
                    border-radius: var(--radius-xl);
                    max-width: 800px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                }
                
                .post-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: var(--spacing-xl);
                    border-bottom: 1px solid var(--gray-200);
                }
                
                .post-modal-close {
                    background: none;
                    border: none;
                    font-size: 2rem;
                    color: var(--gray-500);
                    cursor: pointer;
                    line-height: 1;
                }
                
                .post-modal-meta {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-lg);
                    padding: 0 var(--spacing-xl);
                    color: var(--gray-600);
                    font-size: 0.875rem;
                }
                
                .post-modal-body {
                    padding: var(--spacing-xl);
                }
                
                .post-image {
                    width: 100%;
                    height: 300px;
                    object-fit: cover;
                    border-radius: var(--radius-lg);
                    margin-bottom: var(--spacing-lg);
                }
                
                .post-content {
                    line-height: 1.7;
                    color: var(--gray-700);
                    margin-bottom: var(--spacing-lg);
                }
                
                .post-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--spacing-sm);
                }
                
                .post-tag {
                    background: var(--gray-100);
                    color: var(--gray-600);
                    padding: var(--spacing-xs) var(--spacing-sm);
                    border-radius: var(--radius-sm);
                    font-size: 0.75rem;
                    font-weight: 500;
                }
                
                .no-results {
                    text-align: center;
                    padding: var(--spacing-3xl);
                    color: var(--gray-600);
                }
                
                .no-results i {
                    font-size: 4rem;
                    color: var(--gray-400);
                    margin-bottom: var(--spacing-lg);
                }
                
                .no-results h3 {
                    color: var(--gray-700);
                    margin-bottom: var(--spacing-md);
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize components manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.componentsManager = new ComponentsManager();
});

// Export for use in other modules
window.ComponentsManager = ComponentsManager;