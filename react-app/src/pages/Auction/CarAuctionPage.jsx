import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import PlateDetailModal from '@/components/modals/PlateDetailModal';
import AuctionRegistrationModal from '@/components/modals/AuctionRegistrationModal';
import { plateService, favoriteService, auctionService } from '@/services/apiService';

export default function CarAuctionPage() {
    const { isAuthenticated, user, checkProfileComplete } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('official'); // 'official' | 'results'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [openSections, setOpenSections] = useState({
        type: true,
        year: true,
        avoid: true,
        plateColor: true
    });
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [selectedAvoids, setSelectedAvoids] = useState([]);
    const [selectedPlateColors, setSelectedPlateColors] = useState([]);
    const [favorites, setFavorites] = useState([]);

    // API State
    const [plates, setPlates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    // Modal State
    const [selectedPlate, setSelectedPlate] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    const availableTypes = ["Ngũ quý", "Sảnh tiến", "Tứ quý", "Tam hoa", "Thần tài", "Lộc phát", "Ông địa", "Số gánh", "Lặp đôi"];
    const availableYears = ["196x", "197x", "198x", "199x", "200x"];
    const availableAvoids = ["Tránh 4", "Tránh 7", "Tránh 49", "Tránh 53", "Tránh 13"];
    const vietnameseProvinces = [
        "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh",
        "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau",
        "Cao Bằng", "Thành phố Cần Thơ", "Thành phố Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên",
        "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Thành phố Hà Nội",
        "Hà Tĩnh", "Hải Dương", "Thành phố Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên",
        "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn",
        "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận",
        "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh",
        "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên",
        "Thanh Hóa", "Thành phố Hồ Chí Minh", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang",
        "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
    ];

    // Fetch plates from API - different endpoints for different tabs
    const fetchPlates = async (page = 1) => {
        try {
            setLoading(true);

            const params = {
                page,
                limit: pagination.limit,
                vehicleType: 'car',
                ...(searchTerm && { search: searchTerm }),
                ...(selectedProvince && { province: selectedProvince }),
                ...(selectedTypes.length > 0 && { types: selectedTypes }),
                ...(selectedPlateColors.length > 0 && { colors: selectedPlateColors }),
            };

            let response;

            if (activeTab === 'official') {
                // Get plates available in active sessions (for registration)
                response = await auctionService.getAvailablePlates(params);
            } else {
                // Get auction results (sold plates with winners)
                response = await auctionService.getAuctionResults(params);
            }

            if (response.success) {
                setPlates(response.data);
                setPagination(prev => ({
                    ...prev,
                    page: response.pagination.page,
                    total: response.pagination.total,
                    totalPages: response.pagination.totalPages
                }));
            }
        } catch (error) {
            console.error('Error fetching plates:', error);
            toast.error('Lỗi khi tải danh sách biển số');
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchPlates(1);
    }, [activeTab]); // Reload when tab changes

    // Refetch when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!loading) {
                fetchPlates(1);
            }
        }, 500); // Debounce

        return () => clearTimeout(timer);
    }, [searchTerm, selectedProvince, selectedTypes, selectedPlateColors]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    };

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleFavorite = async (plateId) => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thêm yêu thích');
            return;
        }

        try {
            if (favorites.includes(plateId)) {
                await favoriteService.removeFavorite(plateId);
                setFavorites(prev => prev.filter(id => id !== plateId));
                toast.success('Đã xóa khỏi yêu thích');
            } else {
                await favoriteService.addFavorite(plateId);
                setFavorites(prev => [...prev, plateId]);
                toast.success('Đã thêm vào yêu thích');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleCheckboxChange = (setFunc, list, value, checked) => {
        if (checked) {
            setFunc([...list, value]);
        } else {
            setFunc(list.filter(item => item !== value));
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchPlates(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleLimitChange = (newLimit) => {
        setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
        // Refetch with new limit
        setTimeout(() => fetchPlates(1), 0);
    };

    // Modal Handlers
    const openDetailModal = (plate) => {
        setSelectedPlate(plate);
        setIsDetailOpen(true);
    };

    const openRegisterModal = (sessionPlateItem) => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để đăng ký đấu giá');
            setTimeout(() => navigate('/login'), 1000);
            return;
        }

        if (!checkProfileComplete()) {
            toast.error('Vui lòng hoàn thành thông tin cá nhân trước');
            return;
        }

        // Pass the full sessionPlate item which contains sessionId
        setSelectedPlate(sessionPlateItem);
        setIsRegisterOpen(true);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Banner */}
            <div className="relative h-80 bg-cover bg-center" style={{ backgroundImage: "url('/assets/banners/car-auction-banner.jpg')" }}>
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
                    <h1 className="text-5xl font-bold text-white mb-4">Đấu Giá Biển Số Ô Tô</h1>
                    <p className="text-xl text-white">Sở hữu biển số đẹp - Khẳng định đẳng cấp thượng lưu</p>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-10">
                    <h2 className="text-[32px] font-bold text-gray-900 mb-6">Danh sách đấu giá</h2>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-8 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('official')}
                            className={`px-6 py-3 font-bold text-sm rounded-t-lg transition-colors ${activeTab === 'official'
                                ? 'bg-[#AA8C3C] text-white'
                                : 'text-gray-500 hover:text-[#AA8C3C] hover:bg-gray-50'
                                }`}
                        >
                            Danh sách biển số
                        </button>
                        <button
                            onClick={() => setActiveTab('results')}
                            className={`px-6 py-3 font-bold text-sm rounded-t-lg transition-colors ${activeTab === 'results'
                                ? 'bg-[#AA8C3C] text-white'
                                : 'text-gray-500 hover:text-[#AA8C3C] hover:bg-gray-50'
                                }`}
                        >
                            Kết quả đấu giá
                        </button>
                    </div>

                    {/* Main Layout: Sidebar + Table */}
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Sidebar - Filters */}
                        <div className="w-full lg:w-1/4 flex-shrink-0 space-y-5">
                            {/* Search */}
                            <div>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
                                    <input
                                        type="text"
                                        placeholder="Nhập để tìm kiếm biển số xe"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-[28px] focus:outline-none focus:border-gray-400 text-gray-700"
                                    />
                                </div>
                            </div>

                            {/* Province Dropdown */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn tỉnh, thành phố</label>
                                <div className="relative">
                                    <select
                                        value={selectedProvince}
                                        onChange={(e) => setSelectedProvince(e.target.value)}
                                        className="w-full pl-5 pr-10 py-3.5 border border-gray-300 rounded-[28px] appearance-none focus:outline-none focus:border-gray-400 bg-white cursor-pointer hover:border-gray-400"
                                    >
                                        <option value="">Chọn tỉnh, thành phố</option>
                                        {vietnameseProvinces.map((province) => (
                                            <option key={province} value={province}>{province}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none w-[18px] h-[18px]" />
                                </div>
                            </div>

                            {/* Loại biển số Accordion */}
                            <div className="border border-amber-50 rounded-[16px] overflow-hidden">
                                <button
                                    onClick={() => toggleSection('type')}
                                    className="w-full px-5 py-4 bg-amber-50 flex items-center justify-between font-bold text-amber-900 text-base"
                                >
                                    <span>Loại biển số</span>
                                    {openSections.type ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                {openSections.type && (
                                    <div className="px-5 pb-5 pt-2 space-y-3 bg-white border-t border-amber-100">
                                        {availableTypes.map((type) => (
                                            <label key={type} className="flex items-center gap-3 cursor-pointer text-base text-gray-900 hover:text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTypes.includes(type)}
                                                    onChange={(e) => handleCheckboxChange(setSelectedTypes, selectedTypes, type, e.target.checked)}
                                                    className="w-[18px] h-[18px] text-red-600 border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span>{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Loại biển Accordion */}
                            <div className="border border-amber-50 rounded-[16px] overflow-hidden">
                                <button
                                    onClick={() => toggleSection('plateColor')}
                                    className="w-full px-5 py-4 bg-amber-50 flex items-center justify-between font-bold text-amber-900 text-base"
                                >
                                    <span>Loại biển</span>
                                    {openSections.plateColor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                {openSections.plateColor && (
                                    <div className="px-5 pb-5 pt-2 space-y-3 bg-white border-t border-amber-100">
                                        {['Biển trắng', 'Biển vàng'].map((color) => (
                                            <label key={color} className="flex items-center gap-3 cursor-pointer text-base text-gray-900 hover:text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPlateColors.includes(color)}
                                                    onChange={(e) => handleCheckboxChange(setSelectedPlateColors, selectedPlateColors, color, e.target.checked)}
                                                    className="w-[18px] h-[18px] text-red-600 border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span>{color}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Table Area */}
                        <div className="flex-1">
                            {loading ? (
                                <div className="flex justify-center items-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AA8C3C]"></div>
                                </div>
                            ) : (
                                <>
                                    {/* Table */}
                                    <div className="overflow-x-auto rounded-t-lg border border-gray-200">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-[#AA8C3C] text-white">
                                                <tr>
                                                    <th className="px-6 py-4 text-center font-bold uppercase">STT</th>
                                                    <th className="px-4 py-4 text-center font-bold uppercase">Biển số</th>
                                                    <th className="px-6 py-4 font-bold uppercase">
                                                        {activeTab === 'official' ? 'Giới khởi điểm' : 'Giá trúng'}
                                                    </th>
                                                    <th className="px-6 py-4 font-bold uppercase">Tỉnh, Thành phố</th>
                                                    <th className="px-6 py-4 font-bold uppercase">Loại biển</th>
                                                    <th className="px-6 py-4 text-center font-bold uppercase">
                                                        {activeTab === 'official' ? 'Lựa chọn' : 'Người trúng'}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {plates.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                            {activeTab === 'official'
                                                                ? 'Không tìm thấy biển số phù hợp'
                                                                : 'Chưa có kết quả đấu giá'}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    plates.map((item, index) => {
                                                        // For official tab, item is sessionPlate with populated plateId
                                                        // For results tab, item is also sessionPlate but with winner info
                                                        const plate = item.plateId || item;
                                                        const isYellow = plate.plateColor === 'Biển vàng';
                                                        const plateBgClass = isYellow
                                                            ? 'bg-[#FCD34D] border-[#F59E0B] text-black'
                                                            : 'bg-white border-gray-200 text-gray-800';
                                                        const displayIndex = (pagination.page - 1) * pagination.limit + index + 1;

                                                        return (
                                                            <tr key={item._id} className="hover:bg-blue-50 transition-colors group">
                                                                <td className="px-6 py-4 text-center font-medium text-gray-900">{displayIndex}</td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <div className="relative inline-flex items-center justify-center">
                                                                        {activeTab === 'official' && (
                                                                            <button
                                                                                onClick={() => toggleFavorite(plate._id)}
                                                                                className="absolute -left-6 transform -translate-y-[1px]"
                                                                            >
                                                                                <Star
                                                                                    className={`w-[18px] h-[18px] ${favorites.includes(plate._id)
                                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                                        : 'text-gray-300'
                                                                                        }`}
                                                                                />
                                                                            </button>
                                                                        )}
                                                                        <span
                                                                            onClick={() => openDetailModal(plate)}
                                                                            className={`font-bold border w-28 py-1.5 rounded shadow-sm text-center cursor-pointer hover:border-[#AA8C3C] ${plateBgClass}`}
                                                                        >
                                                                            {item.plateNumber || plate.plateNumber}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                                                                    {activeTab === 'official'
                                                                        ? formatPrice(plate.startingPrice || item.currentPrice)
                                                                        : formatPrice(item.finalPrice || item.currentPrice)}
                                                                </td>
                                                                <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">
                                                                    {plate.province}
                                                                </td>
                                                                <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">
                                                                    {plate.plateType}
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    {activeTab === 'official' ? (
                                                                        <button
                                                                            onClick={() => openRegisterModal(item)}
                                                                            className="text-[#AA8C3C] font-bold hover:underline decoration-2 underline-offset-2 whitespace-nowrap text-sm"
                                                                        >
                                                                            Đăng ký đấu giá
                                                                        </button>
                                                                    ) : (
                                                                        <span className="text-gray-900 font-medium">
                                                                            {item.winnerName || 'Chưa xác định'}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="flex justify-between items-center gap-4 mt-6 p-4 bg-gray-50 rounded-b-lg border border-t-0 border-gray-200">
                                        <div className="flex items-center gap-4">
                                            <div className="text-sm text-gray-600">
                                                Hiển thị {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}-{Math.min(pagination.page * pagination.limit, pagination.total)} trong {pagination.total} kết quả
                                            </div>
                                            <select
                                                value={pagination.limit}
                                                onChange={(e) => handleLimitChange(Number(e.target.value))}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:border-[#AA8C3C]"
                                            >
                                                <option value={10}>10</option>
                                                <option value={20}>20</option>
                                                <option value={50}>50</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handlePageChange(pagination.page - 1)}
                                                disabled={pagination.page === 1}
                                                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Trước
                                            </button>
                                            {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                                                const pageNum = i + 1;
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`px-3 py-1 rounded text-sm ${pagination.page === pageNum
                                                            ? 'bg-[#AA8C3C] text-white'
                                                            : 'border border-gray-300 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                            <button
                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                disabled={pagination.page === pagination.totalPages}
                                                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Sau
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <PlateDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                plate={selectedPlate}
                onRegister={() => {
                    setIsDetailOpen(false);
                    setIsRegisterOpen(true);
                }}
            />

            <AuctionRegistrationModal
                isOpen={isRegisterOpen}
                onClose={() => setIsRegisterOpen(false)}
                auctionItem={selectedPlate}
            />
        </div>
    );
}
