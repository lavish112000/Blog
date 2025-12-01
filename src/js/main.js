/**
 * =====================================
 * MODERN BLOG WEBSITE - MAIN JAVASCRIPT
 * =====================================
 */

class ModernBlog {
  constructor() {
    console.log('ModernBlog initializing...');
    this.posts = window.blogData || [];
    console.log('Posts loaded:', this.posts.length);
    this.enrichPostsWithUrls();
    console.log('First post URL:', this.posts[0]?.url);
    this.init();
  }

  initializeComponents() {
    // Check if we are on a single post page
    if (window.location.pathname.includes('post.html')) {
      this.loadSinglePost();
    } else {
      this.loadFeaturedPosts();
      this.loadLatestPosts();
    }
  }

  getPostUrl(postOrId) {
    let post = postOrId;
    if (typeof postOrId === 'number' || typeof postOrId === 'string') {
      post = this.posts.find(p => p.id == postOrId);
    }

    if (!post) return '#';

    if (post.url) {
      // Calculate depth to root to generate correct relative path
      const slashes = (window.location.pathname.match(/\//g) || []).length;
      // If pathname is just '/' (root), slashes is 1, depth should be 0.
      // If pathname is '/index.html', slashes is 1, depth should be 0.
      // If pathname is '/pages/blog.html', slashes is 2, depth should be 1.
      const depth = Math.max(0, slashes - 1);
      const prefix = '../'.repeat(depth);

      return prefix + post.url;
    }

    // Fallback
    const path = window.location.pathname;
    const inPagesDir = path.includes('/pages/');
    const prefix = inPagesDir ? '' : 'pages/';
    return `${prefix}post.html?id=${post.id}`;
  }

  loadSinglePost() {
    // This function is likely obsolete for the new static pages, 
    // but we keep it for now in case any old links exist.
    // ... (rest of function)
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const post = this.posts.find(p => p.id === id);

    if (!post) {
      document.getElementById('single-post-content').innerHTML = '<div class="text-center py-5"><h3>Post not found</h3><a href="blog.html" class="btn btn-primary mt-3">Back to Blog</a></div>';
      return;
    }

    // ... (rest of implementation is fine to leave as legacy support)
    // But we should probably redirect if we are on post.html?id=X and we have a static URL?
    // For now, let's just leave it.

    // Update Page Title
    document.title = `${post.title} - Modern Blog`;

    // Update Breadcrumbs
    const breadcrumbCategory = document.getElementById('breadcrumb-category');
    const breadcrumbTitle = document.getElementById('breadcrumb-title');

    if (breadcrumbCategory) {
      breadcrumbCategory.innerHTML = `<a href="${post.category}.html" class="breadcrumb-link" style="text-transform: capitalize;">${post.category}</a>`;
    }
    if (breadcrumbTitle) {
      breadcrumbTitle.textContent = post.title;
    }

    // Generate full content
    const content = this.generatePostContent(post);

    // Render Post
    const container = document.getElementById('single-post-content');
    container.innerHTML = `
        <header class="post-header mb-5">
            <div class="post-category-badge mb-3">${post.category}</div>
            <h1 class="post-title display-4 fw-bold mb-4">${post.title}</h1>
            <div class="post-meta d-flex align-items-center gap-4 text-gray-500">
                <div class="d-flex align-items-center gap-2">
                    <div class="author-avatar">${post.author.charAt(0)}</div>
                    <span class="fw-medium text-gray-900">${post.author}</span>
                </div>
                <span><i class="far fa-calendar me-2"></i>${post.date}</span>
                <span><i class="far fa-eye me-2"></i>${post.views} views</span>
            </div>
        </header>

        <div class="post-featured-image mb-5">
            <img src="${post.image}" alt="${post.title}" class="img-fluid rounded-xl w-100" style="max-height: 500px; object-fit: cover;">
        </div>

        <div class="post-body">
            <p class="lead mb-5">${post.excerpt}</p>
            ${content}
        </div>

        <div class="post-tags mt-5 pt-4 border-top">
            <h5 class="mb-3">Tags:</h5>
            <div class="d-flex gap-2">
                <span class="blog-tag">#${post.category}</span>
                <span class="blog-tag">#trend</span>
                <span class="blog-tag">#2024</span>
            </div>
        </div>
        
        <div class="author-bio mt-5">
            <div class="author-bio-avatar">
                <div class="author-avatar" style="width: 100%; height: 100%; font-size: 2rem;">${post.author.charAt(0)}</div>
            </div>
            <div class="author-bio-content">
                <h3>About ${post.author}</h3>
                <p>Senior editor and content creator specializing in ${post.category}. Passionate about uncovering the latest trends and sharing actionable insights with our readers.</p>
                <div class="author-social">
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-linkedin"></i></a>
                    <a href="#"><i class="fas fa-globe"></i></a>
                </div>
            </div>
        </div>
    `;
  }

  generatePostContent(post) {
    // Generate realistic-looking content based on the title and category
    return `
        <p>In the rapidly evolving landscape of <strong>${post.category}</strong>, few developments have sparked as much conversation as <em>${post.title}</em>. As we navigate through 2024, professionals and enthusiasts alike are finding themselves at a crossroads, needing to adapt to these significant shifts.</p>
        
        <h2 class="mt-5 mb-3">The Current State of Affairs</h2>
        <p>To understand where we are going, we must first look at the data. Recent studies indicate a <strong>40% increase</strong> in adoption rates across the industry. This isn't just a fleeting trend; it's a fundamental restructuring of how we approach ${post.category}.</p>
        <p>Experts argue that this shift is driven by three main factors:</p>
        <ul>
            <li><strong>Technological Convergence:</strong> New tools are making it easier than ever to implement complex solutions.</li>
            <li><strong>Consumer Demand:</strong> Expectations for speed, quality, and sustainability are at an all-time high.</li>
            <li><strong>Economic Pressures:</strong> Efficiency is no longer a luxury; it's a survival mechanism.</li>
        </ul>

        <h2 class="mt-5 mb-3">Why This Matters Now</h2>
        <p>"The biggest risk is not taking any risk," as the saying goes. In the context of ${post.title}, this couldn't be truer. Those who hesitate to embrace these changes risk falling behind competitors who are already leveraging these new advantages.</p>
        <blockquote class="blockquote my-5 p-4 bg-light border-start border-4 border-primary">
            <p class="mb-0 fst-italic">"Innovation distinguishes between a leader and a follower. The changes we are seeing in ${post.category} today will define the market leaders of tomorrow."</p>
        </blockquote>
        <p>We spoke with several industry leaders, and the consensus is clear: the time to act is now. Whether you are a seasoned veteran or a newcomer to the field, understanding the nuances of this development is crucial.</p>

        <h2 class="mt-5 mb-3">Practical Steps Forward</h2>
        <p>So, how can you leverage this for your own success? Here is a simple framework to get started:</p>
        <ol>
            <li><strong>Audit your current processes:</strong> Identify where ${post.title} can have the most immediate impact.</li>
            <li><strong>Invest in education:</strong> Ensure your team understands not just the 'how', but the 'why'.</li>
            <li><strong>Start small, scale fast:</strong> Run pilot programs to test viability before a full rollout.</li>
        </ol>
        
        <h2 class="mt-5 mb-3">Conclusion</h2>
        <p>As we look towards 2025, the trajectory is clear. ${post.title} is not going away. By embracing these changes today, you position yourself at the forefront of the <strong>${post.category}</strong> revolution.</p>
        <p>Stay tuned to ModernBlog for more updates as this story develops.</p>
    `;
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
                        <a href="${this.getPostUrl(post)}">${post.title}</a>
                    </h3>
                    <a href="${this.getPostUrl(post)}" class="read-more">Read Article <i class="fas fa-arrow-right"></i></a>
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
                        <a href="${this.getPostUrl(post)}">${post.title}</a>
                    </h3>
                    <p class="blog-card-excerpt">${post.excerpt}</p>
                    <div class="blog-card-footer">
                        <a href="${this.getPostUrl(post)}" class="read-more">
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
