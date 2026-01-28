import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { newsData, notifData } from '@/data/newsData';
import {
    Calendar,
    Tag,
    Share2,
    ArrowLeft,
    Check,
    BellRing,
    Bookmark,
    Building2,
    Link,
    Facebook,
    Linkedin,
    Twitter
} from 'lucide-react';

export default function NewsDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [scrollProgress, setScrollProgress] = useState(0);

    // Combine data to find the item
    const allData = [...newsData, ...notifData];
    const item = allData.find((i) => i.id === parseInt(id));

    // Determine type based on where it came from
    // (In a real app, 'type' should be a property of the item)
    const isNotification = notifData.some(i => i.id === parseInt(id));

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / totalHeight) * 100;
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Social Share Mock Functions
    const shareUrl = window.location.href;
    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        // Could add a toast here
    };

    if (!item) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">Không tìm thấy bài viết</h2>
                    <button
                        onClick={() => navigate('/news')}
                        className="px-8 py-3 bg-[#AA8C3C] text-white rounded-full hover:bg-[#8B7530] transition shadow-lg font-medium"
                    >
                        Quay lại trang tin tức
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800">
            {/* Reading Progress Bar */}
            <div
                className="fixed top-0 left-0 h-1 bg-gradient-to-r from-[#AA8C3C] to-[#C9A961] z-50 transition-all duration-300 ease-out"
                style={{ width: `${scrollProgress}%` }}
            />

            <article>
                {/* Hero Section */}
                <div className="relative h-[600px] overflow-hidden group">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110"
                        />
                    </div>

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                    {/* Hero Content */}
                    <div className="absolute inset-0 flex items-end">
                        <div className="w-full container mx-auto px-4 md:px-8 pb-16 md:pb-24">
                            <div className="max-w-4xl mx-auto">
                                {/* Badge */}
                                <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                                    {isNotification ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#AA8C3C]/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                                                <BellRing className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="inline-block bg-[#AA8C3C]/20 text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest backdrop-blur-md border border-white/20 uppercase shadow-lg">
                                                Thông báo
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#AA8C3C]/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                                                <Tag className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="inline-block bg-[#AA8C3C]/20 text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest backdrop-blur-md border border-white/20 uppercase shadow-lg">
                                                {item.category || 'Tin tức'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Title */}
                                <h1
                                    className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-8 leading-tight tracking-tight animate-fade-in-up drop-shadow-2xl"
                                    style={{ animationDelay: '0.2s' }}
                                >
                                    {item.title}
                                </h1>

                                {/* Meta Info */}
                                <div
                                    className="flex flex-wrap items-center gap-6 text-white/90 text-sm md:text-base animate-fade-in-up font-medium"
                                    style={{ animationDelay: '0.3s' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <span>{item.date}</span>
                                    </div>
                                    <div className="h-4 w-px bg-white/30" />
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                                            {isNotification ? <Building2 className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                        </div>
                                        <span>{item.source || 'NPA Auction'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2 backdrop-blur-sm">
                            <div className="w-1 h-2 bg-white/80 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative bg-white">
                    {/* Decorative Border */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#AA8C3C] to-transparent opacity-30" />

                    <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24">
                        {/* Excerpt */}
                        {item.excerpt && (
                            <div className="mb-12 relative pl-8 border-l-4 border-[#AA8C3C]">
                                <p className="text-xl md:text-2xl text-gray-700 italic font-serif leading-relaxed">
                                    "{item.excerpt}"
                                </p>
                            </div>
                        )}

                        {/* Article Body */}
                        <div
                            className="prose prose-lg md:prose-xl max-w-none 
                            prose-headings:font-serif prose-headings:text-gray-900 
                            prose-p:text-gray-600 prose-p:leading-8 prose-p:font-light
                            prose-a:text-[#AA8C3C] prose-a:no-underline hover:prose-a:underline
                            prose-blockquote:border-l-[#AA8C3C] prose-blockquote:bg-amber-50/30 prose-blockquote:py-4 prose-blockquote:px-6
                            prose-img:rounded-2xl prose-img:shadow-xl
                            first-letter:text-5xl first-letter:font-bold first-letter:text-[#AA8C3C] first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px] first-letter:font-serif"
                            dangerouslySetInnerHTML={{ __html: item.content }}
                        />

                        {/* Divider */}
                        <div className="flex items-center justify-center my-16 opacity-50">
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent w-full" />
                            <div className="px-4 text-[#AA8C3C]">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/20px-Flag_of_Vietnam.svg.png"
                                    className="w-6 h-6 rounded-full grayscale opacity-50"
                                    alt="divider"
                                />
                            </div>
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent w-full" />
                        </div>

                        {/* Social Share */}
                        <div className="mb-12">
                            <h3 className="text-center text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">
                                Chia sẻ bài viết
                            </h3>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1877F2] text-white hover:bg-[#166fe5] transition shadow-md hover:shadow-lg transform hover:-translate-y-1">
                                    <Facebook className="w-5 h-5" />
                                    <span className="font-medium">Facebook</span>
                                </button>
                                <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1DA1F2] text-white hover:bg-[#1a91da] transition shadow-md hover:shadow-lg transform hover:-translate-y-1">
                                    <Twitter className="w-5 h-5" />
                                    <span className="font-medium">Twitter</span>
                                </button>
                                <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0A66C2] text-white hover:bg-[#004182] transition shadow-md hover:shadow-lg transform hover:-translate-y-1">
                                    <Linkedin className="w-5 h-5" />
                                    <span className="font-medium">LinkedIn</span>
                                </button>
                                <button
                                    onClick={handleCopyLink}
                                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition shadow-md hover:shadow-lg transform hover:-translate-y-1"
                                >
                                    <Link className="w-5 h-5" />
                                    <span className="font-medium">Sao chép</span>
                                </button>
                            </div>
                        </div>

                        {/* Back Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={() => navigate('/news')}
                                className="group relative px-10 py-4 rounded-full bg-gradient-to-r from-[#AA8C3C] via-[#C9A961] to-[#AA8C3C] text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                            >
                                <span className="flex items-center gap-3">
                                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    Quay lại danh sách
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </article>

            {/* Custom Styles for Typography & Animation */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap');
                
                .font-serif {
                    font-family: 'Playfair Display', serif;
                }
                
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
}
