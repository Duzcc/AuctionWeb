import { useEffect, useRef, memo } from 'react';
import { Gavel, TrendingUp, Clock } from 'lucide-react';

/**
 * BidHistorySidebar — Hiển thị lịch sử đặt giá real-time với animation
 */
const BidHistorySidebar = memo(function BidHistorySidebar({ bids = [], currentUserId }) {
    const scrollRef = useRef(null);
    const prevBidsLengthRef = useRef(0);

    // Auto-scroll khi có bid mới
    useEffect(() => {
        if (bids.length > prevBidsLengthRef.current) {
            prevBidsLengthRef.current = bids.length;
            if (scrollRef.current) {
                scrollRef.current.scrollTop = 0;
            }
        }
    }, [bids.length]);

    const formatPrice = (amount) =>
        amount?.toLocaleString('vi-VN') ?? '—';

    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="bid-history-sidebar">
            {/* Header */}
            <div className="bid-history-header">
                <div className="bid-history-title">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>Lịch sử đặt giá</span>
                </div>
                {bids.length > 0 && (
                    <span className="bid-count-badge">{bids.length}</span>
                )}
            </div>

            {/* Bid List */}
            <div ref={scrollRef} className="bid-list-container">
                {bids.length === 0 ? (
                    <div className="bid-empty-state">
                        <Gavel className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm italic">Chưa có lượt trả giá nào</p>
                    </div>
                ) : (
                    bids.map((bid, index) => {
                        const isOwn = bid.userId === currentUserId || bid.userId?._id === currentUserId;
                        const isLatest = index === 0;
                        return (
                            <BidItem
                                key={bid._id || bid.bidId || `${bid.bidTime}-${index}`}
                                bid={bid}
                                isOwn={isOwn}
                                isLatest={isLatest}
                                formatPrice={formatPrice}
                                formatTime={formatTime}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
});

/** Từng dòng bid — memo để tránh re-render không cần thiết */
const BidItem = memo(function BidItem({ bid, isOwn, isLatest, formatPrice, formatTime }) {
    return (
        <div className={`bid-item ${isLatest ? 'bid-item--latest' : ''} ${isOwn ? 'bid-item--own' : ''}`}>
            {/* Indicator */}
            <div className={`bid-rank-dot ${isLatest ? 'bid-rank-dot--winning' : ''}`}>
                {isLatest ? (
                    <Gavel className="w-3 h-3 text-amber-900" />
                ) : (
                    <span className="text-[10px] text-gray-500">•</span>
                )}
            </div>

            {/* Info */}
            <div className="bid-item-info">
                <div className="bid-item-row">
                    <span className={`bid-user-name ${isOwn ? 'text-amber-300' : 'text-white'}`}>
                        {isOwn ? '★ Bạn' : (bid.userName || bid.userId?.username || 'Ẩn danh')}
                    </span>
                    <span className={`bid-amount ${isLatest ? 'text-amber-400' : 'text-gray-300'}`}>
                        {formatPrice(bid.bidAmount || bid.amount)}
                    </span>
                </div>
                <div className="bid-item-row">
                    <span className="bid-time">
                        <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                        {formatTime(bid.bidTime || bid.time || bid.createdAt)}
                    </span>
                    {isLatest && (
                        <span className="bid-winning-badge">Cao nhất</span>
                    )}
                </div>
            </div>
        </div>
    );
});

export default BidHistorySidebar;
