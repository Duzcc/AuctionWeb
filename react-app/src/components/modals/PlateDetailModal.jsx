import React from 'react';
import Modal from '@/components/common/Modal';

/**
 * PlateDetailModal Component
 * Shows detailed information about an auction plate
 */
export default function PlateDetailModal({ plate, isOpen, onClose, onRegister }) {
    if (!plate) return null;

    const details = [
        { label: 'Biển số', value: plate.plateNumber, highlight: true },
        { label: 'Tỉnh/Thành', value: plate.province || 'Hà Nội' },
        { label: 'Loại xe', value: plate.type || 'Ô tô' },
        { label: 'Giá khởi điểm', value: `${(plate.startPrice || 50000000).toLocaleString('vi-VN')} VNĐ`, highlight: true },
        { label: 'Bước giá', value: `${(plate.priceStep || 1000000).toLocaleString('vi-VN')} VNĐ` },
        { label: 'Thời gian đấu giá', value: plate.auctionDate || '15/01/2025 - 10:00' },
        { label: 'Phiên đấu giá', value: plate.session || 'Phiên 1' },
        { label: 'Trạng thái', value: plate.status || 'Sắp diễn ra', status: true }
    ];

    const statusColorMap = {
        'Đang đấu giá': 'text-green-700 bg-green-100 border-green-200',
        'Sắp diễn ra': 'text-blue-700 bg-blue-100 border-blue-200',
        'Đã kết thúc': 'text-gray-700 bg-gray-100 border-gray-200'
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chi tiết biển số"
            size="large"
            footer={
                <>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                    >
                        Đóng
                    </button>
                    <button
                        onClick={() => {
                            if (onRegister) onRegister(plate);
                            onClose();
                        }}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#AA8C3C] to-[#8B7530] text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                    >
                        Đăng ký đấu giá
                    </button>
                </>
            }
        >
            <div className="space-y-6">

                {/* Plate Display */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl border-2 border-amber-200">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">Biển số đấu giá</p>
                        <div className="inline-block bg-white px-8 py-6 rounded-xl shadow-lg border-4 border-gray-800">
                            <p className="text-5xl font-black text-gray-900 tracking-wider">
                                {plate.plateNumber}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {details.map((detail, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-xl ${detail.highlight
                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200'
                                    : 'bg-gray-50 border border-gray-200'
                                }`}
                        >
                            <p className="text-sm text-gray-600 mb-1">{detail.label}</p>
                            {detail.status ? (
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${statusColorMap[detail.value] || 'text-gray-700 bg-gray-100 border-gray-200'
                                    }`}>
                                    {detail.value}
                                </span>
                            ) : (
                                <p className={`${detail.highlight ? 'text-xl' : 'text-base'} font-bold text-gray-900`}>
                                    {detail.value}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Important Notes */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 shrink-0">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <div className="text-sm text-amber-800">
                            <p className="font-semibold mb-2">Lưu ý quan trọng:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Phải đăng ký và đặt cọc trước khi tham gia đấu giá</li>
                                <li>Tiền đặt cọc = 20% giá khởi điểm</li>
                                <li>Đọc kỹ điều khoản trước khi đăng ký</li>
                                <li>Liên hệ hotline nếu cần hỗ trợ: 1900 0000</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-3">Thông tin thêm</h4>
                    <div className="text-sm text-gray-700 space-y-2">
                        <p>
                            <strong>Địa điểm:</strong> Trung tâm đấu giá VPA - {plate.province || 'Hà Nội'}
                        </p>
                        <p>
                            <strong>Hình thức:</strong> Đấu giá trực tuyến và trực tiếp
                        </p>
                        <p>
                            <strong>Thời gian mở cửa:</strong> 30 phút trước giờ đấu giá
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
