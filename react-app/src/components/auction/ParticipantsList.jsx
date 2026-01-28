import { Users, Crown, TrendingUp } from 'lucide-react';
import './ParticipantsList.css';

/**
 * ParticipantsList component - Shows all participants in the auction room
 * @param {Object} props
 * @param {Array} props.participants - List of participants
 * @param {String} props.currentUserId - Current user's ID
 * @param {String} props.winnerId - Winner's ID (if auction ended)
 * @param {Boolean} props.isExpanded - Whether list is expanded
 * @param {Function} props.onToggle - Toggle expand/collapse
 */
export default function ParticipantsList({
    participants = [],
    currentUserId,
    winnerId,
    isExpanded = true,
    onToggle,
}) {
    const isWinner = (userId) => winnerId && userId === winnerId;
    const isCurrentUser = (userId) => userId === currentUserId;

    return (
        <div className={`participants-list ${isExpanded ? 'expanded' : 'collapsed'}`}>
            {/* Header */}
            <div className="participants-header" onClick={onToggle}>
                <div className="participants-title">
                    <Users className="participants-icon" size={20} />
                    <span>Người tham gia</span>
                    <span className="participants-count">{participants.length}</span>
                </div>
                <button
                    className="btn-toggle-participants"
                    aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                >
                    {isExpanded ? '−' : '+'}
                </button>
            </div>

            {/* Participants Grid */}
            {isExpanded && (
                <div className="participants-grid">
                    {participants.length === 0 ? (
                        <div className="no-participants">
                            <Users size={48} className="no-participants-icon" />
                            <p>Chưa có người tham gia</p>
                        </div>
                    ) : (
                        participants.map((participant) => (
                            <div
                                key={participant.userId}
                                className={`participant-card ${isCurrentUser(participant.userId) ? 'is-current-user' : ''
                                    } ${isWinner(participant.userId) ? 'is-winner' : ''}`}
                            >
                                <div className="participant-avatar-wrapper">
                                    {participant.userAvatar ? (
                                        <img
                                            src={participant.userAvatar}
                                            alt={participant.userName}
                                            className="participant-avatar"
                                        />
                                    ) : (
                                        <div className="participant-avatar-placeholder">
                                            {participant.userName?.charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    {/* Online indicator */}
                                    <div className="online-indicator"></div>

                                    {/* Winner crown */}
                                    {isWinner(participant.userId) && (
                                        <div className="winner-badge">
                                            <Crown size={14} />
                                        </div>
                                    )}
                                </div>

                                <div className="participant-info">
                                    <div className="participant-name">
                                        {participant.userName}
                                        {isCurrentUser(participant.userId) && (
                                            <span className="you-badge">Bạn</span>
                                        )}
                                    </div>

                                    {participant.bidCount !== undefined && (
                                        <div className="participant-stats">
                                            <TrendingUp size={12} />
                                            <span>{participant.bidCount} lượt</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
