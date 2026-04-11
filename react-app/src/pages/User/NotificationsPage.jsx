import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, BellOff, Check, CheckCheck, Trash2,
    LogIn, AlertTriangle, Info, Gavel, Gift, RefreshCw
} from 'lucide-react';
import axios from '@/services/axiosInstance';
import { toast } from 'react-hot-toast';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const NOTI_ICON = {
    login: { Icon: LogIn, color: '#6366F1', bg: '#EEF2FF' },
    bid: { Icon: Gavel, color: '#F59E0B', bg: '#FFFBEB' },
    warning: { Icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' },
    info: { Icon: Info, color: '#3B82F6', bg: '#EFF6FF' },
    reward: { Icon: Gift, color: '#10B981', bg: '#ECFDF5' },
    default: { Icon: Bell, color: '#6B7280', bg: '#F3F4F6' },
};

// Mocked + fallback data khi API chưa có endpoint
const MOCK_NOTIFICATIONS = [
    { _id: '1', type: 'bid', title: 'Đấu giá bắt đầu', message: 'Phiên đấu giá biển số 51G-888.88 đã bắt đầu. Vào ngay để đặt giá!', isRead: false, createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
    { _id: '2', type: 'info', title: 'KYC được phê duyệt', message: 'Hồ sơ xác minh danh tính của bạn đã được duyệt. Bạn có thể tham gia đấu giá.', isRead: false, createdAt: new Date(Date.now() - 30 * 60000).toISOString() },
    { _id: '3', type: 'reward', title: 'Thắng đấu giá!', message: 'Chúc mừng! Bạn đã thắng phiên đấu giá với giá 85,000,000 VNĐ. Vui lòng thanh toán trong 24h.', isRead: true, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
    { _id: '4', type: 'warning', title: 'Cần thanh toán', message: 'Bạn có 6 giờ để hoàn tất thanh toán cho phiên đấu giá biển 30F-999.99. Quá hạn sẽ bị phạt.', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

export default function NotificationsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all | unread

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            // Thử gọi API trước, fallback về mock nếu chưa có endpoint
            const res = await axios.get('/notifications');
            const data = res.data?.data || res.data || [];
            setNotifications(Array.isArray(data) ? data : MOCK_NOTIFICATIONS);
        } catch {
            // API chưa implement → dùng mock data
            setNotifications(MOCK_NOTIFICATIONS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const markAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            await axios.patch('/notifications/read-all');
        } catch {
            // Silently ignore if API not ready
        }
        toast.success('Đã đánh dấu tất cả đã đọc');
    };

    const markRead = async (id) => {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        try {
            await axios.patch(`/notifications/${id}/read`);
        } catch { /* ignore */ }
    };

    const deleteNoti = async (id) => {
        setNotifications(prev => prev.filter(n => n._id !== id));
        try {
            await axios.delete(`/notifications/${id}`);
        } catch { /* ignore */ }
    };

    const filtered = filter === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) {
        return (
            <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 44, height: 44, border: '3px solid #AA8C3C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                    <p style={{ color: '#9CA3AF' }}>Đang tải thông báo...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'Inter, sans-serif' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Bell style={{ width: 28, height: 28, color: '#AA8C3C' }} />
                        Thông báo
                        {unreadCount > 0 && (
                            <span style={{ background: '#EF4444', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                    <p style={{ color: '#6B7280', marginTop: 4, fontSize: '0.875rem' }}>Cập nhật về phiên đấu giá và tài khoản</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={fetchNotifications} style={{ padding: '0.5rem 0.875rem', border: '1.5px solid #E5E7EB', borderRadius: 10, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#374151', fontWeight: 600 }}>
                        <RefreshCw style={{ width: 13, height: 13 }} /> Làm mới
                    </button>
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} style={{ padding: '0.5rem 0.875rem', border: '1.5px solid rgba(170,140,60,0.4)', borderRadius: 10, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#AA8C3C', fontWeight: 600 }}>
                            <CheckCheck style={{ width: 13, height: 13 }} /> Đọc tất cả
                        </button>
                    )}
                </div>
            </div>

            {/* ── Filter tabs ── */}
            <div style={{ display: 'flex', gap: '0.375rem', background: '#F9FAFB', borderRadius: 12, padding: '0.25rem', width: 'fit-content', marginBottom: '1.25rem' }}>
                {[{ key: 'all', label: `Tất cả (${notifications.length})` }, { key: 'unread', label: `Chưa đọc (${unreadCount})` }].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        style={{ padding: '0.5rem 1rem', borderRadius: 9, border: 'none', background: filter === f.key ? '#fff' : 'transparent', color: filter === f.key ? '#AA8C3C' : '#6B7280', fontWeight: filter === f.key ? 700 : 500, cursor: 'pointer', fontSize: '0.85rem', boxShadow: filter === f.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* ── List ── */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#fff', borderRadius: 20, border: '1.5px solid rgba(170,140,60,0.12)' }}>
                    <BellOff style={{ width: 48, height: 48, color: '#D1D5DB', margin: '0 auto 1rem', display: 'block' }} />
                    <p style={{ color: '#6B7280', fontWeight: 600, marginBottom: 4 }}>Không có thông báo nào</p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Các thông báo về đấu giá sẽ hiện ở đây</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {filtered.map((noti, i) => {
                        const { Icon, color, bg } = NOTI_ICON[noti.type] || NOTI_ICON.default;
                        return (
                            <div
                                key={noti._id || i}
                                onClick={() => !noti.isRead && markRead(noti._id)}
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    padding: '1.125rem 1.25rem',
                                    background: noti.isRead ? '#fff' : 'rgba(170,140,60,0.04)',
                                    borderRadius: 16,
                                    border: `1.5px solid ${noti.isRead ? '#F3F4F6' : 'rgba(170,140,60,0.2)'}`,
                                    cursor: noti.isRead ? 'default' : 'pointer',
                                    transition: 'all 0.15s',
                                    position: 'relative',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                            >
                                {/* Unread dot */}
                                {!noti.isRead && (
                                    <span style={{ position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: '50%', background: '#AA8C3C' }} />
                                )}

                                {/* Type icon */}
                                <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Icon style={{ width: 19, height: 19, color }} />
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: '0 0 3px', fontWeight: noti.isRead ? 600 : 700, color: '#111827', fontSize: '0.9rem' }}>{noti.title}</p>
                                    <p style={{ margin: '0 0 6px', color: '#6B7280', fontSize: '0.825rem', lineHeight: 1.5 }}>{noti.message}</p>
                                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{formatDate(noti.createdAt)}</span>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                                    {!noti.isRead && (
                                        <button
                                            onClick={e => { e.stopPropagation(); markRead(noti._id); }}
                                            title="Đánh dấu đã đọc"
                                            style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Check style={{ width: 13, height: 13, color: '#10B981' }} />
                                        </button>
                                    )}
                                    <button
                                        onClick={e => { e.stopPropagation(); deleteNoti(noti._id); }}
                                        title="Xóa thông báo"
                                        style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Trash2 style={{ width: 13, height: 13, color: '#EF4444' }} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
