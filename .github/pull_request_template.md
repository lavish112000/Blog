# Pull Request

## Description

<!-- Provide a clear and concise description of your changes -->

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 Style/UI update (formatting, styling, etc.)
- [ ] ♻️ Code refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test update
- [ ] 🔧 Configuration change
- [ ] 🔒 Security fix

## Related Issue

<!-- Link to the issue this PR addresses -->
Closes #(issue number)

## Changes Made

<!-- List the specific changes made in this PR -->

-
-
-

## Testing Performed

<!-- Describe the testing you performed -->

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Tested in multiple browsers
- [ ] Tested on mobile devices
- [ ] Accessibility testing performed

**Test results:**

```markdown
# Paste test output here
```

## Screenshots/Videos

<!-- If applicable, add screenshots or videos to demonstrate the changes -->

| Before | After |
|--------|-------|
|        |       |

## 10-Point Code Review Checklist

Review the [CODE_REVIEW_CHECKLIST.md](../CODE_REVIEW_CHECKLIST.md) and confirm:

### 1. Code Quality & Standards

- [ ] Code follows project coding standards
- [ ] ESLint passes (`npm run lint`)
- [ ] Prettier formatting applied (`npm run format:check`)

### 2. Functionality & Logic

- [ ] Code accomplishes intended purpose
- [ ] Edge cases handled
- [ ] Error handling implemented

### 3. Testing & Coverage

- [ ] All tests pass (`npm test`)
- [ ] New tests added for new functionality
- [ ] Coverage threshold met (50%+)

### 4. Security

- [ ] No hardcoded secrets or credentials
- [ ] Input validation implemented
- [ ] Security audit passes (`npm audit`)

### 5. Performance

- [ ] No performance regressions
- [ ] Optimized for production
- [ ] Bundle size checked

### 6. Documentation

- [ ] Code is well-documented
- [ ] README updated if needed
- [ ] Breaking changes documented

### 7. Maintainability

- [ ] Code is clean and maintainable
- [ ] Proper separation of concerns
- [ ] Dependencies are necessary and up-to-date

### 8. Accessibility

- [ ] Semantic HTML used
- [ ] Keyboard navigation works
- [ ] ARIA labels where needed

### 9. Browser Compatibility

- [ ] Tested in modern browsers
- [ ] Responsive design works
- [ ] Mobile-friendly

### 10. Version Control & Process

- [ ] Clear commit messages
- [ ] Branch up to date with base
- [ ] CI/CD pipeline passes

## Deployment Notes

<!-- Any special deployment considerations or steps -->

## Rollback Plan

<!-- How to rollback if issues are found after deployment -->

## Additional Notes

<!-- Any additional context, concerns, or information for reviewers -->

---

## Reviewer Checklist

**For Reviewers:**

- [ ] Code reviewed against all 10 checklist items
- [ ] Tested locally (if applicable)
- [ ] No security concerns identified
- [ ] Performance impact is acceptable
- [ ] Documentation is adequate
- [ ] All automated checks pass

**Review Priority:**

- 🔴 Critical issues must be fixed before merge
- 🟡 Important issues should be addressed
- 🟢 Minor suggestions are optional

---

## Pre-Merge Checklist

Before merging this PR:

- [ ] All review comments addressed
- [ ] CI/CD pipeline passes
- [ ] At least one approval from maintainer
- [ ] Branch is up to date with base
- [ ] Documentation updated
- [ ] No merge conflicts

---

**By submitting this PR, I confirm that:**

- I have read and followed the [CODE_REVIEW_CHECKLIST.md](../CODE_REVIEW_CHECKLIST.md)
- I have tested my changes locally
- My code follows the project's coding standards
- I have added appropriate tests for my changes
