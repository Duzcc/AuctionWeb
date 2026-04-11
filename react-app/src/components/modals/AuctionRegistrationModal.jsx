
import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { getProvinces, getDistricts, getWards } from '@/data/vietnamAddress';
import axios from '@/services/axiosInstance';

export default function AuctionRegistrationModal({ isOpen, onClose, auctionItem }) {
    const { user, isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [userType, setUserType] = useState(null);
    const [formData, setFormData] = useState({
        // Individual
        fullName: '',
        idCard: '',
        phone: '',
        email: '',
        // Organization
        companyName: '',
        taxCode: '',
        representativeName: '',
        representativeId: '',
        // Address
        province: '',
        district: '',
        ward: '',
        specificAddress: '',
        // Terms
        terms: false
    });

    const [errors, setErrors] = useState({});
    const [registrationResult, setRegistrationResult] = useState(null); // Store registration result

    // Address states
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // Init address data
    useEffect(() => {
        setProvinces(getProvinces());
    }, []);

    // Auto-fill form data and set userType from user profile when modal opens
    useEffect(() => {
        if (isOpen && isAuthenticated && user) {
            // Auto-detect user type from profile (required by ProfileCompletionModal)
            const detectedType = user.userType || user.type || 'individual';
            setUserType(detectedType);

            // Pre-fill common fields from user profile
            const provinceName = user.province || user.city || '';
            const districtName = user.district || '';
            const wardName = user.ward || '';

            setFormData(prev => ({
                ...prev,
                fullName: user.fullName || user.name || '',
                phone: user.phone || '',
                email: user.email || '',
                specificAddress: user.specificAddress || user.address || '',
                province: provinceName,
                district: districtName,
                ward: wardName,
                // Set user type specific fields
                companyName: user.businessName || '',
                taxCode: user.taxCode || '',
                representativeName: user.repName || '',
                representativeId: user.identityNumber || '',
                idCard: user.identityNumber || ''
            }));

            // Cascade load address options
            if (provinceName) {
                const provinceDistricts = getDistricts(provinceName);
                setDistricts(provinceDistricts);

                if (districtName) {
                    const districtWards = getWards(provinceName, districtName);
                    setWards(districtWards);
                }
            }
        }
    }, [isOpen, isAuthenticated, user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleProvinceChange = (e) => {
        const newProvince = e.target.value;
        const newDistricts = newProvince ? getDistricts(newProvince) : [];

        setDistricts(newDistricts);
        setWards([]); // Reset wards when province changes

        setFormData(prev => ({
            ...prev,
            province: newProvince,
            district: '',
            ward: ''
        }));
    };

    const handleDistrictChange = (e) => {
        const newDistrict = e.target.value;
        const newWards = newDistrict ? getWards(formData.province, newDistrict) : [];

        setWards(newWards);

        setFormData(prev => ({
            ...prev,
            district: newDistrict,
            ward: ''
        }));
    };

    const handleWardChange = (e) => {
        setFormData(prev => ({
            ...prev,
            ward: e.target.value
        }));
    };

    const validateStep2 = () => {
        const newErrors = {};

        if (userType === 'individual') {
            if (!formData.fullName || formData.fullName.length < 3) {
                newErrors.fullName = 'Họ tên phải có ít nhất 3 ký tự';
            }
            if (!formData.idCard || !/^[0-9]{9}$|^[0-9]{12}$/.test(formData.idCard)) {
                newErrors.idCard = 'CMND/CCCD phải có 9 hoặc 12 số';
            }
        } else {
            if (!formData.companyName || formData.companyName.length < 3) {
                newErrors.companyName = 'Tên công ty phải có ít nhất 3 ký tự';
            }
            if (!formData.taxCode || !/^[0-9]{10,13}$/.test(formData.taxCode)) {
                newErrors.taxCode = 'Mã số thuế phải có 10-13 số';
            }
            if (!formData.representativeName || formData.representativeName.length < 3) {
                newErrors.representativeName = 'Tên người đại diện phải có ít nhất 3 ký tự';
            }
            if (!formData.representativeId || !/^[0-9]{9}$|^[0-9]{12}$/.test(formData.representativeId)) {
                newErrors.representativeId = 'CMND/CCCD phải có 9 hoặc 12 số';
            }
        }

        // Common validations
        if (!formData.phone || !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        if (!formData.province) newErrors.province = 'Vui lòng chọn Tỉnh/Thành phố';
        if (!formData.district) newErrors.district = 'Vui lòng chọn Quận/Huyện';
        if (!formData.ward) newErrors.ward = 'Vui lòng chọn Phường/Xã';
        if (!formData.specificAddress || formData.specificAddress.length < 5) {
            newErrors.specificAddress = 'Địa chỉ cụ thể phải có ít nhất 5 ký tự';
        }
        if (!formData.terms) {
            newErrors.terms = 'Bạn phải đồng ý với điều khoản';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateStep2()) {
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        try {
            const fullAddress = `${formData.specificAddress}, ${formData.ward}, ${formData.district}, ${formData.province}`;

            // Debug: Log the full auctionItem to see its structure
            console.log('DEBUG: Full auctionItem:', auctionItem);

            // auctionItem is now the full sessionPlate object
            // Extract sessionId - it could be:
            // 1. Populated object: sessionId._id
            // 2. String ID directly: sessionId
            // 3. The item itself might be the session: _id
            let sessionId;

            if (auctionItem.sessionId) {
                // sessionId exists
                if (typeof auctionItem.sessionId === 'object' && auctionItem.sessionId._id) {
                    // Populated sessionId object
                    sessionId = auctionItem.sessionId._id;
                } else if (typeof auctionItem.sessionId === 'string') {
                    // String ID directly
                    sessionId = auctionItem.sessionId;
                } else {
                    sessionId = auctionItem.sessionId;
                }
            } else if (auctionItem._id) {
                // Fallback to auctionItem's own ID (might be session itself)
                sessionId = auctionItem._id;
            }

            const plate = auctionItem.plateId || auctionItem;

            // Debug: Log extracted values
            console.log('DEBUG: Extracted sessionId:', sessionId);
            console.log('DEBUG: Extracted plate:', plate);
            console.log('DEBUG: Deposit amount:', auctionItem.depositAmount || plate.startingPrice || 40000000);

            // Validate sessionId
            if (!sessionId) {
                toast.error('Không tìm thấy thông tin phiên đấu giá');
                return;
            }

            // Call API to register
            const response = await axios.post('/registrations', {
                sessionId: sessionId,
                notes: `Address: ${fullAddress}. Rep: ${formData.representativeName || ''}`,
                depositAmount: auctionItem.depositAmount || plate.startingPrice || 40000000
            });

            if (response.data.success) {
                // Store registration result with all details
                setRegistrationResult({
                    registration: response.data.data,
                    sessionCreated: response.data.sessionCreated,
                    sessionPlate: response.data.sessionPlate,
                    message: response.data.message
                });

                // Show success message
                const successMsg = response.data.sessionCreated
                    ? 'Đã tạo phiên đấu giá mới và đăng ký thành công!'
                    : 'Đăng ký phiên đấu giá thành công!';
                toast.success(successMsg);

                // Move to success step
                setStep(3);
            }
        } catch (error) {
            console.error('Registration error:', error);
            console.error('Error response data:', error.response?.data);
            console.error('Error status:', error.response?.status);

            if (error.response?.data?.isExisting) {
                toast.error('Bạn đã đăng ký phiên đấu giá này rồi!');
                // Optional: redirect to existing registration payment if pending
                if (error.response.data.data.depositStatus === 'pending') {
                    navigate(`/payment?type=deposit&registrationId=${error.response.data.data._id}`);
                }
            } else {
                const errorMessage = error.response?.data?.message || error.response?.data?.details || 'Có lỗi xảy ra khi đăng ký';
                toast.error(errorMessage);

                // Log detailed backend error if available
                if (error.response?.data?.stack) {
                    console.error('Backend stack trace:', error.response.data.stack);
                }
            }
        }
    };

    // Reset when modal closes
    const handleClose = () => {
        setUserType(null);
        setErrors({});
        setRegistrationResult(null);
        setStep(1);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Đăng ký đấu giá" size="large">

            {/* User Type Badge */}
            <div className="mb-6 flex items-center justify-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-sm font-medium text-amber-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {userType === 'individual' ? (
                            <>
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </>
                        ) : (
                            <>
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="9" y1="9" x2="9" y2="15"></line>
                                <line x1="15" y1="9" x2="15" y2="15"></line>
                            </>
                        )}
                    </svg>
                    Đăng ký với tư cách: <strong>{userType === 'individual' ? 'Cá nhân' : 'Tổ chức'}</strong>
                </span>
            </div>

            {/* Step 3: Success Screen with Session Details */}
            {step === 3 && registrationResult && (
                <div className="space-y-6">
                    {/* Success Icon */}
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {registrationResult.message || 'Đăng ký thành công!'}
                        </h3>
                        {registrationResult.sessionCreated && (
                            <p className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
                                ✨ Phiên đấu giá mới đã được tạo tự động
                            </p>
                        )}
                    </div>

                    {/* Product Image Gallery */}
                    {registrationResult.sessionPlate?.plateId?.images && registrationResult.sessionPlate.plateId.images.length > 0 && (
                        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                            <img
                                src={registrationResult.sessionPlate.plateId.images[0]}
                                alt={registrationResult.sessionPlate.plateNumber}
                                className="w-full h-64 object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    {/* Product Features & Description */}
                    {(registrationResult.sessionPlate?.plateId?.features || registrationResult.sessionPlate?.plateId?.detailedDescription) && (
                        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-4">
                            {/* Features */}
                            {registrationResult.sessionPlate.plateId.features && registrationResult.sessionPlate.plateId.features.length > 0 && (
                                <div>
                                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Đặc điểm nổi bật</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {registrationResult.sessionPlate.plateId.features.map((feature, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-300 text-amber-800 text-sm font-medium rounded-full"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Detailed Description */}
                            {registrationResult.sessionPlate.plateId.detailedDescription && (
                                <div>
                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Mô tả chi tiết</h5>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {registrationResult.sessionPlate.plateId.detailedDescription}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Price Information Card */}
                    <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-xl p-6">
                        <h5 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Thông tin giá
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-green-100">
                                <p className="text-sm text-gray-600 mb-1">Giá khởi điểm</p>
                                <p className="text-xl font-bold text-green-600">
                                    {(registrationResult.sessionPlate?.startingPrice || 0).toLocaleString('vi-VN')} VNĐ
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-green-100">
                                <p className="text-sm text-gray-600 mb-1">Bước giá</p>
                                <p className="text-xl font-bold text-green-600">
                                    {(registrationResult.sessionPlate?.plateId?.priceStep || 1000000).toLocaleString('vi-VN')} VNĐ
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Session Details Card */}
                    <div className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 rounded-xl p-6 space-y-4">
                        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Thông tin phiên đấu giá
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Plate Information */}
                            {registrationResult.sessionPlate && (
                                <div className="bg-white rounded-lg p-4 border border-amber-100">
                                    <p className="text-sm text-gray-600 mb-1">Biển số</p>
                                    <p className="text-xl font-bold text-amber-600">
                                        {registrationResult.sessionPlate.plateNumber}
                                    </p>
                                </div>
                            )}

                            {/* Room Information */}
                            {registrationResult.registration?.sessionId?.roomId && (
                                <div className="bg-white rounded-lg p-4 border border-amber-100">
                                    <p className="text-sm text-gray-600 mb-1">Phòng đấu giá</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {registrationResult.registration.sessionId.roomId.roomName}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {registrationResult.registration.sessionId.roomId.location}
                                    </p>
                                </div>
                            )}

                            {/* Session Name */}
                            {registrationResult.registration?.sessionId?.sessionName && (
                                <div className="bg-white rounded-lg p-4 border border-amber-100">
                                    <p className="text-sm text-gray-600 mb-1">Tên phiên</p>
                                    <p className="text-base font-semibold text-gray-900">
                                        {registrationResult.registration.sessionId.sessionName}
                                    </p>
                                </div>
                            )}

                            {/* Deposit Amount */}
                            <div className="bg-white rounded-lg p-4 border border-amber-100">
                                <p className="text-sm text-gray-600 mb-1">Tiền đặt cọc</p>
                                <p className="text-lg font-bold text-green-600">
                                    {registrationResult.registration?.depositAmount?.toLocaleString('vi-VN')} VNĐ
                                </p>
                            </div>

                            {/* Start Time */}
                            {registrationResult.registration?.sessionId?.startTime && (
                                <div className="bg-white rounded-lg p-4 border border-amber-100">
                                    <p className="text-sm text-gray-600 mb-1">Thời gian bắt đầu</p>
                                    <p className="text-base font-semibold text-gray-900">
                                        {new Date(registrationResult.registration.sessionId.startTime).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                            )}

                            {/* End Time */}
                            {registrationResult.registration?.sessionId?.endTime && (
                                <div className="bg-white rounded-lg p-4 border border-amber-100">
                                    <p className="text-sm text-gray-600 mb-1">Thời gian kết thúc</p>
                                    <p className="text-base font-semibold text-gray-900">
                                        {new Date(registrationResult.registration.sessionId.endTime).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Registration Status */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-semibold text-blue-900">Trạng thái đăng ký</p>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Bạn cần hoàn tất thanh toán tiền đặt cọc để xác nhận đăng ký tham gia phiên đấu giá.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Đóng
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const registrationId = registrationResult.registration._id;
                                handleClose();
                                navigate(`/payment?type=deposit&registrationId=${registrationId}`);
                            }}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#AA8C3C] to-[#8B7530] text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Thanh toán ngay
                        </button>
                    </div>
                </div>
            )}

            {/* Registration Form (Always Shown) */}
            {userType && step !== 3 && (
                <div>
                    <button
                        onClick={() => {
                            setStep(1);
                            setUserType(null);
                        }}
                        className="mb-4 text-gray-500 hover:text-[#AA8C3C] flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Quay lại
                    </button>

                    <div className="mb-4 flex items-center gap-2 bg-amber-50 p-3 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                            Đăng ký với tư cách: <span className="text-[#AA8C3C] font-bold">
                                {userType === 'individual' ? 'Cá nhân' : 'Tổ chức'}
                            </span>
                        </span>
                    </div>

                    <form className="space-y-4">
                        {userType === 'individual' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] outline-none"
                                        placeholder="Nguyễn Văn A"
                                    />
                                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        CMND/CCCD <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="idCard"
                                        value={formData.idCard}
                                        onChange={handleChange}
                                        maxLength="12"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] outline-none"
                                        placeholder="001234567890"
                                    />
                                    {errors.idCard && <p className="text-red-500 text-sm mt-1">{errors.idCard}</p>}
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tên công ty/tổ chức <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] outline-none"
                                        placeholder="Công ty TNHH ABC"
                                    />
                                    {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Mã số thuế <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="taxCode"
                                        value={formData.taxCode}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] outline-none"
                                        placeholder="0123456789"
                                    />
                                    {errors.taxCode && <p className="text-red-500 text-sm mt-1">{errors.taxCode}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Người đại diện <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="representativeName"
                                        value={formData.representativeName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] outline-none"
                                        placeholder="Nguyễn Văn B"
                                    />
                                    {errors.representativeName && <p className="text-red-500 text-sm mt-1">{errors.representativeName}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        CMND/CCCD người đại diện <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="representativeId"
                                        value={formData.representativeId}
                                        onChange={handleChange}
                                        maxLength="12"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] outline-none"
                                        placeholder="001234567890"
                                    />
                                    {errors.representativeId && <p className="text-red-500 text-sm mt-1">{errors.representativeId}</p>}
                                </div>
                            </>
                        )}

                        {/* Common Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] outline-none"
                                    placeholder="0901234567"
                                />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] outline-none"
                                    placeholder="email@example.com"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>
                        </div>

                        {/* Address Fields */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Địa chỉ <span className="text-red-500">*</span>
                            </label>

                            <select
                                name="province"
                                value={formData.province}
                                onChange={handleProvinceChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] outline-none mb-3"
                            >
                                <option value="">Chọn Tỉnh/Thành phố</option>
                                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            {errors.province && <p className="text-red-500 text-sm mt-1 mb-2">{errors.province}</p>}

                            <select
                                name="district"
                                value={formData.district}
                                onChange={handleDistrictChange}
                                disabled={!formData.province}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] outline-none mb-3 disabled:bg-gray-100"
                            >
                                <option value="">Chọn Quận/Huyện</option>
                                {districts.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                            {errors.district && <p className="text-red-500 text-sm mt-1 mb-2">{errors.district}</p>}

                            <select
                                name="ward"
                                value={formData.ward}
                                onChange={handleWardChange}
                                disabled={!formData.district}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] outline-none mb-3 disabled:bg-gray-100"
                            >
                                <option value="">Chọn Phường/Xã</option>
                                {wards.map(w => (
                                    <option key={w} value={w}>{w}</option>
                                ))}
                            </select>
                            {errors.ward && <p className="text-red-500 text-sm mt-1 mb-2">{errors.ward}</p>}

                            <input
                                type="text"
                                name="specificAddress"
                                value={formData.specificAddress}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AA8C3C] focus:border-[#AA8C3C] outline-none"
                                placeholder="Số nhà, tên đường..."
                            />
                            {errors.specificAddress && <p className="text-red-500 text-sm mt-1">{errors.specificAddress}</p>}
                        </div>

                        {/* Terms */}
                        <div>
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="terms"
                                    checked={formData.terms}
                                    onChange={handleChange}
                                    className="mt-1 w-5 h-5 text-[#AA8C3C] border-gray-300 rounded focus:ring-[#AA8C3C]"
                                />
                                <span className="text-sm text-gray-700">
                                    Tôi đồng ý với <a href="#" className="text-[#AA8C3C] hover:underline font-medium">điều khoản và điều kiện</a> của VPA và cam kết cung cấp thông tin chính xác.
                                </span>
                            </label>
                            {errors.terms && <p className="text-red-500 text-sm mt-1">{errors.terms}</p>}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#AA8C3C] to-[#8B7530] text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                            >
                                Hoàn tất đăng ký
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </Modal>
    );
}
