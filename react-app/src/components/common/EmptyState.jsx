import { PackageOpen, Search, Clock, AlertCircle, Inbox } from 'lucide-react';

const PRESETS = {
    noData: {
        Icon: PackageOpen,
        color: '#9CA3AF',
        bg: '#F9FAFB',
        title: 'Không có dữ liệu',
        desc: 'Chưa có thông tin nào để hiển thị.',
    },
    noResults: {
        Icon: Search,
        color: '#6366F1',
        bg: '#EEF2FF',
        title: 'Không tìm thấy kết quả',
        desc: 'Thử thay đổi từ khoá hoặc bộ lọc tìm kiếm.',
    },
    noAuctions: {
        Icon: Clock,
        color: '#F59E0B',
        bg: '#FFFBEB',
        title: 'Chưa có phiên đấu giá',
        desc: 'Hiện tại chưa có phiên đấu giá nào đang diễn ra.',
    },
    noNotifications: {
        Icon: Inbox,
        color: '#10B981',
        bg: '#ECFDF5',
        title: 'Không có thông báo',
        desc: 'Bạn đã đọc hết tất cả thông báo!',
    },
    error: {
        Icon: AlertCircle,
        color: '#EF4444',
        bg: '#FEF2F2',
        title: 'Đã có lỗi xảy ra',
        desc: 'Không thể tải dữ liệu. Vui lòng thử lại.',
    },
};

/**
 * EmptyState — Hiển thị khi danh sách trống
 *
 * Props:
 *   preset: 'noData' | 'noResults' | 'noAuctions' | 'noNotifications' | 'error'
 *   title: string (override)
 *   description: string (override)
 *   action: JSX node — nút bấm / link action
 *   compact: bool — hiển thị nhỏ hơn (dùng trong sidebar/modal)
 */
export default function EmptyState({
    preset = 'noData',
    title,
    description,
    action,
    compact = false,
    style = {},
}) {
    const cfg = PRESETS[preset] || PRESETS.noData;
    const { Icon, color, bg } = cfg;
    const displayTitle = title || cfg.title;
    const displayDesc = description || cfg.desc;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: compact ? '2rem 1rem' : '3.5rem 1.5rem',
                textAlign: 'center',
                ...style,
            }}
        >
            {/* Icon bubble */}
            <div style={{
                width: compact ? 52 : 72,
                height: compact ? 52 : 72,
                borderRadius: '50%',
                background: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: compact ? 12 : 18,
            }}>
                <Icon style={{ width: compact ? 24 : 32, height: compact ? 24 : 32, color }} />
            </div>

            <p style={{
                fontWeight: 700,
                color: '#111827',
                fontSize: compact ? '0.9rem' : '1.05rem',
                marginBottom: 6,
            }}>
                {displayTitle}
            </p>
            <p style={{
                color: '#6B7280',
                fontSize: compact ? '0.8rem' : '0.875rem',
                maxWidth: 320,
                lineHeight: 1.6,
                marginBottom: action ? 20 : 0,
            }}>
                {displayDesc}
            </p>

            {action && action}
        </div>
    );
}
