import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function AssetCard({ asset }) {
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();

    const isExpired = asset.status === 'expired';

    const handleAddToCart = (e) => {
        e.preventDefault(); // Prevent navigation to detail page

        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
            // Redirect to login handled by user usually, or could use navigate
            // For now just toast as per vanilla behavior roughly
            return;
        }

        const itemToAdd = {
            id: asset.id,
            name: asset.title,
            image: asset.image,
            price: asset.startPriceNumber, // Use the number version
            depositAmount: asset.depositAmount,
            auctionDate: asset.auctionTime,
            quantity: 1,
            type: 'asset'
        };

        addToCart(itemToAdd);
        toast.success(`Đã thêm "${asset.shortTitle || asset.title}" vào giỏ hàng`);
    };

    return (
        <Link
            to={`/assets/${asset.id}`}
            className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col asset-card h-full"
        >
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={asset.image}
                    alt={asset.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        e.target.src = 'https://placehold.co/600x400?text=No+Image';
                    }}
                />

                {/* Status Badge */}
                <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${isExpired ? 'bg-red-500' : 'bg-green-500'
                    }`}>
                    {isExpired ? 'Hết hạn' : 'Đang mở'}
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-[#AA8C3C] transition-colors">
                    {asset.title}
                </h3>

                <div className="space-y-2 mb-4 flex-grow text-sm text-gray-600">
                    <div className="flex justify-between items-start">
                        <span className="text-gray-500">Giá khởi điểm:</span>
                        <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                            {asset.startPrice}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Đấu giá:</span>
                        <span className="font-medium">{asset.auctionTime}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Đăng ký:</span>
                        <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                            {asset.registerTime}
                        </span>
                    </div>
                </div>

                {/* Action Button */}
                {!isExpired && (
                    <button
                        onClick={handleAddToCart}
                        className="w-full mt-auto py-2.5 bg-gray-100 hover:bg-[#AA8C3C] text-gray-700 hover:text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="8" cy="21" r="1" />
                            <circle cx="19" cy="21" r="1" />
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                        </svg>
                        Thêm vào giỏ hàng
                    </button>
                )}

                {isExpired && (
                    <button
                        disabled
                        className="w-full mt-auto py-2.5 bg-gray-100 text-gray-400 font-semibold rounded-lg cursor-not-allowed text-center"
                    >
                        Đã kết thúc
                    </button>
                )}
            </div>
        </Link>
    );
}
