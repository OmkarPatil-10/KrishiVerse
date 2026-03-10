import { useState } from 'react';
import { Bell, User, Sprout, ArrowLeft, Globe, Shield, Info, Lock, Smartphone, FileText, CheckCircle2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfileSidebar } from '../context/ProfileSidebarContext';

const Settings = () => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const { openSidebar, isOpen: isSidebarOpen } = useProfileSidebar();
    const [notifications, setNotifications] = useState({
        push: true,
        priceAlerts: true,
        weatherAlerts: true,
        contractUpdates: true
    });

    const toggleNotification = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
            {/* Top Header Section */}
            <div className="bg-white shadow-sm sticky top-0 z-10 md:relative md:shadow-none">
                <div className="px-4 py-3 md:px-6 md:py-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <Sprout className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-800 md:hidden">KrishiVerse</span>
                        </div>
                        {!isSidebarOpen && (
                            <div className="flex items-center gap-3 md:hidden">
                                <Bell className="w-5 h-5 text-gray-600 cursor-pointer" />
                                <button onClick={openSidebar}>
                                    <User className="w-5 h-5 text-gray-600 cursor-pointer" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Page Header with Back Button */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 md:px-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                        <p className="text-sm text-gray-600">Manage your app preferences</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
                {/* Notifications Card */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                            <Bell className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                            <p className="text-sm text-gray-600">Manage your notification preferences</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {[
                            { key: 'push', label: 'Receive push notifications' },
                            { key: 'priceAlerts', label: 'Get notified about price changes' },
                            { key: 'weatherAlerts', label: 'Receive weather updates' },
                            { key: 'contractUpdates', label: 'Updates on your contracts' }
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                                <span className="text-gray-700">{item.label}</span>
                                <button
                                    onClick={() => toggleNotification(item.key)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${notifications[item.key] ? 'bg-primary' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications[item.key] ? 'translate-x-6' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Language & Region Card */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                            <Globe className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Language & Region</h3>
                            <p className="text-sm text-gray-600">Set your preferred language and currency</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                            <div className="relative">
                                <select
                                    value={i18n.language}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white"
                                >
                                    <option value="en">English</option>
                                    <option value="hi">हिंदी (Hindi)</option>
                                    <option value="mr">मराठी (Marathi)</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                            <div className="relative">
                                <select
                                    defaultValue="INR"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white"
                                >
                                    <option value="INR">₹ INR - Indian Rupee</option>
                                    <option value="USD">$ USD - US Dollar</option>
                                    <option value="EUR">€ EUR - Euro</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Card */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Security</h3>
                            <p className="text-sm text-gray-600">Manage your account security</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700">Change Password</span>
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-400 rotate-[-90deg]" />
                        </button>
                        <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700">Two-Factor Authentication</span>
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-400 rotate-[-90deg]" />
                        </button>
                    </div>
                </div>

                {/* About Card */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                            <Info className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">About</h3>
                            <p className="text-sm text-gray-600">App information and support</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Info className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700">Help & Support</span>
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-400 rotate-[-90deg]" />
                        </button>
                        <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700">Terms & Conditions</span>
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-400 rotate-[-90deg]" />
                        </button>
                        <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700">Privacy Policy</span>
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-400 rotate-[-90deg]" />
                        </button>
                        <div className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-3">
                                <Info className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700">App Version</span>
                            </div>
                            <span className="text-gray-600 font-medium">1.0.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;

