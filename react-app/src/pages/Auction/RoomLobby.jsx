import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, Trophy, Info, ArrowRight, CheckCircle } from 'lucide-react';
import axios from '@/services/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import './RoomLobby.css';

/**
 * RoomLobby - Pre-auction lobby page
 * Shows session info, rules, and countdown before entering auction room
 */
export default function RoomLobby() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeUntilStart, setTimeUntilStart] = useState(null);
    const [canJoin, setCanJoin] = useState(false);

    // Fetch session details
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await axios.get(`/sessions/${sessionId}`);
                if (res.data.success) {
                    setSession(res.data.data);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error fetching session:', err);
                setError('Không thể tải thông tin phiên đấu giá');
                setLoading(false);
            }
        };

        fetchSession();
    }, [sessionId]);

    // Countdown timer
    useEffect(() => {
        if (!session?.startTime) return;

        const updateCountdown = () => {
            const now = new Date();
            const start = new Date(session.startTime);
            const diff = start - now;

            if (diff <= 0) {
                setTimeUntilStart(0);
                setCanJoin(true);
            } else {
                setTimeUntilStart(diff);
                setCanJoin(false);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [session]);

    const formatCountdown = (ms) => {
        if (ms <= 0) return 'Đang diễn ra';

        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} ngày ${hours % 24} giờ`;
        if (hours > 0) return `${hours} giờ ${minutes % 60} phút`;
        if (minutes > 0) return `${minutes} phút ${seconds % 60} giây`;
        return `${seconds} giây`;
    };

    const handleJoinRoom = () => {
        if (canJoin && session) {
            navigate(`/auction/room/${sessionId}`);
        }
    };

    if (loading) {
        return (
            <div className="room-lobby loading">
                <div className="spinner-large"></div>
                <p>Đang tải...</p>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="room-lobby error">
                <div className="error-container">
                    <h2>⚠️ Lỗi</h2>
                    <p>{error || 'Không tìm thấy phiên đấu giá'}</p>
                    <button onClick={() => navigate('/sessions')} className="btn-back">
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="room-lobby">
            <div className="lobby-container">
                {/* Header */}
                <div className="lobby-header">
                    <button onClick={() => navigate(-1)} className="btn-back-small">
                        ← Quay lại
                    </button>
                    <h1 className="lobby-title">{session.sessionName}</h1>
                    <div className="lobby-subtitle">Phòng chờ đấu giá</div>
                </div>

                {/* Main Content Grid */}
                <div className="lobby-grid">
                    {/* Left: Session Info */}
                    <div className="lobby-section">
                        <div className="section-card">
                            <div className="card-header">
                                <Info size={24} />
                                <h2>Thông tin phiên</h2>
                            </div>
                            <div className="card-body">
                                <div className="info-row">
                                    <span className="info-label">Thời gian bắt đầu:</span>
                                    <span className="info-value">
                                        {new Date(session.startTime).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Thời gian kết thúc:</span>
                                    <span className="info-value">
                                        {new Date(session.endTime).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Phí đặt cọc:</span>
                                    <span className="info-value highlight">
                                        {session.depositAmount?.toLocaleString('vi-VN')} VNĐ
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Trạng thái:</span>
                                    <span className={`status-badge ${session.status}`}>
                                        {session.status === 'ongoing' ? 'Đang diễn ra' :
                                            session.status === 'upcoming' ? 'Sắp diễn ra' :
                                                session.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Countdown */}
                        <div className="section-card countdown-card">
                            <div className="card-header">
                                <Clock size={24} />
                                <h2>Thời gian còn lại</h2>
                            </div>
                            <div className="countdown-display">
                                <div className="countdown-time">
                                    {formatCountdown(timeUntilStart)}
                                </div>
                                {canJoin && (
                                    <div className="ready-badge">
                                        <CheckCircle size={20} />
                                        Sẵn sàng tham gia
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Plates & Rules */}
                    <div className="lobby-section">
                        {/* Upcoming Plates */}
                        {session.plates && session.plates.length > 0 && (
                            <div className="section-card">
                                <div className="card-header">
                                    <Trophy size={24} />
                                    <h2>Biển số đấu giá ({session.plates.length})</h2>
                                </div>
                                <div className="plates-carousel">
                                    {session.plates.slice(0, 5).map((plate, index) => (
                                        <div key={plate._id} className="plate-preview">
                                            <div className="plate-number">{plate.plateNumber}</div>
                                            <div className="plate-starting-price">
                                                Giá khởi điểm: {plate.startingPrice?.toLocaleString('vi-VN')} VNĐ
                                            </div>
                                        </div>
                                    ))}
                                    {session.plates.length > 5 && (
                                        <div className="plate-preview more">
                                            <div className="more-text">
                                                +{session.plates.length - 5} biển khác
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Rules */}
                        <div className="section-card">
                            <div className="card-header">
                                <Users size={24} />
                                <h2>Quy định đấu giá</h2>
                            </div>
                            <div className="rules-list">
                                <div className="rule-item">
                                    <CheckCircle size={18} className="rule-icon" />
                                    <span>Người tham gia phải đã đăng ký và đặt cọc đầy đủ</span>
                                </div>
                                <div className="rule-item">
                                    <CheckCircle size={18} className="rule-icon" />
                                    <span>Mỗi lần trả giá phải cao hơn giá hiện tại ít nhất 1 bước giá</span>
                                </div>
                                <div className="rule-item">
                                    <CheckCircle size={18} className="rule-icon" />
                                    <span>Thời gian đấu giá có thể được gia hạn nếu có trả giá trong giây cuối</span>
                                </div>
                                <div className="rule-item">
                                    <CheckCircle size={18} className="rule-icon" />
                                    <span>Người thắng cuộc phải thanh toán trong vòng 48 giờ</span>
                                </div>
                                <div className="rule-item">
                                    <CheckCircle size={18} className="rule-icon" />
                                    <span>Mọi quyết định của ban tổ chức là quyết định cuối cùng</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Join Button */}
                <div className="lobby-footer">
                    <button
                        onClick={handleJoinRoom}
                        disabled={!canJoin}
                        className="btn-join-room"
                    >
                        {canJoin ? (
                            <>
                                Vào phòng đấu giá
                                <ArrowRight size={20} />
                            </>
                        ) : (
                            <>
                                Chưa đến giờ bắt đầu
                                <Clock size={20} />
                            </>
                        )}
                    </button>
                    {!canJoin && (
                        <p className="join-hint">
                            Nút sẽ được kích hoạt khi phiên đấu giá bắt đầu
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
