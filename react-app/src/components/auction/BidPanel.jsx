import { useState } from 'react';
import './BidPanel.css';

/**
 * Bid panel component for placing bids
 */
export default function BidPanel({
    currentPrice,
    priceStep,
    minimumNextBid,
    isPlacingBid,
    bidError,
    rateLimitRemaining,
    canBid,
    onPlaceBid,
    onPlaceBidCustom,
    totalExtensions,
    maxExtensions
}) {
    const [customAmount, setCustomAmount] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const handleQuickBid = (stepMultiplier) => {
        onPlaceBid(stepMultiplier);
    };

    const handleCustomBid = () => {
        const amount = parseInt(customAmount);
        if (isNaN(amount) || amount < minimumNextBid) {
            alert(`Giá đặt phải lớn hơn ${minimumNextBid.toLocaleString('vi-VN')} VND`);
            return;
        }
        onPlaceBidCustom(amount);
        setCustomAmount('');
        setShowCustomInput(false);
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN') + ' VND';
    };

    return (
        <div className="bid-panel">
            <div className="current-price-section">
                <div className="price-label">Giá hiện tại</div>
                <div className="price-value">{formatCurrency(currentPrice)}</div>
                <div className="price-step">Bước giá: {formatCurrency(priceStep)}</div>
            </div>

            {bidError && (
                <div className="bid-error">
                    <span className="error-icon">⚠️</span>
                    <span className="error-text">{bidError}</span>
                </div>
            )}

            {rateLimitRemaining && (
                <div className="rate-limit-warning">
                    <span className="warning-icon">⏳</span>
                    <span className="warning-text">
                        Vui lòng đợi {rateLimitRemaining}s trước khi đặt giá tiếp
                    </span>
                </div>
            )}

            <div className="bid-buttons">
                <h3>Đặt giá nhanh</h3>
                <div className="quick-bid-buttons">
                    <button
                        className="bid-btn quick-bid-1"
                        onClick={() => handleQuickBid(1)}
                        disabled={!canBid}
                    >
                        <span className="btn-label">+1 bước</span>
                        <span className="btn-amount">{formatCurrency(currentPrice + priceStep)}</span>
                    </button>

                    <button
                        className="bid-btn quick-bid-2"
                        onClick={() => handleQuickBid(2)}
                        disabled={!canBid}
                    >
                        <span className="btn-label">+2 bước</span>
                        <span className="btn-amount">{formatCurrency(currentPrice + priceStep * 2)}</span>
                    </button>

                    <button
                        className="bid-btn quick-bid-5"
                        onClick={() => handleQuickBid(5)}
                        disabled={!canBid}
                    >
                        <span className="btn-label">+5 bước</span>
                        <span className="btn-amount">{formatCurrency(currentPrice + priceStep * 5)}</span>
                    </button>
                </div>

                <button
                    className="custom-bid-toggle"
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    disabled={!canBid}
                >
                    {showCustomInput ? 'Ẩn giá tùy chỉnh' : 'Đặt giá tùy chỉnh'}
                </button>

                {showCustomInput && (
                    <div className="custom-bid-section">
                        <input
                            type="number"
                            className="custom-bid-input"
                            placeholder={`Tối thiểu ${formatCurrency(minimumNextBid)}`}
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCustomBid()}
                            disabled={!canBid}
                        />
                        <button
                            className="bid-btn custom-bid-submit"
                            onClick={handleCustomBid}
                            disabled={!canBid || !customAmount}
                        >
                            Đặt giá
                        </button>
                    </div>
                )}
            </div>

            {totalExtensions !== undefined && maxExtensions && (
                <div className="extension-info">
                    <span className="extension-icon">⏱️</span>
                    <span className="extension-text">
                        Số lần gia hạn: {totalExtensions} / {maxExtensions}
                    </span>
                </div>
            )}

            {isPlacingBid && (
                <div className="placing-bid-overlay">
                    <div className="spinner"></div>
                    <div className="loading-text">Đang đặt giá...</div>
                </div>
            )}
        </div>
    );
}
