
import { useState, useMemo } from 'react';
import { calculateDeposit, detectPlatePattern } from '@/utils/plateHelpers';
import { provinces, plateTypes } from '@/data/constants';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
// Note: We'll implement useFavorites later or mock it for now.
// For now, local state or mocked hook.

export default function AuctionTable({
    data,
    type = 'car',
    activeTab = 'official',
    itemsPerPage = 20
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState(null); // { key, direction }

    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();

    // Pagination Logic
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const currentData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return data.slice(start, start + itemsPerPage);
    }, [data, currentPage, itemsPerPage]);

    const handleAddToCart = (item) => {
        if (!isAuthenticated) {
            alert("Vui lòng đăng nhập để thêm vào giỏ hàng!"); // Replace with Toast later
            return;
        }

        addToCart({
            id: item.id,
            plateNumber: item.plateNumber,
            name: `Biển số ${item.plateNumber}`,
            type: type,
            price: parseInt(item.startPrice.replace(/[^0-9]/g, '')) || 0,
            image: type === 'car' ? '/assets/images/car-plate-default.png' : '/assets/images/moto-plate-default.png',
            province: item.province,
            plateColor: item.plateColor,
            depositAmount: calculateDeposit(item.startPrice),
            auctionDate: item.auctionTime || new Date().toISOString()
        });
        alert(`Đã thêm biển số ${item.plateNumber} vào giỏ hàng!`);
    };

    const isResultMode = activeTab === 'results';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase text-xs tracking-wider">
                            <th className="px-6 py-4 font-bold text-center w-16">STT</th>
                            <th className="px-6 py-4 font-bold text-center">Biển số</th>
                            <th className="px-6 py-4 font-bold">{isResultMode ? 'Giá trúng đấu giá' : 'Giá khởi điểm'}</th>
                            <th className="px-6 py-4 font-bold">Tỉnh/Thành phố</th>
                            <th className="px-6 py-4 font-bold">Loại biển</th>
                            <th className="px-6 py-4 font-bold text-center">
                                {isResultMode ? 'Thời gian' : 'Hành động'}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentData.length > 0 ? (
                            currentData.map((item, idx) => {
                                const isYellow = item.plateColor === 'Biển vàng' || item.plateColor === 'yellow';
                                const rowClass = "hover:bg-amber-50/30 transition-colors group";

                                return (
                                    <tr key={item.id || idx} className={rowClass}>
                                        <td className="px-6 py-4 text-center text-gray-400">
                                            {(currentPage - 1) * itemsPerPage + idx + 1}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={`
                        inline-block px-4 py-1 rounded border-2 font-bold text-lg shadow-sm
                        ${isYellow
                                                    ? 'bg-yellow-300 border-yellow-500 text-black'
                                                    : 'bg-white border-gray-300 text-gray-800 group-hover:border-gold'
                                                }
                      `}>
                                                {item.plateNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-red-600">
                                            {item.startPrice}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {item.province}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                {detectPlatePattern(item.plateNumber)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {isResultMode ? (
                                                <span className="text-gray-500 text-sm">{item.auctionTime}</span>
                                            ) : (
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => handleAddToCart(item)}
                                                        className="text-gold font-bold text-sm hover:underline"
                                                    >
                                                        Thêm vào giỏ
                                                    </button>
                                                    {/* Favorite Icon Placeholder */}
                                                    <button className="text-gray-300 hover:text-red-500 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                    Không tìm thấy biển số phù hợp
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="text-sm text-gray-500">
                        Trang {currentPage} / {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Trước
                        </button>
                        {/* Simple Pagination Numbers - Can be improved to standard 1 ... 5 logic */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Logic to show generic page window around current
                            let p = i + 1;
                            if (totalPages > 5 && currentPage > 3) {
                                p = currentPage - 2 + i;
                            }
                            if (p > totalPages) return null;

                            return (
                                <button
                                    key={p}
                                    onClick={() => setCurrentPage(p)}
                                    className={`px-3 py-1 rounded border ${currentPage === p ? 'bg-gold border-gold text-white' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                                >
                                    {p}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
