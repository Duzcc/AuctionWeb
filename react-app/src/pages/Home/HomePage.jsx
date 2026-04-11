import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Tag, UserPlus, HandCoins, Trophy, Eye, Target, Award, Car, Home, Gavel, Users, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import axios from '@/services/axiosInstance';

// ── LiveAuctions mini-component ───────────────────────────────────────────────
function LiveAuctionsSection() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [, setTicks] = useState(0);

    useEffect(() => {
        axios.get('/sessions', { params: { status: 'active', limit: 4 } })
            .then(res => {
                const data = res.data?.data || res.data;
                setSessions(Array.isArray(data) ? data.slice(0, 4) : []);
            })
            .catch(() => setSessions([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const t = setInterval(() => setTicks(p => p + 1), 1000);
        return () => clearInterval(t);
    }, []);

    const getTimeLeft = (endTime) => {
        const diff = Math.max(0, new Date(endTime) - Date.now()) / 1000;
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = Math.floor(diff % 60);
        if (diff <= 0) return { label: 'Đã kết thúc', urgent: true };
        if (h > 0) return { label: `${h}g ${String(m).padStart(2, '0')}p`, urgent: false };
        return { label: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`, urgent: m < 5 };
    };

    const formatVND = (n) => (n || 0) >= 1_000_000
        ? `${((n || 0) / 1_000_000).toFixed(0)}M`
        : `${((n || 0) / 1000).toFixed(0)}K`;

    if (loading || sessions.length === 0) return null;

    return (
        <section className="py-16" style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                            </span>
                            <span className="text-red-400 text-sm font-bold uppercase tracking-wider">Đang diễn ra</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white">Phiên đấu giá LIVE</h2>
                    </div>
                    <Link to="/car-auction" className="hidden md:flex items-center gap-2 text-[#D4AF37] hover:text-[#F0CC50] font-semibold text-sm transition-colors">
                        Xem tất cả <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {sessions.map((session) => {
                        const { label, urgent } = getTimeLeft(session.endTime || session.auctionEndTime);
                        const plates = session.totalPlates || session.sessionPlates?.length || '—';
                        const currentPrice = session.currentHighestBid || session.startingPrice || 0;
                        const bidCount = session.totalBids || session.bids?.length || 0;
                        const participants = session.participantCount || session.participants?.length || 0;
                        const roomType = session.type || session.roomType || 'car';
                        return (
                            <div
                                key={session._id}
                                onClick={() => navigate(`/lobby/${session._id}`)}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 20, padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(10px)' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span style={{ background: roomType === 'car' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)', color: roomType === 'car' ? '#818CF8' : '#34D399', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase' }}>
                                        {roomType === 'car' ? '🚗 Ô tô' : roomType === 'motorbike' ? '🏍 Xe máy' : '🏛 Tài sản'}
                                    </span>
                                    <span style={{ color: urgent ? '#F87171' : '#34D399', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Clock style={{ width: 12, height: 12 }} /> {label}
                                    </span>
                                </div>
                                <p className="font-bold text-white text-sm mb-1 truncate">{session.name || session.title || `Phiên #${session._id?.slice(-6)}`}</p>
                                <p className="text-gray-400 text-xs mb-3 truncate">{plates} biển số đang đấu giá</p>
                                {currentPrice > 0 && (
                                    <div style={{ background: 'rgba(212,175,55,0.1)', borderRadius: 10, padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>
                                        <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginBottom: 2 }}>Giá hiện tại</p>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#D4AF37' }}>{formatVND(currentPrice)} VNĐ</p>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#6B7280' }}><Users style={{ width: 12, height: 12 }} /> {participants} người</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#6B7280' }}><TrendingUp style={{ width: 12, height: 12 }} /> {bidCount} giá</span>
                                    <span style={{ padding: '4px 12px', borderRadius: 100, background: 'rgba(212,175,55,0.15)', color: '#D4AF37', fontSize: '0.7rem', fontWeight: 700 }}>Vào phòng →</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-center mt-6 md:hidden">
                    <Link to="/car-auction" className="flex items-center gap-2 text-[#D4AF37] font-semibold text-sm">
                        Xem tất cả phiên <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default function HomePage() {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [counters, setCounters] = useState({ participants: 0, value: 0, success: 0 });
    const [heroText, setHeroText] = useState({
        title: ['Nơi giá trị', 'Gặp gỡ', 'Cơ hội'],
        description: 'Khám phá nền tảng đấu giá tài sản, biển số xe cao cấp và độc quyền. Tham gia thị trường đấu giá đáng tin cậy nhất Việt Nam.'
    });

    const slides = [
        {
            background: '/assets/banners/back1.jpg',
            title: ['Nơi giá trị', 'Gặp gỡ', 'Cơ hội'],
            description: 'Khám phá nền tảng đấu giá tài sản, biển số xe cao cấp và độc quyền. Tham gia thị trường đấu giá đáng tin cậy nhất Việt Nam.'
        },
        {
            background: '/assets/banners/back2.png',
            title: ['Biển số đẹp', 'Tài sản cao cấp', 'Giá hợp lý'],
            description: 'Sở hữu những biển số xe đẹp và tài sản cao cấp với giá trị thực tế. Đảm bảo mang đến cơ hội sở hữu tài sản độc đáo, giá trị lâu dài.'
        },
        {
            background: '/assets/banners/back3.png',
            title: ['Đấu giá trực tuyến', 'An toàn', 'Tiện lợi'],
            description: 'Tham gia đấu giá mọi lúc mọi nơi với hệ thống bảo mật cao. Thanh toán nhanh chóng, giao dịch được bảo đảm 100%. Tận hưởng trải nghiệm mua sắm đáng tin cậy và an tâm.'
        }
    ];

    // Slideshow effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Update text when slide changes
    useEffect(() => {
        setHeroText({
            title: slides[currentSlide].title,
            description: slides[currentSlide].description
        });
    }, [currentSlide]);

    // Counter animation
    useEffect(() => {
        const targets = { participants: 15000, value: 100, success: 99 };
        const duration = 2000;
        const steps = duration / 16;

        const interval = setInterval(() => {
            setCounters((prev) => {
                const newCounters = { ...prev };
                let allComplete = true;

                Object.keys(targets).forEach((key) => {
                    if (prev[key] < targets[key]) {
                        const increment = Math.ceil(targets[key] / steps);
                        newCounters[key] = Math.min(prev[key] + increment, targets[key]);
                        allComplete = false;
                    }
                });

                if (allComplete) clearInterval(interval);
                return newCounters;
            });
        }, 16);

        return () => clearInterval(interval);
    }, []);

    const partners = [
        '/assets/images/bidv.png',
        '/assets/images/techcombank.png',
        '/assets/images/vietinbank.webp',
        '/assets/images/vietcombank.webp',
        '/assets/images/agribank.webp',
        '/assets/images/vpbank.png',
        '/assets/images/acb.webp',
        '/assets/images/csgt.png',
        '/assets/images/gastuandat.png'
    ];

    return (
        <div className="bg-[#FAF9F6]">
            {/* Hero Section with Slideshow */}
            <section className="relative flex items-center overflow-hidden" style={{ height: '750px' }}>
                {/* Slideshow Background */}
                <div className="absolute inset-0 z-0">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0'
                                }`}
                            style={{ backgroundImage: `url('${slide.background}')` }}
                        />
                    ))}
                </div>

                {/* Overlay Gradient */}
                <div
                    className="absolute inset-0 z-[1]"
                    style={{
                        background:
                            'linear-gradient(135deg, rgba(26,26,26,0.85) 0%, rgba(45,45,45,0.6) 50%, rgba(61,61,61,0.5) 100%)'
                    }}
                />

                {/* Decorative blurs */}
                <div
                    className="absolute top-0 right-1/4 w-96 h-96 rounded-full filter blur-3xl opacity-20 z-[1]"
                    style={{ background: '#F59E0B' }}
                />
                <div
                    className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full filter blur-3xl opacity-10 z-[1]"
                    style={{ background: '#AA8C3C' }}
                />

                <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                        <div className="text-white">
                            {/* Live Badge */}
                            <div className="inline-flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2 mb-6 cursor-pointer hover:bg-gray-700/80 transition-colors">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                                </span>
                                <span className="text-sm font-semibold uppercase tracking-wider">
                                    ĐẤU GIÁ TRỰC TUYẾN ĐANG MỞ
                                </span>
                            </div>

                            {/* Title */}
                            <h1
                                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                    letterSpacing: '-0.02em',
                                    transition: 'opacity 0.5s ease-in-out'
                                }}
                            >
                                <span className="block">{heroText.title[0]}</span>
                                <span className="block">{heroText.title[1]}</span>
                                <span
                                    className="block italic"
                                    style={{
                                        background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}
                                >
                                    {heroText.title[2]}
                                </span>
                            </h1>

                            {/* Description */}
                            <p
                                className="text-base md:text-lg mb-6 max-w-lg leading-relaxed text-gray-300"
                                style={{ transition: 'opacity 0.5s ease-in-out' }}
                            >
                                {heroText.description}
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <button
                                    onClick={() => navigate('/car-auction')}
                                    className="group relative px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 shadow-xl transition-all duration-300 hover:scale-105"
                                    style={{
                                        background: 'linear-gradient(135deg, #AA8C3C)',
                                        color: 'white',
                                        boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)'
                                    }}
                                >
                                    <Search className="w-5 h-5" />
                                    <span>Khám phá đấu giá</span>
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="group relative px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 shadow-xl transition-all duration-300 hover:scale-105"
                                    style={{
                                        background: 'white',
                                        color: 'black',
                                        boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)'
                                    }}
                                >
                                    <Tag className="w-5 h-5" />
                                    <span>Đăng ký ngay</span>
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-8">
                                <div className="text-center">
                                    <div
                                        className="text-4xl font-black mb-1"
                                        style={{
                                            background: 'linear-gradient(to bottom right, #FDE047, #CA8A04)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text'
                                        }}
                                    >
                                        {counters.participants.toLocaleString()}
                                    </div>
                                    <div className="text-[10px] md:text-sm uppercase tracking-wide text-gray-400">
                                        Người tham gia (Triệu)
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div
                                        className="text-4xl font-black mb-1"
                                        style={{
                                            background: 'linear-gradient(to bottom right, #FDE047, #CA8A04)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text'
                                        }}
                                    >
                                        {counters.value.toLocaleString()}
                                    </div>
                                    <div className="text-[10px] md:text-sm uppercase tracking-wide text-gray-400">
                                        Giá trị (Tỷ)
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div
                                        className="text-4xl font-black mb-1"
                                        style={{
                                            background: 'linear-gradient(to bottom right, #FDE047, #CA8A04)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text'
                                        }}
                                    >
                                        {counters.success}
                                    </div>
                                    <div className="text-[10px] md:text-sm uppercase tracking-wide text-gray-400">
                                        Thành công (%)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Auctions Section */}
            <LiveAuctionsSection />

            {/* Services Section */}
            <section
                className="relative py-20"
                style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #FFFFFF 100%)' }}
            >
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-3xl shadow-xl p-10 lg:p-14">
                        <div className="flex flex-col lg:flex-row gap-14 items-center">
                            {/* Left */}
                            <div className="lg:w-1/3">
                                <h2 className="text-[32px] font-bold text-gray-900 mb-6">Dịch vụ của chúng tôi</h2>
                                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                    Công ty Đấu giá Chuyên nghiệp Toàn quốc (NPA) cung cấp các dịch vụ đấu giá minh
                                    bạch, chuyên nghiệp và đúng pháp luật.
                                </p>
                                <button
                                    onClick={() => document.getElementById('about-us')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold transition hover:scale-105"
                                    style={{ background: 'linear-gradient(135deg,#AA8C3C)' }}
                                >
                                    Về chúng tôi
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <polyline points="19 12 12 19 5 12"></polyline>
                                    </svg>
                                </button>
                            </div>

                            {/* Right cards */}
                            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Card 1: Car */}
                                <div className="group bg-white p-6 rounded-2xl border border-[rgba(170,140,60,0.25)] hover:border-[rgba(170,140,60,0.5)] shadow-sm hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer">
                                    <div
                                        className="w-14 h-14 mb-4 rounded-2xl flex items-center justify-center text-white"
                                        style={{
                                            background: 'linear-gradient(135deg, #AA8C3C, #8F7532)',
                                            boxShadow: '0 8px 20px rgba(170,140,60,.35)'
                                        }}
                                    >
                                        <Car className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-gray-900">Đấu giá biển số xe</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Sở hữu biển số đẹp, phong thủy, quy trình công khai.
                                    </p>
                                </div>

                                {/* Card 2: Home */}
                                <div className="group bg-white p-6 rounded-2xl border border-[rgba(170,140,60,0.25)] hover:border-[rgba(170,140,60,0.5)] shadow-sm hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer">
                                    <div
                                        className="w-14 h-14 mb-4 rounded-2xl flex items-center justify-center text-white"
                                        style={{
                                            background: 'linear-gradient(135deg, #AA8C3C, #8F7532)',
                                            boxShadow: '0 8px 20px rgba(170,140,60,.35)'
                                        }}
                                    >
                                        <Home className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-gray-900">Đấu giá tài sản</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Tài sản thi hành án, tang vật, phương tiện…
                                    </p>
                                </div>

                                {/* Card 3: Gavel */}
                                <div className="group bg-white p-6 rounded-2xl border border-[rgba(170,140,60,0.25)] hover:border-[rgba(170,140,60,0.5)] shadow-sm hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer">
                                    <div
                                        className="w-14 h-14 mb-4 rounded-2xl flex items-center justify-center text-white"
                                        style={{
                                            background: 'linear-gradient(135deg, #AA8C3C, #8F7532)',
                                            boxShadow: '0 8px 20px rgba(170,140,60,.35)'
                                        }}
                                    >
                                        <Gavel className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-gray-900">Dành cho tổ chức</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Đăng ký tổ chức đấu giá trên nền tảng VPA.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section
                className="relative py-20"
                style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F6F2 100%)' }}
            >
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Cách thức hoạt động</h2>
                        <p className="text-base md:text-lg max-w-2xl mx-auto text-gray-600">
                            Mua hay bán, nền tảng của chúng tôi giúp quá trình đấu giá trở nên đơn giản, minh bạch
                            và an toàn.
                        </p>
                    </div>

                    <div className="relative max-w-6xl mx-auto">
                        {/* Connecting line */}
                        <div
                            className="hidden md:block absolute top-12 left-1/2 w-[70%] h-0.5 -translate-x-1/2"
                            style={{ background: 'linear-gradient(90deg, transparent, #AA8C3C, transparent)' }}
                        />

                        {/* Steps */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                            {/* Step 1 */}
                            <div className="text-center group">
                                <div className="relative inline-block mb-6">
                                    <div
                                        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1"
                                        style={{
                                            background: 'linear-gradient(135deg,#AA8C3C,#8F7532)',
                                            boxShadow: '0 12px 32px rgba(170,140,60,.35)'
                                        }}
                                    >
                                        <UserPlus className="w-9 h-9 text-white" />
                                    </div>
                                    <div
                                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center font-bold text-sm"
                                        style={{ borderColor: '#AA8C3C', color: '#AA8C3C' }}
                                    >
                                        1
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">Tạo tài khoản</h3>
                                <p className="text-sm leading-relaxed text-gray-600">
                                    Đăng ký nhanh chóng và bảo mật để bắt đầu tham gia các phiên đấu giá trên nền tảng.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="text-center group">
                                <div className="relative inline-block mb-6">
                                    <div
                                        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1"
                                        style={{
                                            background: 'linear-gradient(135deg,#AA8C3C,#8F7532)',
                                            boxShadow: '0 12px 32px rgba(170,140,60,.35)'
                                        }}
                                    >
                                        <HandCoins className="w-9 h-9 text-white" />
                                    </div>
                                    <div
                                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center font-bold text-sm"
                                        style={{ borderColor: '#AA8C3C', color: '#AA8C3C' }}
                                    >
                                        2
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">Đặt giá thầu</h3>
                                <p className="text-sm leading-relaxed text-gray-600">
                                    Lựa chọn tài sản quan tâm và đưa ra mức giá cạnh tranh theo thời gian thực.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="text-center group">
                                <div className="relative inline-block mb-6">
                                    <div
                                        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1"
                                        style={{
                                            background: 'linear-gradient(135deg,#AA8C3C,#8F7532)',
                                            boxShadow: '0 12px 32px rgba(170,140,60,.35)'
                                        }}
                                    >
                                        <Trophy className="w-9 h-9 text-white" />
                                    </div>
                                    <div
                                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center font-bold text-sm"
                                        style={{ borderColor: '#AA8C3C', color: '#AA8C3C' }}
                                    >
                                        3
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">Thắng & Nhận hàng</h3>
                                <p className="text-sm leading-relaxed text-gray-600">
                                    Hoàn tất thanh toán và nhận tài sản theo quy trình bảo mật, đúng pháp luật.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section
                id="about-us"
                className="relative py-24 overflow-hidden"
                style={{ background: 'linear-gradient(180deg, #F7F6F2 0%, #FFFFFF 100%)' }}
            >
                {/* Decorative blur */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
                    style={{ background: '#AA8C3C' }}
                />

                <div className="relative max-w-6xl mx-auto px-4">
                    {/* Heading */}
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Lời giới thiệu</h2>
                        <div
                            className="w-24 h-1 mx-auto mb-6 rounded-full"
                            style={{ background: 'linear-gradient(90deg,#E6DFC8,#AA8C3C)' }}
                        />
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Công ty Đấu giá Chuyên nghiệp Toàn quốc (NPA) là đơn vị hoạt động chuyên nghiệp trong
                            lĩnh vực tư vấn, tổ chức đấu giá tài sản, hướng tới sự minh bạch và giá trị bền vững.
                        </p>
                    </div>

                    {/* Intro highlight box */}
                    <div className="relative bg-white rounded-3xl border border-[rgba(170,140,60,0.25)] shadow-md p-10 md:p-14 mb-24">
                        <span
                            className="absolute -top-4 left-8 bg-white px-4 text-sm font-semibold tracking-wide border border-[rgba(170,140,60,0.25)] rounded-full"
                            style={{ color: '#AA8C3C' }}
                        >
                            National Professional Auctions
                        </span>
                        <p className="text-gray-700 text-lg leading-loose text-center max-w-4xl mx-auto">
                            Với kinh nghiệm hợp tác cùng nhiều Cơ quan, Tập đoàn và Doanh nghiệp lớn, NPA được tin
                            tưởng tổ chức các phiên đấu giá tài sản có giá trị cao và tính chất phức tạp. Chúng tôi
                            không ngừng đổi mới để khẳng định vị thế{' '}
                            <span className="font-semibold text-gray-900">
                                tổ chức đấu giá uy tín hàng đầu tại Việt Nam
                            </span>{' '}
                            lấy quyền lợi khách hàng làm kim chỉ nam cho mọi hoạt động.
                        </p>
                    </div>

                    {/* Vision / Mission / Values */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Vision */}
                        <div className="bg-white rounded-2xl p-8 border border-[rgba(170,140,60,0.25)] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-6">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                                    style={{ background: 'linear-gradient(135deg,#AA8C3C,#8F7532)' }}
                                >
                                    <Eye className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Tầm nhìn</h3>
                            </div>
                            <div className="border-l-4 pl-4" style={{ borderColor: '#AA8C3C' }}>
                                <p className="text-gray-600 leading-relaxed">
                                    Trở thành tổ chức đấu giá tài sản uy tín hàng đầu, tiên phong ứng dụng công nghệ
                                    và tiêu chuẩn minh bạch.
                                </p>
                            </div>
                        </div>

                        {/* Mission */}
                        <div className="bg-white rounded-2xl p-8 border border-[rgba(170,140,60,0.25)] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-6">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                                    style={{ background: 'linear-gradient(135deg,#AA8C3C,#8F7532)' }}
                                >
                                    <Target className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Sứ mệnh</h3>
                            </div>
                            <div className="border-l-4 pl-4" style={{ borderColor: '#AA8C3C' }}>
                                <p className="text-gray-600 leading-relaxed">
                                    Cung cấp dịch vụ đấu giá chuyên nghiệp, đúng pháp luật, tối ưu giá trị tài sản cho
                                    khách hàng và đối tác.
                                </p>
                            </div>
                        </div>

                        {/* Values */}
                        <div className="bg-white rounded-2xl p-8 border border-[rgba(170,140,60,0.25)] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-6">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                                    style={{ background: 'linear-gradient(135deg,#AA8C3C,#8F7532)' }}
                                >
                                    <Award className="w-6 h-6" />
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

            {/* Partners Section */}
            <div className="py-14 md:py-18" style={{ background: '#FAF9F6' }}>
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-[40px] font-bold text-gray-900 mb-12 leading-[48px]">Đối tác</h2>

                    {/* Slider */}
                    <div className="relative max-w-6xl mx-auto overflow-hidden">
                        <div className="flex items-center gap-12 py-4 px-10 animate-scroll w-max hover:play-state-paused">
                            {[...partners, ...partners].map((partner, index) => (
                                <div key={index} className="flex-none w-40 h-12 flex items-center justify-center">
                                    <img src={partner} alt="Partner" className="h-full object-contain" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
