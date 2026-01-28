import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { newsData, notifData } from '@/data/newsData';

export default function NewsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'news';

    // Determine data source
    const currentData = activeTab === 'notif' ? notifData : newsData;
    const isNews = activeTab !== 'notif';

    const handleItemClick = (id) => {
        navigate(isNews ? `/news/${id}` : `/news/${id}?type=notif`);
    };

    return (
        <div className="bg-white min-h-[70vh] pb-16">
            {/* Banner - Matches PageBanner.js */}
            <div
                id="news-banner"
                className="relative h-80 bg-cover bg-center"
                style={{ backgroundImage: "url('/assets/banners/news-banner.jpg')" }}
            >
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-white">
                    <div className="border-l-4 border-[#AA8C3C] pl-4 mb-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">Tin Tức & Sự Kiện</h1>
                        <p className="text-xl">Cập nhật thông tin mới nhất về đấu giá biển số và tài sản</p>
                    </div>
                </div>
            </div>

            {/* News Section - Matches NewsSection.template.html */}
            <div className="py-16 bg-white">
                <div className="container mx-auto px-4">

                    {/* Title Bar - No Buttons, just Title Box */}
                    <div className="w-full flex items-center mb-6">
                        <div
                            id="section-title-box"
                            className={`inline-block px-6 py-3 font-bold text-lg text-white rounded-t-lg shadow-sm border-r-4 border-white transition-colors ${isNews ? 'bg-[#AA8C3C]' : 'bg-[#8B7030]'
                                }`}
                        >
                            {isNews ? 'Tin tức mới nhất' : 'Thông báo mới nhất'}
                        </div>
                        <div className="flex-grow border-b border-[#AA8C3C] h-1 self-end mb-[1px]"></div>
                    </div>

                    {/* List - Matches NewsItem.template.html logic */}
                    <div className="space-y-0 pb-4" id="news-list">
                        {currentData.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleItemClick(item.id)}
                                className="flex gap-6 items-start border-b border-blue-200 pb-6 pt-6 group cursor-pointer hover:bg-blue-50/50 transition-colors news-row"
                                data-id={item.id}
                                data-type={isNews ? 'news' : 'notif'}
                            >
                                {/* Image */}
                                <img
                                    src={item.image || '/images/news/default.jpg'}
                                    alt={item.title}
                                    className="w-56 h-36 object-cover rounded-md flex-shrink-0 bg-gray-200"
                                />

                                {/* Content */}
                                <div className="flex-1">
                                    <h3 className="text-gray-800 font-bold text-lg group-hover:text-[#AA8C3C] transition-colors mb-2">
                                        {item.title}
                                    </h3>
                                    {item.category && (
                                        <div className="text-sm text-gray-400 mb-2">{item.category}</div>
                                    )}
                                    <p className="text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                                        {item.excerpt}
                                    </p>
                                </div>

                                {/* Date */}
                                <div className="flex-shrink-0 text-xs text-gray-400 ml-4 whitespace-nowrap">
                                    {item.date}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Placeholder */}
                    <div id="pagination-container" className="flex justify-end mt-8"></div>

                </div>
            </div>
        </div>
    );
}
