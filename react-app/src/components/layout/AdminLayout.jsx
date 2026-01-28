import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    Settings,
    LogOut,
    Bell,
    Search
} from 'lucide-react';

export default function AdminLayout() {
    const { logout, user } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#1a1c23] text-white flex flex-col fixed h-full z-30">
                <div className="p-6 border-b border-gray-700">
                    <h1 className="text-2xl font-bold text-[#AA8C3C]">PrMINDX Admin</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <Link
                        to="/admin/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/dashboard') ? 'bg-[#AA8C3C] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        to="/admin/users"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/users') ? 'bg-[#AA8C3C] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <Users size={20} />
                        <span>Quản lý User</span>
                    </Link>

                    <Link
                        to="/admin/products"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/products') ? 'bg-[#AA8C3C] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <ShoppingBag size={20} />
                        <span>Sản phẩm</span>
                    </Link>

                    <Link
                        to="/admin/settings"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/settings') ? 'bg-[#AA8C3C] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <Settings size={20} />
                        <span>Cài đặt</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src={user?.avatar || "https://ui-avatars.com/api/?name=Admin"}
                                alt="Admin"
                                className="w-10 h-10 rounded-full bg-gray-600"
                            />
                            <div>
                                <p className="text-sm font-semibold">{user?.username || 'Admin'}</p>
                                <p className="text-xs text-xs text-gray-500">System Admin</p>
                            </div>
                        </div>
                        <button onClick={logout} className="text-gray-400 hover:text-red-400 transition-colors" title="Đăng xuất">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 capitalize">
                        {location.pathname.split('/').pop()}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C]/50"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </header>

                <Outlet />
            </main>
        </div>
    );
}
