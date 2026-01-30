import { useState } from 'react';
import { Bell, User, Sprout, Star, TrendingUp, Mountain, MapPin, Calendar } from 'lucide-react';
import { useProfileSidebar } from '../context/ProfileSidebarContext';

const PricePrediction = () => {
    const { openSidebar, isOpen: isSidebarOpen } = useProfileSidebar();
    const [activeTab, setActiveTab] = useState('priceForecast');
    const [location, setLocation] = useState({
        state: 'Maharashtra',
        district: 'Raigad',
        pincode: '402107'
    });
    const [showResults, setShowResults] = useState(false);

    // Mock crop prediction data
    const cropPredictions = [
        {
            name: 'Wheat',
            demand: 'High',
            demandColor: 'text-black',
            priceChange: '+13.7%',
            priceChangeColor: 'bg-green-100 text-green-700',
            currentPrice: 2150,
            predictedPrice: 2380,
            bestSellDate: '15 Mar 2025',
            confidence: 89,
            recommendation: 'Hold for 2 weeks'
        },
        {
            name: 'Rice',
            demand: 'Very High',
            demandColor: 'text-black',
            priceChange: '+7.8%',
            priceChangeColor: 'bg-green-100 text-green-700',
            currentPrice: 3200,
            predictedPrice: 3450,
            bestSellDate: '9 Mar 2025',
            confidence: 89,
            recommendation: 'Sell in 1 week'
        },
        {
            name: 'Corn',
            demand: 'Medium',
            demandColor: 'text-orange-600',
            priceChange: '+3.0%',
            priceChangeColor: 'bg-orange-100 text-orange-700',
            currentPrice: 1850,
            predictedPrice: 1920,
            bestSellDate: '01 Mar 2025',
            confidence: 82,
            recommendation: 'Sell now'
        },
        {
            name: 'Soybean',
            demand: 'Low',
            demandColor: 'text-red-600',
            priceChange: '-3.4%',
            priceChangeColor: 'bg-red-100 text-red-700',
            currentPrice: 4200,
            predictedPrice: 4050,
            bestSellDate: 'Today',
            confidence: 70,
            recommendation: 'Sell immediately'
        },
        {
            name: 'Cotton',
            demand: 'High',
            demandColor: 'text-black',
            priceChange: '+5.2%',
            priceChangeColor: 'bg-green-100 text-green-700',
            currentPrice: 5800,
            predictedPrice: 6100,
            bestSellDate: '20 Mar 2025',
            confidence: 91,
            recommendation: 'Hold for 3 weeks'
        }
    ];

    const handleGetForecast = (e) => {
        e.preventDefault();
        setShowResults(true);
    };

    const handleChangeLocation = () => {
        setShowResults(false);
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
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">AI Crop Predictions</h1>
                        <p className="text-sm text-gray-600">Smart insights for better farming decisions</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
                {/* AI Powered Predictions Card */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 md:p-6 mb-4 text-white">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="w-5 h-5" />
                                <h3 className="text-lg font-semibold">AI Powered Predictions</h3>
                            </div>
                            <p className="text-sm opacity-90">Based on 10+ years of agricultural data</p>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-bold">89%</p>
                            <p className="text-sm opacity-90">Accuracy Rate</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4 bg-white rounded-xl p-1 shadow-sm">
                    <button
                        onClick={() => setActiveTab('priceForecast')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                            activeTab === 'priceForecast'
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-medium">Price Forecast</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('landAnalysis')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                            activeTab === 'landAnalysis'
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Mountain className="w-5 h-5" />
                        <span className="font-medium">Land Analysis</span>
                    </button>
                </div>

                {!showResults ? (
                    /* Initial Form Screen */
                    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                                <MapPin className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Enter Your Location</h2>
                            <p className="text-sm text-gray-600 text-center">
                                Get crop prices and forecasts specific to your region
                            </p>
                        </div>

                        <form onSubmit={handleGetForecast} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    State *
                                </label>
                                <select
                                    value={location.state}
                                    onChange={(e) => setLocation({ ...location, state: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                >
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Punjab">Punjab</option>
                                    <option value="Haryana">Haryana</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    District *
                                </label>
                                <input
                                    type="text"
                                    value={location.district}
                                    onChange={(e) => setLocation({ ...location, district: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Enter district"
                            required
                        />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pincode *
                                </label>
                                <input
                                    type="text"
                                    value={location.pincode}
                                    onChange={(e) => setLocation({ ...location, pincode: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Enter pincode"
                            required
                        />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors mt-6"
                            >
                                Get Price Forecast
                            </button>
                    </form>
                    </div>
                ) : (
                    /* Results Screen */
                    <div className="space-y-4">
                        {/* Location Card */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-6 h-6 text-primary" />
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {location.district}, {location.state}
                                        </p>
                                        <p className="text-sm text-gray-600">Market prices updated today</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleChangeLocation}
                                    className="bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors"
                                >
                                    Change
                                </button>
                            </div>
                        </div>

                        {/* Crop Prediction Cards */}
                        <div className="space-y-4">
                            {cropPredictions.map((crop, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                                    {/* Crop Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Sprout className="w-5 h-5 text-primary" />
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{crop.name}</h3>
                                                <p className="text-sm">
                                                    Demand:{' '}
                                                    <span className={`font-semibold ${crop.demandColor}`}>
                                                        {crop.demand}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${crop.priceChangeColor}`}>
                                            {crop.priceChange}
                                        </span>
                                    </div>

                                    {/* Price Information */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Current Price</p>
                                            <p className="text-2xl font-bold text-gray-900">₹{crop.currentPrice}</p>
                                            <p className="text-xs text-gray-500">per quintal</p>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-3">
                                            <p className="text-xs text-primary font-medium mb-1">Predicted Price</p>
                                            <p className="text-2xl font-bold text-primary">₹{crop.predictedPrice}</p>
                                            <p className="text-xs text-gray-600">per quintal</p>
                                        </div>
                                    </div>

                                    {/* Best Sell Date & Confidence */}
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-700">
                                                Best Sell Date: <span className="font-semibold">{crop.bestSellDate}</span>
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700">
                                            {crop.confidence}% confidence
                                        </span>
                                    </div>

                                    {/* AI Recommendation */}
                                    <div className="bg-blue-50 rounded-lg p-3">
                                        <p className="text-xs text-blue-700 font-medium mb-1">AI Recommendation</p>
                                        <p className="text-sm font-bold text-blue-900">{crop.recommendation}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PricePrediction;
