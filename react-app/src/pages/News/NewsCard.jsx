
import { Link } from 'react-router-dom';

export default function NewsCard({ item, type }) {
    const isNews = type === 'news';
    const detailLink = isNews ? `/news/${item.id}` : `/notifications/${item.id}`;

    return (
        <div className="group flex flex-col md:flex-row gap-6 bg-white p-4 rounded-2xl border border-gray-100 hover:border-gold/30 hover:shadow-lg transition-all duration-300">
            {/* Image */}
            <div className="md:w-1/3 lg:w-1/4 shrink-0 overflow-hidden rounded-xl">
                <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                        src={item.image || '/assets/images/news/default.jpg'}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                    {item.category && (
                        <span className="px-3 py-1 bg-gray-100 text-xs font-semibold text-gray-600 rounded-full uppercase tracking-wider group-hover:bg-gold group-hover:text-white transition-colors">
                            {item.category}
                        </span>
                    )}
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                            <line x1="16" x2="16" y1="2" y2="6" />
                            <line x1="8" x2="8" y1="2" y2="6" />
                            <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                        {item.date}
                    </span>
                </div>

                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 group-hover:text-gold transition-colors line-clamp-2">
                    <Link to={detailLink}>{item.title}</Link>
                </h3>

                <p className="text-gray-600 text-sm md:text-base line-clamp-3 mb-4 leading-relaxed">
                    {item.excerpt}
                </p>

                <Link
                    to={detailLink}
                    className="inline-flex items-center gap-2 text-gold font-semibold hover:gap-3 transition-all text-sm group/link"
                >
                    Xem chi tiết
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
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
