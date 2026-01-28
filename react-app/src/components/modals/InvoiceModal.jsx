import React from 'react';
import { X, Download, FileText, Check, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function InvoiceModal({ isOpen, onClose, data }) {
    const { user } = useAuth();

    if (!isOpen || !data) return null;

    const statusConfig = {
        success: { text: 'Đã thanh toán', class: 'bg-green-100 text-green-700' },
        verified: { text: 'Đã xác nhận', class: 'bg-teal-100 text-teal-700' },
        won_paid: { text: 'Đã thanh toán', class: 'bg-green-100 text-green-700' },
        pending: { text: 'Chờ thanh toán', class: 'bg-yellow-100 text-yellow-700' },
        default: { text: 'Không xác định', class: 'bg-gray-100 text-gray-600' }
    };

    const status = statusConfig[data.status] || statusConfig.default;
    const formattedDate = new Date(data.date).toLocaleDateString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });

    const handleDownload = () => {
        // Mock download
        alert('Đang tải xuống hóa đơn PDF...');
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#AA8C3C] to-[#8B7530] px-8 py-6 text-white shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                                <FileText className="w-6 h-6" />
                                Chi Tiết Hóa Đơn
                            </h2>
                            <p className="text-blue-100 text-sm opacity-90">Mã đơn: {data.id}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {/* Invoice Info */}
                    <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Ngày tạo</p>
                            <p className="font-semibold text-gray-900">{formattedDate !== 'Invalid Date' ? formattedDate : data.date}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${status.class}`}>
                                {status.text}
                            </span>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin khách hàng</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Họ và tên</p>
                                <p className="font-semibold text-gray-900">{user?.name || 'Khách vãng lai'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                                <p className="font-mono text-sm font-semibold text-gray-900">{user?.phone || 'Unknown'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Chi tiết thanh toán</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">

                            {/* Item Row */}
                            <div className="flex justify-between items-start pb-3 border-b border-gray-200">
                                <div>
                                    <span className="block font-bold text-gray-800 text-lg mb-1">{data.plateNumber}</span>
                                    <span className="text-sm text-gray-500">{data.province || 'Toàn quốc'} • {data.type}</span>
                                </div>
                                <span className="font-bold text-[#AA8C3C] text-lg">
                                    {Number(data.amount).toLocaleString('vi-VN')} đ
                                </span>
                            </div>

                            {/* Total */}
                            <div className="pt-2 flex items-center justify-between">
                                <span className="text-lg font-bold text-gray-900">Tổng thanh toán</span>
                                <span className="text-2xl font-black text-[#AA8C3C]">
                                    {Number(data.amount).toLocaleString('vi-VN')} đ
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-600 mb-1">Phương thức thanh toán</p>
                                <p className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600" />
                                    Chuyển khoản / QR
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Mã tham chiếu</p>
                                <p className="font-mono font-semibold text-gray-900">{data.transactionRef || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex gap-3 shrink-0">
                    <button
                        onClick={handleDownload}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#AA8C3C] to-[#8B7530] hover:from-[#8B7530] hover:to-[#7A6328] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform transition hover:scale-105 flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        <span>Tải Hóa Đơn (PDF)</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
