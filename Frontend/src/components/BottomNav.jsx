import { Link, useLocation } from 'react-router-dom';
import { Home, Star, BarChart3, FileText, Wallet, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
    const location = useLocation();
    const { user } = useAuth();
    // Buyer and contractor are the same entity
    const userRole = user?.role || user?.userType;
    const isContractor = userRole === 'contractor' || userRole === 'buyer';

    const farmerNavItems = [
        { name: 'Dashboard', path: '/dashboard', icon: Home },
        { name: 'Prediction', path: '/prediction', icon: Star },
        { name: 'Insights', path: '/market', icon: BarChart3 },
        { name: 'Contracts', path: '/contracts', icon: FileText },
        { name: 'Wallet', path: '/wallet', icon: Wallet },
    ];

    const contractorNavItems = [
        { name: 'Dashboard', path: '/dashboard', icon: Home },
        { name: 'Farmer', path: '/farmers', icon: Users },
        { name: 'Contracts', path: '/contracts', icon: FileText },
        { name: 'Wallet', path: '/wallet', icon: Wallet },
    ];

    const navItems = isContractor ? contractorNavItems : farmerNavItems;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || 
                        (item.path === '/dashboard' && location.pathname === '/');
                    
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                                isActive ? "text-primary" : "text-gray-500"
                            )}
                        >
                            <Icon className={clsx("w-5 h-5 mb-1", isActive && "text-primary")} />
                            <span className={clsx(
                                "text-xs",
                                isActive ? "text-primary font-medium" : "text-gray-500"
                            )}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;

