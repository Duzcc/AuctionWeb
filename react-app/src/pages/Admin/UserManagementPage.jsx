import { useState, useEffect } from 'react';
import axios from '@/services/axiosInstance';
import { toast } from 'react-hot-toast';
import { Search, UserX, UserCheck, Shield, User } from 'lucide-react';

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });

    useEffect(() => {
        fetchUsers();
    }, [pagination.currentPage, roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/admin/users`, {
                params: {
                    page: pagination.currentPage,
                    limit: 20,
                    search: searchQuery,
                    role: roleFilter
                }
            });
            if (res.data.success) {
                setUsers(res.data.data);
                setPagination({
                    currentPage: res.data.currentPage,
                    totalPages: res.data.totalPages,
                    total: res.data.total
                });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        fetchUsers();
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        const newStatus = !currentStatus;
        const action = newStatus ? 'kích hoạt' : 'vô hiệu hóa';

        if (!confirm(`Xác nhận ${action} người dùng này?`)) return;

        try {
            const res = await axios.put(`/admin/users/${userId}/status`, {
                isActive: newStatus
            });
            if (res.data.success) {
                toast.success(`Đã ${action} người dùng`);
                fetchUsers();
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            toast.error(`Lỗi khi ${action} người dùng`);
        }
    };

    const getRoleBadge = (role) => {
        const styles = {
            admin: 'bg-red-100 text-red-800 border-red-200',
            user: 'bg-blue-100 text-blue-800 border-blue-200'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit ${styles[role] || 'bg-gray-100 text-gray-800'}`}>
                {role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                {role === 'admin' ? 'Admin' : 'User'}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
                <p className="text-gray-500">Tổng số: {pagination.total} người dùng</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Tìm theo tên, email, username..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#AA8C3C] focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 bg-[#AA8C3C] text-white rounded-lg hover:bg-[#8B7230] transition-colors font-medium"
                        >
                            Tìm
                        </button>
                    </div>

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setPagination(prev => ({ ...prev, currentPage: 1 }));
                        }}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#AA8C3C] focus:border-transparent"
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AA8C3C] mx-auto"></div>
                        <p className="mt-4 text-gray-500">Đang tải...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">Không tìm thấy người dùng nào</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tên</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Username</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {users.map(user => (
                                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-semibold text-gray-900">{user.fullName || user.username}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600">{user.email}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600">@{user.username}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getRoleBadge(user.role)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.isActive !== false ? (
                                                    <span className="px-3 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-xs font-bold">
                                                        Hoạt động
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full text-xs font-bold">
                                                        Đã khóa
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => toggleUserStatus(user._id, user.isActive !== false)}
                                                        className={`p-2 rounded-lg transition-colors ${user.isActive !== false
                                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                            }`}
                                                        title={user.isActive !== false ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                                                    >
                                                        {user.isActive !== false ? (
                                                            <UserX className="w-5 h-5" />
                                                        ) : (
                                                            <UserCheck className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                    Trang {pagination.currentPage} / {pagination.totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                        disabled={pagination.currentPage === 1}
                                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Trước
                                    </button>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
