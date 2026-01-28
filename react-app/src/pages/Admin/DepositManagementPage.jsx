import { useState, useEffect } from 'react';
import axios from '@/services/axiosInstance';
import { toast } from 'react-hot-toast';
// import DashboardLayout from '@/components/layout/DashboardLayout'; // Removed unused import causing error

export default function DepositManagementPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/payments?type=DEPOSIT&status=${filter === 'ALL' ? '' : filter}`);
            if (res.data.success) {
                setPayments(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
            // toast.error('Không thể tải danh sách thanh toán');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [filter]);

    const handleApprove = async (id) => {
        if (!window.confirm('Xác nhận duyệt thanh toán này?')) return;
        try {
            const res = await axios.put(`/payments/${id}/approve`);
            if (res.data.success) {
                toast.success('Đã duyệt thanh toán');
                fetchPayments();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi duyệt');
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt('Nhập lý do từ chối:');
        if (reason === null) return; // Cancelled
        try {
            const res = await axios.put(`/payments/${id}/reject`, { reason });
            if (res.data.success) {
                toast.success('Đã từ chối thanh toán');
                fetchPayments();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi từ chối');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý đặt cọc</h1>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {['PENDING', 'COMPLETED', 'FAILED', 'ALL'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${filter === status
                            ? 'bg-[#AA8C3C] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {status === 'ALL' ? 'Tất cả' : status === 'PENDING' ? 'Chờ duyệt' : status === 'COMPLETED' ? 'Đã duyệt' : 'Từ chối'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-10">Đang tải...</div>
            ) : (
                <div className="space-y-4">
                    {payments.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">Không có dữ liệu</div>
                    ) : (
                        payments.map(payment => (
                            <div key={payment._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                                {/* Proof Image */}
                                <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative group">
                                    {payment.proofImage ? (
                                        <a href={payment.proofImage} target="_blank" rel="noopener noreferrer">
                                            <img src={payment.proofImage} alt="Proof" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">Phóng to</div>
                                        </a>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                                            Không có ảnh minh chứng
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                        <h3 className="font-bold text-lg text-gray-900">
                                            {payment.user?.fullName} <span className="text-gray-400 text-sm font-normal">| {payment.user?.email || payment.user?.phone}</span>
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                            payment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {payment.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600 mb-4">
                                        <div>Biển số: <span className="font-medium text-gray-900">{payment.registration?.sessionId?.plateNumber}</span></div>
                                        <div>Mã GD: <span className="font-medium text-gray-900 font-mono bg-gray-100 px-1 rounded">{payment.transactionCode}</span></div>
                                        <div>Số tiền: <span className="font-bold text-[#AA8C3C]">{payment.totalAmount?.toLocaleString()} VNĐ</span></div>
                                        <div>Ngày tạo: <span>{new Date(payment.createdAt).toLocaleString('vi-VN')}</span></div>
                                    </div>

                                    {/* Actions */}
                                    {payment.status === 'PENDING' && (
                                        <div className="flex gap-3 mt-2">
                                            <button
                                                onClick={() => handleApprove(payment._id)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors shadow-sm"
                                            >
                                                Duyệt thanh toán
                                            </button>
                                            <button
                                                onClick={() => handleReject(payment._id)}
                                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold text-sm hover:bg-red-200 transition-colors"
                                            >
                                                Từ chối
                                            </button>
                                        </div>
                                    )}
                                    {payment.adminNotes && (
                                        <div className="mt-2 text-xs text-gray-500 italic border-l-2 border-gray-300 pl-2">
                                            Note: {payment.adminNotes}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
