import { useState, useEffect } from 'react';
import { Card, Loader } from '../components/ui';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications');
            if (res.data.success) {
                setNotifications(res.data.notifications);
                setUnreadCount(res.data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            const res = await api.patch(`/notifications/${id}/read`);
            if (res.data.success) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const res = await api.patch('/notifications/read-all');
            if (res.data.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
                toast.success('All notifications marked as read');
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
            case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
            default: return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    const getBgForType = (type) => {
        switch (type) {
            case 'success': return 'bg-green-100';
            case 'warning': return 'bg-yellow-100';
            case 'error': return 'bg-red-100';
            default: return 'bg-blue-100';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', { 
            day: '2-digit', month: 'short', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button 
                        onClick={handleMarkAllAsRead}
                        className="text-sm font-semibold text-primary hover:text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Mark all as read
                    </button>
                )}
            </div>

            {loading ? <Loader /> : (
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <Card 
                            key={notif._id} 
                            className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 transition-colors ${notif.isRead ? 'bg-white opacity-70' : 'bg-green-50/30 border-l-4 border-l-primary'}`}
                        >
                            <div className="flex items-start gap-4 flex-1 w-full">
                                <div className={`${getBgForType(notif.type)} p-2 rounded-full shrink-0 mt-1`}>
                                    {getIconForType(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-gray-800 ${notif.isRead ? '' : 'font-semibold'}`}>
                                        {notif.message}
                                    </p>
                                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                                        <p className="text-xs text-gray-500">{formatDate(notif.createdAt)}</p>
                                        
                                        {notif.metadata?.link && (
                                            <>
                                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                              <Link to={notif.metadata.link} className="text-xs text-primary font-medium hover:underline">
                                                  View Details
                                              </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {!notif.isRead && (
                                <button 
                                    onClick={() => handleMarkAsRead(notif._id)}
                                    className="text-xs font-medium text-gray-500 hover:text-gray-800 p-2 shrink-0 self-end sm:self-auto bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Mark as read"
                                >
                                    Mark Read
                                </button>
                            )}
                        </Card>
                    ))}
                    {notifications.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bell className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-medium">No notifications yet</p>
                            <p className="text-sm text-gray-400 mt-1">We'll let you know when something important happens</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Notifications;
