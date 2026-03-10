import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import GoogleTranslate from '../GoogleTranslate';
import { MessageCircle, Bell } from 'lucide-react';
import api from '../services/api';

const Navbar = () => {
    const { i18n, t } = useTranslation();
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            if (user) {
                const res = await api.get('/notifications');
                if (res.data.success) {
                    setUnreadCount(res.data.unreadCount);
                }
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        
        // Polling for updates every minute (optional)
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, [user]);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <span className="text-2xl font-bold text-primary">KrishiVerse</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* <select
                            onChange={(e) => changeLanguage(e.target.value)}
                            defaultValue={i18n.language}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
                        >
                            <option value="en">English</option>
                            <option value="hi">हिंदी</option>
                            <option value="mr">मराठी</option>
                        </select> */}
                        <GoogleTranslate />

                        <button 
                            onClick={() => navigate('/notifications')}
                            className="relative p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-full transition-colors"
                            title="Notifications"
                        >
                            <Bell className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        <button 
                            onClick={() => navigate('/contracts')}
                            className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
                            title="Chats & Contracts"
                        >
                            <MessageCircle className="w-6 h-6" />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        {user && (
                            <button onClick={handleLogout} className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">
                                Logout
                            </button>
                        )}

                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
