import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';

/**
 * ProtectedRoute Component
 * @param {Object} props
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route (e.g. ['admin', 'user'])
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner or nothing while checking auth state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#AA8C3C]"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role check
    if (allowedRoles.length > 0 && user) {
        const userRole = user.role || 'user'; // Default to user if undefined
        if (!allowedRoles.includes(userRole)) {
            // User authorized but not for this role
            // Prevent infinite toast loop by checking if we just showed it? 
            // Better to show it once.
            // Putting toast in render is bad practice, usually.
            // But for simple guard it works if we redirect immediately.
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
