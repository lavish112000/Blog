/**
 * =====================================
 * MODERN BLOG WEBSITE - MAIN JAVASCRIPT
 * =====================================
 */

class ModernBlog {
  constructor() {
    this.posts = window.blogData || [];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeComponents();
    this.handleLoadingScreen();
    this.setupScrollEffects();
    this.initializeTheme();
    this.registerServiceWorker();
  }

  initializeComponents() {
    this.loadFeaturedPosts();
    this.loadLatestPosts();
  }

  loadFeaturedPosts() {
    const container = document.getElementById('featured-grid');
    if (!container) return;

    // Sort by views or just take featured ones
    const featured = this.posts.filter(p => p.featured).slice(0, 3);

    container.innerHTML = featured.map(post => `
            <article class="featured-card fade-in-up">
                <div class="featured-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                    <div class="featured-category">${post.category}</div>
                </div>
                <div class="featured-content">
                    <div class="featured-meta">
                        <span><i class="far fa-calendar"></i> ${post.date}</span>
                        <span><i class="far fa-user"></i> ${post.author}</span>
                    </div>
                    <h3 class="featured-title">
                        <a href="#">${post.title}</a>
                    </h3>
                    <a href="#" class="read-more">Read Article <i class="fas fa-arrow-right"></i></a>
                </div>
            </article>
        `).join('');
  }

  loadLatestPosts() {
    const container = document.getElementById('posts-grid');
    if (!container) return;

    const path = window.location.pathname;
    let postsToShow = [];

    // Determine context based on URL
    if (path.includes('technology.html')) {
      postsToShow = this.posts.filter(p => p.category === 'technology');
    } else if (path.includes('design.html')) {
      postsToShow = this.posts.filter(p => p.category === 'design');
    } else if (path.includes('business.html')) {
      postsToShow = this.posts.filter(p => p.category === 'business');
    } else if (path.includes('lifestyle.html')) {
      postsToShow = this.posts.filter(p => p.category === 'lifestyle');
    } else if (path.includes('blog.html')) {
      postsToShow = this.posts; // Show all on blog page
    } else {
      // Home page or root: Show latest 6 mixed
      postsToShow = this.posts.slice(0, 6);
    }

    if (postsToShow.length === 0) {
      container.innerHTML = '<p class="no-posts">No posts found.</p>';
      return;
    }

    container.innerHTML = postsToShow.map(post => this.createPostHTML(post)).join('');
  }

  createPostHTML(post) {
    return `
            <article class="blog-card fade-in-up" data-category="${post.category}">
                <div class="blog-card-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
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
                        <a href="#" class="read-more">
                            Read More <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </article>
        `;
  }

  handleLoadingScreen() {
    const loader = document.getElementById('loading-screen');
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
      }, 800);
    }
  }

  setupScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem('blog-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon();
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('blog-theme', next);
    this.updateThemeIcon();
  }

  updateThemeIcon() {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      const icon = btn.querySelector('i');
      const theme = document.documentElement.getAttribute('data-theme');
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  setupEventListeners() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
      });
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        const filter = e.target.dataset.filter;
        this.filterPosts(filter);
      });
    });
  }

  filterPosts(category) {
    const posts = document.querySelectorAll('.blog-card');
    posts.forEach(post => {
      if (category === 'all' || post.dataset.category === category) {
        post.style.display = 'block';
        setTimeout(() => post.style.opacity = '1', 50);
      } else {
        post.style.display = 'none';
        post.style.opacity = '0';
      }
    });
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW failed', err));
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.blogManager = new ModernBlog();
});
