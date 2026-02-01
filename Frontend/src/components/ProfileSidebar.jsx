import { useNavigate } from 'react-router-dom';
import { X, Sprout, User, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfileSidebar } from '../context/ProfileSidebarContext';
import { clsx } from 'clsx';

const ProfileSidebar = () => {
    const { isOpen, closeSidebar } = useProfileSidebar();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const handleSignOut = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        {
            icon: User,
            title: 'Profile',
            subtitle: 'View and edit your Profile',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            onClick: () => {
                navigate('/profile');
                closeSidebar();
            }
        },
        {
            icon: Settings,
            title: 'Setting',
            subtitle: 'App preference and options',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            onClick: () => {
                navigate('/settings');
                closeSidebar();
            }
        },
        {
            icon: LogOut,
            title: 'Sign Out',
            subtitle: 'Logout from our account',
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            onClick: handleSignOut
        }
    ];

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-[100]"
                onClick={closeSidebar}
            />

            {/* Sidebar */}
            <div className="fixed right-0 top-0 bottom-0 w-2/3 max-w-sm bg-white z-[100] shadow-xl">
                {/* Header */}
                <div className="bg-gradient-to-br from-primary to-green-700 p-6 text-white">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Sprout className="w-5 h-5" />
                            <span className="font-bold">KrishiVerse</span>
                        </div>
                        <button
                            onClick={closeSidebar}
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-3">
                            <User className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-1">{user?.name || 'User'}</h3>
                        <p className="text-sm opacity-90">{user?.email || 'user@example.com'}</p>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="divide-y divide-gray-200">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={index}
                                onClick={item.onClick}
                                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center', item.bgColor)}>
                                    <Icon className={clsx('w-5 h-5', item.color)} />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className={clsx('font-semibold', item.color === 'text-red-600' ? 'text-red-600' : 'text-gray-900')}>
                                        {item.title}
                                    </p>
                                    <p className="text-sm text-gray-500">{item.subtitle}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default ProfileSidebar;

