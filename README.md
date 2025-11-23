# Modern Blog Website

## Overview

This project is a modern, responsive blog website designed with an enterprise-level UI and a vibrant color theme. It incorporates award-winning design principles to provide a comprehensive platform for daily blogging.

## Features

- **Responsive Design**: The website is fully responsive, ensuring a seamless  experience across devices of all sizes.
- **Dynamic Blog Posts**: Blog posts are loaded dynamically from a JSON file, allowing for easy updates and management.
- **User Engagement**: Includes components like a newsletter signup form and a contact page to enhance user interaction.
- **Contact Page**: Interactive contact page with form validation, FAQ accordion functionality, and secure form submission handling.
- **Modern UI Components**: Utilizes well-structured components for the header, footer, sidebar, and more, ensuring a consistent look and feel.

## Project Structure

```text
blog-website
├── src
│   ├── index.html          # Main entry point for the website
│   ├── css
│   │   ├── main.css        # Main styles for the website
│   │   ├── components.css   # Styles for UI components
│   │   ├── contact-page.css # Styles specific to the contact page
│   │   └── responsive.css   # Responsive styles
│   ├── js
│   │   ├── main.js         # Main JavaScript functionality
│   │   ├── blog.js         # Blog-specific JavaScript
│   │   ├── components.js    # JavaScript for UI components
│   │   ├── contact-page.js  # JavaScript for contact page functionality
│   │   └── utils            # Utility JavaScript modules
│   ├── pages
│   │   ├── about.html      # About page
│   │   ├── contact.html    # Contact page
│   │   └── blog.html       # Main blog page
│   ├── components
│   │   ├── header.html     # Header component
│   │   ├── footer.html     # Footer component
│   │   ├── sidebar.html    # Sidebar component
│   │   └── newsletter.html  # Newsletter signup component
│   ├── assets
│   │   ├── fonts           # Directory for font files
│   │   └── icons           # Directory for icon files
│   └── data
│       └── posts.json      # JSON file containing blog posts data
├── api
│   └── analytics.json      # Analytics configuration
├── package.json            # npm configuration file
├── webpack.config.js       # Webpack configuration file
├── .gitignore             # Git ignore rules
├── CACHE_CLEAR_INSTRUCTIONS.md # Cache clearing instructions
├── QUICK_START.md         # Quick start guide
├── SETUP_GUIDE.md         # Setup guide
├── clear-dev-cache.js     # Development cache clearing script
├── blog-website.code-workspace # VS Code workspace file
└── README.md               # Project documentation
```

## Getting Started

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd modern-blog-website
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Build the Project**:

   ```bash
   npm run build
   ```

4. **Run the Development Server**:

   ```bash
   npm start
   ```

## Usage

- Navigate to the main blog page to view the latest posts.
- Use the contact page to reach out for inquiries.
- Subscribe to the newsletter for updates.

## Deployment

### Netlify Deployment

This project is configured for easy deployment on Netlify:

1. **Connect to GitHub**: Link your GitHub repository to Netlify
2. **Build Settings**: Netlify will automatically detect the `netlify.toml` configuration:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. **Deploy**: Netlify will build and deploy your site automatically on every push to main

### Manual Deployment

If you prefer to deploy manually:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# The dist/ directory contains all files ready for deployment
```

## Contributing

Contributions are welcome! This project has a comprehensive code review system with automated quality checks.

**Before contributing, please:**

1. Read the [Contributing Guidelines](CONTRIBUTING.md)
2. Review the [Code Review Checklist](CODE_REVIEW_CHECKLIST.md)
3. Check the [Quick Reference Guide](CODE_REVIEW_SYSTEM.md)

**Quick Start:**

```bash
npm install              # Install dependencies
npm run lint            # Check code quality
npm test                # Run tests
npm run precommit       # Run all checks
```

**Resources:**

- [Contributing Guidelines](CONTRIBUTING.md) - Complete developer guide
- [Code Review Checklist](CODE_REVIEW_CHECKLIST.md) - 10-point review system
- [Security Guidelines](SECURITY.md) - Security best practices
- [Performance Guide](PERFORMANCE.md) - Performance optimization

## Code Quality

This project uses:

- ✅ **ESLint** - Code quality enforcement
- ✅ **Prettier** - Code formatting
- ✅ **Jest** - Unit testing (50% coverage minimum)
- ✅ **Husky** - Pre-commit hooks
- ✅ **GitHub Actions** - CI/CD with quality gates
- ✅ **CodeQL** - Security scanning

All PRs must pass automated quality checks before merge.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
