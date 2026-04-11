import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
    Gavel, Users, Shield, LogOut, Volume2, VolumeX,
    DollarSign, AlertCircle, Wifi, WifiOff, Eye
} from 'lucide-react';
import axios from '@/services/axiosInstance';
import { useAuctionRoom } from '../../hooks/useAuctionRoom';
import ChatBox from '../../components/auction/ChatBox';
import ParticipantsList from '../../components/auction/ParticipantsList';
import BidHistorySidebar from '../../components/auction/BidHistorySidebar';
import CountdownTimer from '../../components/auction/CountdownTimer';
import PriceDisplay from '../../components/auction/PriceDisplay';
import WinnerOverlay from '../../components/auction/WinnerOverlay';
import soundEffects from '../../utils/soundEffects';
import './AuctionRoom.css';

export default function AuctionRoomPage() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // ─── Fetch initial session info ───────────────────────────
    const [sessionInfo, setSessionInfo] = useState(null);
    const [sessionPlateId, setSessionPlateId] = useState(null);
    const [initialPlateData, setInitialPlateData] = useState(null); // data từ HTTP trước khi socket ready
    const [pageLoading, setPageLoading] = useState(true);
    const [pageError, setPageError] = useState(null);

    useEffect(() => {
        const loadSession = async () => {
            try {
                // Lấy thông tin session
                const [sessionRes, platesRes] = await Promise.all([
                    axios.get(`/sessions/${sessionId}`),
                    axios.get(`/sessions/${sessionId}/plates`),
                ]);

                if (sessionRes.data?.success) {
                    setSessionInfo(sessionRes.data.data);
                }

                // Lấy plates từ session
                const plates = platesRes.data?.data || platesRes.data?.items || [];

                if (plates.length === 0) {
                    setPageError('Phiên đấu giá này chưa có biển số nào');
                    return;
                }

                // Ưu tiên plate đang bidding; nếu không có thì lấy cái đầu tiên
                const activePlate = plates.find(p => p.status === 'bidding') || plates[0];

                if (!activePlate?._id) {
                    setPageError('Không tìm thấy thông tin biển số đấu giá');
                    return;
                }

                // Lưu plate data ban đầu để hiển thị khi socket chưa kết nối xong
                setInitialPlateData(activePlate);
                setSessionPlateId(activePlate._id);

            } catch (err) {
                console.error('Load session error:', err);
                setPageError(err.response?.data?.message || 'Không thể tải phiên đấu giá. Vui lòng thử lại.');
            } finally {
                setPageLoading(false);
            }
        };
        if (sessionId) loadSession();
    }, [sessionId]);


    // ─── Real-time Auction Hook ───────────────────────────────
    const {
        auctionData, currentPrice, endTime, status,
        viewers, totalExtensions, winner, priceStep,
        minimumNextBid, bids, latestBid, newBidFlash,
        messages, typingUsers, participants,
        isConnected, error: socketError, reconnectCount,
        isPlacingBid, bidError, rateLimitRemaining, canBid,
        placeBid, sendMessage, sendTyping, refreshParticipants,
    } = useAuctionRoom(sessionPlateId);

    // ─── Countdown ────────────────────────────────────────────
    const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
    useEffect(() => {
        // endTime null hoặc Invalid Date → reset về 0, không set timer
        if (!endTime || isNaN(endTime.getTime())) {
            setTimeLeftSeconds(0);
            return;
        }
        const tick = () => {
            const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
            setTimeLeftSeconds(diff);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [endTime]);

    // ─── Sound ────────────────────────────────────────────────
    const [soundEnabled, setSoundEnabled] = useState(true);
    useEffect(() => { soundEffects.setEnabled(soundEnabled); }, [soundEnabled]);

    // Sound on new bid
    useEffect(() => {
        if (latestBid) {
            soundEffects.playBidSound?.();
            if (timeLeftSeconds <= 30) soundEffects.playWarningSound?.();
        }
    }, [latestBid]);

    // Sound on time warnings
    const warnedRef = useRef({ s60: false, s10: false });
    useEffect(() => {
        if (timeLeftSeconds === 60 && !warnedRef.current.s60) {
            warnedRef.current.s60 = true;
            soundEffects.playWarningSound?.();
            toast('⏰ Còn 1 phút!', { icon: '⚡', duration: 3000 });
        }
        if (timeLeftSeconds === 10 && !warnedRef.current.s10) {
            warnedRef.current.s10 = true;
            soundEffects.playWarningSound?.();
        }
        if (timeLeftSeconds === 0 && status === 'active') {
            soundEffects.playEndSound?.();
        }
    }, [timeLeftSeconds, status]);

    // ─── Bid input state ──────────────────────────────────────
    const [bidInput, setBidInput] = useState('');
    const [showWinner, setShowWinner] = useState(true);
    const bidInputRef = useRef(null);

    // Khi có bid mới → toast
    useEffect(() => {
        if (!latestBid) return;
        const isOwnBid = latestBid.userId === user?.id;
        toast.custom((t) => (
            <div className={`bg-gray-900 border border-amber-500/30 text-white px-4 py-3 rounded-xl shadow-xl ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
                <div className="font-bold text-amber-400">
                    {isOwnBid ? 'Bạn vừa đặt giá' : latestBid.userName}
                </div>
                <div className="text-sm text-gray-300">
                    {(latestBid.bidAmount).toLocaleString('vi-VN')} VNĐ
                </div>
            </div>
        ), { duration: 2500 });
    }, [latestBid]);

    const handleSubmitBid = useCallback(() => {
        const amount = parseInt(String(bidInput).replace(/[^0-9]/g, ''), 10);
        if (!amount || isNaN(amount)) {
            toast.error('Vui lòng nhập giá hợp lệ');
            return;
        }
        if (amount < minimumNextBid) {
            toast.error(`Giá tối thiểu: ${minimumNextBid.toLocaleString('vi-VN')} VNĐ`);
            return;
        }
        const ok = placeBid(amount);
        if (ok) {
            setBidInput('');
            toast.loading('Đang đặt giá...', { id: 'bid-placing', duration: 2000 });
        }
    }, [bidInput, minimumNextBid, placeBid]);

    // Hiển thị toast khi bid confirmed/error
    useEffect(() => {
        if (!isPlacingBid && bidError) {
            toast.dismiss('bid-placing');
            toast.error(bidError, { id: 'bid-error' });
        }
    }, [isPlacingBid, bidError]);

    const setQuickBid = (steps) => {
        const amount = minimumNextBid + (priceStep * (steps - 1));
        setBidInput(String(amount));
    };

    const handleForceStart = async () => {
        if (!window.confirm("Bắt đầu phiên đấu giá này ngay lập tức?")) return;
        try {
            await axios.post(`/sessions/plates/${sessionPlateId}/start`);
            toast.success("Đã bắt đầu đấu giá!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Không thể bắt đầu");
        }
    };

    // ─── Error / Loading screens ──────────────────────────────
    if (pageLoading) {
        return (
            <div className="auction-room" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 48, height: 48, border: '3px solid #D4AF37', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                    <p style={{ color: '#A1A1AA' }}>Đang tải phiên đấu giá...</p>
                </div>
            </div>
        );
    }

    if (pageError || socketError) {
        return (
            <div className="auction-room" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', maxWidth: 400 }}>
                    <AlertCircle style={{ width: 48, height: 48, color: '#EF4444', margin: '0 auto 1rem' }} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Không thể truy cập</h2>
                    <p style={{ color: '#A1A1AA', marginBottom: '1.5rem' }}>{pageError || socketError}</p>
                    <button
                        onClick={() => navigate(`/lobby/${sessionId}`)}
                        style={{ padding: '0.625rem 1.5rem', background: 'linear-gradient(135deg,#D4AF37,#AA8C2C)', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', color: '#000' }}
                    >
                        Quay lại phòng chờ
                    </button>
                </div>
            </div>
        );
    }

    // ─── Render ───────────────────────────────────────────────
    // Ưu tiên: dữ liệu real-time từ socket → dữ liệu HTTP ban đầu → fallback rỗng
    const sessionPlateInfo = auctionData || initialPlateData;
    // KHÔNG dùng sessionInfo.sessionName làm plateNumber — đó là tên phiên, không phải biển số
    const plateNumber = sessionPlateInfo?.plateNumber || sessionPlateInfo?.licensePlate || '------';
    const winnerData = winner || (status === 'ended' && auctionData?.winnerId
        ? { userId: auctionData.winnerId, userName: auctionData.winnerName, finalPrice: auctionData.finalPrice }
        : null);

    return (
        <div className="auction-room">
            {/* ── Winner Overlay ── */}
            {status === 'ended' && showWinner && (
                <WinnerOverlay
                    winner={winnerData}
                    auctionData={auctionData}
                    currentUserId={user?.id}
                    onClose={() => setShowWinner(false)}
                />
            )}

            {/* ── Header ── */}
            <header className="auction-header">
                <div className="auction-header-brand">
                    <div className="live-dot" />
                    <Gavel style={{ width: 18, height: 18, color: '#D4AF37' }} />
                    <h1 className="auction-title">Phòng Đấu Giá Trực Tuyến</h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {user?.role === 'admin' && status === 'pending' && (
                        <button
                            onClick={handleForceStart}
                            style={{ padding: '0.25rem 0.75rem', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                            Bắt đầu ngay (Demo)
                        </button>
                    )}
                    <div className="header-status-pill">
                        <div className={`conn-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
                        {isConnected ? 'Kết nối ổn định' : 'Mất kết nối'}
                        {!isConnected && reconnectCount > 0 && (
                            <span style={{ color: '#6B7280', marginLeft: 4 }}>({reconnectCount})</span>
                        )}
                    </div>
                    <div className="header-status-pill">
                        <Eye style={{ width: 12, height: 12 }} />
                        {viewers} online
                    </div>
                    <button
                        onClick={() => setSoundEnabled(s => !s)}
                        className="header-status-pill"
                        title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                        style={{ cursor: 'pointer', border: '1px solid rgba(212,175,55,0.15)', background: 'transparent' }}
                    >
                        {soundEnabled
                            ? <Volume2 style={{ width: 13, height: 13, color: '#D4AF37' }} />
                            : <VolumeX style={{ width: 13, height: 13, color: '#6B7280' }} />
                        }
                    </button>
                    <span className="header-status-pill" style={{ color: '#D4AF37', fontWeight: 600 }}>
                        {user?.fullName || user?.username || 'Khách'}
                    </span>
                    <button onClick={() => navigate('/auction-history')} className="exit-btn">
                        <LogOut style={{ width: 13, height: 13, display: 'inline', marginRight: 4 }} />
                        Thoát
                    </button>
                </div>
            </header>

            {/* Connection error banner */}
            {!isConnected && socketError && (
                <div className="connection-banner reconnecting">
                    <WifiOff style={{ width: 14, height: 14 }} />
                    {socketError}
                </div>
            )}

            {/* ── Main 3-column layout ── */}
            <div className="auction-main">

                {/* ── COL 1: Center — Plate visual + Info bar ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>

                    {/* Plate visual area */}
                    <div className="plate-visual-card" style={{ flex: '0 0 auto', height: 220 }}>
                        {sessionPlateInfo?.image ? (
                            <img
                                src={sessionPlateInfo.image}
                                alt={plateNumber}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        ) : (
                            <div className="plate-display">
                                <div className="plate-number-box">{plateNumber}</div>
                                <p className="plate-subtitle">Đang diễn ra đấu giá trực tuyến</p>
                            </div>
                        )}

                        {/* Stats overlay bottom */}
                        <div className="stats-overlay">
                            <PriceDisplay
                                currentPrice={currentPrice}
                                newBidFlash={newBidFlash}
                                label="GIÁ HIỆN TẠI"
                            />
                            <CountdownTimer
                                endTime={endTime}
                                timeLeftSeconds={timeLeftSeconds}
                                extensionCount={totalExtensions}
                                maxExtensions={auctionData?.maxExtensions}
                            />
                        </div>
                    </div>

                    {/* Session info bar */}
                    <div className="auction-info-bar">
                        <div className="info-item">
                            <Shield style={{ width: 15, height: 15 }} />
                            <span>Biển số sạch, pháp lý đảm bảo</span>
                        </div>
                        <div className="info-item">
                            <Users style={{ width: 15, height: 15 }} />
                            <span>{participants.length || viewers} người tham dự</span>
                        </div>
                        {sessionInfo?.sessionName && (
                            <div className="info-item">
                                <Gavel style={{ width: 15, height: 15 }} />
                                <span>{sessionInfo.sessionName}</span>
                            </div>
                        )}
                        {(auctionData?.totalExtensions ?? 0) > 0 && (
                            <div className="info-item" style={{ marginLeft: 'auto' }}>
                                <span style={{ color: '#F59E0B', fontSize: '0.75rem', fontWeight: 600 }}>
                                    ⚡ Đã gia hạn {auctionData.totalExtensions} lần
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Bid History (full-height scrollable) */}
                    <BidHistorySidebar bids={bids} currentUserId={user?.id} />
                </div>

                {/* ── COL 2: Bid Controls + Chat ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>

                    {/* Bid Controls Card */}
                    <div className="bid-controls-card">
                        <div className="bid-controls-header">
                            <Gavel style={{ width: 14, height: 14, color: '#D4AF37' }} />
                            ĐẶT GIÁ
                        </div>
                        <div className="bid-controls-body">
                            {/* Current leader */}
                            {latestBid && (
                                <div className="current-leader">
                                    🏅 Đang dẫn:{' '}
                                    <span className="current-leader-name">
                                        {latestBid.userId === user?.id ? 'Bạn' : (latestBid.userName || 'Ẩn danh')}
                                    </span>
                                    {' '}— {(latestBid.bidAmount || 0).toLocaleString('vi-VN')} VNĐ
                                </div>
                            )}

                            {/* Bid input */}
                            <div className="bid-input-label">Giá của bạn (VNĐ)</div>
                            <div className="bid-input-wrapper">
                                <DollarSign className="bid-input-icon" style={{ width: 16, height: 16 }} />
                                <input
                                    ref={bidInputRef}
                                    className="bid-input"
                                    type="number"
                                    value={bidInput}
                                    onChange={e => setBidInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSubmitBid()}
                                    placeholder={minimumNextBid.toLocaleString('vi-VN')}
                                    disabled={status !== 'active' || !canBid}
                                />
                            </div>
                            <div className="min-bid-hint">
                                Tối thiểu: <span>{minimumNextBid.toLocaleString('vi-VN')} VNĐ</span>
                                {priceStep > 0 && (
                                    <> · Bước giá: <span>{priceStep.toLocaleString('vi-VN')}</span></>
                                )}
                            </div>

                            {/* Quick bid buttons */}
                            {priceStep > 0 && (
                                <div className="quick-bid-grid" style={{ marginTop: '0.75rem' }}>
                                    {[1, 2, 5, 10].map(steps => (
                                        <button
                                            key={steps}
                                            className="quick-bid-btn"
                                            onClick={() => setQuickBid(steps)}
                                            disabled={status !== 'active'}
                                        >
                                            +{(priceStep * steps).toLocaleString('vi-VN')}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                className={`submit-bid-btn ${isPlacingBid ? 'placing' : ''}`}
                                onClick={handleSubmitBid}
                                disabled={status !== 'active' || isPlacingBid || rateLimitRemaining > 0}
                                style={{ marginTop: '0.875rem' }}
                            >
                                <Gavel style={{ width: 18, height: 18 }} />
                                {isPlacingBid
                                    ? 'Đang xử lý...'
                                    : status !== 'active'
                                        ? 'Phiên đã kết thúc'
                                        : 'Xác nhận trả giá'
                                }
                            </button>

                            {/* Rate limit */}
                            {rateLimitRemaining > 0 && (
                                <div className="rate-limit-info">
                                    ⏳ Chờ {rateLimitRemaining}s trước khi bid tiếp
                                </div>
                            )}

                            {/* Bid error */}
                            {bidError && (
                                <div className="bid-error-msg">
                                    <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                                    {bidError}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Box */}
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <ChatBox
                            messages={messages}
                            onSendMessage={sendMessage}
                            typingUsers={typingUsers}
                            onTyping={sendTyping}
                            isConnected={isConnected}
                        />
                    </div>
                </div>

                {/* ── COL 3: Participants ── */}
                <div className="auction-right-col" style={{ overflow: 'hidden' }}>
                    <ParticipantsList
                        participants={participants}
                        currentUserId={user?.id}
                        winnerId={winnerData?.userId}
                        isExpanded
                        onToggle={refreshParticipants}
                    />
                </div>
            </div>

            {/* ── Mobile Fixed Bid Bar ── */}
            <div className="mobile-bid-bar">
                <div className="mobile-bid-price">
                    <div style={{ fontSize: '0.6875rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Giá hiện tại</div>
                    <div className="mobile-current-price">{currentPrice.toLocaleString('vi-VN')} VNĐ</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="quick-bid-btn"
                        onClick={() => setQuickBid(1)}
                        disabled={status !== 'active'}
                        style={{ padding: '0.625rem 0.75rem', fontSize: '0.75rem' }}
                    >
                        +{priceStep.toLocaleString('vi-VN')}
                    </button>
                    <button
                        className="mobile-submit-btn"
                        onClick={handleSubmitBid}
                        disabled={status !== 'active' || isPlacingBid || rateLimitRemaining > 0}
                    >
                        <Gavel style={{ width: 15, height: 15, display: 'inline', marginRight: 4 }} />
                        Đặt giá
                    </button>
                </div>
            </div>
        </div>
    );
}
