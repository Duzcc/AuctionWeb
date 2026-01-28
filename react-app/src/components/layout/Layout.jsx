import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from './Header';
import Footer from './Footer';
import FloatingActions from './FloatingActions';
import BackToTop from './BackToTop';
import ProfileCompletionModal from '@/components/modals/ProfileCompletionModal';

/**
 * Layout component - Wraps all pages with Header and Footer
 * 
 * This component uses React Router's Outlet to render child routes
 * while keeping the Header and Footer persistent across navigation.
 * Also manages the ProfileCompletionModal for users who haven't completed their profile.
 */
export default function Layout() {
    const { user, isAuthenticated, checkProfileComplete } = useAuth();
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Check if profile completion modal should be shown
    useEffect(() => {
        if (isAuthenticated && user && !checkProfileComplete()) {
            setShowProfileModal(true);
        } else {
            setShowProfileModal(false);
        }
    }, [isAuthenticated, user, checkProfileComplete]);

    const handleProfileComplete = () => {
        setShowProfileModal(false);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
            <FloatingActions />
            <BackToTop />

            {/* Profile Completion Modal - Shows when user is authenticated but profile incomplete */}
            <ProfileCompletionModal
                isOpen={showProfileModal}
                onComplete={handleProfileComplete}
            />
        </div>
    );
}
