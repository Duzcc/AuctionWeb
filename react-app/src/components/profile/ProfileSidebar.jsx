import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ShoppingCart, Gavel } from 'lucide-react';

export default function ProfileSidebar() {
    const location = useLocation();

    // Determine active path more loosely to handle sub-routes if any
    const isActive = (path) => location.pathname.startsWith(path);

    const menuItems = [
        {
            id: 'profile',
            icon: User,
            label: 'Thông tin tài khoản',
            subtitle: 'Xem và chỉnh sửa hồ sơ',
            path: '/profile'
        },
        {
            id: 'cart',
            icon: ShoppingCart,
            label: 'Giỏ hàng',
            subtitle: 'Quản lý giỏ hàng',
            path: '/cart'
        },
        {
            id: 'auction-history',
            icon: Gavel,
            label: 'Lịch sử đấu giá',
            subtitle: 'Xem hoạt động đấu giá',
            path: '/auction-history'
        }
    ];

    return (
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-4 sticky top-24">
            <nav className="space-y-2">
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`
                                flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden
                                ${active
                                    ? 'bg-gradient-to-r from-[#AA8C3C] to-[#8B7530] text-white shadow-lg shadow-[#AA8C3C]/30 translate-x-1'
                                    : 'text-gray-600 hover:bg-blue-50/50 hover:text-[#AA8C3C] hover:shadow-sm'
                                }
                            `}
                        >
                            {/* Hover Highlight Effect */}
                            <div className={`absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${active ? 'hidden' : 'block'}`} />

                            <item.icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="font-semibold tracking-wide">{item.label}</span>

                            {active && (
                                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-sm" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Decorative bottom element */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400 font-medium">© 2025 NPA Auction</p>
                <div className="mt-2 h-1 w-12 mx-auto bg-gradient-to-r from-transparent via-[#AA8C3C]/30 to-transparent rounded-full" />
            </div>
        </div>
    );
}
