import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import PlateDetailModal from '../../components/modals/PlateDetailModal';
import AuctionRegistrationModal from '../../components/modals/AuctionRegistrationModal';

// Mock data
const mockMotorbikePlates = [
    { id: 1, plateNumber: '29AA-888.88', startPrice: 5000000, province: 'Thành phố Hà Nội', type: 'Ngũ quý', plateColor: 'Biển trắng' },
    { id: 2, plateNumber: '59AB-123.45', startPrice: 5000000, province: 'Thành phố Hồ Chí Minh', type: 'Sảnh tiến', plateColor: 'Biển trắng' },
    { id: 3, plateNumber: '29AB-567.89', startPrice: 5000000, province: 'Thành phố Hà Nội', type: 'Sảnh tiến', plateColor: 'Biển trắng' },
    { id: 4, plateNumber: '59AC-999.99', startPrice: 5000000, province: 'Thành phố Hồ Chí Minh', type: 'Ngũ quý', plateColor: 'Biển vàng' },
    { id: 5, plateNumber: '29AD-686.86', startPrice: 5000000, province: 'Thành phố Hà Nội', type: 'Lộc phát', plateColor: 'Biển trắng' },
];

export default function MotorbikeAuctionPage() {
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
    const [selectedPlate, setSelectedPlate] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    const handleOpenDetail = (plate) => {
        setSelectedPlate(plate);
        setIsDetailOpen(true);
    };

    const handleOpenRegister = (plate) => {
        // Check authentication first
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để đăng ký đấu giá');
            setTimeout(() => navigate('/login'), 1000);
            return;
        }

        // Check profile completion
        if (!checkProfileComplete()) {
            toast.error('Vui lòng hoàn thành thông tin cá nhân trước');
            return; // ProfileCompletionModal will show automatically
        }

        setSelectedPlate(plate);
        setIsRegisterOpen(true);
    };

    const handleCloseModals = () => {
        setIsDetailOpen(false);
        setIsRegisterOpen(false);
        setSelectedPlate(null);
    };

    const handleRegisterFromDetail = (plate) => {
        setIsDetailOpen(false);
        setTimeout(() => {
            setSelectedPlate(plate);
            setIsRegisterOpen(true);
        }, 100);
    };

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

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    };

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleFavorite = (id) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
        );
    };

    const handleCheckboxChange = (setFunc, list, value, checked) => {
        if (checked) {
            setFunc([...list, value]);
        } else {
            setFunc(list.filter(item => item !== value));
        }
    };

    // Filter Logic - Apply all active filters
    const filterPlates = (plates) => {
        return plates.filter(plate => {
            const plateNumber = plate.plateNumber.toLowerCase();

            // 1. Search filter
            if (searchTerm && !plateNumber.includes(searchTerm.toLowerCase())) {
                return false;
            }

            // 2. Province filter
            if (selectedProvince && plate.province !== selectedProvince) {
                return false;
            }

            // 3. Type filter (Ngũ quý, Sảnh tiến, etc.)
            if (selectedTypes.length > 0 && !selectedTypes.includes(plate.type)) {
                return false;
            }

            // 4. Year filter
            if (selectedYears.length > 0) {
                const digits = plateNumber.replace(/[^0-9]/g, '');
                const lastFour = digits.slice(-4);
                if (lastFour.length === 4) {
                    const lastTwo = parseInt(lastFour.slice(-2));
                    const match = selectedYears.some(year => {
                        if (year === '200x') return lastTwo >= 0 && lastTwo <= 9;
                        if (year === '199x') return lastTwo >= 90 && lastTwo <= 99;
                        if (year === '198x') return lastTwo >= 80 && lastTwo <= 89;
                        if (year === '197x') return lastTwo >= 70 && lastTwo <= 79;
                        if (year === '196x') return lastTwo >= 60 && lastTwo <= 69;
                        return false;
                    });
                    if (!match) return false;
                }
            }

            // 5. Avoid numbers filter
            if (selectedAvoids.length > 0) {
                const digits = plateNumber.replace(/[^0-9]/g, '');
                const shouldAvoid = selectedAvoids.some(avoid => {
                    const avoidNum = avoid.split(' ')[1];
                    return digits.includes(avoidNum);
                });
                if (shouldAvoid) return false;
            }

            // 6. Plate color filter
            if (selectedPlateColors.length > 0) {
                if (!selectedPlateColors.includes(plate.plateColor)) {
                    return false;
                }
            }

            return true;
        });
    };

    // Get filtered and sorted plates (favorites first)
    const getDisplayPlates = () => {
        const filtered = filterPlates(mockMotorbikePlates);
        // Sort favorites to top
        const favList = filtered.filter(p => favorites.includes(p.id));
        const otherList = filtered.filter(p => !favorites.includes(p.id));
        return [...favList, ...otherList];
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Banner */}
            <div className="relative h-80 bg-cover bg-center" style={{ backgroundImage: "url('/assets/banners/motorbike-auction-banner.jpg')" }}>
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
                    <h1 className="text-5xl font-bold text-white mb-4">Đấu Giá Biển Số Xe Máy</h1>
                    <p className="text-xl text-white">Sở hữu biển số xe máy đẹp - Cơ hội đầu tư sinh lời</p>
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

                            {/* Năm sinh Accordion */}
                            <div className="border border-amber-50 rounded-[16px] overflow-hidden">
                                <button
                                    onClick={() => toggleSection('year')}
                                    className="w-full px-5 py-4 bg-amber-50 flex items-center justify-between font-bold text-amber-900 text-base"
                                >
                                    <span>Năm sinh</span>
                                    {openSections.year ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                {openSections.year && (
                                    <div className="px-5 pb-5 pt-2 space-y-3 bg-white border-t border-amber-100">
                                        {availableYears.map((year) => (
                                            <label key={year} className="flex items-center gap-3 cursor-pointer text-base text-gray-900 hover:text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedYears.includes(year)}
                                                    onChange={(e) => handleCheckboxChange(setSelectedYears, selectedYears, year, e.target.checked)}
                                                    className="w-[18px] h-[18px] text-red-600 border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span>{year}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tránh số Accordion */}
                            <div className="border border-amber-50 rounded-[16px] overflow-hidden">
                                <button
                                    onClick={() => toggleSection('avoid')}
                                    className="w-full px-5 py-4 bg-amber-50 flex items-center justify-between font-bold text-amber-900 text-base"
                                >
                                    <span>Tránh số</span>
                                    {openSections.avoid ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                {openSections.avoid && (
                                    <div className="px-5 pb-5 pt-2 space-y-3 bg-white border-t border-amber-100">
                                        {availableAvoids.map((avoid) => (
                                            <label key={avoid} className="flex items-center gap-3 cursor-pointer text-base text-gray-900 hover:text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAvoids.includes(avoid)}
                                                    onChange={(e) => handleCheckboxChange(setSelectedAvoids, selectedAvoids, avoid, e.target.checked)}
                                                    className="w-[18px] h-[18px] text-red-600 border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span>{avoid}</span>
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
                            {/* Table */}
                            <div className="overflow-x-auto rounded-t-lg border border-gray-200">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-[#AA8C3C] text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-center font-bold uppercase">STT</th>
                                            <th className="px-4 py-4 text-center font-bold uppercase">Biển số</th>
                                            <th className="px-6 py-4 font-bold uppercase">Giới khởi điểm</th>
                                            <th className="px-6 py-4 font-bold uppercase">Tỉnh, Thành phố</th>
                                            <th className="px-6 py-4 font-bold uppercase">Loại biển</th>
                                            <th className="px-6 py-4 text-center font-bold uppercase">Lựa chọn</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {getDisplayPlates().map((plate, index) => {
                                            const isYellow = plate.plateColor === 'Biển vàng';
                                            const plateBgClass = isYellow
                                                ? 'bg-[#FCD34D] border-[#F59E0B] text-black'
                                                : 'bg-white border-gray-200 text-gray-800';
                                            return (
                                                <tr key={plate.id} className="hover:bg-blue-50 transition-colors group">
                                                    <td className="px-6 py-4 text-center font-medium text-gray-900">{index + 1}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="relative inline-flex items-center justify-center">
                                                            <button
                                                                onClick={() => toggleFavorite(plate.id)}
                                                                className="absolute -left-6 transform -translate-y-[1px]"
                                                            >
                                                                <Star
                                                                    className={`w-[18px] h-[18px] ${favorites.includes(plate.id)
                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                        : 'text-gray-300'
                                                                        }`}
                                                                />
                                                            </button>
                                                            <span
                                                                onClick={() => handleOpenDetail(plate)}
                                                                className={`font-bold border w-28 py-1.5 rounded shadow-sm text-center cursor-pointer hover:border-[#AA8C3C] ${plateBgClass}`}
                                                            >
                                                                {plate.plateNumber}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                                                        {formatPrice(plate.startPrice)}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">
                                                        {plate.province}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">
                                                        {plate.type}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {activeTab === 'official' ? (
                                                            <button
                                                                onClick={() => handleOpenRegister(plate)}
                                                                className="text-[#AA8C3C] font-bold hover:underline decoration-2 underline-offset-2 whitespace-nowrap text-sm"
                                                            >
                                                                Đăng ký đấu giá
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-900">20/12/2025</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-between items-center gap-4 mt-6 p-4 bg-gray-50 rounded-b-lg border border-t-0 border-gray-200">
                                <div className="text-sm text-gray-600">
                                    Hiển thị 1-5 trong 5 kết quả
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm">Trước</button>
                                    <button className="px-3 py-1 bg-[#AA8C3C] text-white rounded text-sm">1</button>
                                    <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm">Sau</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <PlateDetailModal
                isOpen={isDetailOpen}
                onClose={handleCloseModals}
                plate={selectedPlate}
                onRegister={handleRegisterFromDetail}
            />

            <AuctionRegistrationModal
                isOpen={isRegisterOpen}
                onClose={handleCloseModals}
                auctionItem={selectedPlate}
            />
        </div>
    );
}
