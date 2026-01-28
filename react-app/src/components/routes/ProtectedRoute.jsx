import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

/**
 * Protected Route Component
 * Wraps routes that require authentication or specific roles
 * 
 * @param {ReactNode} children - Child components to render if authorized
 * @param {String} requiredRole - Optional role requirement ('user' or 'admin')
 * @param {Boolean} requireVerification - Optional email verification requirement
 */
function ProtectedRoute({ children, requiredRole, requireVerification = false }) {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    // Check authentication
    if (!isAuthenticated) {
        toast.error('Vui lòng đăng nhập để tiếp tục');
        return <Navigate to="/login" replace />;
    }

    // Check email verification if required
    if (requireVerification && !user?.isVerified) {
        toast.error('Vui lòng xác thực email trước khi tiếp tục');
        return <Navigate to="/login" replace />;
    }

    // Check role if specified
    if (requiredRole && user?.role !== requiredRole) {
        toast.error('Bạn không có quyền truy cập trang này');
        return <Navigate to="/" replace />;
    }

    // User is authorized
    return children;
}

export default ProtectedRoute;
