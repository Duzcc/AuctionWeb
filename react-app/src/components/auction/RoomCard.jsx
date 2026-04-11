import React from 'react';
import PropTypes from 'prop-types';

/**
 * Professional Room Card Component
 * Displays auction room information with appropriate styling based on room type
 */
export default function RoomCard({ room, onClick, isSelected }) {
    // Get icon based on room type
    const getRoomIcon = (roomType) => {
        switch (roomType) {
            case 'CarPlate':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        <path d="M3 17h18v-6H3v6zm0-8h18c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2z" />
                    </svg>
                );
            case 'MotorbikePlate':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                );
            case 'Asset':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                );
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                );
        }
    };

    // Get color based on room type
    const getColorClasses = (roomType) => {
        switch (roomType) {
            case 'CarPlate':
                return {
                    bg: 'from-blue-50 to-blue-100',
                    border: 'border-blue-300',
                    text: 'text-blue-700',
                    badge: 'bg-blue-600',
                    icon: 'text-blue-600'
                };
            case 'MotorbikePlate':
                return {
                    bg: 'from-red-50 to-red-100',
                    border: 'border-red-300',
                    text: 'text-red-700',
                    badge: 'bg-red-600',
                    icon: 'text-red-600'
                };
            case 'Asset':
                return {
                    bg: 'from-green-50 to-green-100',
                    border: 'border-green-300',
                    text: 'text-green-700',
                    badge: 'bg-green-600',
                    icon: 'text-green-600'
                };
            default:
                return {
                    bg: 'from-amber-50 to-amber-100',
                    border: 'border-amber-300',
                    text: 'text-amber-700',
                    badge: 'bg-amber-600',
                    icon: 'text-amber-600'
                };
        }
    };

    const colors = getColorClasses(room.roomType);

    return (
        <div
            onClick={onClick}
            className={`
                relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer
                ${isSelected ? 'ring-4 ring-offset-2 ring-amber-400 scale-105' : 'hover:scale-102 hover:shadow-lg'}
                ${colors.border}
                bg-gradient-to-br ${colors.bg}
            `}
        >
            {/* Banner Image */}
            {room.bannerImage && (
                <div className="h-32 overflow-hidden">
                    <img
                        src={room.bannerImage}
                        alt={room.roomName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            )}

            {/* Room Content */}
            <div className="p-6">
                {/* Header with Icon */}
                <div className="flex items-start gap-4 mb-4">
                    <div className={`${colors.icon}`}>
                        {getRoomIcon(room.roomType)}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {room.roomName}
                        </h3>
                        {room.specialization && (
                            <span className={`inline-block px-3 py-1 ${colors.badge} text-white text-xs font-semibold rounded-full`}>
                                {room.specialization}
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {room.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <div>
                                <p className="text-xs text-gray-500">Sức chứa</p>
                                <p className="text-sm font-bold text-gray-900">{room.capacity}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <div>
                                <p className="text-xs text-gray-500">Phiên</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {room.statistics?.totalSessions || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{room.location}</span>
                </div>
            </div>

            {/* Selected Indicator */}
            {isSelected && (
                <div className="absolute top-4 right-4 bg-amber-500 text-white rounded-full p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </div>
            )}
        </div>
    );
}

RoomCard.propTypes = {
    room: PropTypes.shape({
        roomName: PropTypes.string.isRequired,
        roomType: PropTypes.string.isRequired,
        specialization: PropTypes.string,
        description: PropTypes.string,
        location: PropTypes.string,
        capacity: PropTypes.number,
        bannerImage: PropTypes.string,
        statistics: PropTypes.shape({
            totalSessions: PropTypes.number
        })
    }).isRequired,
    onClick: PropTypes.func,
    isSelected: PropTypes.bool
};

RoomCard.defaultProps = {
    onClick: () => { },
    isSelected: false
};
