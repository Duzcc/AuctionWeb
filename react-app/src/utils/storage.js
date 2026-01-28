/**
 * LocalStorage Utilities
 * Safe wrapper functions for localStorage operations
 */

const PREFIX = 'vpa_';

/**
 * Save data to localStorage
 */
export const setItem = (key, value) => {
    try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(PREFIX + key, serialized);
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
};

/**
 * Get data from localStorage
 */
export const getItem = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(PREFIX + key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
};

/**
 * Remove item from localStorage
 */
export const removeItem = (key) => {
    try {
        localStorage.removeItem(PREFIX + key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
};

/**
 * Clear all app data from localStorage
 */
export const clear = () => {
    try {
        Object.keys(localStorage)
            .filter(key => key.startsWith(PREFIX))
            .forEach(key => localStorage.removeItem(key));
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
};

/**
 * Check if key exists in localStorage
 */
export const hasItem = (key) => {
    return localStorage.getItem(PREFIX + key) !== null;
};

/**
 * Get all keys from localStorage
 */
export const getAllKeys = () => {
    return Object.keys(localStorage)
        .filter(key => key.startsWith(PREFIX))
        .map(key => key.replace(PREFIX, ''));
};

/**
 * Save to sessionStorage
 */
export const setSessionItem = (key, value) => {
    try {
        const serialized = JSON.stringify(value);
        sessionStorage.setItem(PREFIX + key, serialized);
        return true;
    } catch (error) {
        console.error('Error saving to sessionStorage:', error);
        return false;
    }
};

/**
 * Get from sessionStorage
 */
export const getSessionItem = (key, defaultValue = null) => {
    try {
        const item = sessionStorage.getItem(PREFIX + key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from sessionStorage:', error);
        return defaultValue;
    }
};

export default {
    setItem,
    getItem,
    removeItem,
    clear,
    hasItem,
    getAllKeys,
    setSessionItem,
    getSessionItem
};
