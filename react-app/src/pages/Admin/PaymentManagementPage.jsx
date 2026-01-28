import { useState, useEffect } from 'react';
import axios from '@/services/axiosInstance';
import { toast } from 'react-hot-toast';
import { Check, X, Eye, Search, Filter } from 'lucide-react';

export default function PaymentManagementPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING'); // PENDING, COMPLETED, REJECTED, ALL
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchPayments();
    }, [filter]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/payments`); // Get all payments
            if (res.data.success) {
                let filtered = res.data.data;

                // Filter by status
                if (filter !== 'ALL') {
                    filtered = filtered.filter(p => p.status === filter);
                }

                // Filter deposits only
                filtered = filtered.filter(p =>
                    p.type === 'DEPOSIT' || p.type === 'auction_payment' || p.type === 'AUCTION_PAYMENT'
                );

                setPayments(filtered);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Không thể tải danh sách thanh toán');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (paymentId) => {
        if (!confirm('Xác nhận duyệt thanh toán này?')) return;

        try {
            const res = await axios.put(`/admin/payments/${paymentId}/approve`);
            if (res.data.success) {
                toast.success('Đã duyệt thanh toán');
                fetchPayments();
            }
        } catch (error) {
            console.error('Error approving payment:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi duyệt thanh toán');
        }
    };

    const handleReject = async (paymentId) => {
        const reason = prompt('Nhập lý do từ chối:');
        if (!reason) return;

        try {
            const res = await axios.put(`/admin/payments/${paymentId}/reject`, { reason });
            if (res.data.success) {
                toast.success('Đã từ chối thanh toán');
                fetchPayments();
            }
        } catch (error) {
            console.error('Error rejecting payment:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi từ chối thanh toán');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            COMPLETED: 'bg-green-100 text-green-800 border-green-200',
            REJECTED: 'bg-red-100 text-red-800 border-red-200'
        };
        const labels = {
            PENDING: 'Chờ duyệt',
            COMPLETED: 'Đã duyệt',
            REJECTED: 'Đã từ chối'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const filteredPayments = payments.filter(p =>
        searchQuery === '' ||
        p.transactionCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý thanh  toán</h1>
                    <p className="text-gray-500">Duyệt và quản lý các giao dịch cọc</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm theo mã GD hoặc tên người dùng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#AA8C3C] focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2">
                        {['ALL', 'PENDING', 'COMPLETED', 'REJECTED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                        ? 'bg-[#AA8C3C] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status === 'ALL' ? 'Tất cả' : status === 'PENDING' ? 'Chờ duyệt' : status === 'COMPLETED' ? 'Đã duyệt' : 'Đã từ chối'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AA8C3C] mx-auto"></div>
                        <p className="mt-4 text-gray-500">Đang tải...</p>
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">Không có thanh toán nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mã GD</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Người dùng</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Số tiền</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Chứng từ</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredPayments.map(payment => (
                                    <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm font-semibold text-gray-900">{payment.transactionCode}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{payment.user?.fullName || payment.user?.username || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-gray-900">{payment.totalAmount?.toLocaleString()} đ</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {payment.proofImage ? (
                                                <button
                                                    onClick={() => setSelectedImage(payment.proofImage)}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Xem
                                                </button>
                                            ) : (
                                                <span className="text-sm text-gray-400">Không có</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {payment.status === 'PENDING' ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(payment._id)}
                                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                        title="Duyệt"
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(payment._id)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Từ chối"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="max-w-4xl max-h-[90vh] relative">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Proof of payment"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
