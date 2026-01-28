import { useState, useEffect } from 'react';

/**
 * Countdown timer component for auction end time
 * @param {Date} endTime - The auction end time
 * @param {Boolean} hasEnded - Whether auction has ended
 */
export default function CountdownTimer({ endTime, hasEnded }) {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!endTime || hasEnded) {
            setTimeLeft(null);
            return;
        }

        const calculateTimeLeft = () => {
            const now = new Date();
            const end = new Date(endTime);
            const diff = end - now;

            if (diff <= 0) {
                return null;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            return { days, hours, minutes, seconds, total: diff };
        };

        setTimeLeft(calculateTimeLeft());

        const interval = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            if (!newTimeLeft) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime, hasEnded]);

    if (hasEnded) {
        return (
            <div className="countdown-timer ended">
                <span className="status-badge ended">🏁 Đã kết thúc</span>
            </div>
        );
    }

    if (!timeLeft) {
        return (
            <div className="countdown-timer loading">
                <span className="status-badge">⏳ Đang tải...</span>
            </div>
        );
    }

    const isUrgent = timeLeft.total < 5 * 60 * 1000; // Less than 5 minutes
    const isCritical = timeLeft.total < 60 * 1000; // Less than 1 minute

    return (
        <div className={`countdown-timer ${isUrgent ? 'urgent' : ''} ${isCritical ? 'critical' : ''}`}>
            <div className="time-label">⏰ Thời gian còn lại:</div>
            <div className="time-display">
                {timeLeft.days > 0 && (
                    <div className="time-unit">
                        <span className="value">{timeLeft.days}</span>
                        <span className="label">ngày</span>
                    </div>
                )}
                {(timeLeft.days > 0 || timeLeft.hours > 0) && (
                    <div className="time-unit">
                        <span className="value">{String(timeLeft.hours).padStart(2, '0')}</span>
                        <span className="label">giờ</span>
                    </div>
                )}
                <div className="time-unit">
                    <span className="value">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="label">phút</span>
                </div>
                <div className="time-unit">
                    <span className="value">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="label">giây</span>
                </div>
            </div>
            {isUrgent && !isCritical && (
                <div className="warning-text">⚠️ Sắp hết giờ!</div>
            )}
            {isCritical && (
                <div className="critical-text">🔥 Chỉ còn dưới 1 phút!</div>
            )}
        </div>
    );
}
