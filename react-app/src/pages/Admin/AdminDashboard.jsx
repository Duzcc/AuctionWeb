import { Link } from 'react-router-dom';
import { Users, DollarSign, Gavel, FileText, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from '@/services/axiosInstance';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        revenue: 0,
        activeSessions: 0,
        pendingDeposits: 0
    });

    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/admin/stats');
                if (res.data.success) {
                    setStats(res.data.data);
                    setRecentActivity(res.data.data.recentActivity);
                }
            } catch (error) {
                console.error("Error fetching admin stats", error);
                // toast.error("Không tải được thống kê");
            }
        };
        fetchStats();
    }, []);

    // Helper to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
                <p className="text-gray-500">Chào mừng trở lại, Admin!</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
                    <div>
                        <h3 className="text-gray-500 text-sm font-semibold">Tổng User</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{stats.users.toLocaleString()}</p>
                        <span className="text-sm text-green-500 flex items-center mt-2">+12% <span className="text-gray-400 ml-1">tháng này</span></span>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
                    <div>
                        <h3 className="text-gray-500 text-sm font-semibold">Doanh thu</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(stats.revenue)}</p>
                        <span className="text-sm text-green-500 flex items-center mt-2">+5.4% <span className="text-gray-400 ml-1">tháng này</span></span>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
                    <div>
                        <h3 className="text-gray-500 text-sm font-semibold">Phiên đấu giá</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{stats.activeSessions}</p>
                        <span className="text-sm text-yellow-600 flex items-center mt-2">Active</span>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                        <Gavel className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
                    <div>
                        <h3 className="text-gray-500 text-sm font-semibold">Cọc chờ duyệt</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pendingDeposits}</p>
                        <span className="text-sm text-red-500 flex items-center mt-2">Cần xử lý</span>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg text-red-600">
                        <FileText className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Quick Actions & Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Truy cập nhanh</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/admin/sessions" className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200 group">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                                <Gavel className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Quản lý Phiên</h4>
                                <p className="text-xs text-gray-500">Tạo, sửa & chốt phiên</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition" />
                        </Link>

                        <Link to="/admin/deposits" className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200 group">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white transition">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Duyệt cọc</h4>
                                <p className="text-xs text-gray-500">Xác nhận thanh toán</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition" />
                        </Link>

                        <button className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200 group text-left">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Người dùng</h4>
                                <p className="text-xs text-gray-500">Quản lý tài khoản</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition" />
                        </button>

                        <button className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200 group text-left">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Báo cáo</h4>
                                <p className="text-xs text-gray-500">Xuất báo cáo tuần</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition" />
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Hoạt động gần đây</h3>
                    <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                            <p className="text-gray-500 italic text-sm">Chưa có hoạt động nào</p>
                        ) : (
                            recentActivity.map((item, i) => (
                                <div key={i} className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className={`w-8 h-8 rounded-full ${item.bg} flex items-center justify-center shrink-0 mt-1`}>
                                        <div className={`w-2 h-2 rounded-full ${item.color.replace('text', 'bg')}`}></div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-800 font-medium">{item.text}</p>
                                        <p className="text-xs text-gray-500">{new Date(item.time).toLocaleTimeString()} {new Date(item.time).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
