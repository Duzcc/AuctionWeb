import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { toast } from 'react-hot-toast';

/**
 * BiddingInterface Component
 * Real-time bidding interface for live auctions
 */
export default function BiddingInterface({ auction, isOpen, onClose }) {
    const [customBid, setCustomBid] = useState('');
    const [showAutoBid, setShowAutoBid] = useState(false);
    const [autoBidMax, setAutoBidMax] = useState('');
    const [autoBidEnabled, setAutoBidEnabled] = useState(false);
    const [bidHistory] = useState([
        { id: 1, userName: 'Nguyễn Văn A', amount: 50000000, time: new Date(), isWinning: false },
        { id: 2, userName: 'Bạn', amount: 55000000, time: new Date(), isWinning: true },
    ]);

    if (!auction) return null;

    const currentBid = auction.currentBid || auction.startPrice;
    const minIncrement = 1000000; // 1 million VND
    const suggestedBid = currentBid + minIncrement;

    const handleQuickBid = (amount) => {
        toast.success(`Đặt giá: ${amount.toLocaleString('vi-VN')} VNĐ`);
        // In real app: call API to place bid
        onClose();
    };

    const handleCustomBid = () => {
        const bidAmount = parseInt(customBid.replace(/\D/g, ''));
        if (!bidAmount || bidAmount < suggestedBid) {
            toast.error(`Giá đặt tối thiểu: ${suggestedBid.toLocaleString('vi-VN')} VNĐ`);
            return;
        }
        handleQuickBid(bidAmount);
    };

    const handleEnableAutoBid = () => {
        const maxBid = parseInt(autoBidMax.replace(/\D/g, ''));
        if (!maxBid) {
            toast.error('Vui lòng nhập giá tối đa');
            return;
        }
        setAutoBidEnabled(true);
        toast.success('Đã kích hoạt đặt giá tự động');
    };

    const formatInput = (value) => {
        const numbers = value.replace(/\D/g, '');
        return numbers ? parseInt(numbers).toLocaleString('vi-VN') : '';
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Đấu giá: ${auction.plateNumber}`} size="xl">
            <div className="space-y-6">

                {/* Current Bid Display */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Giá hiện tại</p>
                        <p className="text-4xl font-black text-[#AA8C3C]">
                            {currentBid.toLocaleString('vi-VN')} <span className="text-2xl">VNĐ</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-2">{bidHistory.length} lượt đặt giá</p>
                    </div>
                </div>

                {/* Quick Bid Buttons */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Đặt giá nhanh</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map(multiplier => {
                            const amount = currentBid + (minIncrement * multiplier);
                            return (
                                <button
                                    key={multiplier}
                                    onClick={() => handleQuickBid(amount)}
                                    className="p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 text-blue-700 font-bold rounded-lg transition-all hover:scale-105"
                                >
                                    <div className="text-lg">+{multiplier}M</div>
                                    <div className="text-xs font-normal mt-1">{amount.toLocaleString('vi-VN')}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Custom Bid */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Đặt giá tùy chỉnh</label>
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={customBid}
                                onChange={(e) => setCustomBid(formatInput(e.target.value))}
                                className="w-full px-4  py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] outline-none font-bold text-lg"
                                placeholder={suggestedBid.toLocaleString('vi-VN')}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">VNĐ</span>
                        </div>
                        <button
                            onClick={handleCustomBid}
                            className="px-6 py-3 bg-gradient-to-r from-[#AA8C3C] to-[#8B7530] text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        >
                            Đặt giá
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Giá tối thiểu: {suggestedBid.toLocaleString('vi-VN')} VNĐ (Bước nhảy: {minIncrement.toLocaleString('vi-VN')} VNĐ)
                    </p>
                </div>

                {/* Auto Bid */}
                <div className="border-t pt-6">
                    <button
                        onClick={() => setShowAutoBid(!showAutoBid)}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg hover:border-purple-400 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-700">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-900">Đặt giá tự động</p>
                                <p className="text-xs text-gray-600">Tự động đấu giá khi bị trả giá</p>
                            </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                            <polyline points={showAutoBid ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}></polyline>
                        </svg>
                    </button>

                    {showAutoBid && (
                        <div className="mt-3 p-4 bg-purple-50 rounded-lg space-y-3">
                            {!autoBidEnabled ? (
                                <>
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Giá tối đa bạn muốn trả
                                    </label>
                                    <input
                                        type="text"
                                        value={autoBidMax}
                                        onChange={(e) => setAutoBidMax(formatInput(e.target.value))}
                                        className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-bold"
                                        placeholder={(currentBid + minIncrement * 5).toLocaleString('vi-VN')}
                                    />
                                    <button
                                        onClick={handleEnableAutoBid}
                                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
                                    >
                                        Kích hoạt
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Giá tối đa:</span>
                                        <span className="font-bold text-purple-700">
                                            {parseInt(autoBidMax.replace(/\D/g, '')).toLocaleString('vi-VN')} VNĐ
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setAutoBidEnabled(false);
                                            toast.info('Đã tắt đặt giá tự động');
                                        }}
                                        className="w-full px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-colors"
                                    >
                                        Tắt đặt giá tự động
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Bid History */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Lịch sử đặt giá</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {bidHistory.map(bid => (
                            <div
                                key={bid.id}
                                className={`flex items-center justify-between p-3 rounded-lg ${bid.userName === 'Bạn' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 ${bid.userName === 'Bạn' ? 'bg-blue-200' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{bid.userName}</p>
                                        <p className="text-xs text-gray-500">{bid.time.toLocaleTimeString('vi-VN')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${bid.isWinning ? 'text-green-700' : 'text-gray-700'}`}>
                                        {bid.amount.toLocaleString('vi-VN')} VNĐ
                                    </p>
                                    {bid.isWinning && <span className="text-xs text-green-600 font-semibold">Đang thắng</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
