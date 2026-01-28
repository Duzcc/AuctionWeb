import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Phone, Bell, ChevronDown } from 'lucide-react';

export default function Header() {
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const { cartItems } = useCart();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [currentDate, setCurrentDate] = useState('');

    // Get current page
    const getCurrentPage = () => {
        const path = location.pathname.split('/')[1] || 'home';
        return path === '' ? 'home' : path;
    };

    const activePage = getCurrentPage();

    // Format current date for ticker
    useEffect(() => {
        const date = new Date();
        const formatted = `${String(date.getDate()).padStart(2, '0')}/${String(
            date.getMonth() + 1
        ).padStart(2, '0')}/${date.getFullYear()}`;
        setCurrentDate(formatted);
    }, []);

    // Handle scroll for sticky nav
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close user menu when route changes
    useEffect(() => {
        setUserMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
    };

    const navClass = (page) =>
        `cursor-pointer hover:text-[#AA8C3C] transition-all ${activePage === page ? 'text-[#AA8C3C] font-bold' : 'text-gray-700'
        }`;

    return (
        <header className="w-full">
            {/* Top Ticker Bar */}
            <div className="bg-[#1a1a1a] text-white text-xs py-2 px-6 flex justify-between items-center">
                <div className="overflow-hidden w-full max-w-5xl whitespace-nowrap">
                    <div className="inline-block animate-marquee pl-4">
                        <span className="inline-block pr-8">
                            Biển số nổi bật ngày {currentDate}: 22A-123.45, 68AA-888.88, 49AA-888.88,
                            47AD-444.44, 74H-024.68, 22H-024.68, 29E-444.40, 29E-433.33, 29E-444.47, 29E-411.11.
                        </span>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 font-bold ml-4 whitespace-nowrap bg-[#AA8C3C] text-white px-3 py-1 rounded-full">
                    <Phone className="w-3.5 h-3.5" fill="#fff" />
                    <span>1900.8888.88</span>
                </div>
            </div>

            {/* Main Navigation */}
            <div
                className={`bg-white shadow-sm sticky top-0 z-50 transition-shadow ${isScrolled ? 'shadow-md' : ''
                    }`}
            >
                <div className="max-w-full mx-auto px-4 lg:px-10 h-20 flex items-center justify-between relative">
                    {/* Logo */}
                    <div className="relative flex items-center justify-start flex-shrink-0">
                        <Link to="/" className="cursor-pointer">
                            <img
                                src="/assets/logo/logo_textgold1.png"
                                alt="Logo NPA"
                                className="h-11 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="flex flex-1 justify-center items-center gap-8 font-semibold text-gray-700 whitespace-nowrap text-[18px]">
                        <Link to="/" className={navClass('home')}>
                            Trang chủ
                        </Link>
                        <Link to="/car-auction" className={navClass('car-auction')}>
                            Đấu giá biển số ô tô
                        </Link>
                        <Link to="/motorbike-auction" className={navClass('motorbike-auction')}>
                            Đấu giá biển số xe máy
                        </Link>
                        <Link to="/assets" className={navClass('assets')}>
                            Đấu giá tài sản khác
                        </Link>

                        {/* News Dropdown */}
                        <div className="relative group">
                            <span className={navClass('news')}>Tin tức</span>
                            {/* Dropdown menu */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                <ul className="py-2 text-sm text-gray-700">
                                    <li className="px-5 py-3 hover:text-[#AA8C3C] cursor-pointer">
                                        <Link to="/news?tab=news">Tin tức</Link>
                                    </li>
                                    <li className="px-5 py-3 hover:text-[#AA8C3C] cursor-pointer">
                                        <Link to="/news?tab=notif">Thông báo</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>

                    {/* Desktop User Section */}
                    <div className="flex w-[20%] justify-end items-center flex-shrink-0">
                        <div className="flex items-center gap-4">
                            {/* Icons Group */}
                            {isAuthenticated && (
                                <div className="flex items-center gap-5 mr-4 border-r border-gray-200 pr-4">
                                    {/* Notification */}
                                    <button className="relative group">
                                        <Bell className="w-6 h-6 text-gray-700 hover:text-[#AA8C3C] transition-colors" />
                                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white transform translate-x-1/2 -translate-y-1/2 hidden group-hover:block"></span>
                                    </button>

                                    {/* Cart */}
                                    <Link to="/cart" className="relative">
                                        <svg
                                            className="w-6 h-6 text-gray-700 hover:text-[#AA8C3C] transition-colors"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="2"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        {cartItems.length > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                                                {cartItems.length}
                                            </span>
                                        )}
                                    </Link>
                                </div>
                            )}

                            {/* User Menu */}
                            {isAuthenticated ? (
                                <div className="relative" id="user-menu-container">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full bg-[#D4AF37] hover:bg-[#C5A028] transition-all shadow-md group"
                                    >
                                        {/* Avatar Circle */}
                                        <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white font-bold text-lg shadow-inner backdrop-blur-sm">
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                (user?.fullName || user?.email || 'U').charAt(0).toUpperCase()
                                            )}
                                        </div>

                                        {/* Name & Subtitle */}
                                        <div className="flex flex-col items-start min-w-[80px]">
                                            <span className="font-bold text-white text-sm leading-tight text-shadow-sm">
                                                {/* Truncate name if too long */}
                                                {(user?.fullName || user?.name || user?.email || 'User').split(' ')[0]}
                                            </span>
                                            <span className="text-[11px] text-white/90 font-medium tracking-wide">
                                                Tài khoản
                                            </span>
                                        </div>

                                        {/* Chevron */}
                                        <ChevronDown className={`w-4 h-4 text-white/90 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-scaleIn origin-top-right">
                                            {/* Header in Dropdown */}
                                            <div className="bg-[#FAF9F6] px-5 py-4 border-b border-gray-100">
                                                <p className="font-bold text-gray-900 truncate">{user?.fullName || user?.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                            </div>

                                            <ul className="py-2">
                                                <li>
                                                    <Link
                                                        to="/profile"
                                                        className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#AA8C3C] transition-colors"
                                                        onClick={() => setUserMenuOpen(false)}
                                                    >
                                                        Thông tin cá nhân
                                                    </Link>
                                                </li>
                                                {user?.role === 'admin' && (
                                                    <li>
                                                        <Link
                                                            to="/admin/dashboard"
                                                            className="block px-5 py-3 text-sm font-semibold text-[#AA8C3C] hover:bg-gray-50 hover:text-[#8B7530] transition-colors"
                                                            onClick={() => setUserMenuOpen(false)}
                                                        >
                                                            Dashboard Quản trị
                                                        </Link>
                                                    </li>
                                                )}
                                                <li>
                                                    <Link
                                                        to="/auction-history"
                                                        className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#AA8C3C] transition-colors"
                                                        onClick={() => setUserMenuOpen(false)}
                                                    >
                                                        Lịch sử đấu giá
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        to="/documents"
                                                        className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#AA8C3C] transition-colors"
                                                        onClick={() => setUserMenuOpen(false)}
                                                    >
                                                        Hồ sơ của tôi
                                                    </Link>
                                                </li>
                                                <li className="border-t border-gray-100 mt-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex w-full items-center px-5 py-4 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        Đăng xuất
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="px-6 py-2 bg-gradient-to-r from-[#AA8C3C] to-[#8B7530] text-white font-bold rounded-lg hover:shadow-lg transition-all"
                                >
                                    Đăng nhập
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
