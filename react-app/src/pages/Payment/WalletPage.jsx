import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wallet, ArrowDownCircle, ArrowUpCircle, RefreshCw,
    TrendingUp, Clock, CheckCircle, XCircle, AlertCircle,
    ChevronDown, CreditCard, Shield
} from 'lucide-react';
import axios from '@/services/axiosInstance';
import { toast } from 'react-hot-toast';

const formatVND = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const TX_TYPE_LABEL = {
    deposit: { label: 'Nạp tiền', color: '#10B981', icon: ArrowDownCircle },
    withdraw: { label: 'Rút tiền', color: '#EF4444', icon: ArrowUpCircle },
    deposit_lock: { label: 'Khoá đặt cọc', color: '#F59E0B', icon: Shield },
    deposit_refund: { label: 'Hoàn cọc', color: '#6366F1', icon: CheckCircle },
    bid_payment: { label: 'Thanh toán thắng', color: '#EF4444', icon: CreditCard },
    admin_adjust: { label: 'Admin điều chỉnh', color: '#8B5CF6', icon: TrendingUp },
};

const TX_STATUS_CONFIG = {
    completed: { label: 'Hoàn thành', color: '#10B981', Icon: CheckCircle },
    pending: { label: 'Đang xử lý', color: '#F59E0B', Icon: Clock },
    failed: { label: 'Thất bại', color: '#EF4444', Icon: XCircle },
};

// ─── Deposit Modal ────────────────────────────────────────────────────────────
function DepositModal({ onClose, onSuccess }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const presets = [500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000];

    const handleDeposit = async () => {
        const parsed = parseInt(String(amount).replace(/[^0-9]/g, ''), 10);
        if (!parsed || parsed < 50_000) {
            toast.error('Số tiền tối thiểu là 50,000 VNĐ');
            return;
        }
        setLoading(true);
        try {
            // Pass a mock valid 24-hex ObjectId for testing since the backend requires it
            const mockObjectId = [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
            await axios.post('/wallet/deposit', { 
                amount: parsed,
                paymentId: mockObjectId
            });
            toast.success(`Nạp ${formatVND(parsed)} thành công!`);
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Nạp tiền thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', maxWidth: 440, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
                <h3 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>💳 Nạp tiền vào ví</h3>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Chọn số tiền hoặc nhập tuỳ ý (tối thiểu 50,000 VNĐ)</p>

                {/* Preset amounts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                    {presets.map(p => (
                        <button
                            key={p}
                            onClick={() => setAmount(String(p))}
                            style={{
                                padding: '0.625rem',
                                border: amount === String(p) ? '2px solid #AA8C3C' : '1.5px solid #E5E7EB',
                                borderRadius: 10,
                                background: amount === String(p) ? 'rgba(170,140,60,0.08)' : '#fff',
                                color: amount === String(p) ? '#AA8C3C' : '#374151',
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                        >
                            {(p / 1000).toLocaleString('vi-VN')}K
                        </button>
                    ))}
                </div>

                {/* Custom input */}
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="Nhập số tiền khác..."
                        style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = '#AA8C3C'}
                        onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                    />
                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: '0.8rem' }}>VNĐ</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={onClose}
                        style={{ flex: 1, padding: '0.75rem', border: '1.5px solid #E5E7EB', borderRadius: 12, background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={handleDeposit}
                        disabled={loading}
                        style={{ flex: 2, padding: '0.75rem', border: 'none', borderRadius: 12, background: 'linear-gradient(135deg, #AA8C3C, #8F7532)', color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Đang xử lý...' : 'Xác nhận nạp tiền'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WalletPage() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [txLoading, setTxLoading] = useState(false);
    const [showDeposit, setShowDeposit] = useState(false);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 15;

    const fetchSummary = useCallback(async () => {
        try {
            const res = await axios.get('/wallet/summary');
            setSummary(res.data.data || res.data);
        } catch {
            toast.error('Không thể lấy thông tin ví');
        }
    }, []);

    const fetchTransactions = useCallback(async (reset = false) => {
        setTxLoading(true);
        try {
            const currentPage = reset ? 1 : page;
            const params = { page: currentPage, limit: LIMIT };
            if (filter !== 'all') params.type = filter;
            const res = await axios.get('/wallet/transactions', { params });
            const data = res.data.data || res.data;
            const list = Array.isArray(data) ? data : data.transactions || [];
            if (reset) {
                setTransactions(list);
                setPage(2);
            } else {
                setTransactions(prev => [...prev, ...list]);
                setPage(p => p + 1);
            }
            setHasMore(list.length === LIMIT);
        } catch {
            toast.error('Không thể lấy lịch sử giao dịch');
        } finally {
            setTxLoading(false);
        }
    }, [filter, page]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchSummary(), fetchTransactions(true)]);
            setLoading(false);
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchTransactions(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const handleRefresh = async () => {
        await Promise.all([fetchSummary(), fetchTransactions(true)]);
        toast.success('Đã cập nhật');
    };

    if (loading) {
        return (
            <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 44, height: 44, border: '3px solid #AA8C3C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                    <p style={{ color: '#9CA3AF' }}>Đang tải thông tin ví...</p>
                </div>
            </div>
        );
    }

    const bal = summary?.balance?.total ?? summary?.walletBalance ?? 0;
    const locked = summary?.balance?.locked ?? summary?.lockedBalance ?? 0;
    const available = bal - locked;

    const FILTERS = [
        { key: 'all', label: 'Tất cả' },
        { key: 'deposit', label: 'Nạp tiền' },
        { key: 'withdraw', label: 'Rút tiền' },
        { key: 'deposit_lock', label: 'Đặt cọc' },
        { key: 'deposit_refund', label: 'Hoàn cọc' },
    ];

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'Inter, sans-serif' }}>
            {showDeposit && (
                <DepositModal
                    onClose={() => setShowDeposit(false)}
                    onSuccess={handleRefresh}
                />
            )}

            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                        <Wallet style={{ display: 'inline', width: 28, height: 28, color: '#AA8C3C', marginRight: 10, verticalAlign: 'middle' }} />
                        Ví của tôi
                    </h1>
                    <p style={{ color: '#6B7280', marginTop: 4, fontSize: '0.875rem' }}>Quản lý số dư và lịch sử giao dịch</p>
                </div>
                <button
                    onClick={handleRefresh}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', border: '1.5px solid #E5E7EB', borderRadius: 10, background: '#fff', cursor: 'pointer', color: '#374151', fontSize: '0.875rem', fontWeight: 600 }}
                >
                    <RefreshCw style={{ width: 14, height: 14 }} /> Làm mới
                </button>
            </div>

            {/* ── Balance Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {/* Total balance */}
                <div style={{ background: 'linear-gradient(135deg, #AA8C3C, #8F7532)', borderRadius: 20, padding: '1.75rem', color: '#fff', boxShadow: '0 8px 32px rgba(170,140,60,0.35)' }}>
                    <p style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Tổng số dư</p>
                    <p style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 4px' }}>{formatVND(bal)}</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.75 }}>Cập nhật vừa xong</p>
                </div>

                {/* Available */}
                <div style={{ background: '#fff', border: '1.5px solid rgba(170,140,60,0.2)', borderRadius: 20, padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <CheckCircle style={{ width: 18, height: 18, color: '#10B981' }} />
                        <p style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Khả dụng</p>
                    </div>
                    <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{formatVND(available)}</p>
                    <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Dùng được ngay</p>
                </div>

                {/* Locked */}
                <div style={{ background: '#fff', border: '1.5px solid rgba(245,158,11,0.2)', borderRadius: 20, padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Shield style={{ width: 18, height: 18, color: '#F59E0B' }} />
                        <p style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Đang khoá</p>
                    </div>
                    <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{formatVND(locked)}</p>
                    <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Đặt cọc đấu giá</p>
                </div>
            </div>

            {/* ── Action Buttons ── */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setShowDeposit(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #AA8C3C, #8F7532)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 16px rgba(170,140,60,0.35)' }}
                >
                    <ArrowDownCircle style={{ width: 18, height: 18 }} /> Nạp tiền
                </button>
                <button
                    onClick={() => navigate('/auction-history')}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem 1.5rem', border: '1.5px solid rgba(170,140,60,0.35)', borderRadius: 12, background: '#fff', color: '#AA8C3C', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                >
                    <TrendingUp style={{ width: 18, height: 18 }} /> Lịch sử đấu giá
                </button>
            </div>

            {/* ── Transaction History ── */}
            <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid rgba(170,140,60,0.15)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>Lịch sử giao dịch</h2>
                    {/* Filter tabs */}
                    <div style={{ display: 'flex', gap: '0.375rem', background: '#F9FAFB', borderRadius: 10, padding: '0.25rem' }}>
                        {FILTERS.map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                style={{
                                    padding: '0.375rem 0.75rem',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: filter === f.key ? '#fff' : 'transparent',
                                    color: filter === f.key ? '#AA8C3C' : '#6B7280',
                                    fontWeight: filter === f.key ? 700 : 500,
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    boxShadow: filter === f.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                {transactions.length === 0 && !txLoading ? (
                    <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                        <Wallet style={{ width: 48, height: 48, color: '#D1D5DB', margin: '0 auto 1rem' }} />
                        <p style={{ color: '#6B7280', fontWeight: 600, marginBottom: 4 }}>Chưa có giao dịch nào</p>
                        <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Nạp tiền để bắt đầu tham gia đấu giá</p>
                    </div>
                ) : (
                    <>
                        {transactions.map((tx, i) => {
                            const tcfg = TX_TYPE_LABEL[tx.type] || { label: tx.type, color: '#6B7280', icon: AlertCircle };
                            const TIcon = tcfg.icon;
                            const scfg = TX_STATUS_CONFIG[tx.status] || TX_STATUS_CONFIG.pending;
                            const { Icon: SIcon } = scfg;
                            const isPositive = ['deposit', 'deposit_refund', 'admin_adjust'].includes(tx.type) && tx.amount > 0;

                            return (
                                <div
                                    key={tx._id || i}
                                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: i < transactions.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    {/* Icon */}
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${tcfg.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <TIcon style={{ width: 18, height: 18, color: tcfg.color }} />
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: '0 0 2px', fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{tcfg.label}</p>
                                        <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.8rem' }}>
                                            {formatDate(tx.createdAt)}
                                            {tx.description && ` · ${tx.description}`}
                                        </p>
                                    </div>

                                    {/* Status */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: scfg.color }}>
                                        <SIcon style={{ width: 13, height: 13 }} />
                                        {scfg.label}
                                    </div>

                                    {/* Amount */}
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: isPositive ? '#10B981' : '#EF4444' }}>
                                            {isPositive ? '+' : '-'}{formatVND(Math.abs(tx.amount))}
                                        </p>
                                        {tx.balanceAfter != null && (
                                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>Còn: {formatVND(tx.balanceAfter)}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Load more */}
                        {hasMore && (
                            <div style={{ padding: '1rem', textAlign: 'center' }}>
                                <button
                                    onClick={() => fetchTransactions(false)}
                                    disabled={txLoading}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.625rem 1.5rem', border: '1.5px solid rgba(170,140,60,0.3)', borderRadius: 10, background: '#fff', color: '#AA8C3C', fontWeight: 600, cursor: txLoading ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}
                                >
                                    <ChevronDown style={{ width: 16, height: 16 }} />
                                    {txLoading ? 'Đang tải...' : 'Xem thêm'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Spin keyframe */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
