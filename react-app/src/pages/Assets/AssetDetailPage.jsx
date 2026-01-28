import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assetData } from '@/data/auctionData';
import {
    ChevronRight,
    Monitor,
    TrendingUp,
    Users,
    Eye,
    Calendar,
    Clock,
    MapPin,
    Wallet,
    ShoppingCart,
    CheckCircle,
    Info,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function AssetDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();

    // Find asset
    const asset = assetData.find(item => item.id === parseInt(id));

    // State for image gallery
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isRegistered, setIsRegistered] = useState(false); // Mock registration state

    // If no asset found
    if (!asset) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <AlertCircle className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Không tìm thấy tài sản</h1>
                    <p className="text-gray-600 mb-6">Tài sản bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                    <button
                        onClick={() => navigate('/assets')}
                        className="bg-[#AA8C3C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#8B7530] transition-colors"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    const images = asset.images || [asset.image];
    const isExpired = asset.status === 'expired';

    // Format helpers
    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);
    const formatCurrency = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
            // Navigate to login if needed, or just show toast
            return;
        }

        const itemToAdd = {
            id: asset.id,
            name: asset.name,
            image: images[0],
            price: asset.startPrice,
            depositAmount: asset.depositAmount,
            auctionDate: asset.auctionTime,
            quantity: 1,
            type: 'asset'
        };

        addToCart(itemToAdd);
        toast.success(`Đã thêm "${asset.shortTitle || asset.name}" vào giỏ hàng`);
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Banner Placeholder (if any) - mirroring original structure which has a banner mount */}

            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                    <button onClick={() => navigate('/')} className="hover:text-[#AA8C3C] transition-colors">Trang chủ</button>
                    <ChevronRight className="w-4 h-4" />
                    <button onClick={() => navigate('/assets')} className="hover:text-[#AA8C3C] transition-colors">Danh sách tài sản</button>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 font-semibold">{asset.shortTitle || asset.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Image Gallery */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="relative aspect-w-16 aspect-h-9 bg-gray-200">
                                <img
                                    src={images[activeImageIndex]}
                                    alt={asset.name}
                                    className="w-full h-96 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                />
                            </div>
                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2 p-4">
                                    {images.slice(0, 4).map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt={`${asset.name} - ${index + 1}`}
                                            className={`w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity border-2 ${activeImageIndex === index ? 'border-[#AA8C3C]' : 'border-transparent'}`}
                                            onClick={() => setActiveImageIndex(index)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô tả tài sản</h2>
                            <p className="text-gray-700 leading-relaxed">{asset.description}</p>
                        </div>

                        {/* Specifications */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông số kỹ thuật</h2>
                            <table className="w-full">
                                <tbody>
                                    {asset.specifications?.map((spec, index) => (
                                        <tr key={index} className="border-b border-gray-200 last:border-0">
                                            <td className="py-3 px-4 font-semibold text-gray-700 bg-gray-100 w-1/3">{spec.label}</td>
                                            <td className="py-3 px-4 text-gray-600">{spec.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Auction Info */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông tin đấu giá</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Monitor className="w-6 h-6 text-[#AA8C3C]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Hình thức</p>
                                        <p className="font-semibold text-gray-900">{asset.auctionInfo?.method || 'Đấu giá trực tuyến'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-[#AA8C3C]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Bước giá</p>
                                        <p className="font-semibold text-gray-900">{formatPrice(asset.auctionInfo?.priceStep || 0)} VNĐ</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-[#AA8C3C]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Người tham gia</p>
                                        <p className="font-semibold text-gray-900">{asset.auctionInfo?.participants || 0} người</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                        <Eye className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Lượt xem</p>
                                        <p className="font-semibold text-gray-900">{asset.auctionInfo?.viewCount || 0} lượt</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Registration Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                            <div className="border-b border-gray-200 pb-4 mb-4">
                                <h3 className="text-2xl font-bold text-[#AA8C3C] mb-2">{formatCurrency(asset.startPrice)}</h3>
                                <p className="text-sm text-gray-500">Giá khởi điểm</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Thời gian đấu giá</p>
                                        <p className="font-semibold text-gray-900">{asset.auctionTime}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Thời gian đăng ký còn lại</p>
                                        <p className={`font-semibold ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>{asset.registerTime}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Địa điểm</p>
                                        <p className="font-semibold text-gray-900">{asset.location}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-3">
                                    <Wallet className="w-5 h-5 text-[#AA8C3C] mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600">Tiền đặt cọc</p>
                                        <p className="font-bold text-[#AA8C3C]">{formatPrice(asset.depositAmount)} VNĐ</p>
                                        <p className="text-xs text-gray-500 mt-1">({asset.depositPercent}% giá khởi điểm)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Action Buttons */}
                            <div id="registration-actions">
                                {isExpired ? (
                                    <>
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                            <div className="flex items-center gap-2 text-red-600">
                                                <AlertCircle className="w-5 h-5" />
                                                <p className="font-semibold">Đã hết hạn đăng ký</p>
                                            </div>
                                        </div>
                                        <button disabled className="w-full bg-gray-300 text-gray-500 font-bold py-3 rounded-lg cursor-not-allowed">
                                            Hết hạn đăng ký
                                        </button>
                                    </>
                                ) : isRegistered ? (
                                    <>
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                            <div className="flex items-center gap-2 text-green-600">
                                                <CheckCircle className="w-5 h-5" />
                                                <p className="font-semibold">Bạn đã đăng ký cuộc đấu giá này</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate('/auction-history')}
                                            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
                                        >
                                            Xem đăng ký của tôi
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleAddToCart}
                                            className="w-full bg-gradient-to-r from-[#AA8C3C] to-[#8B7530] text-white font-bold py-3 rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                            <span>Thêm vào giỏ hàng</span>
                                        </button>
                                        {!isAuthenticated && (
                                            <p className="text-xs text-center text-gray-500 mt-3 flex items-center justify-center gap-1">
                                                <Info className="w-3 h-3" />
                                                Bạn cần đăng nhập để thêm vào giỏ
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Danh mục:</span>
                                    <span className="font-semibold text-gray-900">{asset.category}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
