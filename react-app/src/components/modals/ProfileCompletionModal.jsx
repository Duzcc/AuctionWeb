import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';

/**
 * ProfileCompletionModal - Non-dismissible modal that forces users to complete their profile
 * 
 * Opens automatically after login if user.isProfileComplete === false
 * Cannot be closed until user completes all required fields
 */
export default function ProfileCompletionModal({ isOpen, onComplete }) {
    const { user, updateProfile } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        userType: 'individual', // 'individual' or 'organization'
        // Individual fields
        identityNumber: '',
        issueDate: '',
        issuePlace: '',
        // Organization fields
        businessName: '',
        taxCode: '',
        repName: '',
        repPhone: '',
        // Bank info (optional)
        bankName: '',
        accountNumber: '',
        accountHolder: ''
    });

    const [errors, setErrors] = useState({});

    // Vietnamese provinces
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

    // Pre-fill with user data if available
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.name || user.fullName || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                userType: user.userType || 'individual',
                identityNumber: user.identityNumber || '',
                issueDate: user.issueDate || '',
                issuePlace: user.issuePlace || '',
                businessName: user.businessName || '',
                taxCode: user.taxCode || '',
                repName: user.repName || '',
                repPhone: user.repPhone || '',
                bankName: user.bankName || '',
                accountNumber: user.accountNumber || '',
                accountHolder: user.accountHolder || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validate = () => {
        const newErrors = {};

        // Required fields for all users
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ tên đầy đủ';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }
        if (!formData.address.trim()) {
            newErrors.address = 'Vui lòng nhập địa chỉ';
        }
        if (!formData.city) {
            newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
        }

        // Individual-specific validation
        if (formData.userType === 'individual') {
            if (!formData.identityNumber.trim()) {
                newErrors.identityNumber = 'Vui lòng nhập CMND/CCCD';
            }
            if (!formData.issueDate) {
                newErrors.issueDate = 'Vui lòng nhập ngày cấp';
            }
            if (!formData.issuePlace.trim()) {
                newErrors.issuePlace = 'Vui lòng nhập nơi cấp';
            }
        }

        // Organization-specific validation
        if (formData.userType === 'organization') {
            if (!formData.businessName.trim()) {
                newErrors.businessName = 'Vui lòng nhập tên doanh nghiệp';
            }
            if (!formData.taxCode.trim()) {
                newErrors.taxCode = 'Vui lòng nhập mã số thuế';
            }
            if (!formData.repName.trim()) {
                newErrors.repName = 'Vui lòng nhập tên người đại diện';
            }
            if (!formData.repPhone.trim()) {
                newErrors.repPhone = 'Vui lòng nhập SĐT người đại diện';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        const result = await updateProfile(formData);

        if (result.success) {
            toast.success('Hoàn thành thông tin thành công!');
            if (onComplete) onComplete();
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => { }} // Prevent closing
            title="Hoàn thành thông tin cá nhân"
            size="large"
            closeOnBackdrop={false} // Cannot close by clicking backdrop
            closeOnEsc={false} // Cannot close with ESC key
        >
            <div className="space-y-6">
                {/* Warning Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-amber-900 mb-1">Bắt buộc hoàn thành</h4>
                            <p className="text-sm text-amber-800">
                                Vui lòng hoàn thành thông tin cá nhân để tiếp tục sử dụng các tính năng đấu giá và thanh toán.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C] ${errors.fullName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                Số điện thoại <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C] ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                            Địa chỉ <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C] ${errors.address ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                            Tỉnh/Thành phố <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C] ${errors.city ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="">-- Chọn tỉnh/thành phố --</option>
                            {vietnameseProvinces.map(province => (
                                <option key={province} value={province}>{province}</option>
                            ))}
                        </select>
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>

                    {/* Individual Fields */}
                    {formData.userType === 'individual' && (
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="font-bold text-gray-900">Thông tin cá nhân</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        CMND/CCCD <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="identityNumber"
                                        value={formData.identityNumber}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C] ${errors.identityNumber ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.identityNumber && <p className="text-red-500 text-sm mt-1">{errors.identityNumber}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Ngày cấp <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="issueDate"
                                        value={formData.issueDate}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C] ${errors.issueDate ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.issueDate && <p className="text-red-500 text-sm mt-1">{errors.issueDate}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Nơi cấp <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="issuePlace"
                                    value={formData.issuePlace}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C] ${errors.issuePlace ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.issuePlace && <p className="text-red-500 text-sm mt-1">{errors.issuePlace}</p>}
                            </div>
                        </div>
                    )}

                    {/* Organization Fields */}
                    {formData.userType === 'organization' && (
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="font-bold text-gray-900">Thông tin doanh nghiệp</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Tên doanh nghiệp <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="businessName"
                                        value={formData.businessName}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C] ${errors.businessName ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Mã số thuế <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="taxCode"
                                        value={formData.taxCode}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C] ${errors.taxCode ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.taxCode && <p className="text-red-500 text-sm mt-1">{errors.taxCode}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Người đại diện <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="repName"
                                        value={formData.repName}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C] ${errors.repName ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.repName && <p className="text-red-500 text-sm mt-1">{errors.repName}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        SĐT người đại diện <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="repPhone"
                                        value={formData.repPhone}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C] ${errors.repPhone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.repPhone && <p className="text-red-500 text-sm mt-1">{errors.repPhone}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bank Info (Optional) */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="font-bold text-gray-900">Thông tin ngân hàng (Tùy chọn)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Tên ngân hàng</label>
                                <input
                                    type="text"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Số tài khoản</label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Chủ tài khoản</label>
                                <input
                                    type="text"
                                    name="accountHolder"
                                    value={formData.accountHolder}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="px-8 py-3 bg-gradient-to-r from-[#AA8C3C] to-[#8B7530] text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        >
                            Hoàn tất
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
