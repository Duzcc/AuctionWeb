import { useState, useEffect } from 'react'; // React hooks
import { useNavigate } from 'react-router-dom'; // Navigation
import { useAuth } from '@/contexts/AuthContext'; // Auth context
import { toast } from 'react-hot-toast'; // Toast notifications
import { Camera, Edit3, User, Building2, CheckCircle2, MapPin, Map, Home, Navigation } from 'lucide-react'; // Icons
import ProfileSidebar from '@/components/profile/ProfileSidebar'; // Sidebar
import { getProvinces, getDistricts, getWards } from '@/data/vietnamAddress'; // Address data
import { getValidationError } from '@/utils/validation'; // Validation util

import FloatingContactButtons from '@/components/common/FloatingContactButtons';

export default function ProfilePage() {
    const { user, login, updateProfile, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('individual'); // 'individual' or 'organization'


    // Address State
    const [provincesList, setProvincesList] = useState([]);
    const [districtsList, setDistrictsList] = useState([]);
    const [wardsList, setWardsList] = useState([]);

    // Validation Errors
    const [errors, setErrors] = useState({});

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        avatar: '', // Add avatar field
        identityNumber: '',
        issueDate: '',
        issuePlace: '',
        businessName: '',
        taxCode: '',
        repName: '',
        repPhone: '',
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        province: '',
        district: '',
        ward: '',
        specificAddress: '',
        settings: {
            notifications: true,
            emailUpdates: true
        }
    });

    // Authentication guard - redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để truy cập trang này');
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        // Init provinces
        setProvincesList(getProvinces());
    }, []);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                ...user,
                // Ensure settings object exists
                settings: user.settings || prev.settings,
                // Split address if stored as string, but for now assuming individual fields or manual parse
                // If user data has separated address fields, great. If not, we might need to parse.
                // Assuming simple mapping for now based on current mock data structure
            }));

            if (user.type) setActiveTab(user.type);

            // Trigger cascade load if user has address data
            if (user.province) {
                setDistrictsList(getDistricts(user.province));
                if (user.district) {
                    setWardsList(getWards(user.province, user.district));
                }
            }

            // Check profile completeness logic matching original
            // Original: if (!isProfileComplete) switchMode('edit');
            // We can mimic this by checking required fields
            const isComplete = user.isProfileComplete;
            if (isComplete === false) { // Explicit check
                setIsEditing(true);
            }
        }
    }, [user]);

    // Validation Handler
    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = getValidationError(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Clear error when typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }

        if (name.startsWith('settings.')) {
            const settingKey = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                settings: {
                    ...prev.settings,
                    [settingKey]: checked
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleProvinceChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            province: value,
            district: '',
            ward: ''
        }));
        setDistrictsList(getDistricts(value));
        setWardsList([]);
        setErrors(prev => ({ ...prev, province: null }));
    };

    const handleDistrictChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            district: value,
            ward: ''
        }));
        setWardsList(getWards(formData.province, value));
        setErrors(prev => ({ ...prev, district: null }));
    };

    const handleWardChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, ward: value }));
        setErrors(prev => ({ ...prev, ward: null }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Validate all required fields based on type
        const requiredFields = activeTab === 'individual'
            ? ['fullName', 'phone', 'identityNumber', 'issueDate', 'issuePlace']
            : ['businessName', 'taxCode', 'repName', 'repPhone']; // Removed address parts for simpler initial check loop

        // Add proper Address validation
        const addressFields = ['province', 'district', 'ward', 'specificAddress'];

        let hasError = false;
        const newErrors = {};

        [...requiredFields, ...addressFields].forEach(field => {
            const error = getValidationError(field, formData[field] || (field === 'required' ? undefined : ''));
            // Note: simple required check might fail if value is empty string. 
            // Our util 'getValidationError' handles 'required' keyword or specific field names.
            // Using 'required' generic check for address fields if field specific is not defined

            let specificError = getValidationError(field, formData[field]);
            // Fallback for address fields which might return null if no specific validator exists, but they are required
            if (!specificError && !formData[field]) {
                specificError = 'Trường này là bắt buộc';
            }

            if (specificError) {
                newErrors[field] = specificError;
                hasError = true;
            }
        });

        if (hasError) {
            setErrors(newErrors);
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        // Simulate API update
        await new Promise(resolve => setTimeout(resolve, 800));

        const fullAddress = `${formData.specificAddress}, ${formData.ward}, ${formData.district}, ${formData.province}`;

        const updatedUser = {
            ...user,
            ...formData,
            type: activeTab,
            userType: activeTab, // Also set userType for consistency
            address: fullAddress,
            isProfileComplete: true
        };

        // Update context and localStorage
        const result = await updateProfile(updatedUser);

        if (result.success) {
            toast.success('Cập nhật thông tin thành công!');
            setIsEditing(false);
            setErrors({});
        } else {
            toast.error(result.error || 'Cập nhật thất bại');
        }
    };

    const fullAddress = [formData.specificAddress, formData.ward, formData.district, formData.province].filter(Boolean).join(', ');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            <FloatingContactButtons />
            {/* Banner Section */}
            <div className="relative h-80 bg-cover bg-center overflow-hidden shrink-0"
                style={{ backgroundImage: "url('/assets/banners/profile_v2.png')" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
                <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)]">
                        Thông tin tài khoản
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl drop-shadow-[1px_1px_2px_rgba(0,0,0,0.5)]">
                        Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
                    </p>
                </div>
            </div>

            {/* Content Container */}
            {/* Content Container */}
            <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 md:px-8 py-12 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Sidebar */}
                    <div className="w-full lg:w-80 shrink-0">
                        <ProfileSidebar />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 space-y-6">
                        {/* Premium Header Card */}
                        <div className="bg-white/90 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-xl relative overflow-hidden group">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-[#AA8C3C]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#AA8C3C]/20 transition-colors duration-700"></div>

                            <div className="relative z-10">
                                <h1 className="text-3xl font-bold text-gray-900">Thông tin tài khoản</h1>
                                <p className="text-gray-600 mt-1">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
                            </div>
                        </div>

                        {/* Content */}
                        {/* Content */}
                        <div className="bg-white/80 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-lg relative">
                            {/* Profile Card */}
                            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
                                <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                                        <div className="relative group">
                                            <img src={user?.avatar || "https://ui-avatars.com/api/?name=User&background=random"} alt="Avatar"
                                                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200" />
                                            <label htmlFor="avatar-upload"
                                                className="absolute bottom-0 right-0 bg-[#AA8C3C] text-white p-2 rounded-full cursor-pointer hover:bg-[#8B7530] transition-colors shadow-md">
                                                <Camera className="w-4 h-4" />
                                            </label>
                                            <input type="file" id="avatar-upload" accept="image/*" className="hidden" />
                                        </div>
                                    </div>

                                    {/* Basic Info */}
                                    <div className="flex-1 text-center sm:text-left">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{formData.fullName || formData.businessName || 'Chưa cập nhật tên'}</h2>
                                        <p className="text-gray-600 mb-4">{formData.email}</p>
                                        <div className="flex gap-2 justify-center sm:justify-start">
                                            <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-semibold">
                                                Đã xác thực
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* VIEW MODE */}
                                {!isEditing ? (
                                    <div className="space-y-8 animate-fadeIn">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Thông tin chung</h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">Loại tài khoản</p>
                                                        <p className="font-medium text-gray-900">{activeTab === 'individual' ? 'Cá nhân' : 'Doanh nghiệp'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">Họ và tên / Tên DN</p>
                                                        <p className="font-medium text-gray-900">{activeTab === 'individual' ? formData.fullName : formData.businessName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                                                        <p className="font-medium text-gray-900">{formData.phone}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">Email</p>
                                                        <p className="font-medium text-gray-900">{formData.email}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Thông tin chi tiết</h3>
                                                <div className="space-y-4">
                                                    {activeTab === 'individual' ? (
                                                        <>
                                                            <div>
                                                                <p className="text-sm text-gray-500 mb-1">Số CCCD/HC</p>
                                                                <p className="font-medium text-gray-900">{formData.identityNumber || '---'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500 mb-1">Ngày cấp</p>
                                                                <p className="font-medium text-gray-900">{formData.issueDate || '---'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500 mb-1">Nơi cấp</p>
                                                                <p className="font-medium text-gray-900">{formData.issuePlace || '---'}</p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div>
                                                                <p className="text-sm text-gray-500 mb-1">Mã số thuế</p>
                                                                <p className="font-medium text-gray-900">{formData.taxCode || '---'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500 mb-1">Người đại diện</p>
                                                                <p className="font-medium text-gray-900">{formData.repName || '---'}</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Địa chỉ</h3>
                                                <div>
                                                    <p className="font-medium text-gray-900">{fullAddress || 'Chưa cập nhật địa chỉ'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Ngân hàng</h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">Ngân hàng</p>
                                                        <p className="font-medium text-gray-900">{formData.bankName || '---'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">Số tài khoản</p>
                                                        <p className="font-medium text-gray-900">{formData.accountNumber || '---'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">Chủ tài khoản</p>
                                                        <p className="font-medium text-gray-900">{formData.accountHolder || '---'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-6 border-t border-gray-200">
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="flex items-center gap-2 px-6 py-2.5 border-2 border-[#AA8C3C] text-[#AA8C3C] rounded-lg font-bold hover:bg-[#AA8C3C] hover:text-white transition-all">
                                                <Edit3 className="w-4 h-4" />
                                                Chỉnh sửa thông tin
                                            </button>
                                        </div>
                                    </div>
                                ) : ( // EDIT FORM
                                    <form onSubmit={handleSave} className="space-y-6 animate-fadeIn">
                                        {/* User Type Selector */}
                                        <div className="mb-8">
                                            <label className="block text-sm font-semibold text-gray-900 mb-4">
                                                Chọn loại tài khoản <span className="text-red-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Individual */}
                                                <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer hover:border-[#AA8C3C]/50 transition-all group ${activeTab === 'individual' ? 'border-[#AA8C3C]' : 'border-gray-200'}`}>
                                                    <input type="radio" name="userType" value="individual" checked={activeTab === 'individual'} onChange={() => setActiveTab('individual')} className="sr-only" />
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                                            <User className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-900">Cá nhân</h3>
                                                            <p className="text-sm text-gray-500">Dành cho khách hàng cá nhân</p>
                                                        </div>
                                                    </div>
                                                    {activeTab === 'individual' && (
                                                        <div className="absolute top-4 right-4 text-[#AA8C3C]">
                                                            <CheckCircle2 className="w-6 h-6 fill-[#AA8C3C] text-white" />
                                                        </div>
                                                    )}
                                                </label>

                                                {/* Enterprise */}
                                                <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer hover:border-[#AA8C3C]/50 transition-all group ${activeTab === 'organization' ? 'border-[#AA8C3C]' : 'border-gray-200'}`}>
                                                    <input type="radio" name="userType" value="enterprise" checked={activeTab === 'organization'} onChange={() => setActiveTab('organization')} className="sr-only" />
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                                            <Building2 className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-900">Doanh nghiệp</h3>
                                                            <p className="text-sm text-gray-500">Dành cho tổ chức, công ty</p>
                                                        </div>
                                                    </div>
                                                    {activeTab === 'organization' && (
                                                        <div className="absolute top-4 right-4 text-[#AA8C3C]">
                                                            <CheckCircle2 className="w-6 h-6 fill-[#AA8C3C] text-white" />
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                        </div>

                                        {/* Form Fields */}
                                        <div className="space-y-6">
                                            {activeTab === 'individual' && (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                                                            <input
                                                                type="text"
                                                                name="fullName"
                                                                value={formData.fullName}
                                                                onChange={handleInputChange}
                                                                onBlur={handleBlur}
                                                                className={`w-full border rounded-lg px-4 py-3 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                                                            />
                                                            {errors.fullName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.fullName}</p>}
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                                                            <input
                                                                type="tel"
                                                                name="phone"
                                                                value={formData.phone}
                                                                onChange={handleInputChange}
                                                                onBlur={handleBlur}
                                                                className={`w-full border rounded-lg px-4 py-3 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                                            />
                                                            {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Số CCCD/HC <span className="text-red-500">*</span></label>
                                                            <input
                                                                type="text"
                                                                name="identityNumber"
                                                                value={formData.identityNumber}
                                                                onChange={handleInputChange}
                                                                onBlur={handleBlur}
                                                                className={`w-full border rounded-lg px-4 py-3 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] ${errors.identityNumber ? 'border-red-500' : 'border-gray-300'}`}
                                                            />
                                                            {errors.identityNumber && <p className="text-red-500 text-xs mt-1 ml-1">{errors.identityNumber}</p>}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-semibold text-gray-900 mb-2">Ngày cấp <span className="text-red-500">*</span></label>
                                                                <input
                                                                    type="date"
                                                                    name="issueDate"
                                                                    value={formData.issueDate}
                                                                    onChange={handleInputChange}
                                                                    onBlur={handleBlur}
                                                                    className={`w-full border rounded-lg px-4 py-3 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] ${errors.issueDate ? 'border-red-500' : 'border-gray-300'}`}
                                                                />
                                                                {errors.issueDate && <p className="text-red-500 text-xs mt-1 ml-1">{errors.issueDate}</p>}
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-semibold text-gray-900 mb-2">Nơi cấp <span className="text-red-500">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    name="issuePlace"
                                                                    value={formData.issuePlace}
                                                                    onChange={handleInputChange}
                                                                    onBlur={handleBlur}
                                                                    className={`w-full border rounded-lg px-4 py-3 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] ${errors.issuePlace ? 'border-red-500' : 'border-gray-300'}`}
                                                                />
                                                                {errors.issuePlace && <p className="text-red-500 text-xs mt-1 ml-1">{errors.issuePlace}</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {activeTab === 'enterprise' && (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Tên doanh nghiệp <span className="text-red-500">*</span></label>
                                                            <input
                                                                type="text"
                                                                name="businessName"
                                                                value={formData.businessName}
                                                                onChange={handleInputChange}
                                                                onBlur={handleBlur}
                                                                className={`w-full border rounded-lg px-4 py-3 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] ${errors.businessName ? 'border-red-500' : 'border-gray-300'}`}
                                                            />
                                                            {errors.businessName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.businessName}</p>}
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Mã số thuế <span className="text-red-500">*</span></label>
                                                            <input
                                                                type="text"
                                                                name="taxCode"
                                                                value={formData.taxCode}
                                                                onChange={handleInputChange}
                                                                onBlur={handleBlur}
                                                                className={`w-full border rounded-lg px-4 py-3 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] ${errors.taxCode ? 'border-red-500' : 'border-gray-300'}`}
                                                            />
                                                            {errors.taxCode && <p className="text-red-500 text-xs mt-1 ml-1">{errors.taxCode}</p>}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Người đại diện <span className="text-red-500">*</span></label>
                                                            <input
                                                                type="text"
                                                                name="repName"
                                                                value={formData.repName}
                                                                onChange={handleInputChange}
                                                                onBlur={handleBlur}
                                                                className={`w-full border rounded-lg px-4 py-3 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] ${errors.repName ? 'border-red-500' : 'border-gray-300'}`}
                                                            />
                                                            {errors.repName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.repName}</p>}
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Số ĐT Đại diện <span className="text-red-500">*</span></label>
                                                            <input
                                                                type="tel"
                                                                name="repPhone"
                                                                value={formData.repPhone}
                                                                onChange={handleInputChange}
                                                                onBlur={handleBlur}
                                                                className={`w-full border rounded-lg px-4 py-3 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] ${errors.repPhone ? 'border-red-500' : 'border-gray-300'}`}
                                                            />
                                                            {errors.repPhone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.repPhone}</p>}
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Bank Information */}
                                            <div className="border-t border-gray-200 pt-6">
                                                <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin ngân hàng</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Tên ngân hàng</label>
                                                        <input
                                                            type="text"
                                                            name="bankName"
                                                            value={formData.bankName}
                                                            onChange={handleInputChange}
                                                            onBlur={handleBlur}
                                                            className={`w-full border rounded-lg px-4 py-3 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] ${errors.bankName ? 'border-red-500' : 'border-gray-300'}`}
                                                        />
                                                        {errors.bankName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.bankName}</p>}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Số tài khoản</label>
                                                        <input
                                                            type="text"
                                                            name="accountNumber"
                                                            value={formData.accountNumber}
                                                            onChange={handleInputChange}
                                                            onBlur={handleBlur}
                                                            className={`w-full border rounded-lg px-4 py-3 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] ${errors.accountNumber ? 'border-red-500' : 'border-gray-300'}`}
                                                        />
                                                        {errors.accountNumber && <p className="text-red-500 text-xs mt-1 ml-1">{errors.accountNumber}</p>}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Chủ tài khoản</label>
                                                        <input
                                                            type="text"
                                                            name="accountHolder"
                                                            value={formData.accountHolder}
                                                            onChange={handleInputChange}
                                                            onBlur={handleBlur}
                                                            className={`w-full border rounded-lg px-4 py-3 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] ${errors.accountHolder ? 'border-red-500' : 'border-gray-300'}`}
                                                        />
                                                        {errors.accountHolder && <p className="text-red-500 text-xs mt-1 ml-1">{errors.accountHolder}</p>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Address Section */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900 mb-2">Địa chỉ <span className="text-red-500">*</span></label>
                                                <div className="space-y-3">
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <select
                                                            name="province"
                                                            value={formData.province}
                                                            onChange={handleProvinceChange}
                                                            onBlur={handleBlur}
                                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg appearance-none bg-white focus:ring-[#AA8C3C] focus:border-[#AA8C3C] ${errors.province ? 'border-red-500' : 'border-gray-300'}`}
                                                        >
                                                            <option value="">Chọn Tỉnh/Thành phố</option>
                                                            {provincesList.map(p => (
                                                                <option key={p} value={p}>{p}</option>
                                                            ))}
                                                        </select>
                                                        {errors.province && <p className="text-red-500 text-xs mt-1 ml-1">{errors.province}</p>}
                                                    </div>

                                                    <div className="relative">
                                                        <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <select
                                                            name="district"
                                                            value={formData.district}
                                                            onChange={handleDistrictChange}
                                                            onBlur={handleBlur}
                                                            disabled={!formData.province}
                                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg appearance-none bg-white focus:ring-[#AA8C3C] focus:border-[#AA8C3C] ${!formData.province ? 'bg-gray-100 cursor-not-allowed' : ''} ${errors.district ? 'border-red-500' : 'border-gray-300'}`}
                                                        >
                                                            <option value="">Chọn Quận/Huyện</option>
                                                            {districtsList.map(d => (
                                                                <option key={d} value={d}>{d}</option>
                                                            ))}
                                                        </select>
                                                        {errors.district && <p className="text-red-500 text-xs mt-1 ml-1">{errors.district}</p>}
                                                    </div>

                                                    <div className="relative">
                                                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <select
                                                            name="ward"
                                                            value={formData.ward}
                                                            onChange={handleWardChange}
                                                            onBlur={handleBlur}
                                                            disabled={!formData.district}
                                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg appearance-none bg-white focus:ring-[#AA8C3C] focus:border-[#AA8C3C] ${!formData.district ? 'bg-gray-100 cursor-not-allowed' : ''} ${errors.ward ? 'border-red-500' : 'border-gray-300'}`}
                                                        >
                                                            <option value="">Chọn Phường/Xã</option>
                                                            {wardsList.map(w => (
                                                                <option key={w} value={w}>{w}</option>
                                                            ))}
                                                        </select>
                                                        {errors.ward && <p className="text-red-500 text-xs mt-1 ml-1">{errors.ward}</p>}
                                                    </div>

                                                    <div className="relative">
                                                        <Navigation className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            name="specificAddress"
                                                            value={formData.specificAddress}
                                                            onChange={handleInputChange}
                                                            onBlur={handleBlur}
                                                            placeholder="Số nhà, đường phố..."
                                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-[#AA8C3C] focus:border-[#AA8C3C] ${errors.specificAddress ? 'border-red-500' : 'border-gray-300'}`}
                                                        />
                                                        {errors.specificAddress && <p className="text-red-500 text-xs mt-1 ml-1">{errors.specificAddress}</p>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Hủy</button>
                                                <button type="submit" className="px-6 py-2.5 bg-[#AA8C3C] text-white rounded-lg font-semibold hover:bg-[#8B7530] transition-colors">Lưu Thay Đổi</button>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Settings Card */}
                            <div className="bg-white/60 backdrop-blur border border-white/40 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Cài Đặt</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                                        <div>
                                            <p className="font-semibold text-gray-900">Thông báo</p>
                                            <p className="text-sm text-gray-600 mt-1">Nhận thông báo về đấu giá</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="settings.notifications" checked={formData.settings.notifications} onChange={handleInputChange} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#AA8C3C]"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">Email cập nhật</p>
                                            <p className="text-sm text-gray-600 mt-1">Nhận email về hoạt động tài khoản</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="settings.emailUpdates" checked={formData.settings.emailUpdates} onChange={handleInputChange} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#AA8C3C]"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

