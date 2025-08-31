#!/bin/bash

# 🔒 Security Review Script
# This script performs basic security checks on the codebase

echo "🔒 Starting Security Review..."
echo "==============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

SECURITY_ISSUES=0

# 1. Check for hardcoded secrets
print_status "1. Checking for hardcoded secrets..."

SECRET_PATTERNS=(
    "password\s*[:=]\s*['\"][^'\"]*['\"]"
    "api[_-]?key\s*[:=]\s*['\"][^'\"]*['\"]"
    "secret\s*[:=]\s*['\"][^'\"]*['\"]"
    "token\s*[:=]\s*['\"][^'\"]*['\"]"
    "auth[_-]?key\s*[:=]\s*['\"][^'\"]*['\"]"
)

for pattern in "${SECRET_PATTERNS[@]}"; do
    MATCHES=$(grep -r -i -E "$pattern" src/ 2>/dev/null || true)
    if [ ! -z "$MATCHES" ]; then
        print_error "Potential hardcoded secrets found:"
        echo "$MATCHES"
        SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
    fi
done

if [ $SECURITY_ISSUES -eq 0 ]; then
    print_success "No hardcoded secrets detected"
fi

echo ""

# 2. Check for XSS vulnerabilities
print_status "2. Checking for XSS vulnerabilities..."

XSS_PATTERNS=(
    "innerHTML\s*=\s*[^;]*\+"
    "outerHTML\s*=\s*[^;]*\+"
    "document\.write\s*\("
    "\.html\s*\([^)]*\+[^)]*\)"
)

XSS_ISSUES=0
for pattern in "${XSS_PATTERNS[@]}"; do
    MATCHES=$(grep -r -E "$pattern" src/js/ 2>/dev/null || true)
    if [ ! -z "$MATCHES" ]; then
        print_warning "Potential XSS vulnerability:"
        echo "$MATCHES"
        XSS_ISSUES=$((XSS_ISSUES + 1))
    fi
done

if [ $XSS_ISSUES -eq 0 ]; then
    print_success "No obvious XSS vulnerabilities found"
fi

echo ""

# 3. Check for eval usage
print_status "3. Checking for dangerous eval usage..."

EVAL_MATCHES=$(grep -r "eval\s*(" src/js/ 2>/dev/null || true)
if [ ! -z "$EVAL_MATCHES" ]; then
    print_error "Dangerous eval() usage found:"
    echo "$EVAL_MATCHES"
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
else
    print_success "No eval() usage found"
fi

echo ""

# 4. Check for unsafe DOM manipulation
print_status "4. Checking for unsafe DOM manipulation..."

UNSAFE_DOM=(
    "\.insertAdjacentHTML\s*\([^)]*\+[^)]*\)"
    "\.appendChild\s*\(\s*document\.createElement\s*\(\s*[^)]*\+[^)]*\)\s*\)"
)

DOM_ISSUES=0
for pattern in "${UNSAFE_DOM[@]}"; do
    MATCHES=$(grep -r -E "$pattern" src/js/ 2>/dev/null || true)
    if [ ! -z "$MATCHES" ]; then
        print_warning "Potentially unsafe DOM manipulation:"
        echo "$MATCHES"
        DOM_ISSUES=$((DOM_ISSUES + 1))
    fi
done

if [ $DOM_ISSUES -eq 0 ]; then
    print_success "No unsafe DOM manipulation detected"
fi

echo ""

# 5. Check for HTTP links in production
print_status "5. Checking for insecure HTTP links..."

HTTP_LINKS=$(grep -r "http://" src/ 2>/dev/null | grep -v "localhost\|127.0.0.1" || true)
if [ ! -z "$HTTP_LINKS" ]; then
    print_warning "Insecure HTTP links found (should use HTTPS):"
    echo "$HTTP_LINKS"
else
    print_success "No insecure HTTP links found"
fi

echo ""

# 6. Check for console.log in production
print_status "6. Checking for console statements..."

CONSOLE_STATEMENTS=$(grep -r "console\." src/js/ 2>/dev/null || true)
if [ ! -z "$CONSOLE_STATEMENTS" ]; then
    print_warning "Console statements found (may leak sensitive info):"
    echo "$CONSOLE_STATEMENTS" | head -10
    if [ $(echo "$CONSOLE_STATEMENTS" | wc -l) -gt 10 ]; then
        echo "... and $(($(echo "$CONSOLE_STATEMENTS" | wc -l) - 10)) more"
    fi
else
    print_success "No console statements found"
fi

echo ""

# 7. Check for localStorage/sessionStorage security
print_status "7. Checking localStorage/sessionStorage usage..."

STORAGE_USAGE=$(grep -r "localStorage\|sessionStorage" src/js/ 2>/dev/null || true)
if [ ! -z "$STORAGE_USAGE" ]; then
    print_status "Storage usage found (review for sensitive data):"
    echo "$STORAGE_USAGE"
    print_warning "Ensure no sensitive data is stored in browser storage"
else
    print_success "No browser storage usage found"
fi

echo ""

# 8. Check dependencies for vulnerabilities
print_status "8. Checking dependencies for vulnerabilities..."

if command -v npm >/dev/null 2>&1; then
    if npm audit --audit-level=moderate > /dev/null 2>&1; then
        print_success "No known vulnerabilities in dependencies"
    else
        print_error "Vulnerabilities found in dependencies:"
        npm audit --audit-level=moderate
        SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
    fi
else
    print_warning "npm not available, skipping dependency check"
fi

echo ""

# 9. Check for CORS configuration
print_status "9. Checking for CORS configuration..."

CORS_CONFIG=$(grep -r -i "cors\|access-control-allow" src/ 2>/dev/null || true)
if [ ! -z "$CORS_CONFIG" ]; then
    print_status "CORS configuration found:"
    echo "$CORS_CONFIG"
    print_warning "Review CORS settings for security"
else
    print_status "No CORS configuration found in source files"
fi

echo ""

# 10. Check file permissions
print_status "10. Checking file permissions..."

EXECUTABLE_FILES=$(find src/ -type f -executable 2>/dev/null || true)
if [ ! -z "$EXECUTABLE_FILES" ]; then
    print_warning "Executable files found in src/:"
    echo "$EXECUTABLE_FILES"
else
    print_success "No executable files in source directory"
fi

echo ""

# Summary
echo "==============================="
print_status "Security Review Summary"
echo ""

if [ $SECURITY_ISSUES -eq 0 ]; then
    print_success "No critical security issues found!"
else
    print_error "$SECURITY_ISSUES critical security issues detected"
    echo ""
    print_status "Recommended actions:"
    echo "  1. Review and fix all critical issues above"
    echo "  2. Run 'npm audit fix' for dependency issues"
    echo "  3. Implement input validation and output escaping"
    echo "  4. Use HTTPS for all external resources"
    echo "  5. Remove console.log statements from production code"
fi

echo ""
print_status "Security best practices:"
echo "  ✅ Use Content Security Policy (CSP) headers"
echo "  ✅ Implement proper input validation"
echo "  ✅ Use HTTPS for all communications"
echo "  ✅ Regularly update dependencies"
echo "  ✅ Sanitize user input before DOM insertion"
echo "  ✅ Avoid storing sensitive data in browser storage"

exit $SECURITY_ISSUES