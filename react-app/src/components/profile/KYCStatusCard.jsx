import { CheckCircle, Clock, XCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * KYCStatusCard — Hiển thị trạng thái KYC và hướng dẫn bước tiếp theo
 * Props:
 *   kycStatus: 'none' | 'pending' | 'under_review' | 'approved' | 'rejected'
 *   rejectionReason: string (khi rejected)
 *   compact: bool
 *   onUpload: function (khi muốn upload KYC)
 */

const KYC_STEPS = [
    { key: 'submit', label: 'Nộp hồ sơ' },
    { key: 'review', label: 'Xét duyệt' },
    { key: 'done', label: 'Hoàn tất' },
];

const STATUS_CONFIG = {
    none: {
        step: 0,
        icon: FileText,
        color: '#6B7280',
        bg: '#F9FAFB',
        badge: 'Chưa xác minh',
        badgeBg: '#F3F4F6',
        badgeColor: '#374151',
        title: 'Bạn chưa xác minh danh tính',
        desc: 'Nộp hồ sơ KYC để tham gia đấu giá và tăng hạn mức ví.',
        cta: '📄 Nộp hồ sơ KYC',
    },
    pending: {
        step: 1,
        icon: Clock,
        color: '#F59E0B',
        bg: '#FFFBEB',
        badge: 'Đang chờ xét duyệt',
        badgeBg: '#FEF3C7',
        badgeColor: '#92400E',
        title: 'Hồ sơ đang được xem xét',
        desc: 'Chúng tôi đang xử lý hồ sơ của bạn. Thường mất 1-3 ngày làm việc.',
        cta: null,
    },
    under_review: {
        step: 1,
        icon: AlertCircle,
        color: '#3B82F6',
        bg: '#EFF6FF',
        badge: 'Đang xét duyệt',
        badgeBg: '#DBEAFE',
        badgeColor: '#1E40AF',
        title: 'Hồ sơ đang được xét duyệt',
        desc: 'Nhân viên đang kiểm tra thông tin. Bạn sẽ được thông báo kết quả sớm.',
        cta: null,
    },
    approved: {
        step: 3,
        icon: CheckCircle,
        color: '#10B981',
        bg: '#ECFDF5',
        badge: 'Đã xác minh ✓',
        badgeBg: '#D1FAE5',
        badgeColor: '#065F46',
        title: 'Tài khoản đã được xác minh',
        desc: 'Bạn có thể tham gia tất cả các phiên đấu giá và sử dụng đầy đủ tính năng.',
        cta: null,
    },
    rejected: {
        step: 0,
        icon: XCircle,
        color: '#EF4444',
        bg: '#FEF2F2',
        badge: 'Bị từ chối',
        badgeBg: '#FEE2E2',
        badgeColor: '#991B1B',
        title: 'Hồ sơ bị từ chối',
        desc: 'Hồ sơ của bạn không được chấp thuận. Vui lòng nộp lại với thông tin đầy đủ hơn.',
        cta: '🔄 Nộp lại hồ sơ',
    },
};

export default function KYCStatusCard({ kycStatus = 'none', rejectionReason, compact = false, onUpload }) {
    const navigate = useNavigate();
    const cfg = STATUS_CONFIG[kycStatus] || STATUS_CONFIG.none;
    const { icon: Icon, color, bg, badge, badgeBg, badgeColor, title, desc, cta, step } = cfg;

    const handleCTA = () => {
        if (onUpload) onUpload();
        else navigate('/documents');
    };

    return (
        <div style={{
            background: bg,
            border: `1.5px solid ${color}30`,
            borderRadius: compact ? 12 : 16,
            padding: compact ? '1rem' : '1.25rem 1.5rem',
            fontFamily: 'Inter, sans-serif',
        }}>
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: compact ? 0 : '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: 20, height: 20, color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <p style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem', margin: 0 }}>Xác minh danh tính (KYC)</p>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: badgeBg, color: badgeColor }}>
                            {badge}
                        </span>
                    </div>
                    {!compact && (
                        <>
                            <p style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600, marginBottom: 2 }}>{title}</p>
                            <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>{desc}</p>
                        </>
                    )}
                </div>
            </div>

            {/* Rejection reason */}
            {kycStatus === 'rejected' && rejectionReason && !compact && (
                <div style={{ background: '#FEE2E2', borderRadius: 8, padding: '0.625rem 0.875rem', marginBottom: '0.875rem', fontSize: '0.8rem', color: '#991B1B' }}>
                    <strong>Lý do từ chối:</strong> {rejectionReason}
                </div>
            )}

            {/* Progress steps */}
            {!compact && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: cta ? '1rem' : 0 }}>
                    {KYC_STEPS.map((s, i) => {
                        const done = i < step;
                        const active = i === step - 1 || (step === 0 && i === 0 && kycStatus !== 'approved');
                        const isCurrent = (step === 1 && i === 0) || (step === 3 && i === 2);
                        const filled = step >= i + 1;
                        return (
                            <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                                {/* Circle */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: filled ? color : '#E5E7EB',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: `2px solid ${filled ? color : '#D1D5DB'}`,
                                        transition: 'all 0.3s',
                                    }}>
                                        {filled
                                            ? <CheckCircle style={{ width: 14, height: 14, color: '#fff' }} />
                                            : <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D1D5DB' }} />
                                        }
                                    </div>
                                    <span style={{ fontSize: '0.65rem', color: filled ? color : '#9CA3AF', marginTop: 3, fontWeight: filled ? 700 : 400, whiteSpace: 'nowrap' }}>
                                        {s.label}
                                    </span>
                                </div>
                                {/* Connector */}
                                {i < 2 && (
                                    <div style={{ flex: 1, height: 2, background: step > i + 1 ? color : '#E5E7EB', margin: '0 4px', marginBottom: 18, transition: 'background 0.3s' }} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CTA */}
            {cta && (
                <button
                    onClick={handleCTA}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '0.5rem 1.125rem', border: 'none', borderRadius: 10,
                        background: color, color: '#fff', fontWeight: 700, cursor: 'pointer',
                        fontSize: '0.85rem', boxShadow: `0 4px 12px ${color}40`,
                    }}
                >
                    {cta} <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
            )}
        </div>
    );
}
