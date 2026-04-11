import { lazy, Suspense } from 'react';
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

// ── Eager imports (critical path) ─────────────────────
import HomePage from './pages/Home/HomePage';
import AboutPage from './pages/About/AboutPage';
import NewsPage from './pages/News/NewsPage';
import NewsDetailPage from './pages/News/NewsDetailPage';
import CarAuctionPage from './pages/Auction/CarAuctionPage';
import MotorbikeAuctionPage from './pages/Auction/MotorbikeAuctionPage';
import AssetListPage from './pages/Assets/AssetListPage';
import AssetDetailPage from './pages/Assets/AssetDetailPage';
import LoginPage from './pages/Auth/LoginPage';
import VerifyEmailPage from './pages/Auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';

// ── Lazy imports (code splitting) ─────────────────────
const AuctionHistoryPage = lazy(() => import('./pages/Auction/AuctionHistoryPage'));
const AuctionRoomPage = lazy(() => import('./pages/Auction/AuctionRoomPage'));
const RoomLobby = lazy(() => import('./pages/Auction/RoomLobby'));
const CartPage = lazy(() => import('./pages/Payment/CartPage'));
const CheckoutPage = lazy(() => import('./pages/Payment/CheckoutPage'));
const PaymentPage = lazy(() => import('./pages/Payment/PaymentPage'));
const PaymentSuccessPage = lazy(() => import('./pages/Payment/PaymentSuccessPage'));
const PaymentFailurePage = lazy(() => import('./pages/Payment/PaymentFailurePage'));
const ProfilePage = lazy(() => import('./pages/User/ProfilePage'));
const DocumentsPage = lazy(() => import('./pages/User/DocumentsPage'));
const WalletPage = lazy(() => import('./pages/Payment/WalletPage'));
const NotificationsPage = lazy(() => import('./pages/User/NotificationsPage'));

// ── Admin — lazy (chỉ admin mới dùng) ────────────────
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const DepositManagementPage = lazy(() => import('./pages/Admin/DepositManagementPage'));
const SessionManagementPage = lazy(() => import('./pages/Admin/SessionManagementPage'));
const PaymentManagementPage = lazy(() => import('./pages/Admin/PaymentManagementPage'));
const UserManagementPage = lazy(() => import('./pages/Admin/UserManagementPage'));
const ProductManagementPage = lazy(() => import('./pages/Admin/ProductManagementPage'));

// ── Suspense fallback chung ───────────────────────────
const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF9F6' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #AA8C3C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
      <p style={{ color: '#9CA3AF', fontSize: 14 }}>Đang tải...</p>
    </div>
  </div>
);

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
              <Suspense fallback={<PageLoader />}>
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
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/wallet" element={<WalletPage />} />

                      {/* Auction Flow */}
                      <Route path="/lobby/:sessionId" element={<RoomLobby />} />
                      <Route path="/live/:sessionId" element={<AuctionRoomPage />} />
                      {/* Fix Route redirect bug */}
                      <Route path="/auction/live/:sessionId" element={<AuctionRoomPage />} />

                      {/* Payment Flow */}
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/payment" element={<PaymentPage />} />
                      <Route path="/payment-success" element={<PaymentSuccessPage />} />
                      <Route path="/payment-failure" element={<PaymentFailurePage />} />
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
              </Suspense>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
