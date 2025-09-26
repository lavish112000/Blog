/**
 * Enterprise Theme Manager
 * Advanced theming system with multiple themes, customization, and user preferences
 */

class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                name: 'Light',
                colors: {
                    primary: '#667eea',
                    secondary: '#764ba2',
                    accent: '#f093fb',
                    background: '#ffffff',
                    surface: '#f8fafc',
                    text: '#1a202c',
                    textSecondary: '#4a5568',
                    border: '#e2e8f0',
                    success: '#48bb78',
                    warning: '#ed8936',
                    error: '#f56565',
                    info: '#4299e1'
                },
                shadows: {
                    small: '0 1px 3px rgba(0, 0, 0, 0.12)',
                    medium: '0 4px 6px rgba(0, 0, 0, 0.07)',
                    large: '0 10px 15px rgba(0, 0, 0, 0.1)',
                    xl: '0 20px 25px rgba(0, 0, 0, 0.15)'
                }
            },
            dark: {
                name: 'Dark',
                colors: {
                    primary: '#667eea',
                    secondary: '#764ba2',
                    accent: '#f093fb',
                    background: '#1a202c',
                    surface: '#2d3748',
                    text: '#f7fafc',
                    textSecondary: '#cbd5e0',
                    border: '#4a5568',
                    success: '#68d391',
                    warning: '#fbb360',
                    error: '#fc8181',
                    info: '#63b3ed'
                },
                shadows: {
                    small: '0 1px 3px rgba(0, 0, 0, 0.3)',
                    medium: '0 4px 6px rgba(0, 0, 0, 0.25)',
                    large: '0 10px 15px rgba(0, 0, 0, 0.4)',
                    xl: '0 20px 25px rgba(0, 0, 0, 0.5)'
                }
            },
            sepia: {
                name: 'Sepia',
                colors: {
                    primary: '#8b4513',
                    secondary: '#a0522d',
                    accent: '#daa520',
                    background: '#fdf6e3',
                    surface: '#eee8d5',
                    text: '#073642',
                    textSecondary: '#586e75',
                    border: '#93a1a1',
                    success: '#859900',
                    warning: '#b58900',
                    error: '#dc322f',
                    info: '#268bd2'
                },
                shadows: {
                    small: '0 1px 3px rgba(101, 123, 131, 0.12)',
                    medium: '0 4px 6px rgba(101, 123, 131, 0.07)',
                    large: '0 10px 15px rgba(101, 123, 131, 0.1)',
                    xl: '0 20px 25px rgba(101, 123, 131, 0.15)'
                }
            },
            highContrast: {
                name: 'High Contrast',
                colors: {
                    primary: '#0000ff',
                    secondary: '#800080',
                    accent: '#ff00ff',
                    background: '#ffffff',
                    surface: '#f0f0f0',
                    text: '#000000',
                    textSecondary: '#333333',
                    border: '#000000',
                    success: '#008000',
                    warning: '#ff8c00',
                    error: '#ff0000',
                    info: '#0000ff'
                },
                shadows: {
                    small: '0 1px 3px rgba(0, 0, 0, 0.5)',
                    medium: '0 4px 6px rgba(0, 0, 0, 0.4)',
                    large: '0 10px 15px rgba(0, 0, 0, 0.6)',
                    xl: '0 20px 25px rgba(0, 0, 0, 0.7)'
                }
            },
            cyberpunk: {
                name: 'Cyberpunk',
                colors: {
                    primary: '#00ffff',
                    secondary: '#ff0080',
                    accent: '#ffff00',
                    background: '#0a0a0a',
                    surface: '#1a1a2e',
                    text: '#00ff00',
                    textSecondary: '#00cccc',
                    border: '#ff0080',
                    success: '#00ff00',
                    warning: '#ffff00',
                    error: '#ff0040',
                    info: '#00ffff'
                },
                shadows: {
                    small: '0 1px 3px rgba(0, 255, 255, 0.3)',
                    medium: '0 4px 6px rgba(255, 0, 128, 0.25)',
                    large: '0 10px 15px rgba(0, 255, 0, 0.2)',
                    xl: '0 20px 25px rgba(255, 255, 0, 0.15)'
                }
            }
        };

        this.currentTheme = 'auto';
        this.customThemes = {};
        this.preferences = {
            autoDetect: true,
            followSystem: true,
            transitionDuration: 300,
            enableAnimations: true,
            colorScheme: 'auto'
        };

        this.init();
    }

    init() {
        this.loadPreferences();
        this.detectSystemPreference();
        this.applyTheme(this.currentTheme);
        this.setupSystemListener();
        this.setupThemeToggle();
        this.createThemeStylesheet();
        
        // Theme Manager initialized successfully
    }

    loadPreferences() {
        const stored = localStorage.getItem('themePreferences');
        if (stored) {
            this.preferences = { ...this.preferences, ...JSON.parse(stored) };
        }

        const currentTheme = localStorage.getItem('currentTheme');
        if (currentTheme) {
            this.currentTheme = currentTheme;
        }

        const customThemes = localStorage.getItem('customThemes');
        if (customThemes) {
            this.customThemes = JSON.parse(customThemes);
        }
    }

    savePreferences() {
        localStorage.setItem('themePreferences', JSON.stringify(this.preferences));
        localStorage.setItem('currentTheme', this.currentTheme);
        localStorage.setItem('customThemes', JSON.stringify(this.customThemes));
    }

    detectSystemPreference() {
        if (!window.matchMedia) return 'light';

        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        
        return 'light';
    }

    setupSystemListener() {
        if (!window.matchMedia) return;

        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addEventListener('change', (_e) => {
            if (this.preferences.followSystem && this.currentTheme === 'auto') {
                this.applyTheme('auto');
                this.announceThemeChange('auto');
            }
        });

        const contrastQuery = window.matchMedia('(prefers-contrast: high)');
        contrastQuery.addEventListener('change', (e) => {
            if (e.matches && this.preferences.autoDetect) {
                this.applyTheme('highContrast');
                this.announceThemeChange('highContrast');
            }
        });
    }

    setupThemeToggle() {
        // Setup theme toggle buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.theme-toggle, [data-theme-toggle]')) {
                this.cycleTheme();
            }

            if (e.target.matches('[data-theme]')) {
                const theme = e.target.getAttribute('data-theme');
                this.setTheme(theme);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.cycleTheme();
            }
        });
    }

    createThemeStylesheet() {
        if (!document.getElementById('theme-styles')) {
            const stylesheet = document.createElement('style');
            stylesheet.id = 'theme-styles';
            document.head.appendChild(stylesheet);
        }
    }

    applyTheme(themeName) {
        let theme;
        
        if (themeName === 'auto') {
            const systemPreference = this.detectSystemPreference();
            theme = this.themes[systemPreference];
            themeName = systemPreference;
        } else if (this.themes[themeName]) {
            theme = this.themes[themeName];
        } else if (this.customThemes[themeName]) {
            theme = this.customThemes[themeName];
        } else {
            theme = this.themes.light;
            themeName = 'light';
        }

        this.currentTheme = themeName;
        
        // Apply CSS custom properties
        this.setCSSVariables(theme);
        
        // Update document attributes
        document.documentElement.setAttribute('data-theme', themeName);
        document.documentElement.setAttribute('data-color-scheme', this.getColorScheme(theme));
        
        // Update meta theme-color
        this.updateMetaThemeColor(theme.colors.primary);
        
        // Update theme indicators
        this.updateThemeIndicators(themeName);
        
        // Trigger theme change event
        this.dispatchThemeChangeEvent(themeName, theme);
        
        // Save preference
        this.savePreferences();
        
        // Theme applied successfully: ${theme.name}
    }

    setCSSVariables(theme) {
        const root = document.documentElement;
        
        // Set color variables
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${this.kebabCase(key)}`, value);
        });
        
        // Set shadow variables
        Object.entries(theme.shadows).forEach(([key, value]) => {
            root.style.setProperty(`--shadow-${key}`, value);
        });
        
        // Generate additional color variants
        this.generateColorVariants(theme.colors);
        
        // Apply transition duration
        root.style.setProperty('--theme-transition-duration', `${this.preferences.transitionDuration}ms`);
    }

    generateColorVariants(colors) {
        const root = document.documentElement;
        
        Object.entries(colors).forEach(([key, color]) => {
            if (color.startsWith('#')) {
                const rgb = this.hexToRgb(color);
                if (rgb) {
                    // RGB values
                    root.style.setProperty(`--color-${this.kebabCase(key)}-rgb`, `${rgb.r}, ${rgb.g}, ${rgb.b}`);
                    
                    // Alpha variants
                    root.style.setProperty(`--color-${this.kebabCase(key)}-10`, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
                    root.style.setProperty(`--color-${this.kebabCase(key)}-20`, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`);
                    root.style.setProperty(`--color-${this.kebabCase(key)}-50`, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`);
                    root.style.setProperty(`--color-${this.kebabCase(key)}-80`, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
                    
                    // Lighter/darker variants
                    root.style.setProperty(`--color-${this.kebabCase(key)}-light`, this.lightenColor(color, 20));
                    root.style.setProperty(`--color-${this.kebabCase(key)}-dark`, this.darkenColor(color, 20));
                }
            }
        });
    }

    getColorScheme(theme) {
        // Determine if theme is light or dark for system integration
        const bgColor = theme.colors.background;
        const rgb = this.hexToRgb(bgColor);
        
        if (rgb) {
            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            return brightness > 128 ? 'light' : 'dark';
        }
        
        return 'light';
    }

    updateMetaThemeColor(color) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = color;
    }

    updateThemeIndicators(themeName) {
        // Update theme toggle buttons
        const toggles = document.querySelectorAll('.theme-toggle, [data-theme-toggle]');
        toggles.forEach(toggle => {
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.className = this.getThemeIcon(themeName);
            }
        });

        // Update theme selector
        const themeOptions = document.querySelectorAll('[data-theme]');
        themeOptions.forEach(option => {
            const optionTheme = option.getAttribute('data-theme');
            if (optionTheme === themeName) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    getThemeIcon(themeName) {
        const icons = {
            light: 'fas fa-sun',
            dark: 'fas fa-moon',
            sepia: 'fas fa-book',
            highContrast: 'fas fa-adjust',
            cyberpunk: 'fas fa-robot',
            auto: 'fas fa-magic'
        };
        
        return icons[themeName] || 'fas fa-palette';
    }

    dispatchThemeChangeEvent(themeName, theme) {
        const event = new CustomEvent('themechange', {
            detail: {
                theme: themeName,
                colors: theme.colors,
                shadows: theme.shadows
            }
        });
        
        document.dispatchEvent(event);
    }

    announceThemeChange(themeName) {
        const themeName_display = this.themes[themeName]?.name || 
                                   this.customThemes[themeName]?.name || 
                                   themeName;
        
        // Announce to screen readers
        if (window.AccessibilityManager) {
            window.AccessibilityManager.announce(`Theme changed to ${themeName_display}`, 'polite');
        }
    }

    cycleTheme() {
        const themeOrder = ['light', 'dark', 'sepia', 'auto'];
        const currentIndex = themeOrder.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeOrder.length;
        const nextTheme = themeOrder[nextIndex];
        
        this.setTheme(nextTheme);
        this.announceThemeChange(nextTheme);
    }

    setTheme(themeName) {
        if (themeName === this.currentTheme) return;
        
        // Add transition class for smooth theme changes
        if (this.preferences.enableAnimations) {
            document.documentElement.classList.add('theme-transitioning');
            
            setTimeout(() => {
                document.documentElement.classList.remove('theme-transitioning');
            }, this.preferences.transitionDuration);
        }
        
        this.applyTheme(themeName);
    }

    createCustomTheme(name, baseTheme, overrides = {}) {
        const base = this.themes[baseTheme] || this.themes.light;
        
        const customTheme = {
            name: name,
            colors: { ...base.colors, ...overrides.colors },
            shadows: { ...base.shadows, ...overrides.shadows }
        };
        
        this.customThemes[name] = customTheme;
        this.savePreferences();
        
        return customTheme;
    }

    deleteCustomTheme(name) {
        if (this.customThemes[name]) {
            delete this.customThemes[name];
            
            // Switch to default theme if currently using deleted theme
            if (this.currentTheme === name) {
                this.setTheme('light');
            }
            
            this.savePreferences();
            return true;
        }
        return false;
    }

    exportTheme(themeName) {
        const theme = this.themes[themeName] || this.customThemes[themeName];
        if (theme) {
            return JSON.stringify(theme, null, 2);
        }
        return null;
    }

    importTheme(themeData, name) {
        try {
            const theme = typeof themeData === 'string' ? JSON.parse(themeData) : themeData;
            
            if (theme.colors && theme.shadows) {
                theme.name = name || theme.name || 'Imported Theme';
                this.customThemes[name || 'imported'] = theme;
                this.savePreferences();
                return true;
            }
        } catch (error) {
            // Failed to import theme: handle error silently in production
            // Development note: Theme import failed
        }
        return false;
    }

    getAvailableThemes() {
        return {
            built_in: Object.keys(this.themes).map(key => ({
                id: key,
                name: this.themes[key].name,
                type: 'built-in'
            })),
            custom: Object.keys(this.customThemes).map(key => ({
                id: key,
                name: this.customThemes[key].name,
                type: 'custom'
            }))
        };
    }

    // Utility methods
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    lightenColor(hex, percent) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;
        
        const factor = percent / 100;
        const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor));
        const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor));
        const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor));
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    darkenColor(hex, percent) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;
        
        const factor = percent / 100;
        const r = Math.max(0, Math.round(rgb.r * (1 - factor)));
        const g = Math.max(0, Math.round(rgb.g * (1 - factor)));
        const b = Math.max(0, Math.round(rgb.b * (1 - factor)));
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    kebabCase(str) {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    }

    // Public API methods
    getCurrentTheme() {
        return {
            name: this.currentTheme,
            theme: this.themes[this.currentTheme] || this.customThemes[this.currentTheme]
        };
    }

    updatePreference(key, value) {
        this.preferences[key] = value;
        this.savePreferences();
        
        // Apply changes that require re-initialization
        if (key === 'followSystem') {
            this.setupSystemListener();
        }
    }

    getPreferences() {
        return { ...this.preferences };
    }

    resetToDefaults() {
        this.preferences = {
            autoDetect: true,
            followSystem: true,
            transitionDuration: 300,
            enableAnimations: true,
            colorScheme: 'auto'
        };
        
        this.setTheme('auto');
        this.savePreferences();
    }
}

// Export for use in other modules
export default ThemeManager;

// Auto-initialize if not imported as module
if (typeof module === 'undefined') {
    window.ThemeManager = ThemeManager;
}