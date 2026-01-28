import { useState, useEffect } from 'react';
import axios from '@/services/axiosInstance';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

export default function SessionManagementPage() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSessions = async () => {
        try {
            const res = await axios.get('/sessions'); // Admin should see all, or add /admin/sessions endpoint if logic differs
            if (res.data.success) {
                setSessions(res.data.data.sessions || res.data.data); // Adjust based on pagination structure
            }
        } catch (error) {
            toast.error('Lỗi khi tải danh sách phiên');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleFinalize = async (sessionId) => {
        if (!window.confirm('Bạn có chắc chắn muốn kết thúc phiên đấu giá này? Hành động này sẽ chốt người thắng và không thể hoàn tác.')) return;

        try {
            const res = await axios.post(`/sessions/${sessionId}/finalize`);
            if (res.data.success) {
                toast.success('Đã kết thúc phiên đấu giá thành công');
                fetchSessions(); // Audit status
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi kết thúc phiên');
        }
    };

    if (loading) return <div className="p-8 text-center">Đang tải...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý Phiên đấu giá</h1>

            <div className="grid gap-4">
                {sessions.map(session => (
                    <div key={session._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg text-blue-900">{session.sessionName}</h3>
                            <div className="flex gap-4 text-sm text-gray-500 mt-2">
                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(session.startTime).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}</span>
                            </div>
                            <div className="mt-2 text-sm font-medium">
                                Trạng thái:
                                <span className={`ml-2 px-2 py-1 rounded text-xs uppercase ${session.status === 'active' ? 'bg-green-100 text-green-700' :
                                        session.status === 'ended' ? 'bg-gray-100 text-gray-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {session.status}
                                </span>
                            </div>
                        </div>

                        <div>
                            {/* Show Finalize Only if Time Passed AND Not yet 'ended' (or if we use specific status for finalized) */}
                            {/* Ideally backend updates status to 'ended' ONLY after finalize. If time passed but status is active, it needs finalization. */}
                            {(new Date() > new Date(session.endTime) && session.status !== 'ended') && (
                                <button
                                    onClick={() => handleFinalize(session._id)}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded shadow font-bold transition flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Chốt kết quả
                                </button>
                            )}

                            {session.status === 'ended' && (
                                <span className="text-green-600 font-bold flex items-center gap-1">
                                    <CheckCircle className="w-5 h-5" /> Đã hoàn tất
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
