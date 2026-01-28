import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import axios from '@/services/axiosInstance';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import { Search, FileText, CreditCard, Star, Calendar } from 'lucide-react';

import FloatingContactButtons from '@/components/common/FloatingContactButtons';
import PlateDetailModal from '@/components/modals/PlateDetailModal';
import InvoiceModal from '@/components/modals/InvoiceModal';

export default function AuctionHistoryPage() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    // Mock Data (Simulating getUserDeposits, getUserBids, getUserPayments)
    // Load Data
    // Load Data
    const [historyData, setHistoryData] = useState([]);
    const [selectedDetailPlate, setSelectedDetailPlate] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        const fetchMyRegistrations = async () => {
            try {
                const res = await axios.get('/registrations/my');
                if (res.data.success) {
                    // Map API data to UI format
                    const mappedData = res.data.data.map(reg => ({
                        id: reg._id,
                        plateNumber: reg.sessionId?.plateNumber || 'Unknown',
                        session: reg.sessionId?.sessionName || 'Unknown Session',
                        date: reg.createdAt,
                        status: mapStatus(reg.status, reg.depositStatus), // Helper function needed
                        depositStatus: reg.depositStatus,
                        regStatus: reg.status,
                        auctionId: reg.sessionId?._id || reg.sessionId, // for link
                        ...reg
                    }));
                    setHistoryData(mappedData);
                }
            } catch (error) {
                console.error('Fetch history error:', error);
                // Fallback to local storage if API fails or for demo
                const localHistory = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
                setHistoryData(localHistory);
            }
        };
        fetchMyRegistrations();
    }, []);

    const mapStatus = (regStatus, depositStatus) => {
        if (regStatus === 'approved') return 'verified';
        if (depositStatus === 'pending') return 'pending_payment';
        if (depositStatus === 'paid' && regStatus === 'registered') return 'pending_approval';
        if (regStatus === 'rejected') return 'rejected';
        return 'pending';
    };



    // Authentication guard - redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để xem lịch sử đấu giá');
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredHistory = useMemo(() => {
        return historyData.filter(item => {
            const matchSearch = searchQuery === '' ||
                item.plateNumber.toLowerCase().includes(searchQuery.toLowerCase());

            const itemDate = new Date(item.date);
            const matchStartDate = startDate === '' || itemDate >= new Date(startDate);
            const matchEndDate = endDate === '' || itemDate <= new Date(endDate);

            return matchSearch && matchStartDate && matchEndDate;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [historyData, searchQuery, startDate, endDate]);

    // Badge Rendering Logic (Exact Parity)
    // Badge Rendering Logic
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'verified':
            case 'completed':
            case 'approved':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Đã duyệt - Sẵn sàng
                </span>;
            case 'pending_payment':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold shadow-sm animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Chờ thanh toán
                </span>;
            case 'pending_approval':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Chờ duyệt hồ sơ
                </span>;
            case 'won_paid':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Đã Trúng & Đã Thanh toán
                </span>;
            case 'won_unpaid':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold shadow-sm animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Đã Trúng, Chờ Thanh toán
                </span>;
            case 'success':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Đã thanh toán cọc
                </span>;
            case 'pending':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-bold shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                    Chờ xử lý
                </span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-xs font-bold shadow-sm">
                    {status}
                </span>;
        }
    };

    // Action Button Logic (Exact Parity)
    const renderActionButton = (item) => {
        if (item.status === 'pending_payment') {
            return (
                <button
                    onClick={() => navigate(`/payment?type=deposit&registrationId=${item.id}`)}
                    className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-red-700 transition"
                >
                    <CreditCard className="w-4 h-4" />
                    Thanh toán cọc
                </button>
            );
        } else if (item.status === 'verified' || item.status === 'approved') {
            return (
                <button
                    onClick={() => navigate(`/auction/live/${item.sessionPlateId || item.auctionId}`)}
                    className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-green-700 transition"
                >
                    <Star className="w-4 h-4" />
                    Vào phòng đấu
                </button>
            );
        } else if (item.status === 'won_unpaid') {
            return (
                <Link to={`/payment?auctionId=${item.auctionId}`} className="text-green-600 hover:text-green-800 font-bold text-sm hover:underline flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    Thanh toán xe
                </Link>
            );
        } else {
            return (
                <span className="text-gray-400 text-xs italic">Chờ cập nhật</span>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            <FloatingContactButtons />
            {/* Banner Section */}
            <div className="relative h-80 bg-cover bg-center overflow-hidden shrink-0"
                style={{ backgroundImage: "url('/assets/banners/profile_banner.png')" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
                <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)]">
                        Lịch sử đấu giá
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl drop-shadow-[1px_1px_2px_rgba(0,0,0,0.5)]">
                        Theo dõi toàn bộ hoạt động và lịch sử đấu giá của bạn
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
                                    <h1 className="text-3xl font-bold text-gray-900">Lịch sử đấu giá</h1>
                                    <p className="text-gray-600 mt-1">Theo dõi các phiên đấu giá và trạng thái biển số</p>
                                </div>

                                {/* Filters Bar - Glassmorphic */}
                                <div className="flex flex-col sm:flex-row gap-3 bg-white/50 p-1.5 rounded-2xl border border-white/40 shadow-sm">
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full pl-3 pr-3 py-2 bg-white/80 border-0 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#AA8C3C]/20 text-gray-700 shadow-sm"
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full pl-3 pr-3 py-2 bg-white/80 border-0 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#AA8C3C]/20 text-gray-700 shadow-sm"
                                        />
                                    </div>
                                    <div className="relative min-w-[200px]">
                                        <input
                                            type="search"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-white/80 border-0 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#AA8C3C]/20 placeholder-gray-400 shadow-sm"
                                            placeholder="Tìm biển số..."
                                        />
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table Content */}
                        <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-3xl shadow-lg overflow-hidden min-h-[500px]">
                            {filteredHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24">
                                    <div className="w-32 h-32 mb-6 opacity-40">
                                        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="100" cy="90" r="40" fill="#94A3B8" opacity="0.3" />
                                            <path d="M70 90 L85 105 L115 75" stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
                                            <rect x="80" y="130" width="40" height="6" rx="3" fill="#94A3B8" opacity="0.3" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 text-base font-medium">Không tìm thấy lịch sử đấu giá nào</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50/50 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Biển số</th>
                                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phiên đấu</th>
                                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày đấu giá</th>
                                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredHistory.map((item) => (
                                                <tr key={item.id} className="hover:bg-blue-50/30 transition-all duration-200 group">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="font-bold border w-32 py-1.5 rounded shadow-sm text-center bg-white border-gray-200 text-gray-800 group-hover:border-[#AA8C3C]/50 group-hover:shadow-md transition-all">
                                                                {item.plateNumber}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-sm font-medium text-gray-900">{item.session}</td>
                                                    <td className="px-8 py-5 text-sm text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            {(() => {
                                                                try {
                                                                    const d = new Date(item.date);
                                                                    return isNaN(d.getTime()) ? (item.date || 'unknown') : d.toLocaleDateString('vi-VN');
                                                                } catch { return item.date; }
                                                            })()}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">{renderStatusBadge(item.status)}</td>
                                                    <td className="px-8 py-5">{renderActionButton(item)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <PlateDetailModal
                isOpen={!!selectedDetailPlate}
                onClose={() => setSelectedDetailPlate(null)}
                plate={selectedDetailPlate}
            />
            <InvoiceModal
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
                data={selectedInvoice}
            />
        </div>
    );
}
