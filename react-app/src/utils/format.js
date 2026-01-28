/**
 * Formatting Utilities
 * Functions for formatting numbers, dates, currency, etc.
 */

/**
 * Format number to Vietnamese currency
 */
export const formatCurrency = (amount) => {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0;
    }
    return amount.toLocaleString('vi-VN') + ' VNĐ';
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (num) => {
    if (typeof num !== 'number') {
        num = parseFloat(num) || 0;
    }
    return num.toLocaleString('vi-VN');
};

/**
 * Format date to Vietnamese format
 */
export const formatDate = (date, includeTime = false) => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };

    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }

    return d.toLocaleString('vi-VN', options);
};

/**
 * Format date to relative time (e.g., "2 giờ trước")
 */
export const formatRelativeTime = (date) => {
    if (!date) return '';

    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return formatDate(date);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Format plate number with proper spacing
 */
export const formatPlateNumber = (plateNumber) => {
    if (!plateNumber) return '';
    // Example: "30A88888" -> "30A-888.88"
    return plateNumber.replace(/([A-Z])(\d+)/, '$1-$2').replace(/(\d{3})(\d{2})$/, '$1.$2');
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString) => {
    if (typeof currencyString === 'number') return currencyString;
    return parseInt(String(currencyString).replace(/[^\d]/g, '')) || 0;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default {
    formatCurrency,
    formatNumber,
    formatDate,
    formatRelativeTime,
    truncateText,
    formatPlateNumber,
    parseCurrency,
    formatFileSize
};
