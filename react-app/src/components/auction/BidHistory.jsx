import { useEffect, useRef } from 'react';
import './BidHistory.css';

/**
 * Bid history component showing recent bids
 */
export default function BidHistory({ bids, currentUserId }) {
    const listRef = useRef(null);

    // Auto-scroll to top on new bid
    useEffect(() => {
        if (listRef.current && bids.length > 0) {
            listRef.current.scrollTop = 0;
        }
    }, [bids]);

    if (!bids || bids.length === 0) {
        return (
            <div className="bid-history empty">
                <div className="empty-state">
                    <span className="empty-icon">📭</span>
                    <p>Chưa có ai đặt giá</p>
                    <p className="empty-hint">Hãy là người đầu tiên!</p>
                </div>
            </div>
        );
    }

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN') + ' VND';
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="bid-history">
            <div className="bid-history-header">
                <h3>Lịch sử đấu giá</h3>
                <span className="bid-count">{bids.length} lượt</span>
            </div>

            <div className="bid-list" ref={listRef}>
                {bids.map((bid, index) => {
                    const isMyBid = bid.userId?._id === currentUserId || bid.userId === currentUserId;
                    const isLatest = index === 0;
                    const isWinning = bid.isWinning;

                    return (
                        <div
                            key={bid._id || `bid-${index}`}
                            className={`bid-item ${isMyBid ? 'my-bid' : ''} ${isLatest ? 'latest' : ''} ${isWinning ? 'winning' : ''}`}
                        >
                            <div className="bid-row-1">
                                <div className="bid-user">
                                    {isMyBid && <span className="badge-me">Bạn</span>}
                                    <span className="user-name">
                                        {bid.userName || bid.userId?.username || 'Người dùng'}
                                    </span>
                                    {isWinning && isLatest && (
                                        <span className="badge-winning">🏆 Đang dẫn đầu</span>
                                    )}
                                </div>
                                <div className="bid-time">{formatTime(bid.bidTime || bid.createdAt)}</div>
                            </div>

                            <div className="bid-row-2">
                                <div className="bid-amount">{formatCurrency(bid.bidAmount)}</div>
                                {index < bids.length - 1 && (
                                    <div className="bid-increase">
                                        +{formatCurrency(bid.bidAmount - bids[index + 1].bidAmount)}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
