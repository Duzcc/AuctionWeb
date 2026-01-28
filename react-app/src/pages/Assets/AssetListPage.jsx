import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetData } from '@/data/auctionData';
import { Search, Clock, DollarSign, ShoppingCart } from 'lucide-react';
import PageBanner from '@/components/common/PageBanner';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

export default function AssetListPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = assetData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleAddToCart = (e, item) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
            // Optional: Redirect to login or just show toast
            // setTimeout(() => navigate('/login'), 1000); 
            return;
        }

        const itemToAdd = {
            id: item.id,
            name: item.name,
            image: item.image,
            price: item.startPrice,
            depositAmount: item.depositAmount || item.startPrice * 0.1, // Fallback if not specifically set
            auctionDate: item.auctionTime,
            quantity: 1,
            type: 'asset'
        };

        addToCart(itemToAdd);
        toast.success(`Đã thêm "${item.shortTitle || item.name}" vào giỏ hàng`);
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Banner */}
            <PageBanner
                title="Đấu Giá Tài Sản"
                subtitle="Trang sức, đồng hồ và các tài sản giá trị khác"
                backgroundImage="/assets/banners/asset-auction-banner.jpg"
            />

            {/* Content wrapper */}
            <div className="bg-white">
                <div className="container mx-auto px-4 py-10">
                    {/* Search */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                        <div className="relative w-full md:w-1/2">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#AA8C3C] w-[18px] h-[18px]" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm tài sản"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#AA8C3C] text-sm bg-white shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredData.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => navigate(`/assets/${item.id}`)}
                                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group cursor-pointer"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-2 left-2 bg-blue-400 text-red-700 p-1 rounded-full shadow-md">
                                        <img
                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/2000px-Flag_of_Vietnam.svg.png"
                                            className="w-6 h-6 rounded-full object-cover border border-white"
                                            alt="icon"
                                        />
                                    </div>
                                    <div className={`absolute top-2 right-2 px-3 py-1 text-white text-xs font-bold rounded-full shadow-md ${item.status === 'expired' ? 'bg-red-500' : 'bg-green-500'
                                        }`}>
                                        {item.status === 'expired' ? 'Hết hạn' : 'Đang mở'}
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h3 className="font-bold text-gray-800 text-sm mb-4 line-clamp-2 h-10">
                                        {item.name}
                                    </h3>

                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <DollarSign className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Giá khởi điểm</p>
                                            <p className="text-[#AA8C3C] font-bold text-base">{formatPrice(item.startPrice)}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-start gap-2">
                                            <Clock className="text-gray-400 mt-0.5 w-4 h-4" />
                                            <div>
                                                <p className="text-xs text-gray-500">Thời gian đấu giá</p>
                                                <p className="text-gray-800 font-medium text-sm">{item.auctionTime}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Clock className="text-gray-400 mt-0.5 w-4 h-4" />
                                            <div>
                                                <p className="text-xs text-gray-500">Thời gian đăng ký</p>
                                                <p className={`font-medium text-sm ${item.status === 'expired' ? 'text-red-600' : 'text-green-600'}`}>
                                                    {item.registerTime || 'Đang diễn ra'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => handleAddToCart(e, item)}
                                        className="w-full bg-gradient-to-r from-[#AA8C3C] to-[#8B7530] text-white px-4 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        <span>Thêm vào giỏ hàng</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-end mt-6">
                        <div className="flex gap-1">
                            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#AA8C3C] text-white font-bold text-sm">1</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
