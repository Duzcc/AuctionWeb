import { useState, useEffect } from 'react';
import axios from '@/services/axiosInstance';
import { toast } from 'react-hot-toast';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';

export default function ProductManagementPage() {
    const [activeTab, setActiveTab] = useState('car'); // car or motorbike
    const [plates, setPlates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPlate, setEditingPlate] = useState(null);
    const [formData, setFormData] = useState({
        plateNumber: '',
        province: '',
        plateType: '',
        plateColor: '',
        startingPrice: '',
        description: ''
    });

    useEffect(() => {
        fetchPlates();
    }, [activeTab]);

    const fetchPlates = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/admin/plates`, {
                params: { type: activeTab, limit: 100 }
            });
            if (res.data.success) {
                setPlates(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching plates:', error);
            toast.error('Không thể tải danh sách biển số');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = { ...formData, type: activeTab };

            if (editingPlate) {
                // Update
                await axios.put(`/admin/plates/${editingPlate._id}`, payload);
                toast.success('Cập nhật biển số thành công');
            } else {
                // Create
                await axios.post(`/admin/plates`, payload);
                toast.success('Thêm biển số thành công');
            }

            setShowModal(false);
            setEditingPlate(null);
            resetForm();
            fetchPlates();
        } catch (error) {
            console.error('Error saving plate:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi lưu biển số');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Xác nhận xóa biển số này?')) return;

        try {
            await axios.delete(`/admin/plates/${id}?type=${activeTab}`);
            toast.success('Đã xóa biển số');
            fetchPlates();
        } catch (error) {
            console.error('Error deleting plate:', error);
            toast.error('Lỗi khi xóa biển số');
        }
    };

    const openEditModal = (plate) => {
        setEditingPlate(plate);
        setFormData({
            plateNumber: plate.plateNumber,
            province: plate.province,
            plateType: plate.plateType,
            plateColor: plate.plateColor,
            startingPrice: plate.startingPrice,
            description: plate.description || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            plateNumber: '',
            province: '',
            plateType: '',
            plateColor: '',
            startingPrice: '',
            description: ''
        });
    };

    const filteredPlates = plates.filter(p =>
        p.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.province?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
                    <p className="text-gray-500">Quản lý biển số ô tô và xe máy</p>
                </div>
                <button
                    onClick={() => {
                        setEditingPlate(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-[#AA8C3C] text-white rounded-lg hover:bg-[#8B7230] transition-colors font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Thêm biển số
                </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('car')}
                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'car'
                                ? 'bg-[#AA8C3C] text-white'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Biển số ô tô
                    </button>
                    <button
                        onClick={() => setActiveTab('motorbike')}
                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'motorbike'
                                ? 'bg-[#AA8C3C] text-white'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Biển số xe máy
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm theo số biển hoặc tỉnh..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#AA8C3C] focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AA8C3C] mx-auto"></div>
                        <p className="mt-4 text-gray-500">Đang tải...</p>
                    </div>
                ) : filteredPlates.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">Chưa có biển số nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Biển số</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tỉnh</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Loại</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Màu</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Giá khởi điểm</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredPlates.map(plate => (
                                    <tr key={plate._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-gray-900">{plate.plateNumber}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{plate.province}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{plate.plateType}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{plate.plateColor}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                            {plate.startingPrice?.toLocaleString()} đ
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${plate.status === 'available' ? 'bg-green-100 text-green-800 border-green-200' :
                                                    plate.status === 'in_auction' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                        'bg-gray-100 text-gray-800 border-gray-200'
                                                }`}>
                                                {plate.status === 'available' ? 'Có sẵn' :
                                                    plate.status === 'in_auction' ? 'Đang đấu giá' : 'Đã bán'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(plate)}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                                    title="Sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(plate._id)}
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingPlate ? 'Cập nhật biển số' : 'Thêm biển số mới'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Biển số *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.plateNumber}
                                        onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#AA8C3C]"
                                        placeholder="30K-999.99"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tỉnh *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.province}
                                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#AA8C3C]"
                                        placeholder="Hà Nội"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Loại biển *</label>
                                    <select
                                        required
                                        value={formData.plateType}
                                        onChange={(e) => setFormData({ ...formData, plateType: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#AA8C3C]"
                                    >
                                        <option value="">Chọn loại</option>
                                        <option>Ngũ quý</option>
                                        <option>Sảnh tiến</option>
                                        <option>Tứ quý</option>
                                        <option>Tam hoa</option>
                                        <option>Thần tài</option>
                                        <option>Lộc phát</option>
                                        <option>Ông địa</option>
                                        <option>Số gánh</option>
                                        <option>Lặp đôi</option>
                                        <option>Biển đẹp</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Màu biển *</label>
                                    <select
                                        required
                                        value={formData.plateColor}
                                        onChange={(e) => setFormData({ ...formData, plateColor: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#AA8C3C]"
                                    >
                                        <option value="">Chọn màu</option>
                                        <option>Biển trắng</option>
                                        <option>Biển vàng</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Giá khởi điểm (VND) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.startingPrice}
                                        onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#AA8C3C]"
                                        placeholder="40000000"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#AA8C3C]"
                                        rows="3"
                                        placeholder="Mô tả chi tiết về biển số..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-[#AA8C3C] text-white rounded-lg hover:bg-[#8B7230] font-semibold"
                                >
                                    {editingPlate ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 font-semibold"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
