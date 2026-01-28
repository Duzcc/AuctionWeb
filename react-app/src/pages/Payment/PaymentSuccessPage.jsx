import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Info, History, Gavel } from 'lucide-react';

export default function PaymentSuccessPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get state from navigation or default to mock data
    const { orderCode, timestamp } = location.state || {
        orderCode: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        timestamp: new Date().toLocaleString('vi-VN')
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#F8F9FD] relative overflow-hidden flex items-center justify-center px-4 py-12">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[#AA8C3C]/10 to-blue-100/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#AA8C3C]/5 to-blue-50/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            {/* Main Success Card */}
            <div className="max-w-xl w-full bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-3xl p-8 md:p-12 text-center relative z-10 animate-in fade-in zoom-in-95 duration-500">
                {/* Decorative Top Highlight */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#AA8C3C] to-transparent opacity-50" />

                {/* Animated Success Icon */}
                <div className="mb-10 relative inline-block">
                    <div className="absolute inset-0 bg-[#AA8C3C]/20 rounded-full blur-xl animate-pulse" />
                    <div className="w-28 h-28 bg-gradient-to-br from-[#AA8C3C] to-[#8B7530] rounded-full flex items-center justify-center mx-auto shadow-2xl relative z-10 ring-8 ring-white/50 animate-[bounce-slow_3s_infinite]">
                        <Check className="w-14 h-14 text-white stroke-[3] drop-shadow-md" />
                    </div>
                    {/* Floating confetti dots */}
                    <div className="absolute top-0 right-0 w-3 h-3 bg-blue-400 rounded-full animate-ping [animation-delay:0.2s]" />
                    <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#AA8C3C] rounded-full animate-ping [animation-delay:0.5s]" />
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 mb-4 tracking-tight">
                    Thanh toán thành công!
                </h1>
                <p className="text-lg text-gray-500 mb-10 font-medium leading-relaxed">
                    Chúc mừng bạn! Giao dịch đã hoàn tất và<br />đơn hàng của bạn đã được xác nhận.
                </p>

                {/* Order Details Ticket */}
                <div className="bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl p-6 mb-10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-white/50 to-blue-50/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                    <div className="grid grid-cols-2 gap-8 relative z-10">
                        <div className="text-left border-r border-gray-200/60">
                            <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2">Mã Đơn Hàng</p>
                            <p className="font-mono font-bold text-gray-900 text-lg tracking-wider">{orderCode}</p>
                        </div>
                        <div className="text-left pl-2">
                            <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2">Thời Gian</p>
                            <p className="font-semibold text-gray-900 text-lg">{timestamp}</p>
                        </div>
                    </div>
                </div>

                {/* Next Steps Guide */}
                <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-100 rounded-xl p-5 mb-10 text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Info size={80} />
                    </div>
                    <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                        <Info className="w-5 h-5 text-blue-600" />
                        Bước tiếp theo
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#AA8C3C] mt-2 shrink-0" />
                            <span>Hệ thống đã gửi email xác nhận chi tiết đến hộp thư của bạn.</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#AA8C3C] mt-2 shrink-0" />
                            <span>Bạn có thể theo dõi tiến độ xử lý tại trang Lịch sử đấu giá.</span>
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate('/auction-history')}
                        className="flex-1 group relative overflow-hidden bg-gradient-to-r from-[#AA8C3C] to-[#8B7530] text-white py-4 rounded-xl font-bold shadow-[0_10px_20px_-10px_rgba(170,140,60,0.5)] transition-all hover:shadow-[0_20px_40px_-15px_rgba(170,140,60,0.6)] hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 transform" />
                        <div className="relative flex items-center justify-center gap-2">
                            <History className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span>Lịch Sử Đơn Hàng</span>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 bg-white border border-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all flex items-center justify-center gap-2 group"
                    >
                        <Gavel className="w-5 h-5 group-hover:scale-110 transition-transform text-[#AA8C3C]" />
                        <span>Tiếp Tục Đấu Giá</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
