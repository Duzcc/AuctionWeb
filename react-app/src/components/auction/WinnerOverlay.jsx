import { useEffect, useRef } from 'react';
import { Trophy, Sparkles } from 'lucide-react';

/**
 * WinnerOverlay — Màn hình kết quả khi đấu giá kết thúc
 * Hiển thị người thắng với animation confetti và thông tin chi tiết
 */
export default function WinnerOverlay({ winner, auctionData, currentUserId, onClose }) {
    const overlayRef = useRef(null);
    const isWinner = winner?.userId?.toString() === currentUserId?.toString();

    // Tạo confetti particles
    useEffect(() => {
        if (!overlayRef.current || !winner) return;
        const colors = ['#D4AF37', '#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'];
        const particles = [];

        for (let i = 0; i < 60; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 8 + 4}px;
                height: ${Math.random() * 8 + 4}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                left: ${Math.random() * 100}%;
                top: -10px;
                opacity: 1;
                animation: confetti-fall ${Math.random() * 2 + 2}s ease-in ${Math.random() * 1.5}s forwards;
                pointer-events: none;
            `;
            overlayRef.current.appendChild(particle);
            particles.push(particle);
        }

        return () => particles.forEach(p => p.remove());
    }, [winner]);

    if (!winner && !auctionData) return null;

    return (
        <div
            ref={overlayRef}
            className="winner-overlay"
            style={{ position: 'relative', overflow: 'hidden' }}
        >
            {/* Backdrop blur */}
            <div className="winner-backdrop" />

            {/* Content */}
            <div className="winner-card">
                {/* Trophy Icon */}
                <div className="winner-trophy-ring">
                    <Trophy className="w-12 h-12 text-amber-400" />
                    <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-spin" style={{ animationDuration: '3s' }} />
                </div>

                {winner ? (
                    <>
                        <h2 className="winner-title">
                            {isWinner ? '🎉 Chúc Mừng!' : 'Phiên Đấu Giá Kết Thúc'}
                        </h2>
                        <p className={`winner-subtitle ${isWinner ? 'text-amber-300' : 'text-gray-300'}`}>
                            {isWinner ? 'Bạn đã thắng phiên đấu giá này!' : 'Người thắng cuộc:'}
                        </p>
                        <div className="winner-name">
                            {winner.userName || 'Người thắng ẩn danh'}
                        </div>
                        <div className="winner-price-label">Giá chốt</div>
                        <div className="winner-final-price">
                            {(winner.finalPrice || 0).toLocaleString('vi-VN')} VNĐ
                        </div>
                        {auctionData?.plateNumber && (
                            <div className="winner-plate">
                                Biển số: <strong>{auctionData.plateNumber}</strong>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <h2 className="winner-title">Phiên Đấu Giá Kết Thúc</h2>
                        <p className="text-gray-400">Không có người trúng đấu giá</p>
                    </>
                )}

                {onClose && (
                    <button onClick={onClose} className="winner-close-btn">
                        Xem chi tiết →
                    </button>
                )}
            </div>
        </div>
    );
}
