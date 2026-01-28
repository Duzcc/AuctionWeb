import { MapPin, Phone, Mail, Facebook, ChevronRight } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] text-white pt-16 pb-8 border-t-2 border-[#AA8C3C]/30 w-full">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column - Company Info */}
                    <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl">
                        {/* Logo */}
                        <div className="mb-4">
                            <div className="w-32 h-16 flex items-center justify-start">
                                <img
                                    src="/assets/logo/logo_textwhite.png"
                                    alt="Logo"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold mb-6 text-white leading-tight">
                            Công ty Đấu giá Chuyên nghiệp Toàn quốc
                        </h3>

                        <div className="flex flex-col gap-5 text-gray-100">
                            {/* Address - HQ */}
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#AA8C3C] to-[#8B7530] flex items-center justify-center flex-shrink-0 shadow-md">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-sm">
                                    <span className="text-[#AA8C3C] font-bold block mb-1">Trụ sở chính:</span>
                                    <span className="text-gray-200">Số 12 Chùa Bộc, Phường Đống Đa, TP. Hà Nội</span>
                                </div>
                            </div>

                            {/* Address - Branch */}
                            <div className="flex items-start gap-4 -mt-3">
                                <div className="w-10 h-0 flex-shrink-0"></div>
                                <div className="text-sm">
                                    <span className="text-[#AA8C3C] font-bold block mb-1">Chi nhánh HCM:</span>
                                    <span className="text-gray-200">
                                        Số 114 Bùi Thị Xuân, Quận 1, TP. Hồ Chí Minh
                                    </span>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#AA8C3C] to-[#8B7530] flex items-center justify-center flex-shrink-0 shadow-md">
                                    <Phone className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-sm">
                                    <span className="text-[#AA8C3C] font-bold">Hotline CSKH:</span>
                                    <span className="text-gray-200 ml-1">1900.8888.88</span>
                                    <p className="text-gray-200 mt-1">
                                        Các số gọi ra: 024.9995.5515, 024.9996.8888 hoặc đầu số "NPA"
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#AA8C3C] to-[#8B7530] flex items-center justify-center flex-shrink-0 shadow-md">
                                    <Mail className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-sm space-y-1">
                                    <p>
                                        <span className="text-[#AA8C3C] font-bold">Đấu giá biển số:</span>{' '}
                                        <span className="text-gray-200 ml-1">dgbs@npa.com.vn</span>
                                    </p>
                                    <p>
                                        <span className="text-[#AA8C3C] font-bold">Đấu giá tài sản:</span>{' '}
                                        <span className="text-gray-200 ml-1">dgts@npa.com.vn</span>
                                    </p>
                                    <p>
                                        <span className="text-[#AA8C3C] font-bold">Liên hệ hợp tác:</span>{' '}
                                        <span className="text-gray-200 ml-1">info@npa.com.vn</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Company Legal Info */}
                        <div className="mt-8 pt-6 border-t border-white/10 text-xs text-gray-300 space-y-1">
                            <p>
                                Đại diện: <span className="font-semibold text-white">Ông Đinh Tuấn Dũng</span> -
                                Chức vụ: <span className="font-semibold text-white">Giám Đốc</span>
                            </p>
                            <p>
                                Giấy chứng nhận ĐKHĐ:{' '}
                                <span className="font-semibold text-white">41/TP-ĐKHĐ</span> do Sở Tư pháp Hà Nội
                                cấp ngày 21/01/2025
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Social & Policies */}
                    <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl flex flex-col gap-10">
                        {/* Social Media */}
                        <div>
                            <h3 className="text-xl font-bold mb-6">Theo dõi chúng tôi trên</h3>
                            <div className="flex gap-4">
                                <a
                                    href="https://www.facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#1877F2] p-3 rounded-lg hover:scale-110 transition-all shadow-lg text-white"
                                >
                                    <Facebook className="w-7 h-7" />
                                </a>
                                <a
                                    href="https://zalo.me/vi/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#1877F2] px-3 py-3 rounded-lg hover:scale-110 transition-all font-bold text-sm shadow-lg flex items-center text-white"
                                >
                                    Zalo
                                </a>
                            </div>
                        </div>

                        {/* Government Certification */}
                        <div>
                            <a
                                href="http://online.gov.vn/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block hover:scale-105 transition-transform duration-300"
                            >
                                <img
                                    src="/assets/images/bocongthuong.png"
                                    alt="Đã đăng ký Bộ Công Thương"
                                    className="h-20 w-auto object-contain"
                                />
                            </a>
                        </div>

                        {/* Policies */}
                        <div>
                            <h3 className="text-xl font-bold mb-6">Chính sách</h3>
                            <ul className="space-y-4">
                                <li>
                                    <a
                                        href="https://drive.google.com/file/d/1xovLKH_C62pC3-qg3OrQySI0BSngGoI1/view?usp=drive_link"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-300 hover:text-white flex items-center gap-2 group transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4 text-[#AA8C3C] group-hover:translate-x-1 transition-transform" />
                                        <span>Chính sách bảo vệ dữ liệu cá nhân</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://drive.google.com/file/d/1Dp9OWbWQ8R0CE-5uS-C43O6eEksdKhqh/view?usp=drive_link"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-300 hover:text-white flex items-center gap-2 group transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4 text-[#AA8C3C] group-hover:translate-x-1 transition-transform" />
                                        <span>Quy chế cuộc đấu giá</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Copyright */}
                <div className="border-t border-white/20 mt-12 pt-8 text-center text-sm">
                    <p className="text-gray-300 mb-2">
                        Trang đấu giá trực tuyến <span className="text-white font-bold">npa.com.vn</span> đã
                        được Sở Tư pháp TP. Hà Nội phê duyệt đủ điều kiện theo{' '}
                        <span className="font-semibold text-white">Quyết định số 226/QĐ-STP</span>
                    </p>
                    <p className="text-gray-500 italic">Bản quyền thuộc về NPA © 2025</p>
                </div>
            </div>
        </footer>
    );
}
