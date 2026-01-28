import { z } from 'zod';

/**
 * Login validation schema
 */
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email là bắt buộc')
        .email('Email không hợp lệ'),
    password: z
        .string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
});

/**
 * Register validation schema
 */
export const registerSchema = z
    .object({
        username: z
            .string()
            .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
            .max(50, 'Tên đăng nhập không được quá 50 ký tự')
            .regex(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ chứa chữ cái, số và gạch dưới'),
        email: z
            .string()
            .min(1, 'Email là bắt buộc')
            .email('Email không hợp lệ'),
        password: z
            .string()
            .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
            .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
            .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
            .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số'),
        confirmPassword: z
            .string()
            .min(1, 'Vui lòng xác nhận mật khẩu'),
        fullName: z
            .string()
            .min(3, 'Họ tên phải có ít nhất 3 ký tự')
            .optional(),
        phone: z
            .string()
            .regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ')
            .optional()
            .or(z.literal('')),
        avatar: z
            .instanceof(File)
            .refine((file) => file.size <= 5 * 1024 * 1024, 'Kích thước file không được vượt quá 5MB')
            .refine(
                (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
                'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)'
            )
            .optional(),
        acceptTerms: z
            .boolean()
            .refine((val) => val === true, 'Bạn phải đồng ý với điều khoản và chính sách'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmPassword'],
    });

/**
 * OTP validation schema
 */
export const otpSchema = z.object({
    email: z
        .string()
        .min(1, 'Email là bắt buộc')
        .email('Email không hợp lệ'),
    otpCode: z
        .string()
        .length(6, 'Mã OTP phải có 6 chữ số')
        .regex(/^[0-9]+$/, 'Mã OTP chỉ chứa số'),
});

/**
 * Forgot Password validation schema
 */
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'Email là bắt buộc')
        .email('Email không hợp lệ'),
});

/**
 * Reset Password validation schema
 */
export const resetPasswordSchema = z
    .object({
        email: z
            .string()
            .min(1, 'Email là bắt buộc')
            .email('Email không hợp lệ'),
        otpCode: z
            .string()
            .length(6, 'Mã OTP phải có 6 chữ số')
            .regex(/^[0-9]+$/, 'Mã OTP chỉ chứa số'),
        newPassword: z
            .string()
            .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
            .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
            .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
            .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số'),
        confirmNewPassword: z
            .string()
            .min(1, 'Vui lòng xác nhận mật khẩu mới'),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmNewPassword'],
    });

/**
 * Profile update validation schema
 */
export const profileUpdateSchema = z.object({
    fullName: z
        .string()
        .min(3, 'Họ tên phải có ít nhất 3 ký tự')
        .optional(),
    phone: z
        .string()
        .regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ')
        .optional()
        .or(z.literal('')),
    address: z
        .string()
        .min(10, 'Địa chỉ phải có ít nhất 10 ký tự')
        .optional()
        .or(z.literal('')),
    avatar: z
        .instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, 'Kích thước file không được vượt quá 5MB')
        .refine(
            (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
            'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)'
        )
        .optional(),
});

export default {
    loginSchema,
    registerSchema,
    otpSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    profileUpdateSchema,
};
