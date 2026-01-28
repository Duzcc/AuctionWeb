import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import './ChatBox.css';

/**
 * ChatBox component for real-time messaging in auction rooms
 * @param {Object} props
 * @param {Array} props.messages - Array of chat messages
 * @param {Function} props.onSendMessage - Callback when sending message
 * @param {Array} props.typingUsers - Users currently typing
 * @param {Function} props.onTyping - Callback when user is typing
 * @param {Boolean} props.isConnected - Socket connection status
 */
export default function ChatBox({
    messages = [],
    onSendMessage,
    typingUsers = [],
    onTyping,
    isConnected = false,
}) {
    const [message, setMessage] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setMessage(value);

        // Typing indicator logic
        if (value && !isTyping) {
            setIsTyping(true);
            onTyping?.(true);
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            onTyping?.(false);
        }, 1000);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!message.trim()) return;
        if (!isConnected) {
            alert('Mất kết nối. Vui lòng thử lại.');
            return;
        }

        onSendMessage?.(message.trim());
        setMessage('');
        setIsTyping(false);
        onTyping?.(false);
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMessageClass = (msg) => {
        if (msg.messageType === 'system') return 'message-system';
        if (msg.messageType === 'bid_alert') return 'message-bid-alert';
        return 'message-user';
    };

    return (
        <div className={`chat-box ${isExpanded ? 'expanded' : 'collapsed'}`}>
            {/* Header */}
            <div className="chat-header">
                <div className="chat-title">
                    <MessageCircle className="chat-icon" size={20} />
                    <span>Trò chuyện</span>
                    {!isConnected && (
                        <span className="status-badge disconnected">Offline</span>
                    )}
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="btn-toggle"
                    aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                >
                    {isExpanded ? <X size={20} /> : <MessageCircle size={20} />}
                </button>
            </div>

            {/* Messages Container */}
            {isExpanded && (
                <>
                    <div className="chat-messages">
                        {messages.length === 0 ? (
                            <div className="no-messages">
                                <MessageCircle size={48} className="no-messages-icon" />
                                <p>Chưa có tin nhắn nào</p>
                                <p className="text-muted">Hãy là người đầu tiên gửi tin nhắn!</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, index) => (
                                    <div
                                        key={msg._id || index}
                                        className={`message ${getMessageClass(msg)}`}
                                    >
                                        {msg.messageType !== 'system' && msg.userAvatar && (
                                            <img
                                                src={msg.userAvatar}
                                                alt={msg.userName}
                                                className="message-avatar"
                                            />
                                        )}
                                        <div className="message-content">
                                            {msg.messageType !== 'system' && (
                                                <div className="message-header">
                                                    <span className="message-user">{msg.userName}</span>
                                                    <span className="message-time">{formatTime(msg.createdAt)}</span>
                                                </div>
                                            )}
                                            <div className="message-text">{msg.message}</div>
                                        </div>
                                    </div>
                                ))}

                                {/* Typing indicators */}
                                {typingUsers.length > 0 && (
                                    <div className="typing-indicator">
                                        <div className="typing-dots">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                        <span className="typing-text">
                                            {typingUsers.map(u => u.userName).join(', ')} đang nhập...
                                        </span>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSendMessage} className="chat-input-form">
                        <input
                            type="text"
                            value={message}
                            onChange={handleInputChange}
                            placeholder="Nhập tin nhắn..."
                            className="chat-input"
                            maxLength={500}
                            disabled={!isConnected}
                        />
                        <button
                            type="submit"
                            className="btn-send"
                            disabled={!message.trim() || !isConnected}
                            aria-label="Gửi tin nhắn"
                        >
                            <Send size={20} />
                        </button>
                    </form>

                    {message.length > 400 && (
                        <div className="character-count">
                            {message.length}/500
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
