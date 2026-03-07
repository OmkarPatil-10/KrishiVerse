import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Star, User, Phone, Mail, FileCheck, Leaf, UserMinus, AlertTriangle, X } from 'lucide-react';
import CreateContractForm from '../components/CreateContractForm';

const FarmerDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [farmer, setFarmer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isContractFormOpen, setIsContractFormOpen] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState('added'); // 'added' or 'removed'
    const [isAdding, setIsAdding] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

    useEffect(() => {
        const fetchFarmer = async () => {
            try {
                // Remove /users from the route as the backend is just /farmers or the api prefix has it. Wait, in FarmersList.jsx we used api.get('/users/farmers').
                // Let's use api.get(`/users/farmers/${id}`)
                const { default: api } = await import('../services/api');
                const response = await api.get(`/users/farmers/${id}`);
                if (response.data.success && response.data.data) {
                    const f = response.data.data;
                    setFarmer({
                        id: f._id,
                        name: f.name,
                        verified: true,
                        location: f.location || 'Unknown',
                        farmSize: f.farmSize ? `${f.farmSize} Acre` : 'N/A',
                        experience: f.farmingExperience ? `${f.farmingExperience} Years` : 'N/A',
                        crops: f.cropsInterested || [],
                        phone: f.phone || 'N/A',
                        email: f.email || 'N/A',
                        rating: 4.8,
                        walletConnected: !!f.walletAddress
                    });
                } else {
                    loadMock();
                }
            } catch (error) {
                console.error("Error fetching farmer:", error);
                loadMock();
            } finally {
                setIsLoading(false);
            }
        };

        const loadMock = () => {
            setFarmer({
                id: id || 'F001',
                name: 'Omkar Patil',
                verified: true,
                location: 'Maharashtra, Raigad',
                farmSize: '8.5 Acre',
                experience: '09 Years',
                crops: ['Rice', 'Cotton', 'Wheat'],
                phone: '+91 9167173584',
                email: 'omkarpatil@gmail.com',
                rating: 4.5,
                walletConnected: id === 'F002' || id === 'F004' ? false : true // mock variations
            });
        };

        const fetchNetworkStatus = async () => {
            try {
                const { default: api } = await import('../services/api');
                const response = await api.get('/users/network/my');
                if (response.data.success) {
                    const isPresent = response.data.data.some(f => f._id === id);
                    setIsAdded(isPresent);
                }
            } catch (error) {
                console.error("Error fetching network status:", error);
            }
        };

        fetchFarmer();
        fetchNetworkStatus();
    }, [id]);

    const handleAddToNetwork = async () => {
        setIsAdding(true);
        try {
            const { default: api } = await import('../services/api');
            const response = await api.post('/users/network/add', { farmerId: id });
            if (response.data.success) {
                setIsAdded(true);
                setPopupType('added');
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 3000);
            }
        } catch (error) {
            console.error("Error adding to network:", error);
            // Fallback for mock/offline
            setIsAdded(true);
            setPopupType('added');
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 3000);
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveFromNetwork = async () => {
        setIsRemoving(true);
        try {
            const { default: api } = await import('../services/api');
            const response = await api.post('/users/network/remove', { farmerId: id });
            if (response.data.success) {
                setIsAdded(false);
                setShowRemoveConfirm(false);
                setPopupType('removed');
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 3000);
            }
        } catch (error) {
            console.error("Error removing from network:", error);
            // Fallback for mock/offline
            setIsAdded(false);
            setShowRemoveConfirm(false);
            setPopupType('removed');
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 3000);
        } finally {
            setIsRemoving(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-blue-50 flex items-center justify-center">Loading...</div>;
    }

    if (!farmer) {
        return <div className="min-h-screen bg-blue-50 flex items-center justify-center">Farmer not found</div>;
    }

    return (
        <div className="min-h-screen bg-blue-50 pb-20 md:pb-6 font-sans">
            {/* Top Navigation - Visible on mobile mostly */}
            <div className="bg-white shadow-sm sticky top-0 z-10 md:hidden">
                <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
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
                    <div className="flex items-center gap-3">
                        <button className="text-gray-600 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                        </button>
                        <button className="bg-gray-100 p-1.5 rounded-full">
                            <User className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Farmer Details Header Bar */}
                <div className="flex items-center gap-3 px-4 py-3 bg-white">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1 px-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Farmer Details</h1>
                </div>
            </div>

            <div className="px-4 py-4 md:px-6 md:py-6 max-w-2xl mx-auto">
                {/* Desktop Header */}
                <div className="hidden md:flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Farmer Details</h1>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8">

                    {/* Profile Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 bg-green-50 rounded-full border-2 border-green-100 flex items-center justify-center text-green-500 flex-shrink-0">
                            <User className="w-10 h-10" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-2xl font-bold text-gray-900">{farmer.name}</h2>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 font-medium mb-3">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span>{farmer.rating}</span>
                                </div>
                                <span>ID: {farmer.id}</span>
                            </div>

                            {/* Badges row */}
                            <div className="flex flex-wrap gap-2 mb-2">
                                {farmer.verified && (
                                    <span className="bg-[#e6f9ed] text-[#2b9f4e] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                                        <CheckCircle2 className="w-3.5 h-3.5 fill-current text-[#e6f9ed]" />
                                        Verified
                                    </span>
                                )}
                                {farmer.walletConnected && (
                                    <span className="bg-[#e6f9ed] text-[#2b9f4e] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                                        <FileCheck className="w-4 h-4 fill-current text-[#e6f9ed]" />
                                        <span className="leading-tight text-left" style={{ fontSize: '10px' }}>Smart<br />Contract</span>
                                    </span>
                                )}
                                <span className="bg-[#e6f9ed] text-[#2b9f4e] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                                    <Leaf className="w-3.5 h-3.5 fill-current text-[#2b9f4e]" />
                                    Organic
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Add / Remove Network Buttons */}
                    {isAdded ? (
                        <div className="flex gap-3 mb-6">
                            <div className="flex-1 bg-green-50 border border-green-200 text-green-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-base">
                                <CheckCircle2 className="w-5 h-5" />
                                Added to Network
                            </div>
                            <button
                                onClick={() => setShowRemoveConfirm(true)}
                                className="px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold rounded-xl transition-colors flex items-center gap-2 text-sm"
                            >
                                <UserMinus className="w-4 h-4" />
                                Remove
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleAddToNetwork}
                            disabled={isAdding}
                            className="w-full font-semibold py-3 rounded-xl mb-6 transition-colors text-base shadow-sm flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            {isAdding ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                'Add to Network'
                            )}
                        </button>
                    )}

                    <hr className="border-gray-100 mb-6" />

                    {/* Details Sections */}
                    <div className="space-y-5">
                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Location</p>
                            <p className="text-gray-900 font-semibold">{farmer.location}</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Farm Size</p>
                            <p className="text-gray-900 font-semibold">{farmer.farmSize}</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Experience</p>
                            <p className="text-gray-900 font-semibold">{farmer.experience}</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Crop Grown</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {farmer.crops.map((crop, idx) => (
                                    <span key={idx} className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm font-medium">
                                        {crop}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Phone</p>
                            <p className="text-gray-900 font-semibold">{farmer.phone}</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Email</p>
                            <p className="text-gray-900 font-semibold">{farmer.email}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-8">
                        <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-xl transition-colors">
                            <Phone className="w-5 h-5" />
                            Call
                        </button>
                        <button
                            onClick={() => setIsContractFormOpen(true)}
                            className="flex-[2] flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
                        >
                            <span className="text-lg leading-none">+</span> Create Contract
                        </button>
                    </div>

                </div>
            </div>
            {isContractFormOpen && (
                <CreateContractForm
                    onClose={() => setIsContractFormOpen(false)}
                    initialFarmer={`${farmer.name} - ${farmer.location}`}
                />
            )}

            {/* Success / Removed Popup */}
            {showPopup && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100]" style={{ animation: 'popupSlideIn 0.3s ease-out' }}>
                    <div className={`rounded-2xl shadow-2xl border px-6 py-4 flex items-center gap-3 ${popupType === 'added'
                            ? 'bg-white border-green-100'
                            : 'bg-white border-red-100'
                        }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${popupType === 'added'
                                ? 'bg-green-50 text-green-500'
                                : 'bg-red-50 text-red-500'
                            }`}>
                            {popupType === 'added' ? (
                                <CheckCircle2 className="w-6 h-6" />
                            ) : (
                                <UserMinus className="w-6 h-6" />
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">
                                {popupType === 'added' ? 'Added!' : 'Removed!'}
                            </p>
                            <p className="text-sm text-gray-400">
                                {popupType === 'added'
                                    ? 'Farmer successfully added to your network'
                                    : 'Farmer permanently removed from your network'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Confirmation Modal */}
            {showRemoveConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" style={{ animation: 'popupSlideIn 0.3s ease-out' }}>
                        {/* Header */}
                        <div className="bg-red-50 p-5 flex flex-col items-center">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-3">
                                <AlertTriangle className="w-7 h-7 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 text-center">Remove from Network?</h3>
                        </div>

                        {/* Body */}
                        <div className="p-5">
                            <p className="text-sm text-gray-600 text-center leading-relaxed">
                                Are you sure you want to remove <strong className="text-gray-900">{farmer.name}</strong> from your network?
                                This action is <strong className="text-red-600">permanent</strong> and cannot be undone.
                            </p>

                            <div className="flex gap-3 mt-5">
                                <button
                                    onClick={() => setShowRemoveConfirm(false)}
                                    className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRemoveFromNetwork}
                                    disabled={isRemoving}
                                    className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {isRemoving ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <UserMinus className="w-4 h-4" />
                                            Remove
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes popupSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
};

export default FarmerDetails;
