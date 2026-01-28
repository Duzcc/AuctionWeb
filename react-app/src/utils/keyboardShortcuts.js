/**
 * Keyboard Shortcuts Utility for Auction Room
 * Provides keyboard navigation and quick actions
 */

export const SHORTCUTS = {
    // Bidding
    QUICK_BID: ' ', // Space
    BID_1X: '1',
    BID_2X: '2',
    BID_5X: '5',

    // UI
    TOGGLE_CHAT: 'c',
    TOGGLE_PARTICIPANTS: 'p',
    FOCUS_BID_INPUT: 'b',

    // Navigation
    ESCAPE: 'Escape',
    HELP: '?',
};

class KeyboardShortcuts {
    constructor() {
        this.handlers = new Map();
        this.enabled = true;
        this.listening = false;
    }

    /**
     * Start listening for keyboard events
     */
    startListening() {
        if (this.listening) return;

        this.handleKeyPress = (e) => {
            if (!this.enabled) return;

            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' ||
                e.target.tagName === 'TEXTAREA' ||
                e.target.isContentEditable) {
                // Except for Escape
                if (e.key !== 'Escape') return;
            }

            const handler = this.handlers.get(e.key);
            if (handler) {
                e.preventDefault();
                handler(e);
            }
        };

        document.addEventListener('keydown', this.handleKeyPress);
        this.listening = true;
    }

    /**
     * Stop listening for keyboard events
     */
    stopListening() {
        if (!this.listening) return;

        document.removeEventListener('keydown', this.handleKeyPress);
        this.listening = false;
    }

    /**
     * Register a keyboard shortcut
     * @param {string} key - Key to listen for
     * @param {Function} handler - Handler function
     */
    register(key, handler) {
        this.handlers.set(key, handler);
    }

    /**
     * Unregister a keyboard shortcut
     * @param {string} key - Key to remove
     */
    unregister(key) {
        this.handlers.delete(key);
    }

    /**
     * Clear all registered shortcuts
     */
    clearAll() {
        this.handlers.clear();
    }

    /**
     * Enable/disable shortcuts
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Get help text for all registered shortcuts
     */
    getHelpText() {
        const shortcuts = [
            { key: 'Space', action: 'Đặt giá nhanh (+1 bước)' },
            { key: '1, 2, 5', action: 'Đặt giá x1, x2, x5 bước' },
            { key: 'B', action: 'Focus vào ô nhập giá' },
            { key: 'C', action: 'Bật/tắt chat' },
            { key: 'P', action: 'Bật/tắt danh sách người tham gia' },
            { key: 'Esc', action: 'Thoát/Đóng' },
            { key: '?', action: 'Hiển thị trợ giúp' },
        ];
        return shortcuts;
    }
}

// Create singleton instance
const keyboardShortcuts = new KeyboardShortcuts();

export default keyboardShortcuts;

/**
 * React hook for keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts = {}, enabled = true) {
    const { useEffect } = require('react');

    useEffect(() => {
        if (!enabled) return;

        keyboardShortcuts.setEnabled(true);
        keyboardShortcuts.startListening();

        // Register shortcuts
        Object.entries(shortcuts).forEach(([key, handler]) => {
            keyboardShortcuts.register(key, handler);
        });

        // Cleanup
        return () => {
            Object.keys(shortcuts).forEach(key => {
                keyboardShortcuts.unregister(key);
            });
        };
    }, [shortcuts, enabled]);

    return keyboardShortcuts;
}
