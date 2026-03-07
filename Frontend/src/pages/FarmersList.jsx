import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Maximize, Star, Clock, CheckCircle2, User, ChevronDown, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfileSidebar } from '../context/ProfileSidebarContext';
import api from '../services/api';

const FarmersList = () => {
    const navigate = useNavigate();
    const { openSidebar, isOpen: isSidebarOpen } = useProfileSidebar();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const [farmers, setFarmers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFarmers = async () => {
            try {
                const response = await api.get('/users/farmers');
                if (response.data.success && response.data.data.length > 0) {
                    const formattedData = response.data.data.map(f => ({
                        id: f._id,
                        name: f.name,
                        verified: true,
                        status: 'Verified',
                        location: f.location || 'Unknown',
                        farmSize: f.farmSize ? `${f.farmSize} Acre` : 'N/A',
                        crops: f.cropsInterested || [],
                        rating: 4.8,
                        experience: f.farmingExperience ? `${f.farmingExperience} Years` : 'N/A',
                        walletConnected: !!f.walletAddress
                    }));
                    setFarmers(formattedData);
                } else {
                    loadMockData();
                }
            } catch (error) {
                console.error("Error fetching farmers:", error);
                loadMockData();
            } finally {
                setIsLoading(false);
            }
        };

        const loadMockData = () => {
            const mockFarmers = [
                {
                    id: 'F001',
                    name: 'Omkar Patil',
                    verified: true,
                    status: 'Added',
                    location: 'Maharashtra',
                    farmSize: '8.5 Acre',
                    crops: ['Rice', 'Wheat', 'Cotton'],
                    rating: 4.5,
                    experience: '09 Years',
                    walletConnected: true
                },
                {
                    id: 'F002',
                    name: 'Nikhil Patil',
                    verified: true,
                    status: '',
                    location: 'Gujarat',
                    farmSize: '8.5 Acre',
                    crops: ['Rice', 'Wheat', 'Cotton'],
                    rating: 4.5,
                    experience: '12 Years',
                    walletConnected: false
                },
                {
                    id: 'F003',
                    name: 'Sahil Shete',
                    verified: true,
                    status: 'Added',
                    location: 'Maharashtra',
                    farmSize: '12 Acre',
                    crops: ['Rice', 'Wheat'],
                    rating: 4.1,
                    experience: '20 Years',
                    walletConnected: true
                },
                {
                    id: 'F004',
                    name: 'Ayush Rokade',
                    verified: true,
                    status: 'Added',
                    location: 'Punjab',
                    farmSize: '15 Acre',
                    crops: ['Rice', 'Corn', 'Cotton'],
                    rating: 4.7,
                    experience: '15 Years',
                    walletConnected: false
                },
                {
                    id: 'F005',
                    name: 'Vaibhav Shedge',
                    verified: true,
                    status: '',
                    location: 'Telangana',
                    farmSize: '10 Acre',
                    crops: ['Rice', 'Wheat', 'Cotton'],
                    rating: 4.1,
                    experience: '05 Years',
                    walletConnected: true
                }
            ];
            // Only show farmers that have connected their wallet
            setFarmers(mockFarmers.filter(f => f.walletConnected));
        };

        fetchFarmers();
    }, []);

    const handleClearFilters = () => {
        setActiveFilter('All');
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen bg-blue-50 pb-20 md:pb-6 font-sans">
            {/* Top Navigation - Visible on mobile mostly, similar to Dashboard */}
            <div className="bg-white shadow-sm md:hidden sticky top-0 z-10">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-blue-600">KrishiVerse</span>
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                Contractor
                            </span>
                        </div>
                    </div>
                    {!isSidebarOpen && (
                        <div className="flex items-center gap-3">
                            <button className="text-gray-600 p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                            </button>
                            <button onClick={openSidebar} className="bg-gray-100 p-1.5 rounded-full">
                                <User className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-4 py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Farmer</h1>
                        <p className="text-sm md:text-base text-gray-600">See all available farmer</p>
                    </div>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Added Farmer
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
                        placeholder="Search by name or location"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setActiveFilter('All')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === 'All' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveFilter('State')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1 transition-colors ${activeFilter === 'State' ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                    >
                        State <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setActiveFilter('District')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1 transition-colors ${activeFilter === 'District' ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                    >
                        District <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleClearFilters}
                        className="text-blue-500 text-sm font-medium whitespace-nowrap ml-auto flex items-center gap-1 hover:text-blue-700"
                    >
                        x Clear Filter
                    </button>
                </div>

                {/* Farmers List */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : farmers.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500">No farmers found with a connected wallet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {farmers
                            .filter(f =>
                                f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                f.location.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((farmer) => (
                                <div key={farmer.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 text-green-500">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-gray-900 truncate">{farmer.name}</h3>
                                                {farmer.verified && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                                                {farmer.status && (
                                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium ml-1">
                                                        {farmer.status}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span>{farmer.location}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Maximize className="w-3.5 h-3.5" />
                                                    <span>{farmer.farmSize}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {farmer.crops.map((crop, idx) => (
                                                    <span key={idx} className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                                                        {crop}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                                        <span>{farmer.rating}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{farmer.experience}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/farmers/${farmer.id}`)}
                                                    className="text-blue-500 text-sm font-medium hover:text-blue-700 transition-colors"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmersList;
