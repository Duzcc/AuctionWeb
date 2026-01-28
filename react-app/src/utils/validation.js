/**
 * Validation Utilities
 * Common validation functions used throughout the app
 */

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone) => {
    // Vietnam phone format: 03x, 05x, 07x, 08x, 09x followed by 8 digits
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    return phoneRegex.test(phone);
};

export const validateIDCard = (idCard) => {
    // CMND: 9 digits, CCCD: 12 digits
    const idRegex = /^[0-9]{9}$|^[0-9]{12}$/;
    return idRegex.test(idCard);
};

export const validateTaxCode = (taxCode) => {
    // Vietnamese tax code: 10-13 digits
    const taxRegex = /^[0-9]{10,13}$/;
    return taxRegex.test(taxCode);
};

export const validatePassword = (password, minLength = 6) => {
    return password && password.length >= minLength;
};

export const validateName = (name, minLength = 3) => {
    return name && name.trim().length >= minLength;
};

export const validateRequired = (value) => {
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
};

export const getValidationError = (field, value) => {
    const validators = {
        email: () => validateEmail(value) ? null : 'Email không hợp lệ',
        phone: () => validatePhone(value) ? null : 'Số điện thoại không hợp lệ',
        repPhone: () => validatePhone(value) ? null : 'Số điện thoại không hợp lệ',
        idCard: () => validateIDCard(value) ? null : 'CMND/CCCD phải có 9 hoặc 12 số',
        identityNumber: () => validateIDCard(value) ? null : 'CMND/CCCD phải có 9 hoặc 12 số',
        taxCode: () => validateTaxCode(value) ? null : 'Mã số thuế phải có 10-13 số',
        password: () => validatePassword(value) ? null : 'Mật khẩu phải có ít nhất 6 ký tự',
        fullName: () => validateName(value) ? null : 'Họ tên phải có ít nhất 3 ký tự',
        businessName: () => validateName(value) ? null : 'Tên doanh nghiệp quá ngắn',
        repName: () => validateName(value) ? null : 'Tên người đại diện quá ngắn',
        required: () => validateRequired(value) ? null : 'Trường này là bắt buộc',

        // Address & Dates
        issueDate: () => validateRequired(value) ? null : 'Vui lòng chọn ngày cấp',
        issuePlace: () => validateRequired(value) ? null : 'Vui lòng nhập nơi cấp',
        province: () => validateRequired(value) ? null : 'Vui lòng chọn Tỉnh/Thành phố',
        district: () => validateRequired(value) ? null : 'Vui lòng chọn Quận/Huyện',
        ward: () => validateRequired(value) ? null : 'Vui lòng chọn Phường/Xã',
        specificAddress: () => validateRequired(value) ? null : 'Vui lòng nhập địa chỉ cụ thể',

        // Bank (Optional but if checked needs validation, for now treat as required text if passed)
        bankName: () => validateRequired(value) ? null : 'Vui lòng nhập tên ngân hàng',
        accountNumber: () => validateRequired(value) ? null : 'Vui lòng nhập số tài khoản',
        accountHolder: () => validateRequired(value) ? null : 'Vui lòng nhập tên chủ tài khoản'
    };

    return validators[field] ? validators[field]() : null;
};

export default {
    validateEmail,
    validatePhone,
    validateIDCard,
    validateTaxCode,
    validatePassword,
    validateName,
    validateRequired,
    getValidationError
};
