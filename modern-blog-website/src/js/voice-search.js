/**
 * Voice Search Integration
 * Handles voice search functionality without overlapping with other features
 */

class VoiceSearchManager {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.currentModal = null;
        this.timeoutId = null;
        
        this.init();
    }

    init() {
        try {
            // Check for speech recognition support
            window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!window.SpeechRecognition) {
                console.warn('Speech Recognition not supported');
                this.hideVoiceSearchButtons();
                return;
            }

            this.setupSpeechRecognition();
            this.setupEventListeners();
        } catch (error) {
            console.error('Voice search initialization failed:', error);
            this.hideVoiceSearchButtons();
        }
    }

    setupSpeechRecognition() {
        this.recognition = new window.SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateListeningStatus('Listening...', 'Say something to search');
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            const displayTranscript = finalTranscript || interimTranscript;
            this.updateListeningStatus('Listening...', displayTranscript || 'Say something to search');

            if (finalTranscript) {
                this.handleVoiceResult(finalTranscript.trim());
            }
        };

        this.recognition.onerror = (event) => {
            this.isListening = false;
            let errorMessage = 'Voice search error occurred';
            
            switch (event.error) {
                case 'no-speech':
                    errorMessage = 'No speech detected. Please try again.';
                    break;
                case 'audio-capture':
                    errorMessage = 'Microphone not available';
                    break;
                case 'not-allowed':
                    errorMessage = 'Microphone permission denied';
                    break;
                case 'network':
                    errorMessage = 'Network error. Please check connection.';
                    break;
            }

            this.updateListeningStatus('Error', errorMessage);
            setTimeout(() => this.closeVoiceModal(), 2000);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.closeVoiceModal();
        };
    }

    setupEventListeners() {
        // Main voice search toggle in navigation
        const voiceToggle = document.getElementById('voice-search-toggle');
        if (voiceToggle) {
            voiceToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleVoiceSearch();
            });
        }

        // Voice search modal cancel button
        const voiceCancel = document.getElementById('voice-cancel');
        if (voiceCancel) {
            voiceCancel.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.stopListening();
            });
        }

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.stopListening();
            }
        });

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (this.currentModal && e.target === this.currentModal) {
                this.stopListening();
            }
        });
    }

    toggleVoiceSearch() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        if (!this.recognition) {
            this.showNotification('Voice search not available', 'error');
            return;
        }

        try {
            // Close any other open overlays to prevent conflicts
            this.closeOtherOverlays();
            
            // Show voice modal
            this.showVoiceModal();
            
            // Start recognition
            this.recognition.start();
            
            // Set timeout to auto-stop after 10 seconds
            this.timeoutId = setTimeout(() => {
                if (this.isListening) {
                    this.stopListening();
                }
            }, 10000);
            
        } catch (error) {
            console.error('Failed to start voice recognition:', error);
            this.showNotification('Failed to start voice search', 'error');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        this.isListening = false;
        this.closeVoiceModal();
        
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    showVoiceModal() {
        const modal = document.getElementById('voice-search-modal');
        if (modal) {
            this.currentModal = modal;
            modal.classList.add('active');
            document.body.classList.add('modal-open');
            
            // Focus management
            const cancelBtn = modal.querySelector('#voice-cancel');
            if (cancelBtn) {
                cancelBtn.focus();
            }
        }
    }

    closeVoiceModal() {
        if (this.currentModal) {
            this.currentModal.classList.remove('active');
            document.body.classList.remove('modal-open');
            this.currentModal = null;
        }
    }

    updateListeningStatus(title, message) {
        const titleElement = document.getElementById('voice-status-title');
        const statusElement = document.getElementById('voice-status');
        
        if (titleElement) titleElement.textContent = title;
        if (statusElement) statusElement.textContent = message;
    }

    handleVoiceResult(transcript) {
        if (!transcript) return;

        // Close voice modal
        this.closeVoiceModal();
        
        // Perform search with the voice result
        this.performSearch(transcript);
    }

    performSearch(query) {
        try {
            // Open search overlay
            const searchOverlay = document.getElementById('search-overlay');
            const searchInput = document.getElementById('search-input');
            
            if (searchOverlay && searchInput) {
                // Set search query
                searchInput.value = query;
                
                // Show search overlay
                searchOverlay.classList.add('active');
                document.body.classList.add('modal-open');
                
                // Focus search input
                setTimeout(() => {
                    searchInput.focus();
                    searchInput.select();
                }, 100);
                
                // Trigger search
                const searchEvent = new Event('input', { bubbles: true });
                searchInput.dispatchEvent(searchEvent);
                
                // Show notification
                this.showNotification(`Searching for: "${query}"`, 'info');
            }
        } catch (error) {
            console.error('Failed to perform search:', error);
            this.showNotification('Search failed. Please try manually.', 'error');
        }
    }

    closeOtherOverlays() {
        // Close search overlay
        const searchOverlay = document.getElementById('search-overlay');
        if (searchOverlay && searchOverlay.classList.contains('active')) {
            searchOverlay.classList.remove('active');
        }
        
        // Close reading settings panel
        const readingPanel = document.getElementById('reading-settings-panel');
        if (readingPanel && readingPanel.classList.contains('active')) {
            readingPanel.classList.remove('active');
        }
        
        // Close dropdowns
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
        
        // Remove modal-open class
        document.body.classList.remove('modal-open');
    }

    hideVoiceSearchButtons() {
        const voiceButtons = document.querySelectorAll('.voice-search-toggle, .voice-search-btn');
        voiceButtons.forEach(btn => {
            btn.style.display = 'none';
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to notification container
        const container = document.getElementById('notificationContainer') || document.body;
        container.appendChild(notification);
        
        // Show with animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Public methods for external use
    isSupported() {
        return !!window.SpeechRecognition;
    }

    getCurrentState() {
        return {
            isListening: this.isListening,
            isSupported: this.isSupported(),
            modalOpen: !!this.currentModal
        };
    }
}

// Initialize voice search when DOM is ready
let voiceSearchManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        voiceSearchManager = new VoiceSearchManager();
    });
} else {
    voiceSearchManager = new VoiceSearchManager();
}

// Export for external use
window.VoiceSearchManager = VoiceSearchManager;
window.voiceSearchManager = voiceSearchManager;