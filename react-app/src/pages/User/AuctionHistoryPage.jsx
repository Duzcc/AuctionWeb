import { useState, useMemo } from 'react';
import { Search, FileText, CreditCard, Star, Calendar } from 'lucide-react';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import { useNavigate } from 'react-router-dom';

export default function AuctionHistoryPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Mock Data mimicking getUserDeposits, getUserBids, getUserPayments
    const deposits = [
        { id: 'd1', itemName: '30K-999.99', createdAt: '2024-12-20', amount: 40000000, status: 'verified', session: '25/12/2024' },
        { id: 'd2', itemName: '51K-888.88', createdAt: '2024-12-18', amount: 40000000, status: 'verified', session: '23/12/2024' },
    ];

    const bids = [
        { id: 'b1', auctionId: 'a1', itemName: '30K-999.99', timestamp: '2024-12-25', amount: 150000000, isWinning: true, session: '25/12/2024' },
        { id: 'b2', auctionId: 'a2', itemName: '51K-888.88', timestamp: '2024-12-23', amount: 120000000, isWinning: false, session: '23/12/2024' } // Outbid
    ];

    const payments = [
        { id: 'p1', auctionId: 'a1', itemName: '30K-999.99', createdAt: '2024-12-26', remainingAmount: 110000000, status: 'pending', completedAt: null }
    ];

    // Consolidated Logic
    const historyData = useMemo(() => {
        const consolidated = [
            // 1. Deposits
            ...deposits.map(d => ({
                id: d.id,
                plateNumber: d.itemName || 'N/A',
                type: 'Đăng ký',
                session: d.session,
                date: d.createdAt,
                amount: d.amount,
                status: d.status,
                itemType: 'deposit'
            })),
            // 2. Bids
            ...bids.map(b => {
                const hasPayment = payments.some(p => p.auctionId === b.auctionId && p.status === 'completed');
                return {
                    id: b.id,
                    auctionId: b.auctionId,
                    plateNumber: b.itemName || 'N/A',
                    type: b.isWinning ? 'Trúng thầu' : 'Đặt giá',
                    session: b.session,
                    date: b.timestamp,
                    amount: b.amount,
                    status: b.isWinning ? (hasPayment ? 'won_paid' : 'won_unpaid') : 'outbid',
                    itemType: 'bid'
                };
            }),
            // 3. Payments
            ...payments.map(p => ({
                id: p.id,
                auctionId: p.auctionId,
                plateNumber: p.itemName || 'N/A',
                type: 'Biển số',
                session: p.completedAt ? new Date(p.completedAt).toLocaleDateString('vi-VN') : 'Đang xử lý',
                date: p.createdAt,
                amount: p.remainingAmount,
                status: p.status,
                itemType: 'payment'
            }))
        ];

        return consolidated.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, []);

    const filteredHistory = historyData.filter(item => {
        const matchSearch = item.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const itemDate = new Date(item.date);
        const matchStart = !startDate || itemDate >= new Date(startDate);
        const matchEnd = !endDate || itemDate <= new Date(endDate);
        return matchSearch && matchStart && matchEnd;
    });

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'won_paid':
                return <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-semibold">✓ Đã Trúng & Đã Thanh toán</span>;
            case 'won_unpaid':
                return <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold animate-pulse">⏳ Đã Trúng, Chờ Thanh toán</span>;
            case 'verified':
            case 'completed':
                return <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-semibold">Đã xác nhận</span>;
            case 'pending':
                return <span className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-semibold">Chờ xác nhận</span>;
            case 'processing':
                return <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">Đang xử lý</span>;
            case 'winning':
                return <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">Đang dẫn đầu</span>;
            case 'outbid':
                return <span className="px-3 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-full text-xs font-semibold">Bị vượt giá</span>;
            default:
                return <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold">Đã từ chối</span>;
        }
    };

    const renderActionButton = (item) => {
        if (item.status === 'won_paid') {
            return (
                <button className="text-[#AA8C3C] hover:text-blue-800 font-semibold text-sm hover:underline flex items-center gap-1">
                    <FileText className="w-4 h-4" /> Xem chi tiết
                </button>
            );
        } else if (item.status === 'won_unpaid') {
            return (
                <button
                    onClick={() => navigate(`/payment?auctionId=${item.auctionId}`)}
                    className="text-green-600 hover:text-green-800 font-semibold text-sm hover:underline flex items-center gap-1">
                    <CreditCard className="w-4 h-4" /> Thanh toán ngay
                </button>
            );
        } else if (item.itemType === 'payment') {
            if (item.status === 'completed') {
                return (
                    <button className="text-[#AA8C3C] hover:text-blue-800 font-semibold text-sm hover:underline flex items-center gap-1">
                        <FileText className="w-4 h-4" /> Xem chi tiết
                    </button>
                );
            } else if (item.status === 'pending' || item.status === 'processing') {
                return (
                    <button
                        onClick={() => navigate(`/payment?paymentId=${item.id}`)}
                        className="text-green-600 hover:text-green-800 font-semibold text-sm hover:underline flex items-center gap-1">
                        <CreditCard className="w-4 h-4" /> Thanh toán ngay
                    </button>
                );
            }
        } else if (item.type === 'Đăng ký' && item.status === 'verified') {
            return <span className="text-gray-500 text-sm">Đã xác nhận</span>;
        }
        return <span className="text-gray-400">-</span>;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Banner */}
            <div className="relative h-80 bg-cover bg-center overflow-hidden shrink-0"
                style={{ backgroundImage: "url('/assets/banners/profile_banner.png')" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
                <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                        Lịch sử đấu giá
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        Theo dõi toàn bộ hoạt động và lịch sử đấu giá của bạn
                    </p>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full lg:w-80 shrink-0">
                        <ProfileSidebar />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 px-8 py-6 rounded-t-xl shadow-sm">
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold text-gray-900">Lịch sử đấu giá</h1>
                                <p className="text-gray-600 mt-1">Theo dõi các phiên đấu giá của bạn</p>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="w-full pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="relative flex-1">
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="w-full pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="relative flex-1">
                                    <input
                                        type="search"
                                        placeholder="Nhập biển số xe"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="p-8 bg-white border-x border-b border-gray-200 rounded-b-xl shadow-sm">
                            {filteredHistory.length > 0 ? (
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <div className="p-0 overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Biển số</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phiên đấu</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ngày đấu giá</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredHistory.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                                <span className="text-sm font-bold text-gray-900 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-md">
                                                                    {item.plateNumber}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900">{item.type}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-900">{item.session}</td>
                                                        <td className="px-6 py-4">
                                                            {renderStatusBadge(item.status)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {renderActionButton(item)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-24">
                                    <div className="w-32 h-32 mb-6 opacity-40">
                                        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="100" cy="90" r="40" fill="#94A3B8" opacity="0.3" />
                                            <path d="M70 90 L85 105 L115 75" stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
                                            <rect x="80" y="130" width="40" height="6" rx="3" fill="#94A3B8" opacity="0.3" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 text-base">Chưa có lịch sử đấu giá</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

