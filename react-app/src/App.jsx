import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import store from './store';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import useSocket from './hooks/useSocket';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';

// Import pages
import HomePage from './pages/Home/HomePage';
import AboutPage from './pages/About/AboutPage';
import NewsPage from './pages/News/NewsPage';
import NewsDetailPage from './pages/News/NewsDetailPage';
import CarAuctionPage from './pages/Auction/CarAuctionPage';
import MotorbikeAuctionPage from './pages/Auction/MotorbikeAuctionPage';
import AssetListPage from './pages/Assets/AssetListPage';
import AssetDetailPage from './pages/Assets/AssetDetailPage';
import AuctionHistoryPage from './pages/Auction/AuctionHistoryPage';
import AuctionRoomPage from './pages/Auction/AuctionRoomPage';
import CartPage from './pages/Payment/CartPage';
import CheckoutPage from './pages/Payment/CheckoutPage';
import PaymentPage from './pages/Payment/PaymentPage';
import PaymentSuccessPage from './pages/Payment/PaymentSuccessPage';
import PaymentFailurePage from './pages/Payment/PaymentFailurePage';
import LoginPage from './pages/Auth/LoginPage';
import VerifyEmailPage from './pages/Auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import ProfilePage from './pages/User/ProfilePage';
import DocumentsPage from './pages/User/DocumentsPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import DepositManagementPage from './pages/Admin/DepositManagementPage';
import SessionManagementPage from './pages/Admin/SessionManagementPage';
import PaymentManagementPage from './pages/Admin/PaymentManagementPage';
import UserManagementPage from './pages/Admin/UserManagementPage';
import ProductManagementPage from './pages/Admin/ProductManagementPage';
import LiveAuctionPage from './pages/Auction/LiveAuctionPage';

// Socket connection manager component
function SocketManager() {
  useSocket(); // Auto-connect/disconnect based on auth state
  return null;
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <SocketManager />
              <Toaster position="top-right" />
              <Routes>
                {/* --- PUBLIC ROUTES --- */}
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/news" element={<NewsPage />} />
                  <Route path="/news/:id" element={<NewsDetailPage />} />
                  <Route path="/notifications/:id" element={<NewsDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  {/* Public Auction Viewing */}
                  <Route path="/car-auction" element={<CarAuctionPage />} />
                  <Route path="/motorbike-auction" element={<MotorbikeAuctionPage />} />
                  <Route path="/assets" element={<AssetListPage />} />
                  <Route path="/assets/:id" element={<AssetDetailPage />} />
                </Route>

                {/* --- USER PROTECTED ROUTES --- */}
                <Route element={<Layout />}>
                  <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/documents" element={<DocumentsPage />} />
                    <Route path="/auction-history" element={<AuctionHistoryPage />} />

                    {/* Payment Flow */}
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/payment-success" element={<PaymentSuccessPage />} />
                    <Route path="/payment-success" element={<PaymentSuccessPage />} />
                    <Route path="/payment-failure" element={<PaymentFailurePage />} />
                    <Route path="/live/:sessionId" element={<AuctionRoomPage />} />
                    <Route path="/auction/live/:sessionPlateId" element={<LiveAuctionPage />} />
                  </Route>
                </Route>

                {/* --- ADMIN PROTECTED ROUTES --- */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<UserManagementPage />} />
                    <Route path="payments" element={<PaymentManagementPage />} />
                    <Route path="deposits" element={<DepositManagementPage />} />
                    <Route path="sessions" element={<SessionManagementPage />} />
                    <Route path="products" element={<ProductManagementPage />} />
                    <Route path="settings" element={<div className="p-4">Settings Prototype</div>} />
                  </Route>
                </Route>

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
