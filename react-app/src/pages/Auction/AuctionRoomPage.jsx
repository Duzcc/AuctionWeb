import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';
import useRoomSocket from '../../hooks/useRoomSocket';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Clock, DollarSign, User, Shield, AlertTriangle, Gavel } from 'lucide-react';
import axios from '@/services/axiosInstance';
import ChatBox from '../../components/auction/ChatBox';
import ParticipantsList from '../../components/auction/ParticipantsList';
import soundEffects from '../../utils/soundEffects';
import keyboardShortcuts, { SHORTCUTS } from '../../utils/keyboardShortcuts';

export default function AuctionRoomPage() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket();
    const { user } = useAuth();

    // State
    const [session, setSession] = useState(null);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [bids, setBids] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [bidAmount, setBidAmount] = useState(0);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('loading');
    const [sessionPlateId, setSessionPlateId] = useState(null);

    // UI State for new components
    const [showChat, setShowChat] = useState(true);
    const [showParticipants, setShowParticipants] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const bidInputRef = useRef(null);

    // Room socket for chat and participants
    const {
        messages,
        participants,
        typingUsers,
        isConnected: roomSocketConnected,
        sendMessage,
        sendTyping,
    } = useRoomSocket(sessionPlateId, !!sessionPlateId);

    // Sound effects setup
    useEffect(() => {
        soundEffects.setEnabled(soundEnabled);
    }, [soundEnabled]);


    // Fetch Session Detail Initial
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await axios.get(`/sessions/${sessionId}`);
                if (res.data.success) {
                    setSession(res.data.data);
                    setCurrentPrice(res.data.data.currentPrice || res.data.data.depositAmount || 0);
                    setStatus('active');

                    // Set sessionPlateId for room socket
                    if (res.data.data.plates && res.data.data.plates.length > 0) {
                        setSessionPlateId(res.data.data.plates[0]._id);
                    }
                }
            } catch (err) {
                console.error("Error fetching session:", err);
                setError("Không tìm thấy phiên đấu giá");
                setStatus('error');
            }
        };
        fetchSession();
    }, [sessionId]);

    // Socket Connection & Events
    useEffect(() => {
        if (!socket || !isConnected || !sessionId) return;

        // Join Room
        socket.emit('join_auction', { sessionId });

        // Listeners
        socket.on('joined_auction', (data) => {
            toast.success("Đã vào phòng đấu giá");
            soundEffects.playSuccessSound();
        });

        socket.on('bid_update', (data) => {
            setCurrentPrice(data.newPrice);
            setBids(prev => [{
                id: Date.now(),
                user: data.winnerName,
                amount: data.newPrice,
                time: new Date()
            }, ...prev]);
            toast.success(`Giá mới: ${data.newPrice.toLocaleString()}`);
            soundEffects.playBidSound();
        });

        socket.on('error', (data) => {
            toast.error(data.message);
            setError(data.message);
        });

        socket.on('bid_error', (data) => {
            toast.error(data.message);
        });

        return () => {
            socket.off('joined_auction');
            socket.off('bid_update');
            socket.off('error');
            socket.off('bid_error');
        };
    }, [socket, isConnected, sessionId]);

    // Timer Logic with sound warning
    useEffect(() => {
        if (!session?.endTime) return;
        const interval = setInterval(() => {
            const now = new Date();
            const end = new Date(session.endTime);
            const diff = Math.floor((end - now) / 1000);

            if (diff <= 0) {
                setTimeLeft(0);
                setStatus('ended');
                soundEffects.playEndSound();
                clearInterval(interval);
            } else {
                setTimeLeft(diff);
                // Warning sound at 60 seconds
                if (diff === 60) {
                    soundEffects.playWarningSound();
                    toast('⚠️ Còn 1 phút!', { icon: '⏰' });
                }
                // Warning sound at 10 seconds
                if (diff === 10) {
                    soundEffects.playWarningSound();
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [session]);

    const handleBid = async () => {
        if (!socket || !isConnected) {
            toast.error("Mất kết nối máy chủ");
            return;
        }
        if (bidAmount <= currentPrice) {
            toast.error("Giá đặt phải cao hơn giá hiện tại");
            return;
        }

        const plateId = session?.plates?.[0]?._id;
        if (!plateId) {
            toast.error("Không tìm thấy thông tin biển số");
            return;
        }

        try {
            const res = await axios.post('/bids', {
                sessionPlateId: plateId,
                amount: Number(bidAmount)
            });

            if (res.data.success) {
                toast.success('Đặt giá thành công!');
                soundEffects.playSuccessSound();
            }
        } catch (error) {
            console.error('Bid error:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi đặt giá');
        }
    };

    // Quick bid function
    const quickBid = (multiplier = 1) => {
        if (status !== 'active') return;
        const step = 1000000; // Default step
        setBidAmount(currentPrice + (step * multiplier));
        setTimeout(() => handleBid(), 100);
    };

    // Keyboard shortcuts
    useEffect(() => {
        keyboardShortcuts.startListening();

        // Register shortcuts
        keyboardShortcuts.register(SHORTCUTS.QUICK_BID, () => quickBid(1));
        keyboardShortcuts.register(SHORTCUTS.BID_1X, () => quickBid(1));
        keyboardShortcuts.register(SHORTCUTS.BID_2X, () => quickBid(2));
        keyboardShortcuts.register(SHORTCUTS.BID_5X, () => quickBid(5));
        keyboardShortcuts.register(SHORTCUTS.TOGGLE_CHAT, () => setShowChat(prev => !prev));
        keyboardShortcuts.register(SHORTCUTS.TOGGLE_PARTICIPANTS, () => setShowParticipants(prev => !prev));
        keyboardShortcuts.register(SHORTCUTS.FOCUS_BID_INPUT, () => bidInputRef.current?.focus());
        keyboardShortcuts.register(SHORTCUTS.ESCAPE, () => navigate(-1));

        return () => {
            keyboardShortcuts.stopListening();
            keyboardShortcuts.clearAll();
        };
    }, [status, currentPrice, session]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const second = s % 60;
        return `${m.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
    };

    if (status === 'error') return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Lỗi truy cập</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button onClick={() => navigate('/auction-history')} className="text-blue-600 hover:underline">Quay lại lịch sử</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 py-4 px-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <h1 className="text-xl font-bold text-white tracking-wide">PHÒNG ĐẤU GIÁ TRỰC TUYẾN</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="bg-gray-700 px-3 py-1 rounded text-sm text-gray-300">
                        {user?.fullName || 'Khách'}
                    </span>
                    <button onClick={() => navigate('/auction-history')} className="text-sm text-gray-400 hover:text-white transition">Thoát</button>
                </div>
            </header>

            <div className="container mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)]">

                {/* Left: Main View (Image/Stream) - 8 columns */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Visual Area */}
                    <div className="flex-1 bg-black rounded-2xl relative overflow-hidden border border-gray-700 shadow-2xl flex items-center justify-center group">
                        {session?.plates?.[0]?.image ? (
                            <img src={session.plates[0].image} className="w-full h-full object-contain" alt="Plate" />
                        ) : (
                            <div className="text-center">
                                <div className="border-4 border-white inline-block px-8 py-4 rounded bg-blue-900 text-5xl font-mono font-bold tracking-widest mb-4">
                                    {session?.sessionName || 'LOADING...'}
                                </div>
                                <p className="text-gray-400">Đang diễn ra trực tiếp</p>
                            </div>
                        )}

                        {/* Overlay Stats */}
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-4 py-2 rounded-lg border border-gray-600">
                            <span className="text-gray-300 text-xs uppercase block mb-1">Thời gian còn lại</span>
                            <div className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-white'}`}>
                                {formatTime(timeLeft)}
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-4 py-2 rounded-lg border border-gray-600">
                            <span className="text-gray-300 text-xs uppercase block mb-1">Giá hiện tại</span>
                            <div className="text-2xl font-bold text-[#D4AF37]">
                                {currentPrice.toLocaleString('vi-VN')}
                            </div>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h2 className="text-lg font-bold text-white mb-2">{session?.sessionName}</h2>
                        <div className="flex gap-8 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" /> <span>Biển số sạch, pháp lý đảm bảo</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" /> <span>Người tổ chức: VPA Auction</span>
                            </div>
                        </div>
                    </div>

                    {/* Bid History - Show only on large screens */}
                    <div className="hidden lg:block bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-700">
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Lịch sử đặt giá</h3>
                        </div>
                        <div className="p-4 max-h-48 overflow-y-auto space-y-3">
                            {bids.length === 0 ? (
                                <div className="text-center py-10 text-gray-600 italic">Chưa có lượt trả giá nào</div>
                            ) : (
                                bids.slice(0, 5).map(bid => (
                                    <div key={bid.id} className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg border-l-4 border-[#D4AF37]">
                                        <div>
                                            <div className="font-bold text-white text-sm">{bid.user || 'Ẩn danh'}</div>
                                            <div className="text-xs text-gray-500">{new Date(bid.time).toLocaleTimeString()}</div>
                                        </div>
                                        <div className="font-bold text-[#D4AF37]">
                                            {bid.amount.toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Bidding Controls + Chat + Participants - 4 columns */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    {/* Bidding Controls */}
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                        <div className="p-6 bg-gray-750 border-b border-gray-700">
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                                    Đặt giá của bạn (VNĐ)
                                    <span className="text-xs font-normal lowercase ml-2 text-gray-500">(Phím tắt: B)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        ref={bidInputRef}
                                        type="number"
                                        value={bidAmount}
                                        onChange={e => setBidAmount(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-600 text-white text-lg font-bold py-3 pl-10 pr-4 rounded-lg focus:outline-none focus:border-[#D4AF37] transition"
                                        placeholder="Nhập giá..."
                                    />
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                </div>
                                <div className="flex gap-2 mt-2">
                                    {[1000000, 5000000, 10000000].map(step => (
                                        <button
                                            key={step}
                                            onClick={() => setBidAmount(currentPrice + step)}
                                            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded transition"
                                        >
                                            +{step.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                    💡 Phím tắt: Space/1/2/5 để đặt giá nhanh
                                </div>
                            </div>

                            <button
                                onClick={handleBid}
                                disabled={status !== 'active'}
                                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#AA8C3C] hover:from-[#E5B83B] hover:to-[#BFA045] text-white font-black py-4 rounded-xl shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg uppercase tracking-wider"
                            >
                                <Gavel className="w-6 h-6" />
                                {status === 'active' ? 'Xác nhận trả giá' : 'Phiên đấu giá kết thúc'}
                            </button>
                        </div>
                    </div>

                    {/* Chat Box */}
                    <ChatBox
                        messages={messages}
                        onSendMessage={sendMessage}
                        typingUsers={typingUsers}
                        onTyping={sendTyping}
                        isConnected={roomSocketConnected}
                    />

                    {/* Participants List */}
                    <ParticipantsList
                        participants={participants}
                        currentUserId={user?.id}
                        winnerId={session?.winnerId}
                        isExpanded={showParticipants}
                        onToggle={() => setShowParticipants(!showParticipants)}
                    />
                </div>
            </div>
        </div>
    );
}
