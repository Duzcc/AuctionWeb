import { useEffect, useRef, memo } from 'react';

/**
 * PriceDisplay — Hiển thị giá hiện tại với flip animation khi thay đổi
 */
const PriceDisplay = memo(function PriceDisplay({ currentPrice, newBidFlash, label = 'GIÁ HIỆN TẠI' }) {
    const priceRef = useRef(null);

    // Trigger animation khi newBidFlash = true
    useEffect(() => {
        if (newBidFlash && priceRef.current) {
            priceRef.current.classList.remove('price-flash');
            void priceRef.current.offsetWidth; // reflow để reset animation
            priceRef.current.classList.add('price-flash');
        }
    }, [newBidFlash]);

    const formatted = (currentPrice || 0).toLocaleString('vi-VN');

    return (
        <div className="price-display-wrapper">
            <span className="price-display-label">{label}</span>
            <div ref={priceRef} className="price-display-value">
                {formatted}
                <span className="price-display-currency">VNĐ</span>
            </div>
        </div>
    );
});

export default PriceDisplay;
