import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Check, CreditCard, ChevronDown, MapPin, Calendar, Clock, DollarSign, Lock } from 'lucide-react';


export default function CheckoutPage() {
    const navigate = useNavigate();
    const { currentOrder } = useCart();
    const { user } = useAuth();

    // Validate order exists
    if (!currentOrder || !currentOrder.items || currentOrder.items.length === 0) {
        // In real app, redirect or show empty state
        // navigate('/cart');
        // return null;
    }

    const items = currentOrder?.items || [];
    const registrationItems = items.filter(i => true); // Assume all for now

    const depositTotal = registrationItems.reduce((sum, item) => sum + (item.depositAmount || item.price * 0.1 || 0), 0);
    const totalAmount = depositTotal;

    const [isProfileComplete, setIsProfileComplete] = useState(false);

    useEffect(() => {
        if (user?.fullName && user?.phone && user?.identityNumber) {
            setIsProfileComplete(true);
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center justify-between relative">
                            {/* Line */}
                            <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -translate-y-1/2 -z-10"></div>
                            <div className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-[#AA8C3C] to-[#D4AF37] -translate-y-1/2 -z-10 transition-all duration-500 w-1/2"></div>

                            {/* Step 1: Cart */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#AA8C3C] to-[#8B7530] flex items-center justify-center shadow-xl mb-3 relative border-2 border-white">
                                    <Check className="w-6 h-6 text-white stroke-[3]" />
                                </div>
                                <span className="text-sm font-bold text-[#AA8C3C]">Giỏ hàng</span>
                            </div>

                            {/* Step 2: Confirm (Active) */}
                            <div className="flex flex-col items-center">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA8C3C] flex items-center justify-center shadow-2xl mb-3 ring-4 ring-[#AA8C3C]/20 border-2 border-white">
                                    <span className="text-white font-black text-xl">2</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">Xác nhận</span>
                            </div>

                            {/* Step 3: Payment */}
                            <div className="flex flex-col items-center opacity-60">
                                <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center shadow-md mb-3">
                                    <span className="text-gray-400 font-bold text-lg">3</span>
                                </div>
                                <span className="text-sm font-medium text-gray-500">Thanh toán</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-gray-900 mb-3 bg-gradient-to-r from-gray-900 via-[#AA8C3C] to-gray-900 bg-clip-text text-transparent">
                        Xác nhận đơn hàng
                    </h1>
                    <p className="text-gray-600 text-lg">Kiểm tra thông tin trước khi thanh toán</p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COL */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 1. User Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <CheckSquare className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-gray-800 text-lg">Thông tin người đặt</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                                    <p className="font-semibold text-gray-900">{user?.fullName || '---'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Email</p>
                                    <p className="font-semibold text-gray-900">{user?.email || '---'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                                    <p className="font-semibold text-gray-900">{user?.phone || '---'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                                    <p className="font-semibold text-gray-900">{user?.address || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Warning Card */}
                        {!isProfileComplete && (
                            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 p-6 rounded-xl shadow-md animate-pulse">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                        <Lock className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-base font-bold text-amber-900 mb-2">
                                            ⚠️ Vui lòng cập nhật đầy đủ thông tin trước khi thanh toán
                                        </p>
                                        <p className="text-sm text-amber-800 mb-4">
                                            Theo quy định, bạn cần cập nhật nốt CCCD và Địa chỉ để tham gia đấu giá.
                                        </p>
                                        <button onClick={() => navigate('/profile')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold rounded-lg transition-all text-sm shadow-md">
                                            <CheckSquare className="w-4 h-4" />
                                            Cập nhật thông tin
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Items List - Plates */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#AA8C3C] flex items-center justify-center shadow-lg">
                                    <CheckSquare className="w-7 h-7 text-white" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900">Chi tiết đơn hàng</h2>
                                <span className="ml-auto px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 text-[#8B7530] border border-amber-200 rounded-full font-bold text-sm">
                                    {items.length} mục
                                </span>
                            </div>

                            <div className="space-y-4">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#AA8C3C]/30 transition-colors">
                                        <div className="w-16 h-12 bg-white border-2 border-yellow-400 rounded flex items-center justify-center shadow-sm shrink-0">
                                            <span className="font-bold text-gray-800 text-xs">{item.plateNumber}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 text-lg">{item.plateNumber}</h4>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" /> {item.province}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" /> {item.auctionDate ? new Date(item.auctionDate).toLocaleDateString('vi-VN') : 'Sắp diễn ra'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 mb-1">Tiền cọc</p>
                                            <p className="font-bold text-[#AA8C3C] text-lg">
                                                {(item.depositAmount || item.price * 0.1 || 0).toLocaleString('vi-VN')} đ
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COL - Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <DollarSign className="w-6 h-6 text-[#AA8C3C]" />
                                Tổng quan thanh toán
                            </h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                                    <span className="text-gray-600">Số lượng biển số</span>
                                    <span className="font-bold text-gray-800">{items.length}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                                    <span className="text-gray-600">Tổng tiền cọc</span>
                                    <span className="font-bold text-gray-800">{depositTotal.toLocaleString('vi-VN')} đ</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold text-gray-800">Tổng cộng</span>
                                    <span className="text-2xl font-black text-[#AA8C3C]">{totalAmount.toLocaleString('vi-VN')} đ</span>
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="mb-6 relative group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phương thức thanh toán</label>
                                <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-[#AA8C3C] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <CreditCard className="w-5 h-5 text-[#AA8C3C]" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">Chuyển khoản QR</p>
                                            <p className="text-xs text-gray-500">Quét mã QR ngân hàng</p>
                                        </div>
                                    </div>
                                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-[#AA8C3C]" />
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/payment')}
                                disabled={!isProfileComplete}
                                className={`w-full py-4 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 mb-3
                                    ${isProfileComplete ? 'bg-gradient-to-r from-[#AA8C3C] to-[#8B7530] hover:shadow-xl hover:scale-[1.02] transition-all' : 'bg-gray-400 cursor-not-allowed'}
                                `}
                            >
                                {isProfileComplete ? 'Tiếp tục thanh toán' : 'Vui lòng cập nhật thông tin'}
                                {isProfileComplete && <CreditCard className="w-5 h-5" />}
                            </button>

                            <button
                                onClick={() => navigate('/cart')}
                                className="w-full py-3 bg-white text-gray-600 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Quay lại giỏ hàng
                            </button>

                            <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
                                <Lock className="w-3 h-3" />
                                Thanh toán an toàn & bảo mật
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CheckSquare(props) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
    )
}
