# Contributing to Modern Blog Website

Thank you for your interest in contributing to our project! This guide will help you understand our development process, coding standards, and review requirements.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Code Review Process](#code-review-process)
- [Security Guidelines](#security-guidelines)
- [Performance Standards](#performance-standards)
- [Accessibility Requirements](#accessibility-requirements)
- [Pull Request Process](#pull-request-process)
- [Community Guidelines](#community-guidelines)

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git
- VS Code (recommended) with our workspace extensions

### Initial Setup

1. **Fork and Clone**

```bash
git clone https://github.com/YOUR_USERNAME/Blog.git
cd Blog
```

1. **Install Dependencies**

```bash
npm install
```

1. **Verify Setup**

```bash
npm run lint        # Check code quality
npm run test        # Run tests
npm run build       # Build project
```

1. **Open in VS Code**

```bash
code blog-website.code-workspace
```

### VS Code Setup

Install recommended extensions when prompted. Our workspace includes:

- ESLint for code quality
- Prettier for formatting
- Live Server for development
- GitLens for version control

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch Naming Convention:**

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test updates
- `chore/` - Maintenance tasks

### 2. Make Your Changes

Follow our [Coding Standards](#coding-standards) and write clean, maintainable code.

### 3. Run Quality Checks

Before committing, ensure all checks pass:

```bash
# Lint your code
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format code
npm run format

# Run tests
npm run test

# Check coverage
npm run test:coverage

# Build project
npm run build
```

### 4. Commit Your Changes

Use conventional commit format:

```bash
git commit -m "feat(blog): add dark mode toggle"
git commit -m "fix(contact): resolve form validation issue"
git commit -m "docs(readme): update installation steps"
```

**Commit Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance
- `perf` - Performance improvement
- `ci` - CI/CD changes
- `build` - Build system changes

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub using our PR template.

---

## Coding Standards

### JavaScript

#### ES6+ Features

- Use `const` and `let`, never `var`
- Use arrow functions for callbacks
- Use template literals for string interpolation
- Use destructuring where appropriate
- Use async/await for async operations

```javascript
// ✅ Good
const fetchPosts = async () => {
  try {
    const response = await fetch('/api/posts');
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    throw error;
  }
};

// ❌ Bad
var fetchPosts = function() {
  return fetch('/api/posts')
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      return json.data;
    });
};
```

#### Naming Conventions

- `camelCase` for variables and functions
- `PascalCase` for classes and constructors
- `UPPER_SNAKE_CASE` for constants
- Descriptive names (avoid single letters except in loops)

```javascript
// ✅ Good
const MAX_POSTS_PER_PAGE = 10;
class BlogPost { }
function calculateReadTime(content) { }

// ❌ Bad
const m = 10;
class blogpost { }
function calc(c) { }
```

#### Function Guidelines

- Keep functions small (< 50 lines)
- Single responsibility principle
- Maximum 3-4 parameters (use object for more)
- Always return a value or undefined explicitly

```javascript
// ✅ Good
function createPost({ title, content, author, tags }) {
  // Implementation
  return post;
}

// ❌ Bad
function createPost(title, content, author, tags, category, status, publishDate) {
  // Too many parameters
}
```

### CSS

#### Naming Convention

Use BEM (Block Element Modifier):

```css
/* Block */
.blog-post { }

/* Element */
.blog-post__title { }
.blog-post__content { }

/* Modifier */
.blog-post--featured { }
.blog-post__title--large { }
```

#### Best Practices

- Mobile-first responsive design
- Use CSS custom properties (variables)
- Avoid !important unless absolutely necessary
- Keep specificity low
- Group related properties

```css
/* ✅ Good */
.blog-post {
  /* Layout */
  display: flex;
  flex-direction: column;
  
  /* Box model */
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  
  /* Visual */
  background-color: var(--color-bg-primary);
  border-radius: var(--border-radius);
}
```

### HTML

- Use semantic HTML5 elements
- Proper heading hierarchy (h1 → h2 → h3)
- Include alt text for images
- Use ARIA labels where needed
- Validate forms properly

```html
<!-- ✅ Good -->
<article class="blog-post">
  <header>
    <h2 class="blog-post__title">Post Title</h2>
  </header>
  <section class="blog-post__content">
    <p>Content here...</p>
  </section>
</article>

<!-- ❌ Bad -->
<div class="blog-post">
  <div>
    <div class="title">Post Title</div>
  </div>
</div>
```

---

## Testing Requirements

### Writing Tests

All new functionality must include tests. We use Jest for testing.

```javascript
// Example test structure
describe('BlogPost Component', () => {
  describe('render', () => {
    test('should display post title', () => {
      // Arrange
      const post = { title: 'Test Post' };
      
      // Act
      const element = renderPost(post);
      
      // Assert
      expect(element.querySelector('.post-title').textContent).toBe('Test Post');
    });
  });
});
```

### Coverage Requirements

- **Minimum:** 50% overall coverage
- **New Code:** 70% coverage
- **Critical Logic:** 90% coverage

Run coverage report:

```bash
npm run test:coverage
```

### Test Types

1. **Unit Tests** - Test individual functions/components
2. **Integration Tests** - Test component interactions
3. **E2E Tests** - Test user workflows (future)

---

## Code Review Process

All contributions go through our [10-Point Code Review Checklist](CODE_REVIEW_CHECKLIST.md).

### Before Requesting Review

Ensure you have:

- [ ] Run all quality checks locally
- [ ] Written/updated tests
- [ ] Updated documentation
- [ ] Filled out PR template completely
- [ ] Reviewed your own changes
- [ ] Tested in multiple browsers

### During Review

- Respond to feedback promptly
- Ask questions if feedback is unclear
- Make requested changes
- Re-request review after updates
- Be open to suggestions

### Review Timeline

- Initial review: Within 2 business days
- Follow-up reviews: Within 1 business day
- Stale PRs (no activity for 14 days) may be closed

---

## Security Guidelines

### Critical Rules

1. **Never commit secrets**
   - No API keys, passwords, or tokens
   - Use environment variables
   - Add `.env` files to `.gitignore`

1. **Validate all inputs**

```javascript
function sanitizeInput(input) {
     return input.trim().replace(/[<>]/g, '');
   }
```

1. **Handle errors securely**

```javascript
   // ✅ Good
   catch (error) {
     console.error('Operation failed');
     throw new Error('An error occurred');
   }
   
   // ❌ Bad - exposes internal details
   catch (error) {
     console.error(error.stack);
     throw error;
   }
   ```

1. **Keep dependencies updated**

```bash
   npm audit
   npm audit fix
   ```

### Security Checklist

Before submitting PR:

- [ ] No hardcoded credentials
- [ ] All user inputs validated
- [ ] Error messages don't expose sensitive info
- [ ] `npm audit` shows no high/critical issues
- [ ] HTTPS used for all external requests

---

## Performance Standards

### Guidelines

1. **Optimize Images**
   - Use WebP format where supported
   - Provide multiple sizes for responsive images
   - Use lazy loading for below-fold images

2. **Minimize Bundle Size**
   - Code-split large features
   - Tree-shake unused code
   - Minimize dependencies

3. **Optimize JavaScript**
   - Debounce scroll/resize handlers
   - Use event delegation
   - Remove unused event listeners

```javascript
// ✅ Good - Debounce
const debouncedSearch = debounce((query) => {
  searchPosts(query);
}, 300);

// ❌ Bad - No debounce
input.addEventListener('input', (e) => {
  searchPosts(e.target.value); // Fires on every keystroke
});
```

### Performance Targets

- First Contentful Paint: < 1.8s
- Time to Interactive: < 3.9s
- Lighthouse Performance Score: > 90

---

## Accessibility Requirements

We follow WCAG 2.1 Level AA standards.

### Requirements

1. **Semantic HTML**

```html
   <nav role="navigation">
   <main role="main">
   <article role="article">
   ```

1. **Keyboard Navigation**
   - All interactive elements focusable
   - Logical tab order
   - Visible focus indicators

2. **Color Contrast**
   - Text: 4.5:1 ratio minimum
   - Large text: 3:1 ratio minimum
   - Test with tools like WebAIM

3. **ARIA Labels**

```html
   <button aria-label="Close dialog">×</button>
   <img src="logo.png" alt="Company logo">
   ```

### Testing Accessibility

```bash
# Run Lighthouse accessibility audit
npm run build
# Open dist/index.html in Chrome DevTools > Lighthouse
```

---

## Pull Request Process

### 1. Prepare Your PR

- Run all quality checks
- Update documentation
- Write clear PR description
- Complete PR template checklist

### 2. Submit PR

- Use descriptive title
- Reference related issues
- Add screenshots for UI changes
- Request reviewers

### 3. Address Feedback

- Make requested changes
- Push updates to same branch
- Re-request review
- Resolve conversations

### 4. Merge

Once approved and CI passes:

- Maintainer will merge
- PR branch will be deleted
- Changes deployed automatically (if main branch)

---

## Community Guidelines

### Code of Conduct

- Be respectful and professional
- Welcome newcomers
- Provide constructive feedback
- No harassment or discrimination
- Assume good intentions

### Getting Help

- **Questions:** Open a discussion
- **Bugs:** Create an issue
- **Features:** Propose in discussions first
- **Urgent:** Contact maintainers directly

### Recognition

Contributors are recognized in:

- Release notes
- README contributors section
- Project documentation

---

## Quick Reference

### Common Commands

```bash
# Development
npm start              # Start dev server
npm run dev           # Alternative dev server
npm run watch         # Watch mode for webpack

# Quality Checks
npm run lint          # Check code quality
npm run lint:fix      # Auto-fix issues
npm run format        # Format code
npm run format:check  # Check formatting

# Testing
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report

# Build
npm run build         # Production build
npm run clean         # Clean build artifacts
```

### Key Files

- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `jest.config.js` - Jest configuration
- `webpack.config.js` - Build configuration
- `CODE_REVIEW_CHECKLIST.md` - Review guidelines
- `.github/workflows/ci.yml` - CI/CD pipeline

---

## Additional Resources

- [Code Review Checklist](CODE_REVIEW_CHECKLIST.md)
- [Setup Guide](SETUP_GUIDE.md)
- [Quick Start](QUICK_START.md)
- [Cache Clearing Instructions](CACHE_CLEAR_INSTRUCTIONS.md)

---

## Questions?

If you have questions or need help:

1. Check existing documentation
2. Search existing issues/discussions
3. Open a new discussion
4. Contact maintainers

Thank you for contributing! 🎉
