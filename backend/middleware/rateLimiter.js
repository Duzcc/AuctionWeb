/**
 * Simple in-memory rate limiter for bidding
 * Limits 1 bid per 5 seconds per user
 */

const bidAttempts = new Map();

const RATE_LIMIT_WINDOW = 5000; // 5 seconds
const MAX_ATTEMPTS = 1;

/**
 * Rate limiter middleware for bidding
 */
export const bidRateLimiter = (req, res, next) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const now = Date.now();
    const userKey = `bid:${userId}`;

    // Get user's bid history
    const userAttempts = bidAttempts.get(userKey) || [];

    // Filter out old attempts (outside the rate limit window)
    const recentAttempts = userAttempts.filter(
        timestamp => now - timestamp < RATE_LIMIT_WINDOW
    );

    // Check if user has exceeded rate limit
    if (recentAttempts.length >= MAX_ATTEMPTS) {
        const oldestAttempt = recentAttempts[0];
        const timeRemaining = Math.ceil((RATE_LIMIT_WINDOW - (now - oldestAttempt)) / 1000);

        return res.status(429).json({
            success: false,
            message: `Too many bid attempts. Please wait ${timeRemaining} seconds before bidding again.`,
            retryAfter: timeRemaining
        });
    }

    // Add current attempt
    recentAttempts.push(now);
    bidAttempts.set(userKey, recentAttempts);

    // Cleanup old entries periodically (simple memory management)
    if (Math.random() < 0.01) { // 1% chance to cleanup
        cleanupOldEntries(now);
    }

    next();
};

/**
 * Cleanup old rate limit entries
 * @private
 */
function cleanupOldEntries(now) {
    for (const [key, attempts] of bidAttempts.entries()) {
        const recentAttempts = attempts.filter(
            timestamp => now - timestamp < RATE_LIMIT_WINDOW
        );

        if (recentAttempts.length === 0) {
            bidAttempts.delete(key);
        } else {
            bidAttempts.set(key, recentAttempts);
        }
    }
}

/**
 * General API rate limiter
 * Limits requests per IP
 */
const apiAttempts = new Map();

const API_WINDOW = 15 * 60 * 1000; // 15 minutes
const API_MAX_REQUESTS = 100;

export const apiRateLimiter = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    const requests = apiAttempts.get(ip) || [];
    const recentRequests = requests.filter(
        timestamp => now - timestamp < API_WINDOW
    );

    if (recentRequests.length >= API_MAX_REQUESTS) {
        return res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil(API_WINDOW / 1000)
        });
    }

    recentRequests.push(now);
    apiAttempts.set(ip, recentRequests);

    next();
};

/**
 * Clear rate limit for a specific user (for testing or admin override)
 */
export const clearUserRateLimit = (userId) => {
    const userKey = `bid:${userId}`;
    bidAttempts.delete(userKey);
};

export default {
    bidRateLimiter,
    apiRateLimiter,
    clearUserRateLimit
};
