import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '@/components/common/Modal';
import PlateDetailModal from '@/components/modals/PlateDetailModal';
import { Search, Trash2, RotateCcw, CreditCard, CheckSquare, Square, MapPin, Calendar, Clock, DollarSign, ShoppingCart } from 'lucide-react';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import FloatingContactButtons from '@/components/common/FloatingContactButtons';

export default function CartPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { cartItems, removeFromCart, refundCartItem, createPendingOrder } = useCart();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [selectedDetailPlate, setSelectedDetailPlate] = useState(null);
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    // Authentication guard - redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để truy cập giỏ hàng');
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const filteredItems = useMemo(() => {
        return cartItems.filter(item =>
            (item.plateNumber?.toLowerCase()?.includes(searchTerm.toLowerCase())) ||
            (item.province?.toLowerCase()?.includes(searchTerm.toLowerCase()))
        );
    }, [cartItems, searchTerm]);

    const toggleSelection = (id) => {
        const next = new Set(selectedItems);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedItems(next);
    };

    const toggleSelectAll = () => {
        if (selectedItems.size === filteredItems.length && filteredItems.length > 0) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredItems.map(i => i.id)));
        }
    };

    const selectionStatus = useMemo(() => {
        const selected = filteredItems.filter(i => selectedItems.has(i.id));
        if (selected.length === 0) return { canDelete: false, canRefund: false, canCheckout: false, total: 0, count: 0 };

        const allRefunded = selected.every(i => i.refunded);
        const allPaid = selected.every(i => i.depositPaid || i.paid);
        const allUnpaid = selected.every(i => !i.depositPaid && !i.paid && !i.refunded);

        const total = selected.reduce((sum, i) => sum + (i.depositAmount || i.price * 0.1 || 0), 0);

        return {
            canDelete: allRefunded || allUnpaid,
            canRefund: allPaid && !allRefunded,
            canCheckout: allUnpaid,
            total,
            count: selected.length
        };
    }, [selectedItems, filteredItems]);

    const openConfirm = (title, message, onConfirm) => {
        setConfirmConfig({ isOpen: true, title, message, onConfirm });
    };

    const closeConfirm = () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    };

    const handleRemoveSelected = () => {
        openConfirm(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa ${selectedItems.size} biển số đã chọn khỏi giỏ hàng?`,
            () => {
                Array.from(selectedItems).forEach(id => removeFromCart(id));
                setSelectedItems(new Set());
            }
        );
    };

    const handleRefundSelected = () => {
        openConfirm(
            'Xác nhận hoàn tiền',
            `Bạn có chắc muốn hoàn tiền cho ${selectedItems.size} biển số đã chọn?`,
            () => {
                Array.from(selectedItems).forEach(id => refundCartItem(id));
            }
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            <FloatingContactButtons />
            {/* Template Banner */}
            <div className="relative h-80 bg-cover bg-center overflow-hidden shrink-0"
                style={{ backgroundImage: "url('/assets/banners/cart_new.png')" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
                <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)]">
                        Giỏ hàng
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl drop-shadow-[1px_1px_2px_rgba(0,0,0,0.5)]">
                        Quản lý danh sách biển số đã đăng ký đấu giá
                    </p>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 md:px-8 py-12 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Sidebar */}
                    <div className="w-full lg:w-80 shrink-0 hidden lg:block">
                        <ProfileSidebar />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 space-y-6">
                        {/* Premium Header Card */}
                        <div className="bg-white/90 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-[#AA8C3C]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#AA8C3C]/20 transition-colors duration-700"></div>

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
                                    <p className="text-gray-600 mt-1">Quản lý danh sách biển số đã đăng ký đấu giá</p>
                                </div>
                                <div className="relative w-full md:w-72">
                                    <input
                                        type="search"
                                        placeholder="Tìm kiếm biển số..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-5 pr-12 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#AA8C3C] focus:ring-2 focus:ring-[#AA8C3C]/20 transition-all font-medium text-gray-700 placeholder-gray-400 hover:bg-white"
                                    />
                                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Content Card */}
                        <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-3xl shadow-lg overflow-hidden relative min-h-[500px] flex flex-col">
                            {/* Actions Toolbar */}
                            {selectedItems.size > 0 && (
                                <div className="px-8 py-4 border-b border-gray-100 flex gap-3 h-16 items-center">
                                    {selectionStatus.canDelete && (
                                        <button onClick={handleRemoveSelected} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors shadow-sm">
                                            <Trash2 className="w-4 h-4" /> Xóa đã chọn ({selectedItems.size})
                                        </button>
                                    )}
                                    {selectionStatus.canRefund && (
                                        <button onClick={handleRefundSelected} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors shadow-sm">
                                            <RotateCcw className="w-4 h-4" /> Hoàn tiền ({selectedItems.size})
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Content Table */}
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50/50 text-gray-500 font-bold text-xs uppercase tracking-wider backdrop-blur-sm sticky top-0 z-10">
                                        <tr>

                                            <th className="px-6 py-5 text-left text-sm font-bold text-gray-700 border-b border-gray-100">Biển số</th>
                                            <th className="px-6 py-5 text-left text-sm font-bold text-gray-700 border-b border-gray-100">Loại biển</th>
                                            <th className="px-6 py-5 text-center text-sm font-bold text-gray-700 border-b border-gray-100">Khu vực</th>
                                            <th className="px-6 py-5 text-left text-sm font-bold text-gray-700 border-b border-gray-100">Giá khởi điểm</th>
                                            <th className="px-6 py-5 text-left text-sm font-bold text-gray-700 border-b border-gray-100">Tiền đặt trước</th>
                                            <th className="px-6 py-5 text-left text-sm font-bold text-gray-700 border-b border-gray-100">Ngày đấu giá</th>
                                            <th className="px-6 py-5 text-center text-sm font-bold text-gray-700 border-b border-gray-100">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredItems.length > 0 ? filteredItems.map(item => (
                                            <tr key={item.id} onClick={() => toggleSelection(item.id)} className={`cursor-pointer transition-all duration-200 group ${selectedItems.has(item.id) ? 'bg-[#AA8C3C]/5' : 'hover:bg-blue-50/50'}`}>

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            onClick={(e) => { e.stopPropagation(); setSelectedDetailPlate(item); }}
                                                            className="font-bold border-2 border-gray-200 w-36 py-2 rounded-lg shadow-sm text-center bg-white text-gray-800 text-lg group-hover:border-[#AA8C3C]/50 group-hover:shadow-md transition-all cursor-pointer hover:text-[#AA8C3C]"
                                                        >
                                                            {item.plateNumber}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-gray-600 font-medium">
                                                    {item.type === 'car' ? 'Biển số ô tô' : (item.type === 'motorbike' ? 'Biển số xe máy' : (item.type || 'Biển đẹp'))}
                                                </td>
                                                <td className="px-6 py-5 text-center text-sm font-medium text-gray-900">
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
                                                        <MapPin className="w-3 h-3" />
                                                        {item.province || 'TQ'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-sm font-bold text-gray-500">
                                                    {(item.price || 0).toLocaleString('vi-VN')} đ
                                                </td>
                                                <td className="px-6 py-5 text-sm font-bold text-[#AA8C3C] text-lg">
                                                    {(item.depositAmount || item.price * 0.1 || 0).toLocaleString('vi-VN')} đ
                                                </td>
                                                <td className="px-6 py-5 text-sm text-gray-900">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        {item.auctionDate ? new Date(item.auctionDate).toLocaleDateString('vi-VN') : 'Sắp diễn ra'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    {item.refunded ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                                            <RotateCcw className="w-3 h-3" /> Hoàn tiền
                                                        </span>
                                                    ) : item.depositPaid ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 shadow-sm">
                                                            <CheckSquare className="w-3 h-3" /> Đã đặt cọc
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200 animate-pulse">
                                                            <Clock className="w-3 h-3" /> Chờ đặt cọc
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-32 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="w-40 h-40 mb-6 opacity-50 relative">
                                                            <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50"></div>
                                                            <ShoppingCart className="w-full h-full text-gray-400 relative z-10 p-8" />
                                                        </div>
                                                        <p className="text-xl text-gray-500 font-medium">Giỏ hàng của bạn đang trống</p>
                                                        <button onClick={() => navigate('/auction/car')} className="mt-6 px-6 py-2 bg-[#AA8C3C] text-white rounded-xl font-bold hover:bg-[#8B7530] transition-colors shadow-md hover:shadow-lg">
                                                            Khám phá kho biển số
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Sticky Checkout Footer */}
            <div className={`sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-blue-100 px-8 py-6 shadow-[0_-8px_30px_-5px_rgba(0,0,0,0.1)] z-50 transition-all duration-500 ease-in-out ${selectionStatus.canCheckout ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                <div className="max-w-screen-2xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tổng tiền đặt trước</span>
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-black text-[#AA8C3C] tracking-tight">{selectionStatus.total.toLocaleString('vi-VN')}</span>
                                <span className="text-lg font-bold text-gray-400">VNĐ</span>
                            </div>
                        </div>
                        <div className="h-12 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50/50 rounded-xl border border-blue-100">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-lg font-bold text-gray-900 leading-none">{selectionStatus.count}</span>
                                <span className="text-xs font-bold text-gray-500">BIỂN SỐ</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const selected = filteredItems.filter(i => selectedItems.has(i.id));
                            createPendingOrder(selected);
                            navigate('/checkout');
                        }}
                        className="group relative overflow-hidden min-w-[320px] bg-gradient-to-r from-[#AA8C3C] via-[#B89E54] to-[#AA8C3C] bg-[length:200%_100%] hover:bg-[100%_0] transition-all duration-500 text-white py-4 px-10 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:shadow-[#AA8C3C]/30 flex items-center justify-center gap-4"
                    >
                        <div className="absolute inset-0 bg-white/20 group-hover:opacity-0 transition-opacity"></div>
                        <CreditCard className="w-6 h-6 group-hover:scale-110 transition-transform relative z-10" />
                        <span className="text-lg tracking-wide relative z-10">TIẾN HÀNH THANH TOÁN</span>
                    </button>
                </div>
            </div>
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={closeConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
            />

            <PlateDetailModal
                isOpen={!!selectedDetailPlate}
                onClose={() => setSelectedDetailPlate(null)}
                plate={selectedDetailPlate}
            // No onRegister here as it's already in cart
            />
        </div>
    );
}
