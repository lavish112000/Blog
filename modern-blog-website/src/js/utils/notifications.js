/**
 * Enterprise Notification System
 * Advanced notification management with multiple types, queuing, and persistence
 */

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.queue = [];
        this.settings = {
            maxVisible: 5,
            defaultDuration: 5000,
            position: 'top-right',
            enableSound: false,
            enableVibration: true,
            persistence: true,
            groupSimilar: true,
            showProgress: true
        };
        
        this.sounds = {
            success: '/assets/sounds/success.mp3',
            error: '/assets/sounds/error.mp3',
            warning: '/assets/sounds/warning.mp3',
            info: '/assets/sounds/info.mp3'
        };

        this.container = null;
        this.unreadCount = 0;
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.createContainer();
        this.loadPersistedNotifications();
        this.setupServiceWorkerListener();
        this.setupPermissions();
        
        console.log('🔔 Notification Manager initialized');
    }

    loadSettings() {
        const stored = localStorage.getItem('notificationSettings');
        if (stored) {
            this.settings = { ...this.settings, ...JSON.parse(stored) };
        }
    }

    saveSettings() {
        localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    }

    createContainer() {
        if (document.getElementById('notificationContainer')) {
            this.container = document.getElementById('notificationContainer');
            return;
        }

        this.container = document.createElement('div');
        this.container.id = 'notificationContainer';
        this.container.className = `notification-container ${this.settings.position}`;
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-label', 'Notifications');
        
        document.body.appendChild(this.container);
    }

    async setupPermissions() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            if (Notification.permission === 'default') {
                // Don't request permission immediately, wait for user interaction
                this.showPermissionPrompt();
            }
        }
    }

    showPermissionPrompt() {
        const prompt = this.show({
            type: 'info',
            title: 'Enable Notifications',
            message: 'Get notified about new articles and updates',
            persistent: true,
            actions: [
                {
                    text: 'Enable',
                    action: () => this.requestPermission()
                },
                {
                    text: 'Later',
                    action: () => this.dismissPrompt()
                }
            ]
        });

        return prompt;
    }

    async requestPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                this.show({
                    type: 'success',
                    title: 'Notifications Enabled',
                    message: 'You\'ll now receive notifications about new content'
                });
                
                this.updateNotificationBadge();
            } else {
                this.show({
                    type: 'warning',
                    title: 'Notifications Disabled',
                    message: 'You can enable them later in your browser settings'
                });
            }
        }
    }

    setupServiceWorkerListener() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'notification') {
                    this.show(event.data.notification);
                }
            });
        }
    }

    show(options) {
        const notification = this.createNotification(options);
        
        // Check if similar notification exists and group them
        if (this.settings.groupSimilar) {
            const similar = this.findSimilarNotification(notification);
            if (similar) {
                return this.groupNotifications(similar, notification);
            }
        }

        // Add to queue if too many notifications are visible
        if (this.getVisibleCount() >= this.settings.maxVisible) {
            this.queue.push(notification);
            return notification;
        }

        this.displayNotification(notification);
        return notification;
    }

    createNotification(options) {
        const id = this.generateId();
        const timestamp = Date.now();
        
        const notification = {
            id,
            type: options.type || 'info',
            title: options.title || '',
            message: options.message || '',
            icon: options.icon || this.getDefaultIcon(options.type),
            duration: options.duration !== undefined ? options.duration : this.settings.defaultDuration,
            persistent: options.persistent || false,
            actions: options.actions || [],
            data: options.data || {},
            timestamp,
            read: false,
            visible: false,
            dismissed: false,
            onClick: options.onClick || null,
            onClose: options.onClose || null
        };

        this.notifications.push(notification);
        this.updateNotificationBadge();
        
        if (this.settings.persistence) {
            this.persistNotifications();
        }

        return notification;
    }

    displayNotification(notification) {
        const element = this.createNotificationElement(notification);
        
        // Add to container
        this.container.appendChild(element);
        notification.visible = true;
        notification.element = element;

        // Animate in
        requestAnimationFrame(() => {
            element.classList.add('show');
        });

        // Play sound
        if (this.settings.enableSound) {
            this.playSound(notification.type);
        }

        // Vibrate
        if (this.settings.enableVibration && 'vibrate' in navigator) {
            const patterns = {
                success: [100],
                error: [100, 50, 100],
                warning: [200],
                info: [50]
            };
            navigator.vibrate(patterns[notification.type] || [100]);
        }

        // Auto dismiss
        if (!notification.persistent && notification.duration > 0) {
            notification.timer = setTimeout(() => {
                this.dismiss(notification.id);
            }, notification.duration);
        }

        // Show browser notification if permission granted
        this.showBrowserNotification(notification);

        return element;
    }

    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.setAttribute('data-id', notification.id);
        element.setAttribute('role', 'alert');
        element.setAttribute('aria-labelledby', `notification-title-${notification.id}`);
        element.setAttribute('aria-describedby', `notification-message-${notification.id}`);

        let progressBar = '';
        if (this.settings.showProgress && notification.duration > 0 && !notification.persistent) {
            progressBar = `
                <div class="notification-progress">
                    <div class="progress-bar" style="animation-duration: ${notification.duration}ms;"></div>
                </div>
            `;
        }

        let actions = '';
        if (notification.actions.length > 0) {
            actions = `
                <div class="notification-actions">
                    ${notification.actions.map((action, index) => `
                        <button class="notification-action" data-action="${index}">
                            ${action.text}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="${notification.icon}"></i>
                </div>
                <div class="notification-body">
                    <div class="notification-title" id="notification-title-${notification.id}">
                        ${notification.title}
                    </div>
                    <div class="notification-message" id="notification-message-${notification.id}">
                        ${notification.message}
                    </div>
                    ${actions}
                </div>
                <div class="notification-controls">
                    <div class="notification-time" title="${new Date(notification.timestamp).toLocaleString()}">
                        ${this.formatTimestamp(notification.timestamp)}
                    </div>
                    <button class="notification-close" aria-label="Close notification">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            ${progressBar}
        `;

        // Add event listeners
        this.attachNotificationEvents(element, notification);

        return element;
    }

    attachNotificationEvents(element, notification) {
        // Close button
        const closeBtn = element.querySelector('.notification-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.dismiss(notification.id);
        });

        // Action buttons
        const actionButtons = element.querySelectorAll('.notification-action');
        actionButtons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = notification.actions[index];
                if (action && action.action) {
                    action.action(notification);
                }
                this.dismiss(notification.id);
            });
        });

        // Click handler
        if (notification.onClick) {
            element.addEventListener('click', () => {
                notification.onClick(notification);
                this.markAsRead(notification.id);
            });
        }

        // Hover handlers for pause/resume timer
        if (notification.timer) {
            element.addEventListener('mouseenter', () => {
                clearTimeout(notification.timer);
                element.classList.add('paused');
            });

            element.addEventListener('mouseleave', () => {
                if (!notification.dismissed) {
                    notification.timer = setTimeout(() => {
                        this.dismiss(notification.id);
                    }, 1000); // Resume with shorter time
                    element.classList.remove('paused');
                }
            });
        }
    }

    dismiss(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (!notification || notification.dismissed) return;

        notification.dismissed = true;

        if (notification.element) {
            notification.element.classList.add('dismissing');
            
            setTimeout(() => {
                if (notification.element && notification.element.parentNode) {
                    notification.element.parentNode.removeChild(notification.element);
                }
                notification.visible = false;
                
                // Show next queued notification
                this.showNextQueued();
                
                // Call onClose callback
                if (notification.onClose) {
                    notification.onClose(notification);
                }
            }, 300);
        }

        if (notification.timer) {
            clearTimeout(notification.timer);
        }

        this.updateNotificationBadge();
        
        if (this.settings.persistence) {
            this.persistNotifications();
        }
    }

    dismissAll() {
        const visibleNotifications = this.notifications.filter(n => n.visible && !n.dismissed);
        visibleNotifications.forEach(notification => {
            this.dismiss(notification.id);
        });
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            this.unreadCount = Math.max(0, this.unreadCount - 1);
            this.updateNotificationBadge();
            
            if (this.settings.persistence) {
                this.persistNotifications();
            }
        }
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            if (!notification.read) {
                notification.read = true;
            }
        });
        
        this.unreadCount = 0;
        this.updateNotificationBadge();
        
        if (this.settings.persistence) {
            this.persistNotifications();
        }
    }

    showNextQueued() {
        if (this.queue.length > 0 && this.getVisibleCount() < this.settings.maxVisible) {
            const nextNotification = this.queue.shift();
            this.displayNotification(nextNotification);
        }
    }

    findSimilarNotification(notification) {
        return this.notifications.find(n => 
            n.visible && 
            !n.dismissed && 
            n.type === notification.type && 
            n.title === notification.title &&
            Math.abs(n.timestamp - notification.timestamp) < 30000 // Within 30 seconds
        );
    }

    groupNotifications(existing, newNotification) {
        const count = (existing.data.count || 1) + 1;
        existing.data.count = count;
        
        // Update the existing notification
        const countElement = existing.element.querySelector('.notification-count');
        if (countElement) {
            countElement.textContent = count;
        } else {
            const titleElement = existing.element.querySelector('.notification-title');
            titleElement.innerHTML += ` <span class="notification-count">(${count})</span>`;
        }

        // Reset timer
        if (existing.timer) {
            clearTimeout(existing.timer);
            existing.timer = setTimeout(() => {
                this.dismiss(existing.id);
            }, newNotification.duration);
        }

        // Remove the new notification from the list since we're grouping
        this.notifications = this.notifications.filter(n => n.id !== newNotification.id);

        return existing;
    }

    showBrowserNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const browserNotification = new Notification(notification.title, {
                body: notification.message,
                icon: notification.icon || '/assets/icons/notification-icon.png',
                badge: '/assets/icons/badge-icon.png',
                tag: notification.type,
                renotify: true,
                requireInteraction: notification.persistent
            });

            browserNotification.onclick = () => {
                window.focus();
                if (notification.onClick) {
                    notification.onClick(notification);
                }
                browserNotification.close();
            };

            // Auto close browser notification
            if (!notification.persistent) {
                setTimeout(() => {
                    browserNotification.close();
                }, notification.duration);
            }
        }
    }

    updateNotificationBadge() {
        const badges = document.querySelectorAll('.notification-badge');
        badges.forEach(badge => {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        });

        // Update document title
        if (this.unreadCount > 0) {
            document.title = `(${this.unreadCount}) ${document.title.replace(/^\(\d+\) /, '')}`;
        } else {
            document.title = document.title.replace(/^\(\d+\) /, '');
        }
    }

    persistNotifications() {
        const toStore = this.notifications.map(n => ({
            ...n,
            element: null // Don't store DOM elements
        }));
        
        try {
            localStorage.setItem('persistedNotifications', JSON.stringify(toStore));
        } catch (error) {
            console.warn('Failed to persist notifications:', error);
        }
    }

    loadPersistedNotifications() {
        if (!this.settings.persistence) return;

        try {
            const stored = localStorage.getItem('persistedNotifications');
            if (stored) {
                const notifications = JSON.parse(stored);
                
                // Only load recent notifications (last 24 hours)
                const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
                const recentNotifications = notifications.filter(n => n.timestamp > dayAgo);
                
                this.notifications = recentNotifications;
                this.unreadCount = recentNotifications.filter(n => !n.read).length;
                this.updateNotificationBadge();
            }
        } catch (error) {
            console.warn('Failed to load persisted notifications:', error);
        }
    }

    playSound(type) {
        if (this.sounds[type]) {
            const audio = new Audio(this.sounds[type]);
            audio.volume = 0.3;
            audio.play().catch(() => {
                // Ignore audio play errors (usually due to user interaction requirements)
            });
        }
    }

    // Utility methods
    generateId() {
        return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getDefaultIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || 'fas fa-bell';
    }

    formatTimestamp(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    }

    getVisibleCount() {
        return this.notifications.filter(n => n.visible && !n.dismissed).length;
    }

    // Public API methods
    success(title, message, options = {}) {
        return this.show({
            type: 'success',
            title,
            message,
            ...options
        });
    }

    error(title, message, options = {}) {
        return this.show({
            type: 'error',
            title,
            message,
            persistent: true, // Errors should be persistent by default
            ...options
        });
    }

    warning(title, message, options = {}) {
        return this.show({
            type: 'warning',
            title,
            message,
            ...options
        });
    }

    info(title, message, options = {}) {
        return this.show({
            type: 'info',
            title,
            message,
            ...options
        });
    }

    getAllNotifications() {
        return [...this.notifications];
    }

    getUnreadCount() {
        return this.unreadCount;
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        // Apply position change
        if (newSettings.position) {
            this.container.className = `notification-container ${this.settings.position}`;
        }
    }

    getSettings() {
        return { ...this.settings };
    }

    clear() {
        this.dismissAll();
        this.notifications = [];
        this.queue = [];
        this.unreadCount = 0;
        this.updateNotificationBadge();
        
        if (this.settings.persistence) {
            localStorage.removeItem('persistedNotifications');
        }
    }
}

// Export for use in other modules
export default NotificationManager;

// Auto-initialize if not imported as module
if (typeof module === 'undefined') {
    window.NotificationManager = NotificationManager;
}