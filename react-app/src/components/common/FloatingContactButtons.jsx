import React from 'react';

const FloatingContactButtons = () => {
    return (
        <div className="fixed right-6 bottom-32 z-50 flex flex-col gap-4">
            {/* Facebook Button */}
            <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                title="Liên hệ Facebook"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="white"
                    stroke="currentColor"
                    strokeWidth="0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
            </a>

            {/* Zalo Button */}
            <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-[#AA8C3C] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                title="Liên hệ Zalo"
            >
                <div className="text-white font-bold text-xs">Zalo</div>
            </a>
        </div>
    );
};

export default FloatingContactButtons;
