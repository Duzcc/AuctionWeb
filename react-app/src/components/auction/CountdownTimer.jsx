import { memo } from 'react';
import { Clock, Zap } from 'lucide-react';

/**
 * CountdownTimer — Đồng hồ đếm ngược với visual states:
 * - Normal: trắng
 * - Warning (≤60s): vàng amber
 * - Critical (≤30s): đỏ + pulse glow
 * - Urgent (≤10s): đỏ đậm + shake animation
 */
const CountdownTimer = memo(function CountdownTimer({
    endTime,
    timeLeftSeconds,
    extensionCount = 0,
    maxExtensions = 10,
}) {
    // Safety guard: nếu timeLeftSeconds là NaN/null/undefined thì fallback về 0
    const safeSecs = (Number.isFinite(timeLeftSeconds) && timeLeftSeconds >= 0)
        ? timeLeftSeconds
        : 0;

    const minutes = Math.floor(safeSecs / 60);
    const seconds = safeSecs % 60;

    const isUrgent   = safeSecs <= 10 && safeSecs > 0;
    const isCritical = safeSecs <= 30 && safeSecs > 10;
    const isWarning  = safeSecs <= 60 && safeSecs > 30;
    // Chỉ coi là ended khi đã nhận được endTime nhưng đã hết giờ
    const isEnded = !!endTime && safeSecs <= 0;

    const colorClass = isEnded
        ? 'timer--ended'
        : isUrgent
            ? 'timer--urgent'
            : isCritical
                ? 'timer--critical'
                : isWarning
                    ? 'timer--warning'
                    : 'timer--normal';

    return (
        <div className={`countdown-timer ${colorClass}`}>
            <div className="timer-label">
                <Clock className="w-3.5 h-3.5" />
                <span>Thời gian còn lại</span>
                {extensionCount > 0 && (
                    <span className="timer-extension-badge">
                        <Zap className="w-2.5 h-2.5" />
                        +{extensionCount}
                    </span>
                )}
            </div>

            <div className="timer-display">
                <div className="time-unit">
                    <span className={`time-value ${isUrgent ? 'time-value--urgent' : ''}`}>
                        {String(minutes).padStart(2, '0')}
                    </span>
                </div>
                <div className="timer-separator">:</div>
                <div className="time-unit">
                    <span className={`time-value ${isUrgent ? 'time-value--urgent' : ''}`}>
                        {String(seconds).padStart(2, '0')}
                    </span>
                </div>
            </div>

            {!isEnded && (
                <div className="timer-progress-bg">
                    <div
                        className={`timer-progress-fill ${colorClass}`}
                        style={{
                            width: `${Math.min(100, (timeLeftSeconds / 300) * 100)}%`,
                            transition: 'width 1s linear',
                        }}
                    />
                </div>
            )}

            {isEnded && <div className="timer-ended-text">ĐÃ KẾT THÚC</div>}
            {isUrgent && !isEnded && <div className="timer-urgent-text">⚡ Sắp kết thúc!</div>}
        </div>
    );
});

export default CountdownTimer;
