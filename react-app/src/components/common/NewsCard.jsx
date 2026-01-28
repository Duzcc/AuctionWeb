import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';

export default function NewsCard({ news }) {
    return (
        <Link
            to={`/news/${news.id}`}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full"
        >
            {/* Image */}
            <div className="relative h-56 overflow-hidden">
                <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-[#AA8C3C] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    {news.category}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content */}
            <div className="flex flex-col flex-grow p-6">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    {news.date}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-[#AA8C3C] transition-colors">
                    {news.title}
                </h3>

                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow">
                    {news.excerpt}
                </p>

                <div className="flex items-center text-[#AA8C3C] font-bold text-sm group/link">
                    Đọc tiếp
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/link:translate-x-1" />
                </div>
            </div>
        </Link>
    );
}
