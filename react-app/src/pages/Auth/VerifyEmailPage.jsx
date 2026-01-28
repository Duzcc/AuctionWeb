import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { axiosPrivate } from '@/utils/axiosPrivate';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const navigate = useNavigate();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const handleChange = (index, value) => {
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            toast.error('Vui lòng nhập đủ 6 số');
            return;
        }

        setLoading(true);
        try {
            await axiosPrivate.post('/auth/verify-otp', {
                email,
                otpCode
            });

            toast.success('Xác thực thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Mã OTP không hợp lệ');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await axiosPrivate.post('/auth/resend-otp', { email });
            toast.success('Mã OTP mới đã được gửi');
            setOtp(['', '', '', '', '', '']);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể gửi lại OTP');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[#AA8C3C] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Xác thực Email</h2>
                        <p className="text-gray-600 mt-2">
                            Nhập mã 6 số đã được gửi đến
                        </p>
                        <p className="text-[#AA8C3C] font-semibold">{email}</p>
                    </div>

                    {/* OTP Input */}
                    <form onSubmit={handleVerify}>
                        <div className="flex justify-center gap-2 mb-6">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#AA8C3C] focus:ring-2 focus:ring-[#AA8C3C]/20 outline-none transition-all"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#AA8C3C] text-white py-3 rounded-lg font-semibold hover:bg-[#8B7530] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang xác thực...' : 'Xác thực'}
                        </button>
                    </form>

                    {/* Resend */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm mb-2">Không nhận được mã?</p>
                        <button
                            onClick={handleResend}
                            disabled={resending}
                            className="text-[#AA8C3C] font-semibold hover:underline disabled:opacity-50"
                        >
                            {resending ? 'Đang gửi...' : 'Gửi lại OTP'}
                        </button>
                    </div>

                    {/* Back to Login */}
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-6 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 w-full"
                    >
                        <ArrowLeft size={16} />
                        <span>Quay lại đăng nhập</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
