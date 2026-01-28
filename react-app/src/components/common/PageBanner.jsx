
export default function PageBanner({ title, subtitle, backgroundImage, alignment = 'left' }) {
    const isLeft = alignment === 'left';

    // Background styles
    const styles = backgroundImage
        ? {
            backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.3)), url('${backgroundImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }
        : {};

    const containerClasses = backgroundImage
        ? 'min-h-[400px] flex items-center'
        : 'bg-gradient-to-r from-gold-700 via-gold to-gold min-h-[300px] flex items-center';

    return (
        <div className={`${containerClasses} relative overflow-hidden w-full`} style={styles}>
            {/* Default Background pattern if no image */}
            {!backgroundImage && (
                <>
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    ></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                </>
            )}

            {/* Content */}
            <div className="container mx-auto px-4 md:px-8 relative z-10">
                <div
                    className={`max-w-4xl ${isLeft ? 'text-left' : 'text-center'} ${isLeft ? 'py-16 md:py-24 pl-4 md:pl-0' : 'py-16 md:py-24'
                        }`}
                >
                    {subtitle && (
                        <span className="block text-sm font-bold mb-3 text-gold tracking-widest uppercase border-l-4 border-gold pl-3 py-1 bg-black/20 backdrop-blur-sm w-fit rounded-r-lg shadow-lg">
                            {subtitle}
                        </span>
                    )}

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
                        {title}
                    </h1>
                </div>
            </div>
        </div>
    );
}
