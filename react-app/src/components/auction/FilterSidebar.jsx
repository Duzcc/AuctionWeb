
import { useState } from 'react';
import { provinces, plateTypes } from '@/data/constants';

export default function FilterSidebar({ filters, setFilters, onReset }) {
    const [openSections, setOpenSections] = useState({
        type: true,
        year: true,
        avoid: true,
        plateColor: true,
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCheckboxChange = (category, value) => {
        setFilters(prev => {
            const currentList = prev[category] || [];
            const newList = currentList.includes(value)
                ? currentList.filter(item => item !== value)
                : [...currentList, value];
            return { ...prev, [category]: newList };
        });
    };

    const availableYears = ["196x", "197x", "198x", "199x", "200x"];
    const availableAvoids = ["Tránh 4", "Tránh 7", "Tránh 49", "Tránh 53", "Tránh 13"];
    const availableColors = ["Biển trắng", "Biển vàng"];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-6">
            {/* Search */}
            <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Tìm kiếm</label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Nhập biển số..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gold focus:border-gold outline-none"
                    />
                    <svg className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>

            {/* Province */}
            <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Tỉnh / Thành phố</label>
                <select
                    value={filters.province}
                    onChange={(e) => setFilters(prev => ({ ...prev, province: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-gold focus:border-gold outline-none"
                >
                    <option value="">Tất cả tỉnh thành</option>
                    {provinces.map(p => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </div>

            {/* Accordions */}
            <FilterAccordion
                title="Loại biển"
                isOpen={openSections.type}
                onToggle={() => toggleSection('type')}
            >
                {plateTypes.map(t => (
                    <FilterCheckbox
                        key={t}
                        label={t}
                        checked={filters.types?.includes(t)}
                        onChange={() => handleCheckboxChange('types', t)}
                    />
                ))}
            </FilterAccordion>

            <FilterAccordion
                title="Năm sinh / Đầu số"
                isOpen={openSections.year}
                onToggle={() => toggleSection('year')}
            >
                {availableYears.map(y => (
                    <FilterCheckbox
                        key={y}
                        label={y}
                        checked={filters.years?.includes(y)}
                        onChange={() => handleCheckboxChange('years', y)}
                    />
                ))}
            </FilterAccordion>

            <FilterAccordion
                title="Tránh số"
                isOpen={openSections.avoid}
                onToggle={() => toggleSection('avoid')}
            >
                {availableAvoids.map(a => (
                    <FilterCheckbox
                        key={a}
                        label={a}
                        checked={filters.avoids?.includes(a)}
                        onChange={() => handleCheckboxChange('avoids', a)}
                    />
                ))}
            </FilterAccordion>

            <FilterAccordion
                title="Màu biển"
                isOpen={openSections.plateColor}
                onToggle={() => toggleSection('plateColor')}
            >
                {availableColors.map(c => (
                    <FilterCheckbox
                        key={c}
                        label={c}
                        checked={filters.colors?.includes(c)}
                        onChange={() => handleCheckboxChange('colors', c)}
                    />
                ))}
            </FilterAccordion>

            <button
                onClick={onReset}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-300 rounded-lg transition-colors"
            >
                Đặt lại bộ lọc
            </button>
        </div>
    );
}

function FilterAccordion({ title, isOpen, onToggle, children }) {
    return (
        <div className="border-t border-gray-100 pt-4">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full font-bold text-gray-800 mb-2 hover:text-gold transition-colors"
            >
                <span>{title}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            {isOpen && (
                <div className="space-y-2 mt-2">
                    {children}
                </div>
            )}
        </div>
    );
}

function FilterCheckbox({ label, checked, onChange }) {
    return (
        <label className="flex items-center gap-3 cursor-pointer group">
            <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold cursor-pointer"
                checked={!!checked}
                onChange={onChange}
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-900">{label}</span>
        </label>
    );
}
