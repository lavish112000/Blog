module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        // Code Quality Rules
        'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-duplicate-imports': 'error',
        'no-var': 'error',
        'prefer-const': 'error',
        
        // Code Style Rules
        'indent': ['error', 4],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'comma-dangle': ['error', 'never'],
        'brace-style': ['error', '1tbs'],
        'camelcase': 'error',
        
        // Best Practices
        'eqeqeq': 'error',
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-throw-literal': 'error',
        'prefer-promise-reject-errors': 'error',
        
        // Security Rules
        'no-script-url': 'error',
        'no-alert': 'warn',
        
        // Performance Rules
        'no-loop-func': 'error'
    },
    globals: {
        'ModernBlog': 'readonly',
        'BlogManager': 'readonly',
        'ComponentsManager': 'readonly'
    }
};