import { useNavigate } from 'react-router-dom';
import { Bell, User, Sprout, FileText, CheckCircle2, Clock, Calendar, ChevronRight } from 'lucide-react';
import { useProfileSidebar } from '../context/ProfileSidebarContext';
import { useAuth } from '../context/AuthContext';

const ContractorDashboard = () => {
    const navigate = useNavigate();
    const { openSidebar, isOpen: isSidebarOpen } = useProfileSidebar();
    const { user } = useAuth();

    // Mock contract data
    const contracts = [
        {
            id: 'CT001',
            farmerName: 'Ayush Rokade',
            status: 'Active',
            statusColor: 'bg-green-100 text-green-700',
            crop: 'Wheat',
            quantity: '50 Tons',
            price: 1250000,
            deliveryDate: '20 Mar 2026'
        },
        {
            id: 'CT002',
            farmerName: 'Sahil Shete',
            status: 'Pending',
            statusColor: 'bg-orange-100 text-orange-700',
            crop: 'Rice',
            quantity: '30 Tons',
            price: 840000,
            deliveryDate: '20 Mar 2026'
        },
        {
            id: 'CT003',
            farmerName: 'Vaibhav Shedge',
            status: 'Completed',
            statusColor: 'bg-purple-100 text-purple-700',
            crop: 'Sugarcane',
            quantity: '100 Tons',
            price: 2800000,
            deliveryDate: '20 Mar 2026'
        }
    ];

    const stats = {
        total: 45,
        active: 12,
        completed: 28,
        pending: 5
    };

    return (
        <div className="min-h-screen bg-blue-50 pb-20 md:pb-6">
            {/* Top Header Section */}
            <div className="bg-white shadow-sm sticky top-0 z-10 md:relative md:shadow-none">
                <div className="px-4 py-3 md:px-6 md:py-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <Sprout className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-blue-600 md:hidden">KrishiVerse</span>
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                    Contractor
                                </span>
                            </div>
                        </div>
                        {!isSidebarOpen && (
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-gray-600 cursor-pointer" />
                                <button onClick={openSidebar}>
                                    <User className="w-5 h-5 text-gray-600 cursor-pointer" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">KrishiVerse Contractor Dashboard</h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
                {/* Title - Mobile */}
                <div className="mb-4 md:hidden">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
                    <p className="text-sm text-gray-600">Welcome back! Here's your contract overview.</p>
                </div>

                {/* Welcome Message - Desktop */}
                <div className="hidden md:block mb-6">
                    <p className="text-lg text-gray-700">Welcome back! Here's your contract overview.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</p>
                        <p className="text-sm text-gray-600">Total Contract</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{stats.active}</p>
                        <p className="text-sm text-gray-600">Active Contract</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{stats.completed}</p>
                        <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{stats.pending}</p>
                        <p className="text-sm text-gray-600">Pending</p>
                    </div>
                </div>

                {/* Recent Contracts */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">Recent Contract</h2>
                        <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors text-sm">
                            View All
                        </button>
                    </div>

                    <div className="space-y-3">
                        {contracts.map((contract) => (
                            <div
                                key={contract.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900">{contract.farmerName}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${contract.statusColor}`}>
                                                {contract.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">Contract ID: {contract.id}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Crop</p>
                                        <p className="font-semibold text-gray-900">{contract.crop}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Quantity</p>
                                        <p className="font-semibold text-gray-900">{contract.quantity}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Price</p>
                                        <p className="font-semibold text-blue-600">₹{contract.price.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Delivery</p>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <p className="font-semibold text-gray-900">{contract.deliveryDate}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => navigate(`/contracts/${contract.id}`)}
                                        className="text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center gap-1"
                                    >
                                        View Details
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractorDashboard;

