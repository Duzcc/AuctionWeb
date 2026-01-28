import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useBidding } from '../../hooks/useBidding';
import CountdownTimer from '../../components/auction/CountdownTimer';
import BidPanel from '../../components/auction/BidPanel';
import BidHistory from '../../components/auction/BidHistory';
import './LiveAuctionPage.css';

export default function LiveAuctionPage() {
    const { sessionPlateId } = useParams();
    const navigate = useNavigate();
    const { accessToken, userId } = useSelector(state => state.auth);

    // Check authentication
    useEffect(() => {
        if (!accessToken) {
            navigate('/login', { state: { from: `/auction/live/${sessionPlateId}` } });
        }
    }, [accessToken, navigate, sessionPlateId]);

    // Use bidding hook
    const {
        auctionData,
        bids,
        currentPrice,
        endTime,
        status,
        viewers,
        error,
        isConnected,
        totalExtensions,
        priceStep,
        isPlacingBid,
        bidError,
        rateLimitRemaining,
        handlePlaceBid,
        placeBidCustom,
        canBid,
        minimumNextBid
    } = useBidding(sessionPlateId, accessToken);

    if (!accessToken) {
        return null; // Will redirect
    }

    if (error && error.includes('not registered')) {
        return (
            <div className="live-auction-page error-page">
                <div className="error-container">
                    <h2>⚠️ Không thể tham gia đấu giá</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/sessions')} className="btn-back">
                        Quay lại danh sách phiên
                    </button>
                </div>
            </div>
        );
    }

    const hasEnded = status === 'ended' || auctionData?.status === 'sold' || auctionData?.status === 'unsold';

    return (
        <div className="live-auction-page">
            {/* Header */}
            <div className="auction-header">
                <div className="header-content">
                    <button onClick={() => navigate(-1)} className="btn-back-small">
                        ← Quay lại
                    </button>
                    <h1 className="auction-title">
                        {auctionData?.plateNumber || 'Đang tải...'}
                    </h1>
                    <div className="connection-status">
                        {isConnected ? (
                            <span className="status-badge connected">
                                🟢 Kết nối trực tiếp
                            </span>
                        ) : (
                            <span className="status-badge disconnected">
                                🔴 Đang kết nối lại...
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {(error || bidError) && (
                <div className="auction-error-container">
                    {error && (
                        <div className="error-message socket-error">
                            <span className="error-icon">⚠️</span>
                            <span className="error-text">{error}</span>
                            {!isConnected && (
                                <button
                                    onClick={() => window.location.reload()}
                                    className="btn-retry"
                                >
                                    Refresh Page
                                </button>
                            )}
                        </div>
                    )}
                    {bidError && (
                        <div className="error-message bid-error">
                            <span className="error-icon">❌</span>
                            <span className="error-text">{bidError}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Main Content */}
            <div className="auction-container">
                {/* Left Column: Auction Info & Timer */}
                <div className="auction-left">
                    {/* Auction Image/Plate Info */}
                    <div className="auction-plate-card">
                        <div className="plate-number-display">
                            {auctionData?.plateNumber || '...'}
                        </div>
                        {auctionData?.itemType && (
                            <div className="plate-type">
                                {auctionData.itemType === 'car' ? '🚗 Ô tô' : '🏍️ Xe máy'}
                            </div>
                        )}
                    </div>

                    {/* Countdown Timer */}
                    <CountdownTimer
                        endTime={endTime}
                        hasEnded={hasEnded}
                    />

                    {/* Auction Stats */}
                    <div className="auction-stats">
                        <div className="stat-item">
                            <span className="stat-label">Giá khởi điểm</span>
                            <span className="stat-value">
                                {(auctionData?.startingPrice || 0).toLocaleString('vi-VN')} VND
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Bước giá</span>
                            <span className="stat-value">
                                {(priceStep || 0).toLocaleString('vi-VN')} VND
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Số người xem</span>
                            <span className="stat-value">
                                👥 {viewers} người
                            </span>
                        </div>
                        {totalExtensions !== undefined && (
                            <div className="stat-item">
                                <span className="stat-label">Gia hạn</span>
                                <span className="stat-value">
                                    {totalExtensions} / {auctionData?.maxExtensions || 10}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Winner Info (if ended) */}
                    {hasEnded && auctionData && (
                        <div className={`auction-result ${auctionData.status}`}>
                            {auctionData.status === 'sold' ? (
                                <>
                                    <h3>🏆 Kết quả đấu giá</h3>
                                    <div className="winner-info">
                                        <div className="winner-name">
                                            Người thắng: <strong>{auctionData.winnerName}</strong>
                                        </div>
                                        <div className="final-price">
                                            Giá cuối: <strong>{(auctionData.finalPrice || 0).toLocaleString('vi-VN')} VND</strong>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3>📭 Đấu giá kết thúc</h3>
                                    <p>Không có người đặt giá</p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Center Column: Bid Panel */}
                <div className="auction-center">
                    {!hasEnded ? (
                        <BidPanel
                            currentPrice={currentPrice}
                            priceStep={priceStep}
                            minimumNextBid={minimumNextBid}
                            isPlacingBid={isPlacingBid}
                            bidError={bidError}
                            rateLimitRemaining={rateLimitRemaining}
                            canBid={canBid}
                            onPlaceBid={handlePlaceBid}
                            onPlaceBidCustom={placeBidCustom}
                            totalExtensions={totalExtensions}
                            maxExtensions={auctionData?.maxExtensions}
                        />
                    ) : (
                        <div className="auction-ended-panel">
                            <h2>Đấu giá đã kết thúc</h2>
                            {auctionData?.winnerId === userId && (
                                <div className="you-won">
                                    <span className="trophy">🎉</span>
                                    <h3>Chúc mừng! Bạn đã thắng!</h3>
                                    <p>Vui lòng thanh toán trong vòng 48 giờ</p>
                                    <button
                                        onClick={() => navigate('/user/payment')}
                                        className="btn-payment"
                                    >
                                        Thanh toán ngay
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Bid History */}
                <div className="auction-right">
                    <BidHistory
                        bids={bids}
                        currentUserId={userId}
                    />
                </div>
            </div>

            {/* Loading Overlay */}
            {status === 'loading' && (
                <div className="loading-overlay">
                    <div className="spinner-large"></div>
                    <div className="loading-text">Đang tải phiên đấu giá...</div>
                </div>
            )}
        </div>
    );
}
