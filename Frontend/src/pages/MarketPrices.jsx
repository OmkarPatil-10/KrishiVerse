import { Bell, User, Sprout, TrendingUp, TrendingDown, Sun, Cloud, CloudRain } from 'lucide-react';
import { useProfileSidebar } from '../context/ProfileSidebarContext';

const MarketPrices = () => {
    const { openSidebar, isOpen: isSidebarOpen } = useProfileSidebar();
    // Mock market data
    const marketData = [
        {
            name: 'Wheat',
            demand: 'High Demand',
            price: 2650,
            change: '+8%',
            isPositive: true
        },
        {
            name: 'Rice',
            demand: 'Medium Demand',
            price: 2400,
            change: '+5%',
            isPositive: true
        },
        {
            name: 'Corn',
            demand: 'High Demand',
            price: 1850,
            change: '-2%',
            isPositive: false
        },
        {
            name: 'Soybean',
            demand: 'Low Demand',
            price: 4200,
            change: '+12%',
            isPositive: true
        }
    ];

    // Mock weather data
    const weatherData = [
        { day: 'Today', icon: Sun, temp: '28°C', condition: 'Sunny' },
        { day: 'Tomorrow', icon: Cloud, temp: '26°C', condition: 'Cloudy' },
        { day: 'Wed', icon: CloudRain, temp: '24°C', condition: 'Rain' },
        { day: 'Thu', icon: Sun, temp: '27°C', condition: 'Sunny' }
    ];

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
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Market Insights</h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
                {/* Title - Mobile */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:hidden">Market Insights</h1>

                {/* Today's Market Card */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Today's Market</h2>
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                            Live Data
                        </span>
                    </div>

                    <div className="space-y-3">
                        {marketData.map((crop, index) => {
                            const ChangeIcon = crop.isPositive ? TrendingUp : TrendingDown;
                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <Sprout className="w-5 h-5 text-primary flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900">{crop.name}</h3>
                                            <p className="text-sm text-gray-600">{crop.demand}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">₹{crop.price.toLocaleString()}</p>
                                        </div>
                                        <div
                                            className={`flex items-center gap-1 px-2 py-1 rounded ${
                                                crop.isPositive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            <ChangeIcon className="w-4 h-4" />
                                            <span className="text-sm font-semibold">{crop.change}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Weather Forecast Card */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Weather Forecast</h2>

                    <div className="grid grid-cols-4 gap-2 md:gap-4">
                        {weatherData.map((weather, index) => {
                            const WeatherIcon = weather.icon;
                            return (
                                <div
                                    key={index}
                                    className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <p className="text-xs text-gray-600 mb-2">{weather.day}</p>
                                    <WeatherIcon className="w-8 h-8 text-gray-700 mb-2" />
                                    <p className="text-sm font-bold text-gray-900 mb-1">{weather.temp}</p>
                                    <p className="text-xs text-gray-600">{weather.condition}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketPrices;
