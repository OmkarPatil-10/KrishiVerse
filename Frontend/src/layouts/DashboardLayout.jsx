import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import ProfileSidebar from '../components/ProfileSidebar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
    return (
        <div className="flex bg-gray-50 min-h-screen">
            {/* Sidebar - Hidden on mobile, visible on desktop */}
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Navbar - Hidden on mobile, visible on desktop */}
                <div className="hidden md:block">
                    <Navbar />
                </div>
                <main className="flex-1 overflow-y-auto md:p-4 md:sm:p-6 md:lg:p-8">
                    <Outlet />
                </main>
            </div>
            {/* Bottom Navigation - Visible on mobile only */}
            <BottomNav />
            {/* Profile Sidebar - Available on all pages */}
            <ProfileSidebar />
        </div>
    );
};

export default DashboardLayout;
