export default function AboutPage() {
    return (
        <div className="bg-white">
            {/* Page Banner */}
            <div
                className="relative h-64 bg-cover bg-center"
                style={{ backgroundImage: "url('/assets/banners/about_banner.png')" }}
            >
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-white">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">Giới thiệu</h1>
                    <p className="text-xl">Về chúng tôi</p>
                </div>
            </div>

            {/* Same content as HomePage About section - reuse */}
            <section
                id="about-us"
                className="relative py-24 overflow-hidden"
                style={{ background: 'linear-gradient(180deg, #F7F6F2 0%, #FFFFFF 100%)' }}
            >
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
                    style={{ background: '#AA8C3C' }}
                />

                <div className="relative max-w-6xl mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Lời giới thiệu</h2>
                        <div
                            className="w-24 h-1 mx-auto mb-6 rounded-full"
                            style={{ background: 'linear-gradient(90deg,#E6DFC8,#AA8C3C)' }}
                        />
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Công ty Đấu giá Chuyên nghiệp Toàn quốc (NPA) là đơn vị hoạt động chuyên nghiệp
                            trong lĩnh vực tư vấn, tổ chức đấu giá tài sản, hướng tới sự minh bạch và giá trị
                            bền vững.
                        </p>
                    </div>

                    <div className="relative bg-white rounded-3xl border border-[rgba(170,140,60,0.25)] shadow-md p-10 md:p-14 mb-24">
                        <span
                            className="absolute -top-4 left-8 bg-white px-4 text-sm font-semibold tracking-wide border border-[rgba(170,140,60,0.25)] rounded-full"
                            style={{ color: '#AA8C3C' }}
                        >
                            National Professional Auctions
                        </span>
                        <p className="text-gray-700 text-lg leading-loose text-center max-w-4xl mx-auto">
                            Với kinh nghiệm hợp tác cùng nhiều Cơ quan, Tập đoàn và Doanh nghiệp lớn, NPA được
                            tin tưởng tổ chức các phiên đấu giá tài sản có giá trị cao và tính chất phức tạp.
                            Chúng tôi không ngừng đổi mới để khẳng định vị thế{' '}
                            <span className="font-semibold text-gray-900">
                                tổ chức đấu giá uy tín hàng đầu tại Việt Nam
                            </span>{' '}
                            lấy quyền lợi khách hàng làm kim chỉ nam cho mọi hoạt động.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="bg-white rounded-2xl p-8 border border-[rgba(170,140,60,0.25)] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-6">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                                    style={{ background: 'linear-gradient(135deg,#AA8C3C,#8F7532)' }}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Tầm nhìn</h3>
                            </div>
                            <div className="border-l-4 pl-4" style={{ borderColor: '#AA8C3C' }}>
                                <p className="text-gray-600 leading-relaxed">
                                    Trở thành tổ chức đấu giá tài sản uy tín hàng đầu, tiên phong ứng dụng công
                                    nghệ và tiêu chuẩn minh bạch.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 border border-[rgba(170,140,60,0.25)] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-6">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                                    style={{ background: 'linear-gradient(135deg,#AA8C3C,#8F7532)' }}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6v6l4 2" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Sứ mệnh</h3>
                            </div>
                            <div className="border-l-4 pl-4" style={{ borderColor: '#AA8C3C' }}>
                                <p className="text-gray-600 leading-relaxed">
                                    Cung cấp dịch vụ đấu giá chuyên nghiệp, đúng pháp luật, tối ưu giá trị tài sản
                                    cho khách hàng và đối tác.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 border border-[rgba(170,140,60,0.25)] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-6">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                                    style={{ background: 'linear-gradient(135deg,#AA8C3C,#8F7532)' }}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Giá trị cốt lõi</h3>
                            </div>
                            <div className="border-l-4 pl-4 space-y-2" style={{ borderColor: '#AA8C3C' }}>
                                <p className="text-gray-600">Minh bạch & công bằng</p>
                                <p className="text-gray-600">Chuyên nghiệp & trách nhiệm</p>
                                <p className="text-gray-600">Khách hàng là trung tâm</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
