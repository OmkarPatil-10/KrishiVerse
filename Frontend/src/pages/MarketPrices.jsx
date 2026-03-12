import { useState, useEffect } from 'react';
import { Bell, User, Sprout, TrendingUp, TrendingDown, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Loader2, Trash2, MapPin, Calendar } from 'lucide-react';
import { useProfileSidebar } from '../context/ProfileSidebarContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Map weather condition strings to icons
const getWeatherIcon = (condition) => {
    if (!condition) return Cloud;
    const c = condition.toLowerCase();
    if (c.includes('clear') || c.includes('sunny')) return Sun;
    if (c.includes('thunder') || c.includes('storm')) return CloudLightning;
    if (c.includes('snow')) return CloudSnow;
    if (c.includes('rain') || c.includes('drizzle')) return CloudRain;
    if (c.includes('cloud') || c.includes('overcast')) return Cloud;
    if (c.includes('wind')) return Wind;
    return Cloud;
};

// Get time label from date (e.g., "3 PM", "6 PM")
const getTimeLabel = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
};

const MarketPrices = () => {
    const { openSidebar, isOpen: isSidebarOpen } = useProfileSidebar();
    const { user } = useAuth();

    // Price predictions from localStorage
    const [predictions, setPredictions] = useState([]);

    // Weather state
    const [weatherData, setWeatherData] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [weatherError, setWeatherError] = useState('');
    const [weatherCity, setWeatherCity] = useState('');

    // Load predictions from localStorage
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('krishiverse_predictions') || '[]');
        setPredictions(stored);
    }, []);

    // Fetch weather from backend using user's location
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                setWeatherLoading(true);
                setWeatherError('');

                // Get city from user profile
                const city = user?.city || user?.location || user?.district || 'Pune';
                setWeatherCity(city);

                const response = await api.get(`/weather?city=${encodeURIComponent(city)}`);
                if (response.data.success) {
                    setWeatherData(response.data.weather);
                }
            } catch (err) {
                console.error('Error fetching weather:', err);
                setWeatherError('Failed to load weather data');
            } finally {
                setWeatherLoading(false);
            }
        };

        fetchWeather();
    }, [user]);

    // Clear all predictions
    const clearPredictions = () => {
        localStorage.removeItem('krishiverse_predictions');
        setPredictions([]);
    };

    // Remove single prediction
    const removePrediction = (id) => {
        const updated = predictions.filter(p => p.id !== id);
        localStorage.setItem('krishiverse_predictions', JSON.stringify(updated));
        setPredictions(updated);
    };

    // Format timestamp
    const formatDate = (timestamp) => {
        const d = new Date(timestamp);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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
                    <div className="hidden md:block">
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Market Insights</h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
                {/* Title - Mobile */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:hidden">Market Insights</h1>

                {/* Your Price Predictions Card */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold text-gray-900">Your Price Predictions</h2>
                        </div>
                        {predictions.length > 0 && (
                            <button
                                onClick={clearPredictions}
                                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear All
                            </button>
                        )}
                    </div>

                    {predictions.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <TrendingUp className="w-8 h-8 text-primary/40" />
                            </div>
                            <p className="text-gray-500 mb-1">No predictions yet</p>
                            <p className="text-sm text-gray-400">
                                Go to <span className="font-semibold text-primary">Price Prediction</span> page to get AI-powered price forecasts
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {predictions.map((pred) => {
                                const isHighConfidence = pred.confidence === 'Very High' || pred.confidence === 'High';
                                return (
                                    <div
                                        key={pred.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Sprout className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-gray-900">{pred.commodity}</h3>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isHighConfidence
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {pred.confidence}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {pred.variety} • {pred.market}, {pred.district}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{pred.month} • {formatDate(pred.timestamp)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 ml-3">
                                            <div className="text-right">
                                                <p className="font-bold text-primary text-lg">₹{pred.predictedPrice?.toLocaleString()}</p>
                                                <p className="text-xs text-gray-500">
                                                    ₹{pred.minPrice?.toLocaleString()} - ₹{pred.maxPrice?.toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removePrediction(pred.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                                                title="Remove prediction"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Weather Forecast Card */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Weather Forecast</h2>
                        {weatherCity && (
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                                <MapPin className="w-4 h-4" />
                                {weatherCity}
                            </span>
                        )}
                    </div>

                    {weatherLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="w-7 h-7 text-primary animate-spin" />
                        </div>
                    ) : weatherError ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-1">{weatherError}</p>
                            <p className="text-sm text-gray-400">Weather data could not be loaded</p>
                        </div>
                    ) : weatherData ? (
                        <>
                            {/* Current Weather */}
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 md:p-6 mb-4 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm opacity-90 mb-1">Current Weather</p>
                                        <p className="text-4xl font-bold mb-1">
                                            {Math.round(weatherData.temperature?.current || 0)}°C
                                        </p>
                                        <p className="text-sm opacity-90 capitalize">
                                            {weatherData.description || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Droplets className="w-4 h-4 opacity-80" />
                                            <span className="text-sm">{Math.round(weatherData.humidity || 0)}% Humidity</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Wind className="w-4 h-4 opacity-80" />
                                            <span className="text-sm">{Math.round(weatherData.windSpeed || 0)} km/h</span>
                                        </div>
                                        <p className="text-xs opacity-80">
                                            {Math.round(weatherData.temperature?.min || 0)}° / {Math.round(weatherData.temperature?.max || 0)}°
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Hourly Forecast */}
                            {weatherData.forecast && weatherData.forecast.length > 0 && (
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-3">Next 24 Hours</p>
                                    <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {weatherData.forecast.map((item, index) => {
                                            const WeatherIcon = getWeatherIcon(item.condition);
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors min-w-[80px]"
                                                >
                                                    <p className="text-xs font-medium text-gray-600 mb-2">
                                                        {getTimeLabel(item.date)}
                                                    </p>
                                                    <WeatherIcon className="w-7 h-7 text-gray-700 mb-2" />
                                                    <p className="text-sm font-bold text-gray-900 mb-1">
                                                        {Math.round(item.temp)}°C
                                                    </p>
                                                    <p className="text-[10px] text-gray-500">{item.condition}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Agriculture Advice */}
                            {weatherData.agricultureAdvice && (
                                <div className="bg-green-50 rounded-lg p-3 mt-2">
                                    <p className="text-xs text-green-700 font-medium mb-1">🌾 Farming Advice</p>
                                    <p className="text-sm text-green-800">{weatherData.agricultureAdvice}</p>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default MarketPrices;
