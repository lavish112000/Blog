# Security Guidelines

This document outlines security best practices and requirements for the Modern Blog Website project.

## Table of Contents

- [Security Policy](#security-policy)
- [Secure Development Practices](#secure-development-practices)
- [Vulnerability Management](#vulnerability-management)
- [Security Testing](#security-testing)
- [Incident Response](#incident-response)

---

## Security Policy

### Reporting Security Vulnerabilities

**IMPORTANT:** Please do not report security vulnerabilities through public GitHub issues.

If you discover a security vulnerability:

1. Email the maintainers directly at [security contact]
2. Include detailed steps to reproduce
3. Provide severity assessment if possible
4. Allow reasonable time for fix before disclosure

### Security Response Timeline

- **Critical:** 24 hours
- **High:** 72 hours
- **Medium:** 7 days
- **Low:** 30 days

---

## Secure Development Practices

### 1. Authentication & Authorization

```javascript
// ✅ Good - Validate user permissions
function deletePost(postId, userId) {
  const post = getPost(postId);
  if (post.authorId !== userId) {
    throw new Error('Unauthorized');
  }
  // Delete logic
}

// ❌ Bad - No authorization check
function deletePost(postId) {
  // Direct delete without checking ownership
}
```

### 2. Input Validation

**Always validate and sanitize user inputs:**

```javascript
// ✅ Good - Input validation
function createComment(content) {
  if (!content || typeof content !== 'string') {
    throw new Error('Invalid input');
  }
  
  const sanitized = content
    .trim()
    .substring(0, 1000) // Max length
    .replace(/[<>]/g, ''); // Basic XSS prevention
    
  return sanitized;
}

// ❌ Bad - Direct use without validation
function createComment(content) {
  return content; // Vulnerable to XSS
}
```

### 3. Output Encoding

**Prevent XSS by encoding output:**

```javascript
// ✅ Good - Encode output
function displayComment(comment) {
  const div = document.createElement('div');
  div.textContent = comment; // Automatic encoding
  return div;
}

// ❌ Bad - Raw HTML injection
function displayComment(comment) {
  document.innerHTML = comment; // XSS vulnerability
}
```

### 4. Secure Data Storage

```javascript
// ✅ Good - No sensitive data in localStorage
const userPrefs = {
  theme: 'dark',
  language: 'en'
};
localStorage.setItem('prefs', JSON.stringify(userPrefs));

// ❌ Bad - Storing sensitive data
localStorage.setItem('apiKey', userApiKey); // Never do this
```

### 5. API Security

```javascript
// ✅ Good - HTTPS only
const API_BASE = 'https://api.example.com';

// Add CSRF token for state-changing operations
fetch(`${API_BASE}/posts`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': getCsrfToken()
  },
  body: JSON.stringify(data)
});

// ❌ Bad - HTTP endpoint
const API_BASE = 'http://api.example.com';
```

### 6. Error Handling

```javascript
// ✅ Good - Generic error messages
try {
  await authenticateUser(username, password);
} catch (error) {
  console.error('Authentication failed'); // Log details internally
  throw new Error('Invalid credentials'); // Generic user message
}

// ❌ Bad - Exposing internal details
try {
  await authenticateUser(username, password);
} catch (error) {
  throw new Error(`Database error: ${error.message}`); // Exposes internals
}
```

### 7. Dependency Security

```javascript
// ✅ Good - Regular updates and audits
// Run regularly:
npm audit
npm audit fix
npm outdated

// Review and update dependencies
npm update

// Use exact versions for critical deps
"dependencies": {
  "critical-lib": "1.2.3" // Exact version
}
```

---

## Vulnerability Management

### Automated Scanning

Our CI/CD pipeline automatically checks for vulnerabilities:

```yaml
# .github/workflows/ci.yml
- name: Security audit
  run: npm audit --audit-level=moderate
```

### Dependency Updates

**Weekly Schedule:**

1. Review `npm audit` output
2. Check for outdated packages: `npm outdated`
3. Update non-breaking changes: `npm update`
4. Test thoroughly before merging
5. Review breaking changes carefully

### Vulnerability Database

We monitor:

- **npm audit** - JavaScript vulnerabilities
- **GitHub Security Advisories** - Repository alerts
- **Snyk** - Continuous monitoring (if configured)
- **OWASP Top 10** - Web application risks

---

## Security Testing

### Pre-commit Checks

Automated by Husky:

```bash
# Runs on every commit
npm run lint
npm run test
```

### Security Checklist

Before every PR:

- [ ] No hardcoded secrets or credentials
- [ ] All user inputs validated and sanitized
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] CSRF protection in place
- [ ] Secure communication (HTTPS)
- [ ] Error messages don't expose internals
- [ ] Dependencies are up to date
- [ ] `npm audit` shows no high/critical issues

### Manual Security Testing

**Test for common vulnerabilities:**

1. **XSS Testing**

   ```javascript
   // Try injecting:
   <script>alert('XSS')</script>
   <img src=x onerror=alert('XSS')>
   ```

2. **Input Validation**

   ```javascript
   // Test with:
   - Empty strings
   - Null/undefined
   - Very long strings (>10000 chars)
   - Special characters: <>&"'
   - SQL injection patterns
   ```

3. **Authentication**

   ```javascript
   // Verify:
   - Session timeout works
   - Logout clears all tokens
   - Cannot access protected resources
   ```

---

## Security Best Practices

### 1. Never Commit Secrets

```bash
# Add to .gitignore
.env
.env.local
.env.*.local
secrets/
*.key
*.pem
```

**Use environment variables:**

```javascript
// ✅ Good
const API_KEY = process.env.API_KEY;

// ❌ Bad
const API_KEY = 'sk_live_abc123...';
```

### 2. Content Security Policy

```html
<!-- Add to HTML head -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';">
```

### 3. CORS Configuration

```javascript
// Server-side (if applicable)
res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

### 4. Rate Limiting

```javascript
// Implement client-side rate limiting
const rateLimiter = {
  requests: new Map(),
  
  canMakeRequest(endpoint, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const requests = this.requests.get(endpoint) || [];
    
    // Remove old requests
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(endpoint, recentRequests);
    return true;
  }
};
```

### 5. Secure Headers

```javascript
// Server configuration (if applicable)
headers: {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
}
```

---

## Common Vulnerabilities to Avoid

### 1. Cross-Site Scripting (XSS)

**Vulnerable:**

```javascript
// ❌ Never do this
element.innerHTML = userInput;
```

**Secure:**

```javascript
// ✅ Do this instead
element.textContent = userInput;
// or
element.innerText = sanitize(userInput);
```

### 2. SQL Injection

**Vulnerable:**

```javascript
// ❌ Never do this (if using SQL)
const query = `SELECT * FROM posts WHERE id = ${userId}`;
```

**Secure:**

```javascript
// ✅ Use parameterized queries
const query = 'SELECT * FROM posts WHERE id = ?';
db.execute(query, [userId]);
```

### 3. CSRF (Cross-Site Request Forgery)

**Secure:**

```javascript
// Include CSRF token in forms
<input type="hidden" name="csrf_token" value="${csrfToken}">

// Validate on server
if (req.body.csrf_token !== req.session.csrf_token) {
  throw new Error('Invalid CSRF token');
}
```

### 4. Insecure Direct Object References

**Vulnerable:**

```javascript
// ❌ Direct access without authorization
function getPost(postId) {
  return database.posts.get(postId);
}
```

**Secure:**

```javascript
// ✅ Check authorization
function getPost(postId, userId) {
  const post = database.posts.get(postId);
  if (post.isPrivate && post.authorId !== userId) {
    throw new Error('Unauthorized');
  }
  return post;
}
```

---

## Incident Response

### If a Security Issue is Found

1. **Immediate Actions:**
   - Assess severity
   - Document the issue
   - Notify maintainers
   - Do not disclose publicly

2. **Fix Development:**
   - Create private branch
   - Develop and test fix
   - Review thoroughly
   - Prepare security advisory

3. **Deployment:**
   - Deploy fix immediately
   - Monitor for issues
   - Verify fix is effective

4. **Post-Incident:**
   - Document lessons learned
   - Update security practices
   - Notify affected users if needed
   - Publish security advisory

### Security Contacts

For security issues:

- GitHub Security Advisories: Enable in repository settings
- Direct contact: [maintainer email]
- Response time: 24 hours for critical issues

---

## Security Resources

### Tools

- **npm audit** - Vulnerability scanning
- **ESLint security plugin** - Code analysis
- **OWASP ZAP** - Web app security testing
- **Lighthouse** - Security audit in Chrome DevTools

### References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

---

## Compliance

### Data Protection

- No personal data stored without consent
- Clear privacy policy
- Data minimization principle
- Secure data transmission (HTTPS)

### Regular Audits

**Monthly:**

- Review npm audit output
- Check for outdated dependencies
- Review security logs

**Quarterly:**

- Full security review
- Update dependencies
- Review and update this document

---

## Questions?

For security-related questions:

1. Review this document
2. Check OWASP guidelines
3. Consult with security team
4. Contact maintainers

**Remember:** Security is everyone's responsibility. When in doubt, ask!
