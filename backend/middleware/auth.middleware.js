import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.model.js';

/**
 * Middleware: Verify JWT Token from Authorization header
 * Attaches user payload to req.user
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = verifyToken(token);
        
        // Normalize: Backend controllers expect req.user.userId but payload uses id
        decoded.userId = decoded.userId || decoded.id;

        // Attach user info to request object
        req.user = decoded;

        next();
    } catch (error) {
        if (error.message === 'Token has expired') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired',
                code: 'TOKEN_EXPIRED',
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
};

/**
 * Middleware: Check if user has specific role
 * @param {...String} roles - Allowed roles (e.g., 'admin', 'user')
 * @returns {Function} - Express middleware
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden. Insufficient permissions.',
                requiredRoles: roles,
                userRole: req.user.role,
            });
        }

        next();
    };
};

/**
 * Middleware: Check if user account is verified
 */
export const requireVerification = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('isVerified');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Account not verified. Please verify your account first.',
                code: 'ACCOUNT_NOT_VERIFIED',
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error checking verification status',
        });
    }
};

/**
 * Middleware: Optional authentication (doesn't fail if no token)
 * Used for routes that have different behavior for authenticated vs non-authenticated users
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = verifyToken(token);
            req.user = decoded;
        }

        next();
    } catch (error) {
        // Ignore errors for optional auth
        next();
    }
};

export default {
    authenticate,
    authorize,
    requireVerification,
    optionalAuth,
};
