import { useState, useEffect } from 'react';
import { Bell, User, Sprout, Star, TrendingUp, Mountain, MapPin, Calendar, Loader2, AlertCircle, Thermometer, Droplets, Layers } from 'lucide-react';
import { useProfileSidebar } from '../context/ProfileSidebarContext';
import { getReferenceData, getModelStats, getMarkets, getVarieties, predictPrice, predictCrop } from '../services/mlApi';

const PricePrediction = () => {
    const { openSidebar, isOpen: isSidebarOpen } = useProfileSidebar();
    const [activeTab, setActiveTab] = useState('priceForecast');

    // ==================== PRICE FORECAST STATE ====================
    const [priceForm, setPriceForm] = useState({
        district: '',
        market: '',
        commodity: '',
        variety: '',
        grade: '',
        month: new Date().getMonth() + 1,
    });
    const [refData, setRefData] = useState({
        districts: [],
        commodities: [],
        markets: [],
        varieties: [],
        grades: [],
    });
    const [filteredMarkets, setFilteredMarkets] = useState([]);
    const [filteredVarieties, setFilteredVarieties] = useState([]);
    const [modelStats, setModelStats] = useState(null);
    const [priceResult, setPriceResult] = useState(null);
    const [priceLoading, setPriceLoading] = useState(false);
    const [priceError, setPriceError] = useState('');
    const [showPriceResults, setShowPriceResults] = useState(false);

    // ==================== LAND ANALYSIS (CROP PREDICTION) STATE ====================
    const [cropForm, setCropForm] = useState({
        temperature: '',
        soil_type: 'Medium Fertility',
        rainfall_category: 'Medium',
    });
    const [cropResult, setCropResult] = useState(null);
    const [cropLoading, setCropLoading] = useState(false);
    const [cropError, setCropError] = useState('');
    const [showCropResults, setShowCropResults] = useState(false);

    // ==================== LOAD REFERENCE DATA ON MOUNT ====================
    useEffect(() => {
        const fetchRefData = async () => {
            try {
                const res = await getReferenceData();
                if (res.success) {
                    setRefData(res.data);
                }
            } catch (err) {
                console.error('Failed to load reference data:', err);
            }
        };
        const fetchModelStats = async () => {
            try {
                const stats = await getModelStats();
                setModelStats(stats);
            } catch (err) {
                console.error('Failed to load model stats:', err);
            }
        };
        fetchRefData();
        fetchModelStats();
    }, []);

    // ==================== AUTO-FETCH MARKETS WHEN DISTRICT CHANGES ====================
    useEffect(() => {
        if (!priceForm.district) {
            setFilteredMarkets([]);
            return;
        }
        const fetchMarkets = async () => {
            try {
                const res = await getMarkets(priceForm.district);
                setFilteredMarkets(res.markets || []);
                // Reset market selection when district changes
                setPriceForm((prev) => ({ ...prev, market: '' }));
            } catch (err) {
                console.error('Failed to load markets:', err);
                setFilteredMarkets([]);
            }
        };
        fetchMarkets();
    }, [priceForm.district]);

    // ==================== AUTO-FETCH VARIETIES WHEN COMMODITY CHANGES ====================
    useEffect(() => {
        if (!priceForm.commodity) {
            setFilteredVarieties([]);
            return;
        }
        const fetchVarieties = async () => {
            try {
                const res = await getVarieties(priceForm.commodity);
                setFilteredVarieties(res.varieties || []);
                // Reset variety selection when commodity changes
                setPriceForm((prev) => ({ ...prev, variety: '' }));
            } catch (err) {
                console.error('Failed to load varieties:', err);
                setFilteredVarieties([]);
            }
        };
        fetchVarieties();
    }, [priceForm.commodity]);

    // ==================== HANDLERS ====================

    const handlePriceSubmit = async (e) => {
        e.preventDefault();
        setPriceLoading(true);
        setPriceError('');
        try {
            const result = await predictPrice(priceForm);
            if (result.error) {
                setPriceError(result.error);
            } else {
                setPriceResult(result);
                setShowPriceResults(true);

                // Save prediction to localStorage for MarketPrices page
                const prediction = {
                    id: Date.now(),
                    commodity: priceForm.commodity,
                    variety: priceForm.variety,
                    market: priceForm.market,
                    district: priceForm.district,
                    grade: priceForm.grade,
                    month: monthNames[priceForm.month - 1],
                    predictedPrice: result.predicted_price,
                    minPrice: result.min_price,
                    maxPrice: result.max_price,
                    confidence: result.confidence,
                    timestamp: new Date().toISOString(),
                };
                const existing = JSON.parse(localStorage.getItem('krishiverse_predictions') || '[]');
                existing.unshift(prediction); // Newest first
                // Keep only the latest 20 predictions
                localStorage.setItem('krishiverse_predictions', JSON.stringify(existing.slice(0, 20)));
            }
        } catch (err) {
            setPriceError(err.response?.data?.error || 'Failed to get price prediction. Make sure the Flask server is running.');
        } finally {
            setPriceLoading(false);
        }
    };

    const handleCropSubmit = async (e) => {
        e.preventDefault();
        setCropLoading(true);
        setCropError('');
        try {
            const result = await predictCrop(cropForm);
            if (result.error) {
                setCropError(result.error);
            } else {
                setCropResult(result);
                setShowCropResults(true);
            }
        } catch (err) {
            setCropError(err.response?.data?.error || 'Failed to get crop recommendation. Make sure the Flask server is running.');
        } finally {
            setCropLoading(false);
        }
    };

    const handlePriceChangeLocation = () => {
        setShowPriceResults(false);
        setPriceResult(null);
        setPriceError('');
    };

    const handleCropChangeParams = () => {
        setShowCropResults(false);
        setCropResult(null);
        setCropError('');
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // ==================== RENDER ====================

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
                            <p className="text-4xl font-bold">
                                {activeTab === 'priceForecast'
                                    ? modelStats?.price_r2 ? `${(modelStats.price_r2 * 100).toFixed(0)}%` : '—'
                                    : modelStats?.recommendation_accuracy ? `${(modelStats.recommendation_accuracy * 100).toFixed(0)}%` : '—'
                                }
                            </p>
                            <p className="text-sm opacity-90">
                                {activeTab === 'priceForecast' ? 'R² Accuracy' : 'Model Accuracy'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4 bg-white rounded-xl p-1 shadow-sm">
                    <button
                        onClick={() => setActiveTab('priceForecast')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${activeTab === 'priceForecast'
                            ? 'bg-primary text-white'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-medium">Price Forecast</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('landAnalysis')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${activeTab === 'landAnalysis'
                            ? 'bg-primary text-white'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Mountain className="w-5 h-5" />
                        <span className="font-medium">Land Analysis</span>
                    </button>
                </div>

                {/* ==================== PRICE FORECAST TAB ==================== */}
                {activeTab === 'priceForecast' && (
                    <>
                        {!showPriceResults ? (
                            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                                <div className="flex flex-col items-center mb-6">
                                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                                        <TrendingUp className="w-8 h-8 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Price Prediction</h2>
                                    <p className="text-sm text-gray-600 text-center">
                                        Select commodity and market details to get AI-powered price forecasts
                                    </p>
                                </div>

                                {priceError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p className="text-sm">{priceError}</p>
                                    </div>
                                )}

                                <form onSubmit={handlePriceSubmit} className="space-y-4">
                                    {/* District */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                                        <select
                                            value={priceForm.district}
                                            onChange={(e) => setPriceForm({ ...priceForm, district: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select District</option>
                                            {refData.districts.map((d) => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Market */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Market *</label>
                                        <select
                                            value={priceForm.market}
                                            onChange={(e) => setPriceForm({ ...priceForm, market: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            required
                                            disabled={!priceForm.district}
                                        >
                                            <option value="">{priceForm.district ? 'Select Market' : 'Select a district first'}</option>
                                            {filteredMarkets.map((m) => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Commodity */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Commodity *</label>
                                        <select
                                            value={priceForm.commodity}
                                            onChange={(e) => setPriceForm({ ...priceForm, commodity: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select Commodity</option>
                                            {refData.commodities.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Variety */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Variety *</label>
                                        <select
                                            value={priceForm.variety}
                                            onChange={(e) => setPriceForm({ ...priceForm, variety: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            required
                                            disabled={!priceForm.commodity}
                                        >
                                            <option value="">{priceForm.commodity ? 'Select Variety' : 'Select a commodity first'}</option>
                                            {filteredVarieties.map((v) => (
                                                <option key={v} value={v}>{v}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Grade */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Grade *</label>
                                        <select
                                            value={priceForm.grade}
                                            onChange={(e) => setPriceForm({ ...priceForm, grade: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select Grade</option>
                                            {refData.grades.map((g) => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Month */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                                        <select
                                            value={priceForm.month}
                                            onChange={(e) => setPriceForm({ ...priceForm, month: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            required
                                        >
                                            {monthNames.map((name, idx) => (
                                                <option key={idx + 1} value={idx + 1}>{name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={priceLoading}
                                        className="w-full bg-primary text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors mt-6 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {priceLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Predicting...
                                            </>
                                        ) : (
                                            'Get Price Forecast'
                                        )}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            /* Price Results */
                            <div className="space-y-4">
                                {/* Header Card */}
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-6 h-6 text-primary" />
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {priceForm.commodity} — {priceForm.market}, {priceForm.district}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {priceForm.variety} • {priceForm.grade} • {monthNames[priceForm.month - 1]}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handlePriceChangeLocation}
                                            className="bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors"
                                        >
                                            Change
                                        </button>
                                    </div>
                                </div>

                                {priceResult && (
                                    <>
                                        {/* Main Price Card */}
                                        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <TrendingUp className="w-5 h-5 text-primary" />
                                                <h3 className="text-lg font-bold text-gray-900">Predicted Price</h3>
                                                <span className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${priceResult.confidence === 'Very High' || priceResult.confidence === 'High'
                                                    ? 'bg-green-100 text-green-700'
                                                    : priceResult.confidence === 'Medium'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {priceResult.confidence} Confidence
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                    <p className="text-xs text-gray-500 mb-1">Min Price</p>
                                                    <p className="text-xl font-bold text-gray-700">₹{priceResult.min_price}</p>
                                                    <p className="text-xs text-gray-500">per quintal</p>
                                                </div>
                                                <div className="bg-green-50 rounded-lg p-3 text-center border-2 border-green-200">
                                                    <p className="text-xs text-primary font-medium mb-1">Predicted</p>
                                                    <p className="text-2xl font-bold text-primary">₹{priceResult.predicted_price}</p>
                                                    <p className="text-xs text-gray-600">per quintal</p>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                    <p className="text-xs text-gray-500 mb-1">Max Price</p>
                                                    <p className="text-xl font-bold text-gray-700">₹{priceResult.max_price}</p>
                                                    <p className="text-xs text-gray-500">per quintal</p>
                                                </div>
                                            </div>

                                            {/* Model Info */}
                                            {priceResult.model_info && (
                                                <div className="bg-blue-50 rounded-lg p-3">
                                                    <p className="text-xs text-blue-700 font-medium mb-1">Model Info</p>
                                                    <p className="text-sm text-blue-900">
                                                        {priceResult.model_info.name} — R² Score: {priceResult.model_info.r2_score} • MAE: ₹{priceResult.model_info.mae}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Historical Prices */}
                                        {priceResult.historical_prices && priceResult.historical_prices.length > 0 && (
                                            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                    <Calendar className="w-5 h-5 text-primary" />
                                                    Historical Price Trend
                                                </h3>
                                                <div className="space-y-2">
                                                    {priceResult.historical_prices.map((hp, idx) => (
                                                        <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                                            <span className="text-sm text-gray-600">{hp.month}</span>
                                                            <div className="flex-1 mx-4">
                                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-primary rounded-full"
                                                                        style={{ width: `${Math.min((hp.price / priceResult.predicted_price) * 100, 100)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <span className="text-sm font-semibold text-gray-900">₹{hp.price}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Market Factors */}
                                        {priceResult.factors && priceResult.factors.length > 0 && (
                                            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                                                <h3 className="text-lg font-bold text-gray-900 mb-4">Market Factors</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {priceResult.factors.map((factor, idx) => (
                                                        <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                                            <p className="text-xs text-gray-500 mb-1">{factor.name}</p>
                                                            <div className="flex items-center justify-between">
                                                                <span className={`text-sm font-semibold ${factor.impact === 'Positive' ? 'text-green-600'
                                                                    : factor.impact === 'Negative' ? 'text-red-600'
                                                                        : 'text-yellow-600'
                                                                    }`}>
                                                                    {factor.impact}
                                                                </span>
                                                                <span className="text-sm font-bold text-gray-900">{factor.value}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* ==================== LAND ANALYSIS TAB ==================== */}
                {activeTab === 'landAnalysis' && (
                    <>
                        {!showCropResults ? (
                            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                                <div className="flex flex-col items-center mb-6">
                                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                                        <Mountain className="w-8 h-8 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Land Analysis</h2>
                                    <p className="text-sm text-gray-600 text-center">
                                        Enter your land conditions to get AI-powered crop recommendations
                                    </p>
                                </div>

                                {cropError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p className="text-sm">{cropError}</p>
                                    </div>
                                )}

                                <form onSubmit={handleCropSubmit} className="space-y-4">
                                    {/* Temperature */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="flex items-center gap-1">
                                                <Thermometer className="w-4 h-4" />
                                                Temperature (°C) *
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            step="0.1"
                                            value={cropForm.temperature}
                                            onChange={(e) => setCropForm({ ...cropForm, temperature: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Enter temperature (0-50°C)"
                                            required
                                        />
                                    </div>

                                    {/* Soil Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="flex items-center gap-1">
                                                <Layers className="w-4 h-4" />
                                                Soil Type *
                                            </span>
                                        </label>
                                        <select
                                            value={cropForm.soil_type}
                                            onChange={(e) => setCropForm({ ...cropForm, soil_type: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            required
                                        >
                                            <option value="Low Fertility">Low Fertility</option>
                                            <option value="Medium Fertility">Medium Fertility</option>
                                            <option value="High Fertility">High Fertility</option>
                                        </select>
                                    </div>

                                    {/* Rainfall Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="flex items-center gap-1">
                                                <Droplets className="w-4 h-4" />
                                                Rainfall Category *
                                            </span>
                                        </label>
                                        <select
                                            value={cropForm.rainfall_category}
                                            onChange={(e) => setCropForm({ ...cropForm, rainfall_category: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            required
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={cropLoading}
                                        className="w-full bg-primary text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors mt-6 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {cropLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            'Analyze My Land'
                                        )}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            /* Crop Recommendation Results */
                            <div className="space-y-4">
                                {/* Input Summary Card */}
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Mountain className="w-6 h-6 text-primary" />
                                            <div>
                                                <p className="font-semibold text-gray-900">Land Conditions</p>
                                                <p className="text-sm text-gray-600">
                                                    {cropForm.temperature}°C • {cropForm.soil_type} • {cropForm.rainfall_category} Rainfall
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleCropChangeParams}
                                            className="bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors"
                                        >
                                            Change
                                        </button>
                                    </div>
                                </div>

                                {cropResult && (
                                    <>
                                        {/* Best Crop Card */}
                                        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Sprout className="w-5 h-5 text-primary" />
                                                <h3 className="text-lg font-bold text-gray-900">Best Recommended Crop</h3>
                                            </div>
                                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white text-center">
                                                <p className="text-3xl font-bold mb-2">{cropResult.best_crop}</p>
                                                <p className="text-lg opacity-90">
                                                    Confidence: {cropResult.best_confidence_percentage}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Top Recommendations */}
                                        {cropResult.recommendations && cropResult.recommendations.length > 0 && (
                                            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                                                <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Recommendations</h3>
                                                <div className="space-y-3">
                                                    {cropResult.recommendations.map((rec, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${idx === 0 ? 'bg-green-500'
                                                                : idx === 1 ? 'bg-green-400'
                                                                    : idx === 2 ? 'bg-yellow-500'
                                                                        : 'bg-gray-400'
                                                                }`}>
                                                                {idx + 1}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-gray-900">{rec.crop}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold text-primary">{rec.confidence_percentage}</p>
                                                            </div>
                                                            <div className="flex-1 max-w-[120px]">
                                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-primary rounded-full transition-all"
                                                                        style={{ width: `${rec.confidence * 100}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PricePrediction;
