import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, Sprout, TrendingUp, TrendingDown, FileText, BarChart3, Sun, Cloud, CloudRain, CloudLightning, Wallet, RefreshCw, Loader2 } from 'lucide-react';
import { useProfileSidebar } from '../context/ProfileSidebarContext';
import { useAuth } from '../context/AuthContext';
import ContractorDashboard from './ContractorDashboard';
import api from '../services/api';
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

// Map weather condition to icon
const getWeatherIcon = (condition) => {
    if (!condition) return Sun;
    const c = condition.toLowerCase();
    if (c.includes('clear') || c.includes('sunny')) return Sun;
    if (c.includes('thunder') || c.includes('storm')) return CloudLightning;
    if (c.includes('rain') || c.includes('drizzle')) return CloudRain;
    if (c.includes('cloud') || c.includes('overcast') || c.includes('haze')) return Cloud;
    return Sun;
};

// Get farming advice based on weather
const getWeatherAdvice = (description) => {
    if (!description) return 'Check weather before planning outdoor activities';
    const d = description.toLowerCase();
    if (d.includes('rain') || d.includes('drizzle')) return 'Delay pesticide application';
    if (d.includes('clear') || d.includes('sunny')) return 'Perfect for harvest';
    if (d.includes('cloud') || d.includes('haze')) return 'Good for field work';
    return 'Check conditions before field work';
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { openSidebar, isOpen: isSidebarOpen } = useProfileSidebar();
    const { user } = useAuth();

    // Show contractor dashboard if user is contractor
    const userRole = user?.role || user?.userType;
    if (userRole === 'contractor' || userRole === 'buyer') {
        return <ContractorDashboard />;
    }

    // === State ===
    const [contracts, setContracts] = useState([]);
    const [contractsLoading, setContractsLoading] = useState(true);
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [predictions, setPredictions] = useState([]);

    // === Fetch contracts ===
    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const res = await api.get('/contracts');
                if (res.data.success) {
                    setContracts(res.data.contracts || []);
                }
            } catch (err) {
                console.error('Failed to load contracts:', err);
            } finally {
                setContractsLoading(false);
            }
        };
        fetchContracts();
    }, []);

    // === Fetch weather ===
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const city = user?.city || user?.location || user?.district || 'Pune';
                const res = await api.get(`/weather?city=${encodeURIComponent(city)}`);
                if (res.data.success) {
                    setWeather(res.data.weather);
                }
            } catch (err) {
                console.error('Failed to load weather:', err);
            } finally {
                setWeatherLoading(false);
            }
        };
        fetchWeather();
    }, [user]);

    // === Load predictions from localStorage ===
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('krishiverse_predictions') || '[]');
        setPredictions(stored);
    }, []);

    // === Computed values ===
    const userId = user?._id || user?.id;

    // Farmer's contracts (accepted by this farmer)
    const myContracts = contracts.filter(c =>
        c.acceptedBy?.farmerId === userId
    );

    // All open contracts available for farmer
    const openContracts = contracts.filter(c => c.status === 'open');

    const activeContracts = myContracts.filter(c =>
        c.status === 'accepted' || c.status === 'outForDelivery'
    );

    const completedContracts = myContracts.filter(c => c.status === 'completed');

    const totalEarnings = completedContracts.reduce((sum, c) => sum + (c.totalBudget || 0), 0);

    // Latest prediction
    const latestPrediction = predictions.length > 0 ? predictions[0] : null;

    // Weather data
    const currentTemp = weather ? Math.round(weather.temperature?.current || 0) : null;
    const weatherDesc = weather?.description || '';
    const WeatherIcon = getWeatherIcon(weatherDesc);
    const weatherAdvice = getWeatherAdvice(weatherDesc);

    // === Chart Data from predictions ===
    const chartPredictions = predictions.slice(0, 10).reverse(); // Oldest first for chart
    const hasChartData = chartPredictions.length > 0;

    const chartData = hasChartData ? {
        labels: chartPredictions.map((p) => {
            const d = new Date(p.timestamp);
            return `${d.getDate()}/${d.getMonth() + 1}`;
        }),
        datasets: [
            {
                label: 'Predicted Price (₹/quintal)',
                data: chartPredictions.map(p => p.predictedPrice),
                borderColor: '#2E7D32',
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#2E7D32',
            },
        ],
    } : {
        labels: ['No data yet'],
        datasets: [{
            label: 'Predicted Price (₹/quintal)',
            data: [0],
            borderColor: '#ccc',
            backgroundColor: 'rgba(200,200,200,0.1)',
            fill: true,
        }],
    };

    const priceValues = chartPredictions.map(p => p.predictedPrice).filter(Boolean);
    const minPrice = priceValues.length > 0 ? Math.min(...priceValues) - 200 : 0;
    const maxPrice = priceValues.length > 0 ? Math.max(...priceValues) + 200 : 5000;

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
                    font: { size: 12 },
                },
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    title: (items) => {
                        const idx = items[0]?.dataIndex;
                        if (idx !== undefined && chartPredictions[idx]) {
                            return `${chartPredictions[idx].commodity} - ${chartPredictions[idx].variety}`;
                        }
                        return '';
                    },
                    label: (item) => `₹${item.raw?.toLocaleString()} /quintal`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                min: minPrice,
                max: maxPrice,
                ticks: {
                    callback: (v) => `₹${v}`,
                },
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
            },
            x: {
                grid: { display: false },
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
                            <div className="flex items-center gap-3 md:hidden">
                                <button onClick={() => navigate('/notifications')}>
                                    <Bell className="w-5 h-5 text-gray-600 hover:text-green-600 transition-colors cursor-pointer" />
                                </button>
                                <button onClick={openSidebar}>
                                    <User className="w-5 h-5 text-gray-600 hover:text-green-600 transition-colors cursor-pointer" />
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
                            <h2 className="text-lg font-semibold text-gray-800 mb-1">
                                Welcome, {user?.name || 'Farmer'}
                            </h2>
                            <p className="text-xs text-gray-500 mb-4">Today's farming insights</p>
                            <div className="flex gap-6">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Total Earnings</p>
                                    {contractsLoading ? (
                                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                    ) : (
                                        <p className="text-2xl font-bold text-primary">
                                            ₹{totalEarnings.toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Completed Contracts</p>
                                    {contractsLoading ? (
                                        <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                                    ) : (
                                        <p className="text-2xl font-bold text-orange-500">
                                            {completedContracts.length}
                                        </p>
                                    )}
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
                    <div
                        className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate('/price-prediction')}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-medium">Price Forecast</h3>
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        {latestPrediction ? (
                            <>
                                <p className="text-xl font-bold mb-1">
                                    ₹{latestPrediction.predictedPrice?.toLocaleString()}
                                </p>
                                <p className="text-xs opacity-90 truncate">
                                    {latestPrediction.commodity}
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-xl font-bold mb-1">—</p>
                                <p className="text-xs opacity-90">No predictions yet</p>
                            </>
                        )}
                    </div>

                    {/* Smart Contracts Card */}
                    <div
                        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate('/contracts')}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-medium">Smart Contracts</h3>
                            <FileText className="w-4 h-4" />
                        </div>
                        {contractsLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin mt-1" />
                        ) : (
                            <>
                                <p className="text-xl font-bold mb-1">
                                    {completedContracts.length} Completed
                                </p>
                                <p className="text-xs opacity-90">
                                    {openContracts.length} Open
                                </p>
                            </>
                        )}
                    </div>

                    {/* Market Insights Card */}
                    <div
                        className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-4 text-gray-900 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate('/market-prices')}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-medium">Market Insights</h3>
                            <BarChart3 className="w-4 h-4" />
                        </div>
                        {predictions.length > 0 ? (
                            <>
                                <p className="text-xl font-bold mb-1">
                                    {predictions.length} Prediction{predictions.length !== 1 ? 's' : ''}
                                </p>
                                <p className="text-xs opacity-80 truncate">
                                    Latest: {latestPrediction?.commodity}
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-xl font-bold mb-1">Explore</p>
                                <p className="text-xs opacity-80">View market data</p>
                            </>
                        )}
                    </div>

                    {/* Weather Alert Card */}
                    <div
                        className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate('/market-prices')}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-medium">Weather</h3>
                            {weatherLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <WeatherIcon className="w-4 h-4" />
                            )}
                        </div>
                        {weatherLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin mt-1" />
                        ) : currentTemp !== null ? (
                            <>
                                <p className="text-xl font-bold mb-1">{currentTemp}°C</p>
                                <p className="text-xs opacity-90 capitalize truncate">{weatherAdvice}</p>
                            </>
                        ) : (
                            <>
                                <p className="text-xl font-bold mb-1">—</p>
                                <p className="text-xs opacity-90">Unavailable</p>
                            </>
                        )}
                    </div>
                </div>

                {/* AI Price Forecast Card */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">AI Price Forecast</h3>
                        <div className="flex items-center gap-2 text-sm text-primary">
                            <RefreshCw className="w-4 h-4" />
                            <span className="font-medium">
                                {predictions.length > 0
                                    ? `${predictions.length} prediction${predictions.length !== 1 ? 's' : ''}`
                                    : 'No data'}
                            </span>
                        </div>
                    </div>
                    {!hasChartData ? (
                        <div className="h-64 md:h-80 flex flex-col items-center justify-center text-gray-400">
                            <TrendingUp className="w-12 h-12 mb-3 opacity-30" />
                            <p className="text-sm mb-1">No prediction data yet</p>
                            <button
                                onClick={() => navigate('/price-prediction')}
                                className="text-sm text-primary font-medium hover:underline mt-2"
                            >
                                Make your first prediction →
                            </button>
                        </div>
                    ) : (
                        <div className="h-64 md:h-80">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
