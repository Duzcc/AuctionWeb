import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosPrivate } from '@/utils/axiosPrivate';
import { toast } from 'react-hot-toast';
import { KeyRound, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Vui lòng nhập email');
            return;
        }

        setLoading(true);
        try {
            await axiosPrivate.post('/auth/forgot-password', { email });
            toast.success('Mã OTP đã được gửi đến email của bạn');
            navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[#AA8C3C] rounded-full flex items-center justify-center mx-auto mb-4">
                            <KeyRound className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Quên mật khẩu</h2>
                        <p className="text-gray-600 mt-2">
                            Nhập email để nhận mã khôi phục
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#AA8C3C] focus:ring-2 focus:ring-[#AA8C3C]/20 outline-none transition-all"
                                placeholder="email@example.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#AA8C3C] text-white py-3 rounded-lg font-semibold hover:bg-[#8B7530] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                        </button>
                    </form>

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
