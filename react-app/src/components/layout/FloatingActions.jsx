export default function FloatingActions() {
    return (
        <div className="fixed right-4 bottom-24 md:bottom-1/2 md:translate-y-1/2 flex flex-col gap-3 z-50">
            <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                aria-label="Facebook"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6"
                >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
            </a>
            <a
                href="https://zalo.me/vi/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gold text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform font-bold text-[10px]"
                aria-label="Zalo"
            >
                Zalo
            </a>
        </div>
    );
}
