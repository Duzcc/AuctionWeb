import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { toast } from 'react-hot-toast';

const DEPOSIT_PERCENTAGE = 20;

/**
 * DepositModal Component
 * Handles deposit payment for auction registration
 */
export default function DepositModal({ auction, isOpen, onClose }) {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    toast.error('Hết hạn thanh toán đặt cọc');
                    onClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, onClose]);

    if (!auction) return null;

    const startPrice = auction.startPrice || 50000000;
    const depositAmount = Math.round(startPrice * (DEPOSIT_PERCENTAGE / 100));
    const bankInfo = {
        bankName: 'Vietcombank (VCB)',
        accountNo: '1034567890',
        accountName: 'VPA AUCTION',
        amount: depositAmount,
        description: `DATCOC ${auction.id || 'AUCTION'}`
    };

    const qrCodeURL = `https://img.vietqr.io/image/VCB-1034567890-compact2.png?amount=${depositAmount}&addInfo=${encodeURIComponent(bankInfo.description)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`Đã sao chép ${label}`);
    };

    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setUploadedFile(file);
        }
    };

    const handleSubmit = () => {
        if (!uploadedFile) {
            toast.error('Vui lòng upload ảnh minh chứng');
            return;
        }

        toast.success('Đã gửi minh chứng thanh toán thành công!');
        setTimeout(() => {
            setUploadedFile(null);
            onClose();
        }, 1500);
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Thanh toán đặt cọc" size="large">
            <div className="space-y-6">

                {/* Auction Info */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Biển số</p>
                            <p className="text-xl font-bold text-gray-900">{auction.plateNumber}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Giá khởi điểm</p>
                            <p className="text-xl font-bold text-[#AA8C3C]">{startPrice.toLocaleString('vi-VN')} VNĐ</p>
                        </div>
                    </div>
                </div>

                {/* Countdown Timer */}
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                    <div className="flex items-center justify-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <div>
                            <p className="text-sm text-gray-700">Thời gian còn lại</p>
                            <p className="text-2xl font-bold text-red-600">
                                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* QR Code */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-3">Quét mã QR để thanh toán</h3>
                        <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                            <img
                                src={qrCodeURL}
                                alt="QR Code"
                                className="w-full h-auto"
                            />
                        </div>
                    </div>

                    {/* Bank Info */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-3">Thông tin chuyển khoản</h3>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 space-y-3">

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Ngân hàng:</span>
                                <span className="font-semibold text-gray-900">{bankInfo.bankName}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Số TK:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-gray-900">{bankInfo.accountNo}</span>
                                    <button
                                        onClick={() => copyToClipboard(bankInfo.accountNo, 'Số tài khoản')}
                                        className="p-1.5 hover:bg-white/50 rounded"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#AA8C3C]">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Chủ TK:</span>
                                <span className="font-semibold text-gray-900">{bankInfo.accountName}</span>
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t border-blue-200">
                                <span className="text-sm text-gray-700">Số tiền:</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-black text-[#AA8C3C]">
                                        {depositAmount.toLocaleString('vi-VN')}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(depositAmount.toString(), 'Số tiền')}
                                        className="p-1.5 hover:bg-white/50 rounded"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#AA8C3C]">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-start pt-3">
                                <span className="text-sm text-gray-700">Nội dung:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-gray-900">{bankInfo.description}</span>
                                    <button
                                        onClick={() => copyToClipboard(bankInfo.description, 'Nội dung')}
                                        className="p-1.5 hover:bg-white/50 rounded"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#AA8C3C]">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 mt-3">
                                <p className="text-sm text-amber-800">
                                    💰 Tiền đặt cọc = {DEPOSIT_PERCENTAGE}% giá khởi điểm
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload Proof */}
                <div className="border-t pt-6">
                    <h3 className="font-bold text-gray-900 mb-3">Upload minh chứng thanh toán</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#AA8C3C] transition-all cursor-pointer text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-gray-400">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                <p className="text-gray-700 font-medium">
                                    {uploadedFile ? uploadedFile.name : 'Chọn ảnh minh chứng'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG tối đa 5MB</p>
                            </label>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!uploadedFile}
                            className="w-full px-6 py-3 bg-gradient-to-r from-[#AA8C3C] to-[#8B7530] text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            Gửi minh chứng
                        </button>
                    </div>
                </div>

                {/* Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 shrink-0">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Chuyển khoản chính xác số tiền</li>
                                <li>Ghi đúng nội dung chuyển khoản</li>
                                <li>Upload ảnh minh chứng rõ ràng</li>
                                <li>Hoàn tất trong thời gian quy định</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
