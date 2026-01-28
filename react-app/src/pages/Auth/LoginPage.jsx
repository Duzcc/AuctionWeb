import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Check, X } from 'lucide-react';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [showPassword, setShowPassword] = useState({
        signin: false,
        signup: false,
        confirm: false
    });

    // Form states
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
    });

    // Validation Errors State
    const [errors, setErrors] = useState({});

    const [isLoading, setIsLoading] = useState(false);

    // Check for session expiry message
    useEffect(() => {
        const authError = sessionStorage.getItem('authError');
        if (authError) {
            toast.error(authError, { duration: 5000 });
            sessionStorage.removeItem('authError');
        }
    }, []);

    // --- Validation Utilities (Inline for Page Logic) ---
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email) ? null : 'Email không hợp lệ';
    };

    const validatePassword = (password) => {
        if (!password) return 'Vui lòng nhập mật khẩu';
        if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
        return null;
    };

    // --- Event Handlers ---

    const handleBlur = (field, value, formType) => {
        let error = null;
        switch (field) {
            case 'email':
                error = validateEmail(value);
                break;
            case 'password':
                error = validatePassword(value);
                break;
            case 'fullName':
                if (!value.trim()) {
                    error = 'Vui lòng nhập họ tên';
                } else if (value.trim().length < 3) {
                    error = 'Họ tên phải có ít nhất 3 ký tự';
                }
                break;
            case 'confirmPassword':
                if (value !== registerForm.password) error = 'Mật khẩu không khớp';
                break;
            default:
                break;
        }

        setErrors(prev => ({
            ...prev,
            [`${formType}_${field}`]: error
        }));
    };

    // OTP State
    const [otpCode, setOtpCode] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        // If Showing OTP Input, skip standard validation and just submit OTP
        if (showOtpInput) {
            if (!otpCode) {
                toast.error('Vui lòng nhập mã OTP');
                return;
            }
            setIsLoading(true);
            try {
                // Call login again but with OTP
                // Use 'loginForm' values + otpCode
                const result = await login(loginForm.email, loginForm.password, otpCode);
                if (result.success) {
                    toast.success('Đăng nhập admin thành công!');
                    navigate('/admin/dashboard'); // Or root, auth context redirects based on role
                } else {
                    toast.error(result.message || 'Mã OTP không đúng');
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Lỗi xác thực OTP');
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // Standard Login
        const emailError = validateEmail(loginForm.email);
        const passwordError = !loginForm.password ? 'Vui lòng nhập mật khẩu' : null;

        if (emailError || passwordError) {
            setErrors({
                signin_email: emailError,
                signin_password: passwordError
            });
            return;
        }

        setIsLoading(true);
        try {
            const result = await login(loginForm.email, loginForm.password);

            if (result.success) {
                // Check if OTP required (Admin flow)
                if (result.requireOtp) {
                    setShowOtpInput(true);
                    toast.success('Vui lòng nhập mã OTP đã gửi về email (Admin Check)');
                } else {
                    toast.success('Đăng nhập thành công!');
                    navigate('/');
                }
            } else {
                if (result.requireOtp) { // Context might assume success:false if flow interrupted or custom structure
                    // But usually context returns data. 
                    // If context treats this as success=true with payload, use above block.
                    // If context throws or returns success=false... let's check auth context structure later?
                    // Assuming 'login' returns the API response data object structure directly or normalized.
                    setShowOtpInput(true);
                    toast.success(result.message);
                } else {
                    toast.error(result.error || 'Đăng nhập thất bại');
                }
            }
        } catch (error) {
            // Handle "Require OTP" via 200 OK response usually, but if error...
            const msg = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        // Validation
        let nameError = null;
        if (!registerForm.fullName.trim()) {
            nameError = 'Vui lòng nhập họ tên';
        } else if (registerForm.fullName.trim().length < 3) {
            nameError = 'Họ tên phải có ít nhất 3 ký tự';
        }

        const emailError = validateEmail(registerForm.email);
        const passError = validatePassword(registerForm.password);
        const confirmError = registerForm.password !== registerForm.confirmPassword ? 'Mật khẩu không khớp' : null;
        const termsError = !registerForm.acceptTerms ? 'Bạn phải đồng ý với điều khoản' : null;

        if (nameError || emailError || passError || confirmError || termsError) {
            setErrors({
                signup_fullName: nameError,
                signup_email: emailError,
                signup_password: passError,
                signup_confirmPassword: confirmError,
                signup_terms: termsError
            });
            if (termsError) toast.error(termsError);
            return;
        }

        setIsLoading(true);

        // Generate username from fullName (remove spaces and special chars)
        const username = registerForm.fullName
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '') ||
            registerForm.email.split('@')[0];

        try {
            const result = await register({
                username,
                fullName: registerForm.fullName,
                email: registerForm.email,
                password: registerForm.password
            });

            if (result.success) {
                toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
                // Reset form
                setRegisterForm({
                    fullName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    acceptTerms: false
                });
                setErrors({});
                // Switch to login form
                setTimeout(() => {
                    setIsRegisterMode(false);
                }, 1000);
            } else {
                toast.error(result.error || 'Đăng ký thất bại');
            }
        } catch (error) {
            console.error('Register error:', error);
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    // Social Icon SVG Component to avoid FontAwesome dependency issues
    const SocialIcon = ({ type }) => {
        if (type === 'google') {
            return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" /></svg>;
        }
        if (type === 'facebook') {
            return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
        }
        return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>;
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className={`auth-container relative w-full max-w-[850px] min-h-[550px] bg-white rounded-[20px] shadow-2xl overflow-hidden ${isRegisterMode ? 'auth-active' : ''}`}>

                {/* SIGN IN FORM */}
                <div className="auth-form-container sign-in absolute top-0 left-0 w-1/2 h-full transition-all duration-600 ease-in-out z-[2]">
                    <form onSubmit={handleLogin} className="flex flex-col items-center justify-center h-full px-10 bg-white text-center" noValidate>
                        <h1 className="text-3xl font-bold mb-4 text-gray-800">Đăng Nhập</h1>

                        <div className="flex gap-4 mb-5">
                            <button type="button" className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"><SocialIcon type="google" /></button>
                            <button type="button" className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"><SocialIcon type="facebook" /></button>
                            <button type="button" className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"><SocialIcon type="github" /></button>
                        </div>

                        <span className="text-sm text-gray-500 mb-5">hoặc sử dụng email của bạn</span>

                        <div className="w-full mb-3 text-left">
                            {showOtpInput ? (
                                // OTP INPUT view
                                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-sm text-center">
                                        Vui lòng nhập mã OTP đã được gửi đến email quản trị viên của bạn.
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Nhập mã OTP (6 số)"
                                            className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C] transition-all text-center tracking-[0.5em] font-bold text-xl"
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            ) : (
                                // STANDARD LOGIN view
                                <>
                                    <div className="relative mb-3">
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            className={`w-full px-4 py-3 bg-gray-100 border ${errors.signin_email ? 'border-red-500' : 'border-transparent'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C] transition-all`}
                                            value={loginForm.email}
                                            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                            onBlur={(e) => handleBlur('email', e.target.value, 'signin')}
                                        />
                                        {errors.signin_email && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{errors.signin_email}</p>}
                                    </div>

                                    <div className="relative">
                                        <input
                                            type={showPassword.signin ? "text" : "password"}
                                            placeholder="Mật khẩu"
                                            className={`w-full px-4 py-3 bg-gray-100 border ${errors.signin_password ? 'border-red-500' : 'border-transparent'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C] transition-all`}
                                            value={loginForm.password}
                                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                            onBlur={(e) => handleBlur('password', e.target.value, 'signin')}
                                        />
                                        <button type="button" onClick={() => setShowPassword({ ...showPassword, signin: !showPassword.signin })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showPassword.signin ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        {errors.signin_password && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{errors.signin_password}</p>}
                                    </div>
                                </>
                            )}
                        </div>

                        <a href="#" className="text-sm text-gray-600 hover:text-[#AA8C3C] mt-2 mb-4 font-medium transition-colors">Quên mật khẩu?</a>

                        <button type="submit" className="px-10 py-3 bg-[#AA8C3C] text-white font-bold rounded-full uppercase tracking-wider text-xs hover:bg-[#8B7530] transition-transform active:scale-95 shadow-md hover:shadow-lg">
                            {isLoading ? 'Đang xử lý...' : (showOtpInput ? 'Xác thực OTP' : 'Đăng Nhập')}
                        </button>
                    </form>
                </div>

                {/* SIGN UP FORM */}
                <div className={`auth-form-container sign-up absolute top-0 left-0 w-1/2 h-full transition-all duration-600 ease-in-out z-[1] ${isRegisterMode ? 'opacity-100 z-[5]' : 'opacity-0 z-[1] translate-x-full'}`} style={{ transform: isRegisterMode ? 'translateX(100%)' : 'translateX(0)' }}>
                    <form onSubmit={handleRegister} className="flex flex-col items-center justify-center h-full px-10 bg-white text-center" noValidate>
                        <h1 className="text-3xl font-bold mb-4 text-gray-800">Tạo Tài Khoản</h1>

                        <div className="flex gap-4 mb-5">
                            <button type="button" className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"><SocialIcon type="google" /></button>
                            <button type="button" className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"><SocialIcon type="facebook" /></button>
                            <button type="button" className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"><SocialIcon type="github" /></button>
                        </div>

                        <span className="text-sm text-gray-500 mb-5">hoặc sử dụng email của bạn</span>

                        <div className="w-full mb-3 text-left">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tên đăng nhập"
                                    className={`w-full px-4 py-3 bg-gray-100 border ${errors.signup_fullName ? 'border-red-500' : 'border-transparent'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C] transition-all`}
                                    value={registerForm.fullName}
                                    onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                                    onBlur={(e) => handleBlur('fullName', e.target.value, 'signup')}
                                />
                                {errors.signup_fullName && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{errors.signup_fullName}</p>}
                            </div>
                        </div>

                        <div className="w-full mb-3 text-left">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className={`w-full px-4 py-3 bg-gray-100 border ${errors.signup_email ? 'border-red-500' : 'border-transparent'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C] transition-all`}
                                    value={registerForm.email}
                                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                                    onBlur={(e) => handleBlur('email', e.target.value, 'signup')}
                                />
                                {errors.signup_email && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{errors.signup_email}</p>}
                            </div>
                        </div>

                        <div className="w-full mb-3 text-left">
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="Mật khẩu"
                                    className={`w-full px-4 py-3 bg-gray-100 border ${errors.signup_password ? 'border-red-500' : 'border-transparent'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C] transition-all`}
                                    value={registerForm.password}
                                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                    onBlur={(e) => handleBlur('password', e.target.value, 'signup')}
                                />
                                {errors.signup_password && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{errors.signup_password}</p>}
                            </div>
                        </div>

                        <div className="w-full mb-4 text-left">
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="Xác nhận mật khẩu"
                                    className={`w-full px-4 py-3 bg-gray-100 border ${errors.signup_confirmPassword ? 'border-red-500' : 'border-transparent'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AA8C3C] transition-all`}
                                    value={registerForm.confirmPassword}
                                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                                    onBlur={(e) => handleBlur('confirmPassword', e.target.value, 'signup')}
                                />
                                {errors.signup_confirmPassword && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{errors.signup_confirmPassword}</p>}
                            </div>
                        </div>

                        <div className="w-full mb-4 flex items-center justify-center">
                            <label className="flex items-center cursor-pointer text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    className="mr-2 accent-[#AA8C3C]"
                                    checked={registerForm.acceptTerms}
                                    onChange={(e) => setRegisterForm({ ...registerForm, acceptTerms: e.target.checked })}
                                />
                                <span>Tôi đồng ý với <a href="#" className="font-bold text-[#AA8C3C]">Điều khoản</a> & <a href="#" className="font-bold text-[#AA8C3C]">Chính sách</a></span>
                            </label>
                        </div>

                        <button type="submit" className="px-10 py-3 bg-[#AA8C3C] text-white font-bold rounded-full uppercase tracking-wider text-xs hover:bg-[#8B7530] transition-transform active:scale-95 shadow-md hover:shadow-lg">
                            {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
                        </button>
                    </form>
                </div>

                {/* OVERLAY PANELS */}
                <div className="auth-overlay-container absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 ease-in-out z-[100]" style={{ transform: isRegisterMode ? 'translateX(-100%)' : 'translateX(0)' }}>
                    <div className="auth-overlay relative -left-full h-full w-[200%] bg-gradient-to-r from-[#AA8C3C] to-[#8B7530] text-white transition-transform duration-600 ease-in-out" style={{ transform: isRegisterMode ? 'translateX(50%)' : 'translateX(0)' }}>
                        <div className={`auth-overlay-panel auth-overlay-left absolute flex flex-col items-center justify-center top-0 h-full w-1/2 text-center px-10 transition-transform duration-600 ease-in-out ${isRegisterMode ? 'translate-x-0' : '-translate-x-[20%]'}`}>
                            <h1 className="text-4xl font-bold mb-4">Chào Mừng Trở Lại!</h1>
                            <p className="text-sm leading-6 tracking-wider font-light mb-8">Đã có tài khoản? Đăng nhập để tiếp tục kết nối với chúng tôi</p>
                            <button onClick={() => setIsRegisterMode(false)} className="px-10 py-3 bg-transparent border border-white text-white font-bold rounded-full uppercase tracking-wider text-xs hover:bg-white hover:text-[#AA8C3C] transition-all">
                                Đăng Nhập
                            </button>
                        </div>
                        <div className={`auth-overlay-panel auth-overlay-right absolute flex flex-col items-center justify-center top-0 right-0 h-full w-1/2 text-center px-10 transition-transform duration-600 ease-in-out ${isRegisterMode ? 'translate-x-[20%]' : 'translate-x-0'}`}>
                            <h1 className="text-4xl font-bold mb-4">Xin Chào!</h1>
                            <p className="text-sm leading-6 tracking-wider font-light mb-8">Chưa có tài khoản? Đăng ký ngay để bắt đầu hành trình của bạn</p>
                            <button onClick={() => setIsRegisterMode(true)} className="px-10 py-3 bg-transparent border border-white text-white font-bold rounded-full uppercase tracking-wider text-xs hover:bg-white hover:text-[#AA8C3C] transition-all">
                                Đăng Ký
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                .auth-container {
                     min-height: 480px; 
                }
                .auth-container.auth-active .sign-in {
                    transform: translateX(100%);
                }
            `}</style>

        </div>
    );
}
