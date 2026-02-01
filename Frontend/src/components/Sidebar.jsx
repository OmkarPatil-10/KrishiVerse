import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Handshake, Bell, User, Shield, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { t } = useTranslation();

    const links = [
        { name: 'Dashboard', path: '/dashboard', icon: Home, roles: ['farmer', 'contractor', 'admin'] },
        { name: 'Price Prediction', path: '/prediction', icon: TrendingUp, roles: ['farmer'] },
        { name: 'Market Prices', path: '/market', icon: TrendingUp, roles: ['farmer'] },
        { name: 'Contracts', path: '/contracts', icon: Handshake, roles: ['farmer', 'contractor'] },
        { name: 'Notifications', path: '/notifications', icon: Bell, roles: ['farmer', 'contractor'] },
        { name: 'Profile', path: '/profile', icon: User, roles: ['farmer', 'contractor', 'admin'] },
        { name: 'Settings', path: '/settings', icon: Settings, roles: ['farmer', 'contractor', 'admin'] },
        { name: 'Admin Panel', path: '/admin', icon: Shield, roles: ['admin'] },
    ];

    // Buyer and contractor are the same - normalize to contractor
    const userRole = user?.role || user?.userType;
    const normalizedRole = userRole === 'buyer' ? 'contractor' : userRole;
    const allowedLinks = links.filter(link => !link.roles || (normalizedRole && link.roles.includes(normalizedRole)));

    return (
        <aside className="bg-white w-64 min-h-screen border-r border-gray-200 hidden md:block">
            <div className="p-6">
                <nav className="space-y-2">
                    {allowedLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname.startsWith(link.path);
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={clsx(
                                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                                    isActive ? "bg-green-50 text-primary font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
