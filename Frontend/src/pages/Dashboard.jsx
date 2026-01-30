import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bell, User, Sprout, TrendingUp, FileText, BarChart3, Sun, Plus, Search, Wallet, RefreshCw } from 'lucide-react';
import { useProfileSidebar } from '../context/ProfileSidebarContext';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { openSidebar, isOpen: isSidebarOpen } = useProfileSidebar();

    // Chart data for AI Price Forecast
    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Wheat (₹/quintal)',
                data: [2380, 2420, 2480, 2520, 2580, 2620, 2650],
                borderColor: '#2E7D32',
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#2E7D32',
            },
            {
                label: 'Rice (₹/quintal)',
                data: [2150, 2180, 2220, 2280, 2320, 2350, 2380],
                borderColor: '#EAB308',
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#EAB308',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12,
                    },
                },
            },
            tooltip: {
                enabled: true,
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                min: 2130,
                max: 2700,
                ticks: {
                    stepSize: 150,
                    callback: function(value) {
                        return value;
                    },
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
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
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-gray-600 cursor-pointer" />
                                <button onClick={openSidebar}>
                                    <User className="w-5 h-5 text-gray-600 cursor-pointer" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-3xl font-bold text-primary mb-1">KrishiVerse</h1>
                        <p className="text-sm text-gray-600">AI-Powered Smart Farming Platform</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
                {/* Logo and Tagline - Mobile */}
                <div className="mb-4 md:hidden">
                    <h1 className="text-2xl font-bold text-primary mb-1">KrishiVerse</h1>
                    <p className="text-xs text-gray-600">AI-Powered Smart Farming Platform</p>
                </div>

                {/* Welcome Card */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-4 md:p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-800 mb-1">Welcome, Farmer</h2>
                            <p className="text-xs text-gray-500 mb-4">Today's farming insights</p>
                            <div className="flex gap-6">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Today's Earnings</p>
                                    <p className="text-2xl font-bold text-primary">₹2,450</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Active Contracts</p>
                                    <p className="text-2xl font-bold text-orange-500">3</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center">
                            <Sprout className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4 md:gap-4 md:grid-cols-4">
                    {/* Price Forecast Card */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-medium">Price Forecast</h3>
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                            <TrendingUp className="w-5 h-5" />
                            <span className="text-xl font-bold">+12%</span>
                        </div>
                        <p className="text-xs opacity-90">Next 7 days</p>
                    </div>

                    {/* Smart Contracts Card */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-medium">Smart Contracts</h3>
                            <FileText className="w-4 h-4" />
                        </div>
                        <p className="text-xl font-bold mb-1">3 Active</p>
                        <p className="text-xs opacity-90">2 Pending</p>
                    </div>

                    {/* Market Insights Card */}
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-4 text-gray-900 shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-medium">Market Insights</h3>
                            <BarChart3 className="w-4 h-4" />
                        </div>
                        <p className="text-xl font-bold mb-1">High Demand</p>
                        <p className="text-xs opacity-80">Wheat & Rice</p>
                    </div>

                    {/* Weather Alert Card */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-medium">Weather Alert</h3>
                            <Sun className="w-4 h-4" />
                        </div>
                        <p className="text-xl font-bold mb-1">Sunny</p>
                        <p className="text-xs opacity-90">Perfect for harvest</p>
                    </div>
                </div>

                {/* AI Price Forecast Card */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">AI Price Forecast</h3>
                        <div className="flex items-center gap-2 text-sm text-primary">
                            <RefreshCw className="w-4 h-4" />
                            <span className="font-medium">85% Accuracy</span>
                        </div>
                    </div>
                    <div className="h-64 md:h-80">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                                <Plus className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">New Contract</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <Search className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Find Buyers</span>
                        </button>
                        <button 
                            onClick={() => navigate('/wallet')}
                            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors"
                        >
                            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">View Wallet</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
