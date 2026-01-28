import { useState } from 'react';
import { Search, Download, FileText } from 'lucide-react';
import ProfileSidebar from '@/components/profile/ProfileSidebar';

export default function DocumentsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock documents data matching DocumentsPage.js structure
    const documents = [
        { id: 1, plateNumber: '30A-888.88', type: 'Hợp đồng', date: '2025-01-10', status: 'active', fileName: 'hop_dong_30A_888_88.pdf' },
        { id: 2, plateNumber: '51F-999.99', type: 'Biên bản', date: '2025-01-12', status: 'active', fileName: 'bien_ban_51F_999_99.pdf' },
        { id: 3, plateNumber: '29E-444.44', type: 'Giấy tờ', date: '2024-12-20', status: 'archived', fileName: 'giay_to_29E_444_44.pdf' }
    ];

    const filteredDocs = documents.filter(doc =>
        doc.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownload = (doc) => {
        alert('Tải tài liệu: ' + doc.fileName);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Banner - Matches DocumentsPage.template.html */}
            <div className="relative h-80 bg-cover bg-center overflow-hidden shrink-0"
                style={{ backgroundImage: "url('/assets/banners/documents.png')" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
                <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                        Tài liệu của tôi
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        Quản lý tài liệu và hợp đồng đấu giá
                    </p>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full lg:w-80 shrink-0">
                        <ProfileSidebar />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 px-8 py-6 rounded-t-xl shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Tài liệu của tôi</h1>
                                    <p className="text-gray-600 mt-1">Quản lý tài liệu và hợp đồng đấu giá</p>
                                </div>
                                <div className="relative">
                                    <input
                                        type="search"
                                        id="docs-search"
                                        placeholder="Nhập biển số"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full md:w-64 pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Content Area - TABLE LAYOUT */}
                        <div id="docs-content" className="p-8 bg-white border-x border-b border-gray-200 rounded-b-xl shadow-sm">
                            {filteredDocs.length > 0 ? (
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Biển số</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Loại tài liệu</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ngày tạo</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredDocs.map(doc => {
                                                const statusClass = doc.status === 'active'
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200';
                                                const statusText = doc.status === 'active' ? 'Hoạt động' : 'Lưu trữ';

                                                return (
                                                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold text-gray-900 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                                    {doc.plateNumber}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{doc.type}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-900">{new Date(doc.date).toLocaleDateString('vi-VN')}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1 ${statusClass} border rounded-full text-xs font-semibold`}>
                                                                {statusText}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => handleDownload(doc)}
                                                                className="text-[#AA8C3C] hover:text-blue-800 font-semibold text-sm transition-colors hover:underline">
                                                                Tải về
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-24">
                                    <div className="w-32 h-32 mb-6 opacity-40">
                                        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="50" y="40" width="100" height="130" rx="8" fill="#94A3B8" opacity="0.3" />
                                            <rect x="60" y="60" width="40" height="4" rx="2" fill="#94A3B8" opacity="0.5" />
                                            <rect x="60" y="75" width="70" height="4" rx="2" fill="#94A3B8" opacity="0.5" />
                                            <rect x="60" y="90" width="60" height="4" rx="2" fill="#94A3B8" opacity="0.5" />
                                            <circle cx="130" cy="60" r="8" fill="#94A3B8" opacity="0.4" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 text-base">Không tìm thấy bản ghi nào</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

