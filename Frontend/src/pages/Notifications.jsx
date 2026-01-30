import { useState, useEffect } from 'react';
import { Card, Loader } from '../components/ui';
import { Bell } from 'lucide-react';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data
        setTimeout(() => {
            setNotifications([
                { id: 1, message: 'Contract #102 accepted by Foods Ltd', date: '2024-01-30 10:30 AM', type: 'success' },
                { id: 2, message: 'Market price for Onion decreased by 5%', date: '2024-01-29 02:15 PM', type: 'warning' },
                { id: 3, message: 'Welcome to KrishiVerse!', date: '2024-01-28 09:00 AM', type: 'info' },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>

            {loading ? <Loader /> : (
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <Card key={notif.id} className="flex items-start gap-4 p-4">
                            <div className="bg-green-100 p-2 rounded-full">
                                <Bell className="h-5 w-5 text-green-700" />
                            </div>
                            <div>
                                <p className="text-gray-800 font-medium">{notif.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notif.date}</p>
                            </div>
                        </Card>
                    ))}
                    {notifications.length === 0 && <p className="text-center text-gray-500">No new notifications</p>}
                </div>
            )}
        </div>
    );
};

export default Notifications;
