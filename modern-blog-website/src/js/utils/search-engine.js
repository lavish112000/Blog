/**
 * Advanced Search Engine with AI-powered features
 */

export class SearchEngine {
    constructor() {
        this.index = new Map();
        this.searchHistory = [];
        this.searchSuggestions = [];
        this.isInitialized = false;
        this.fuse = null;
        
        this.initializeSearch();
    }

    async initializeSearch() {
        try {
            // Import Fuse.js for fuzzy searching
            const { default: Fuse } = await import('fuse.js');
            
            this.fuseOptions = {
                keys: [
                    { name: 'title', weight: 0.3 },
                    { name: 'content', weight: 0.2 },
                    { name: 'excerpt', weight: 0.2 },
                    { name: 'tags', weight: 0.2 },
                    { name: 'author', weight: 0.1 }
                ],
                includeScore: true,
                includeMatches: true,
                threshold: 0.3,
                minMatchCharLength: 2,
                ignoreLocation: true
            };

            // Load search data
            await this.loadSearchData();
            
            // Initialize Fuse search
            this.fuse = new Fuse(this.searchData, this.fuseOptions);
            
            // Setup search UI
            this.setupSearchUI();
            
            // Load search history
            this.loadSearchHistory();
            
            this.isInitialized = true;
            // Advanced search engine initialized successfully
            
        } catch (error) {
            // Failed to initialize search engine - using basic search fallback
            this.initBasicSearch();
        }
    }

    async loadSearchData() {
        try {
            // Load posts data
            const postsResponse = await fetch('./data/posts.json');
            const posts = await postsResponse.json();
            
            // Load additional content (pages, categories, etc.)
            const pages = [
                { title: 'About', content: 'About page content', type: 'page', url: '/pages/about.html' },
                { title: 'Contact', content: 'Contact page content', type: 'page', url: '/pages/contact.html' }
            ];
            
            // Combine all searchable content
            this.searchData = [
                ...posts.map(post => ({
                    ...post,
                    type: 'post',
                    url: `/blog.html?id=${post.id}`
                })),
                ...pages
            ];
            
        } catch (error) {
            // Failed to load search data - using empty dataset
            this.searchData = [];
        }
    }

    setupSearchUI() {
        const searchInput = document.getElementById('search-input');
        const searchSuggestions = document.getElementById('search-suggestions');
        
        if (!searchInput || !searchSuggestions) return;

        // Enhanced search input with debouncing
        searchInput.addEventListener('input', this.debounce((e) => {
            const query = e.target.value.trim();
            
            if (query.length >= 2) {
                this.performSearch(query);
            } else {
                this.clearSuggestions();
            }
        }, 300));

        // Keyboard navigation for search results
        searchInput.addEventListener('keydown', (e) => {
            this.handleSearchKeydown(e);
        });

        // Voice search support
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.setupVoiceSearch(searchInput);
        }

        // Search shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }
        });
    }

    setupVoiceSearch(searchInput) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        // Add voice search button
        const voiceButton = document.createElement('button');
        voiceButton.className = 'voice-search-btn';
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceButton.title = 'Voice Search';
        
        const searchContainer = searchInput.parentNode;
        searchContainer.appendChild(voiceButton);

        voiceButton.addEventListener('click', () => {
            recognition.start();
            voiceButton.classList.add('listening');
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript;
            searchInput.dispatchEvent(new Event('input'));
            voiceButton.classList.remove('listening');
        };

        recognition.onerror = () => {
            voiceButton.classList.remove('listening');
        };

        recognition.onend = () => {
            voiceButton.classList.remove('listening');
        };
    }

    performSearch(query) {
        if (!this.isInitialized || !this.fuse) {
            return this.basicSearch(query);
        }

        const results = this.fuse.search(query);
        
        // Track search query
        this.trackSearchQuery(query);
        
        // Process and rank results
        const processedResults = this.processSearchResults(results, query);
        
        // Display results
        this.displaySearchResults(processedResults, query);
        
        // Generate suggestions
        this.generateSearchSuggestions(query);
        
        return processedResults;
    }

    processSearchResults(results, query) {
        return results
            .map(result => ({
                ...result.item,
                score: result.score,
                matches: result.matches,
                relevanceScore: this.calculateRelevanceScore(result, query)
            }))
            .sort((a, b) => a.relevanceScore - b.relevanceScore)
            .slice(0, 10); // Limit to top 10 results
    }

    calculateRelevanceScore(result, query) {
        let score = result.score;
        
        // Boost exact matches
        if (result.item.title.toLowerCase().includes(query.toLowerCase())) {
            score *= 0.5;
        }
        
        // Boost recent content
        if (result.item.date) {
            const daysSincePublished = Math.floor(
                (Date.now() - new Date(result.item.date).getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysSincePublished < 30) {
                score *= 0.8;
            }
        }
        
        // Boost popular content
        if (result.item.views > 1000) {
            score *= 0.9;
        }
        
        return score;
    }

    displaySearchResults(results, query) {
        const suggestionsContainer = document.getElementById('search-suggestions');
        if (!suggestionsContainer) return;

        if (results.length === 0) {
            suggestionsContainer.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>Try different keywords or check the spelling</p>
                    <div class="search-suggestions-list">
                        <h4>Suggestions:</h4>
                        ${this.getSearchSuggestions(query).map(suggestion => 
                            `<button class="search-suggestion" data-query="${suggestion}">${suggestion}</button>`
                        ).join('')}
                    </div>
                </div>
            `;
        } else {
            suggestionsContainer.innerHTML = `
                <div class="search-results">
                    <div class="search-results-header">
                        <h3>Search Results (${results.length})</h3>
                        <span class="search-query">for "${query}"</span>
                    </div>
                    <div class="search-results-list">
                        ${results.map((result, index) => this.renderSearchResult(result, index)).join('')}
                    </div>
                </div>
            `;
        }

        // Add click handlers for suggestions
        suggestionsContainer.querySelectorAll('.search-suggestion').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const query = e.target.dataset.query;
                document.getElementById('search-input').value = query;
                this.performSearch(query);
            });
        });

        suggestionsContainer.classList.add('active');
    }

    renderSearchResult(result, index) {
        const highlightedTitle = this.highlightMatches(result.title, result.matches, 'title');
        const highlightedExcerpt = this.highlightMatches(
            result.excerpt || result.content?.substring(0, 150) + '...',
            result.matches,
            'content'
        );

        return `
            <div class="search-result" data-index="${index}">
                <div class="search-result-content">
                    <h4 class="search-result-title">
                        <a href="${result.url || '#'}">${highlightedTitle}</a>
                    </h4>
                    <p class="search-result-excerpt">${highlightedExcerpt}</p>
                    <div class="search-result-meta">
                        <span class="search-result-type">${result.type}</span>
                        ${result.author ? `<span class="search-result-author">by ${result.author}</span>` : ''}
                        ${result.date ? `<span class="search-result-date">${this.formatDate(result.date)}</span>` : ''}
                        <span class="search-result-relevance">${Math.round((1 - result.score) * 100)}% match</span>
                    </div>
                    ${result.tags ? `
                        <div class="search-result-tags">
                            ${result.tags.slice(0, 3).map(tag => 
                                `<span class="search-tag">${tag}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    highlightMatches(text, matches, key) {
        if (!matches || !text) return text;
        
        const relevantMatches = matches.filter(match => match.key === key);
        if (relevantMatches.length === 0) return text;

        let highlightedText = text;
        
        // Sort matches by indices to avoid overlap issues
        const sortedMatches = relevantMatches
            .flatMap(match => match.indices)
            .sort((a, b) => b[0] - a[0]); // Reverse order to maintain indices

        sortedMatches.forEach(([start, end]) => {
            const before = highlightedText.substring(0, start);
            const match = highlightedText.substring(start, end + 1);
            const after = highlightedText.substring(end + 1);
            
            highlightedText = `${before}<mark class="search-highlight">${match}</mark>${after}`;
        });

        return highlightedText;
    }

    generateSearchSuggestions(query) {
        // Generate suggestions based on:
        // 1. Popular searches
        // 2. Related tags/categories
        // 3. Similar titles
        // 4. Trending topics

        const suggestions = new Set();

        // Add related tags
        this.searchData.forEach(item => {
            if (item.tags) {
                item.tags.forEach(tag => {
                    if (tag.toLowerCase().includes(query.toLowerCase()) && tag !== query) {
                        suggestions.add(tag);
                    }
                });
            }
        });

        // Add similar titles (partial matches)
        this.searchData.forEach(item => {
            const words = item.title.toLowerCase().split(' ');
            words.forEach(word => {
                if (word.includes(query.toLowerCase()) && word.length > query.length) {
                    suggestions.add(word);
                }
            });
        });

        this.searchSuggestions = Array.from(suggestions).slice(0, 5);
    }

    getSearchSuggestions(query) {
        // Return cached suggestions or generate new ones
        if (this.searchSuggestions.length > 0) {
            return this.searchSuggestions;
        }

        // Fallback suggestions
        return [
            'web development',
            'javascript',
            'design',
            'tutorial',
            'guide'
        ].filter(suggestion => 
            suggestion.toLowerCase().includes(query.toLowerCase())
        );
    }

    handleSearchKeydown(e) {
        const suggestions = document.getElementById('search-suggestions');
        if (!suggestions || !suggestions.classList.contains('active')) return;

        const results = suggestions.querySelectorAll('.search-result');
        let activeIndex = Array.from(results).findIndex(result => 
            result.classList.contains('active')
        );

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                activeIndex = Math.min(activeIndex + 1, results.length - 1);
                this.updateActiveResult(results, activeIndex);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                activeIndex = Math.max(activeIndex - 1, -1);
                this.updateActiveResult(results, activeIndex);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0) {
                    const activeResult = results[activeIndex];
                    const link = activeResult.querySelector('a');
                    if (link) {
                        window.location.href = link.href;
                    }
                }
                break;
                
            case 'Escape':
                this.clearSuggestions();
                break;
                
            default:
                // No action needed for other keys
                break;
        }
    }

    updateActiveResult(results, activeIndex) {
        results.forEach((result, index) => {
            result.classList.toggle('active', index === activeIndex);
        });

        // Scroll active result into view
        if (activeIndex >= 0) {
            results[activeIndex].scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }

    trackSearchQuery(query) {
        // Add to search history
        this.searchHistory.unshift({
            query,
            timestamp: Date.now(),
            results: 0 // Will be updated with results count
        });

        // Keep last 50 searches
        if (this.searchHistory.length > 50) {
            this.searchHistory = this.searchHistory.slice(0, 50);
        }

        // Save to localStorage
        try {
            localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        } catch (error) {
            // Failed to save search history - continuing without persistence
        }

        // Track in analytics
        if (window.enterpriseBlog?.analytics) {
            window.enterpriseBlog.analytics.track('search_query', { query });
        }
    }

    loadSearchHistory() {
        try {
            const history = localStorage.getItem('searchHistory');
            if (history) {
                this.searchHistory = JSON.parse(history);
            }
        } catch (error) {
            // Failed to load search history - starting with empty history
            this.searchHistory = [];
        }
    }

    clearSuggestions() {
        const suggestions = document.getElementById('search-suggestions');
        if (suggestions) {
            suggestions.classList.remove('active');
            suggestions.innerHTML = '';
        }
    }

    openSearch() {
        const searchToggle = document.getElementById('search-toggle');
        if (searchToggle) {
            searchToggle.click();
        }
    }

    basicSearch(query) {
        // Fallback search implementation
        const results = this.searchData.filter(item => {
            const searchText = `${item.title} ${item.content} ${item.tags?.join(' ') || ''}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });

        this.displaySearchResults(results.slice(0, 10), query);
        return results;
    }

    initBasicSearch() {
        // Using basic search functionality (advanced features not available)
        this.isInitialized = true;
        this.setupSearchUI();
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Public API
    search(query) {
        return this.performSearch(query);
    }

    getSearchHistory() {
        return this.searchHistory;
    }

    clearSearchHistory() {
        this.searchHistory = [];
        try {
            localStorage.removeItem('searchHistory');
        } catch (error) {
            // Failed to clear search history - continuing without clearing
        }
    }

    exportSearchData() {
        const data = {
            searchHistory: this.searchHistory,
            searchData: this.searchData,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `search-data-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}