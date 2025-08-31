#!/bin/bash

# 🔍 Automated Code Review Script
# This script runs automated checks for code review

set -e

echo "🔍 Starting Automated Code Review..."
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Checking project dependencies..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
fi

# 1. Code Formatting Check
print_status "1. Checking code formatting..."
if npm run format:check; then
    print_success "Code formatting is correct"
else
    print_warning "Code formatting issues found. Run 'npm run format' to fix."
fi

echo ""

# 2. Linting Check
print_status "2. Running ESLint..."
if npm run lint; then
    print_success "No linting errors found"
else
    print_warning "Linting errors found. Run 'npm run lint:fix' to auto-fix some issues."
fi

echo ""

# 3. Security Audit
print_status "3. Running security audit..."
if npm audit --audit-level=moderate; then
    print_success "No security vulnerabilities found"
else
    print_warning "Security vulnerabilities detected. Review and update dependencies."
fi

echo ""

# 4. Bundle Size Check (if build exists)
print_status "4. Checking bundle size..."
if npm run build 2>/dev/null; then
    if [ -d "dist" ]; then
        BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
        print_status "Bundle size: $BUNDLE_SIZE"
        
        # Warning if bundle is too large (>5MB)
        BUNDLE_KB=$(du -sk dist/ | cut -f1)
        if [ "$BUNDLE_KB" -gt 5120 ]; then
            print_warning "Bundle size is quite large (>5MB). Consider optimization."
        else
            print_success "Bundle size is reasonable"
        fi
    fi
else
    print_warning "Build failed or no build script available"
fi

echo ""

# 5. File Structure Analysis
print_status "5. Analyzing file structure..."

# Check for large files
LARGE_FILES=$(find src/ -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -size +100k 2>/dev/null || true)
if [ ! -z "$LARGE_FILES" ]; then
    print_warning "Large files detected (>100KB):"
    echo "$LARGE_FILES"
else
    print_success "No unusually large files found"
fi

# Check for duplicate files
print_status "Checking for potential duplicate files..."
DUPLICATE_JS=$(find src/js/ -name "*.js" -exec basename {} \; | sort | uniq -d)
if [ ! -z "$DUPLICATE_JS" ]; then
    print_warning "Potential duplicate JavaScript files found:"
    echo "$DUPLICATE_JS"
else
    print_success "No duplicate JavaScript files found"
fi

echo ""

# 6. Accessibility Quick Check
print_status "6. Basic accessibility checks..."

# Check for alt attributes in HTML files
HTML_FILES=$(find src/ -name "*.html")
MISSING_ALT=0

for file in $HTML_FILES; do
    if grep -q "<img" "$file"; then
        if ! grep -q "alt=" "$file"; then
            print_warning "Images without alt attributes found in: $file"
            MISSING_ALT=1
        fi
    fi
done

if [ $MISSING_ALT -eq 0 ]; then
    print_success "Basic accessibility checks passed"
fi

echo ""

# 7. Performance Checks
print_status "7. Performance analysis..."

# Check for console.log statements
CONSOLE_LOGS=$(grep -r "console\." src/js/ 2>/dev/null | wc -l)
if [ "$CONSOLE_LOGS" -gt 0 ]; then
    print_warning "Found $CONSOLE_LOGS console statements in JavaScript files"
else
    print_success "No console statements found in production code"
fi

# Check for inline styles
INLINE_STYLES=$(grep -r "style=" src/ 2>/dev/null | wc -l)
if [ "$INLINE_STYLES" -gt 0 ]; then
    print_warning "Found $INLINE_STYLES inline styles. Consider moving to CSS files."
else
    print_success "No inline styles found"
fi

echo ""

# 8. Code Quality Metrics
print_status "8. Code quality metrics..."

# Count lines of code
JS_LINES=$(find src/js/ -name "*.js" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
CSS_LINES=$(find src/css/ -name "*.css" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
HTML_LINES=$(find src/ -name "*.html" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")

print_status "Code statistics:"
echo "  JavaScript: $JS_LINES lines"
echo "  CSS: $CSS_LINES lines"
echo "  HTML: $HTML_LINES lines"

# Calculate complexity (rough estimate based on function count)
FUNCTIONS=$(grep -r "function\|=>" src/js/ 2>/dev/null | wc -l)
print_status "Estimated complexity: $FUNCTIONS functions"

echo ""

# Summary
echo "======================================="
print_status "Code Review Summary Complete"
echo ""
print_status "Next steps:"
echo "  1. Address any warnings or errors above"
echo "  2. Run manual testing checklist"
echo "  3. Update documentation if needed"
echo "  4. Request peer review"
echo ""
print_success "Automated code review completed!"