import { useState, useEffect } from 'react';
import { Bell, User, Sprout, Mail, Phone, MapPin, Building, Lock, Ruler, Clock, Calendar, FileText, Star, Leaf, Droplets, ChevronRight, Plus, CheckCircle2, Briefcase, Upload, Hash, Save, X, Edit2, FileCheck } from 'lucide-react';
import ProfileSidebar from '../components/ProfileSidebar';
import { useProfileSidebar } from '../context/ProfileSidebarContext';
import { useAuth } from '../context/AuthContext';
import { ConnectWallet, useAddress, useDisconnect } from '@thirdweb-dev/react';
import api from '../services/api';
const Profile = () => {
    const { openSidebar, isOpen: isSidebarOpen } = useProfileSidebar();
    const { user, updateProfile } = useAuth();
    const address = useAddress();
    const disconnect = useDisconnect();

    useEffect(() => {
        if (address && user) {
            if (user.walletAddress && address.toLowerCase() !== user.walletAddress.toLowerCase()) {
                alert("You cannot change your linked wallet address. Please connect your registered wallet: " + user.walletAddress);
                disconnect();
            } else if (!user.walletAddress) {
                // Auto update user wallet address
                updateProfile({ walletAddress: address }).catch(err => {
                    console.error("Failed to update wallet address", err);
                });
            }
        }
    }, [address, user, disconnect, updateProfile]);

    // Buyer and contractor are the same entity
    const userRole = user?.role || user?.userType;
    const isContractor = userRole === 'contractor' || userRole === 'buyer';

    // Edit mode states
    const [isEditingPersonal, setIsEditingPersonal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });

    // Personal info form state
    const [personalFormData, setPersonalFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        location: user?.location || '',
        farmSize: user?.farmSize || '',
        farmingExperience: user?.farmingExperience || '',
        // Contractor fields
        businessName: user?.businessName || '',
        contractorType: user?.contractorType || '',
        contractorExperience: user?.contractorExperience || '',
        state: user?.state || '',
        district: user?.district || '',
        city: user?.city || '',
        fullAddress: user?.fullAddress || ''
    });

    const [selectedCrops, setSelectedCrops] = useState(user?.cropsInterested || []);
    const [selectedIrrigation, setSelectedIrrigation] = useState(['Rainfed', 'Tank', 'Canal']);
    const [isOrganic, setIsOrganic] = useState(true);

    // Contract stats
    const [contractStats, setContractStats] = useState({ total: 0, active: 0, completed: 0 });
    const [statsLoading, setStatsLoading] = useState(true);

    // Fetch contract stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/contracts');
                if (res.data.success) {
                    const allContracts = res.data.contracts || [];
                    const userId = user?._id || user?.id;
                    const mine = isContractor
                        ? allContracts.filter(c => c.buyerId === userId)
                        : allContracts.filter(c => c.acceptedBy?.farmerId === userId);
                    setContractStats({
                        total: mine.length,
                        active: mine.filter(c => c.status === 'accepted' || c.status === 'outForDelivery').length,
                        completed: mine.filter(c => c.status === 'completed').length
                    });
                }
            } catch (err) {
                console.error('Failed to load contract stats:', err);
            } finally {
                setStatsLoading(false);
            }
        };
        if (user) fetchStats();
    }, [user, isContractor]);

    // Contractor form state
    const [contractorData, setContractorData] = useState({
        cropsInterested: user?.cropsInterested || [],
        minQuantityRequired: user?.minQuantityRequired || '',
        maxQuantityCapacity: user?.maxQuantityCapacity || '',
        preferredQualityGrade: user?.preferredQualityGrade || 'Any',
        gstNumber: user?.gstNumber || '',
        panNumber: user?.panNumber || '',
        businessLicense: user?.businessLicense || ''
    });

    // Update form data when user changes
    useEffect(() => {
        if (user) {
            setPersonalFormData({
                name: user.name || '',
                phone: user.phone || '',
                location: user.location || '',
                farmSize: user.farmSize || '',
                farmingExperience: user.farmingExperience || '',
                // Contractor fields
                businessName: user.businessName || '',
                contractorType: user.contractorType || '',
                contractorExperience: user.contractorExperience || '',
                state: user.state || '',
                district: user.district || '',
                city: user.city || '',
                fullAddress: user.fullAddress || ''
            });
            setSelectedCrops(user.cropsInterested || []);
            setContractorData({
                cropsInterested: user.cropsInterested || [],
                minQuantityRequired: user.minQuantityRequired || '',
                maxQuantityCapacity: user.maxQuantityCapacity || '',
                preferredQualityGrade: user.preferredQualityGrade || 'Any',
                gstNumber: user.gstNumber || '',
                panNumber: user.panNumber || '',
                businessLicense: user.businessLicense || ''
            });
        }
    }, [user]);

    const crops = ['Rice', 'Wheat', 'Corn', 'SugarCane', 'Cotton', 'Soyabean', 'Millets', 'Onion', 'Tomato'];
    const irrigationTypes = ['Rainfed', 'Tank', 'Canal', 'Sprinkler', 'Well', 'Drip'];

    const toggleCrop = (crop) => {
        if (selectedCrops.includes(crop)) {
            setSelectedCrops(selectedCrops.filter(c => c !== crop));
        } else {
            setSelectedCrops([...selectedCrops, crop]);
        }
    };

    const toggleIrrigation = (type) => {
        if (selectedIrrigation.includes(type)) {
            setSelectedIrrigation(selectedIrrigation.filter(i => i !== type));
        } else {
            setSelectedIrrigation([...selectedIrrigation, type]);
        }
    };

    // Save personal info
    const handleSavePersonalInfo = async () => {
        setIsSaving(true);
        setSaveMessage({ type: '', text: '' });
        try {
            const updateData = {
                name: personalFormData.name,
                phone: personalFormData.phone
            };

            if (isContractor) {
                // Contractor fields
                updateData.businessName = personalFormData.businessName;
                updateData.contractorType = personalFormData.contractorType;
                updateData.contractorExperience = personalFormData.contractorExperience;
                updateData.state = personalFormData.state;
                updateData.district = personalFormData.district;
                updateData.city = personalFormData.city;
                updateData.fullAddress = personalFormData.fullAddress;
            } else {
                // Farmer fields
                updateData.location = personalFormData.location;
                updateData.farmSize = personalFormData.farmSize;
                updateData.farmingExperience = personalFormData.farmingExperience;
            }

            await updateProfile(updateData);
            setIsEditingPersonal(false);
            setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setSaveMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setSaveMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setIsSaving(false);
        }
    };

    // Save contractor section 1 (Crop & Trading Interest)
    const handleSaveContractorSection1 = async () => {
        setIsSaving(true);
        setSaveMessage({ type: '', text: '' });
        try {
            const updateData = {
                cropsInterested: contractorData.cropsInterested,
                minQuantityRequired: contractorData.minQuantityRequired,
                maxQuantityCapacity: contractorData.maxQuantityCapacity,
                preferredQualityGrade: contractorData.preferredQualityGrade
            };

            await updateProfile(updateData);
            setSaveMessage({ type: 'success', text: 'Crop & Trading Interest saved successfully!' });
            setTimeout(() => setSaveMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setSaveMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save data' });
        } finally {
            setIsSaving(false);
        }
    };

    // Save contractor section 2 (Optional fields)
    const handleSaveContractorSection2 = async () => {
        setIsSaving(true);
        setSaveMessage({ type: '', text: '' });
        try {
            const updateData = {
                gstNumber: contractorData.gstNumber,
                panNumber: contractorData.panNumber,
                businessLicense: contractorData.businessLicense
            };

            await updateProfile(updateData);
            setSaveMessage({ type: 'success', text: 'Optional details saved successfully!' });
            setTimeout(() => setSaveMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setSaveMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save data' });
        } finally {
            setIsSaving(false);
        }
    };

    // Save farmer farming details
    const handleSaveFarmingDetails = async () => {
        setIsSaving(true);
        setSaveMessage({ type: '', text: '' });
        try {
            // Note: cropsInterested might be stored differently for farmers
            // Adjust based on your backend schema
            const updateData = {
                cropsInterested: selectedCrops
            };

            await updateProfile(updateData);
            setSaveMessage({ type: 'success', text: 'Farming details saved successfully!' });
            setTimeout(() => setSaveMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setSaveMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save data' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
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

                {/* Page Title */}
                <div className="px-4 py-2 md:px-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile</h1>
                </div>

                {/* Main Content */}
                <div className="px-4 py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
                    {/* My Profile Banner */}
                    <div className={`rounded-xl shadow-sm p-6 mb-4 text-white relative ${isContractor ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-primary to-green-700'}`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sprout className="w-5 h-5" />
                                    <span className="text-lg font-bold">KrishiVerse</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-3">
                                        <User className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h2 className="text-2xl font-bold">{user?.name || 'User'}</h2>
                                    </div>
                                    <p className="text-lg opacity-90 mb-4 capitalize">
                                        {isContractor ? (user?.contractorType || 'Contractor') : (user?.role || 'User')}
                                    </p>
                                    <div className="mb-4">
                                        <ConnectWallet theme="dark" btnTitle="Connect Wallet" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm ${isContractor ? 'bg-blue-100 text-blue-600' : 'bg-[#e6f9ed] text-[#2b9f4e]'}`}>
                                <CheckCircle2 className="w-4 h-4 fill-current" />
                                Verified
                            </span>
                            {(address || user?.walletAddress) && (
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm ${isContractor ? 'bg-blue-100 text-blue-600' : 'bg-[#e6f9ed] text-[#2b9f4e]'}`}>
                                    <FileCheck className="w-5 h-5 fill-current" />
                                    <span className="leading-tight text-left text-xs">Smart<br />Contract</span>
                                </span>
                            )}
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm ${isContractor ? 'bg-blue-100 text-blue-600' : 'bg-[#e6f9ed] text-[#2b9f4e]'}`}>
                                {isContractor ? <Briefcase className="w-4 h-4" /> : <Leaf className="w-4 h-4 fill-current text-[#2b9f4e]" />}
                                {isContractor ? 'Business' : 'Organic'}
                            </span>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-3 gap-3">
                            {isContractor ? (
                                <>
                                    {user?.contractorExperience && (
                                        <div className="bg-white/20 rounded-lg p-3 text-center">
                                            <p className="text-xl font-bold">{user.contractorExperience}</p>
                                            <p className="text-xs opacity-90">Years Exp</p>
                                        </div>
                                    )}
                                    <div className="bg-white/20 rounded-lg p-3 text-center">
                                        <p className="text-xl font-bold">{statsLoading ? '...' : contractStats.total}</p>
                                        <p className="text-xs opacity-90">Total Contracts</p>
                                    </div>
                                    <div className="bg-white/20 rounded-lg p-3 text-center">
                                        <p className="text-xl font-bold">{statsLoading ? '...' : contractStats.completed}</p>
                                        <p className="text-xs opacity-90">Completed</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {user?.farmSize && (
                                        <div className="bg-white/20 rounded-lg p-3 text-center">
                                            <p className="text-xl font-bold">{user.farmSize}</p>
                                            <p className="text-xs opacity-90">Acres</p>
                                        </div>
                                    )}
                                    {user?.farmingExperience && (
                                        <div className="bg-blue-500/30 rounded-lg p-3 text-center">
                                            <p className="text-xl font-bold">{user.farmingExperience}</p>
                                            <p className="text-xs opacity-90">Years Exp</p>
                                        </div>
                                    )}
                                    <div className="bg-yellow-500/30 rounded-lg p-3 text-center">
                                        <p className="text-xl font-bold">{statsLoading ? '...' : contractStats.total}</p>
                                        <p className="text-xs opacity-90">Contracts</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Success/Error Message */}
                    {saveMessage.text && (
                        <div className={`mb-4 p-4 rounded-lg ${saveMessage.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                            {saveMessage.text}
                        </div>
                    )}

                    {/* Personal Information Card */}
                    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">My Profile</h3>
                                <p className="text-sm text-gray-600">Manage your account information</p>
                            </div>
                            {!isEditingPersonal ? (
                                <button
                                    onClick={() => setIsEditingPersonal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleSavePersonalInfo}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingPersonal(false);
                                            setPersonalFormData({
                                                name: user?.name || '',
                                                phone: user?.phone || '',
                                                location: user?.location || '',
                                                farmSize: user?.farmSize || '',
                                                farmingExperience: user?.farmingExperience || '',
                                                // Contractor fields
                                                businessName: user?.businessName || '',
                                                contractorType: user?.contractorType || '',
                                                contractorExperience: user?.contractorExperience || '',
                                                state: user?.state || '',
                                                district: user?.district || '',
                                                city: user?.city || '',
                                                fullAddress: user?.fullAddress || ''
                                            });
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <User className="w-5 h-5 text-gray-500" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Full Name</p>
                                    {isEditingPersonal ? (
                                        <input
                                            type="text"
                                            value={personalFormData.name}
                                            onChange={(e) => setPersonalFormData({ ...personalFormData, name: e.target.value })}
                                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    ) : (
                                        <p className="font-semibold text-gray-900">{user?.name || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Mail className="w-5 h-5 text-gray-500" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Email Address</p>
                                    <p className="font-semibold text-gray-900">{user?.email || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Phone className="w-5 h-5 text-gray-500" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Phone Number</p>
                                    {isEditingPersonal ? (
                                        <input
                                            type="tel"
                                            value={personalFormData.phone}
                                            onChange={(e) => setPersonalFormData({ ...personalFormData, phone: e.target.value })}
                                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    ) : (
                                        <p className="font-semibold text-gray-900">{user?.phone || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>
                            {!isContractor && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <MapPin className="w-5 h-5 text-gray-500" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Location</p>
                                        {isEditingPersonal ? (
                                            <input
                                                type="text"
                                                value={personalFormData.location}
                                                onChange={(e) => setPersonalFormData({ ...personalFormData, location: e.target.value })}
                                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        ) : (
                                            <p className="font-semibold text-gray-900">{user?.location || 'Not provided'}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {!isContractor && (
                                <>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Ruler className="w-5 h-5 text-gray-500" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Farm Size (acres)</p>
                                            {isEditingPersonal ? (
                                                <input
                                                    type="number"
                                                    value={personalFormData.farmSize}
                                                    onChange={(e) => setPersonalFormData({ ...personalFormData, farmSize: e.target.value })}
                                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            ) : (
                                                <p className="font-semibold text-gray-900">{user?.farmSize ? `${user.farmSize} acres` : 'Not provided'}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Clock className="w-5 h-5 text-gray-500" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Farming Experience (years)</p>
                                            {isEditingPersonal ? (
                                                <input
                                                    type="number"
                                                    value={personalFormData.farmingExperience}
                                                    onChange={(e) => setPersonalFormData({ ...personalFormData, farmingExperience: e.target.value })}
                                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            ) : (
                                                <p className="font-semibold text-gray-900">{user?.farmingExperience ? `${user.farmingExperience} years` : 'Not provided'}</p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                            {isContractor ? (
                                <>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Building className="w-5 h-5 text-gray-500" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Business Name</p>
                                            {isEditingPersonal ? (
                                                <input
                                                    type="text"
                                                    value={personalFormData.businessName}
                                                    onChange={(e) => setPersonalFormData({ ...personalFormData, businessName: e.target.value })}
                                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            ) : (
                                                <p className="font-semibold text-gray-900">{user?.businessName || 'Not provided'}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Briefcase className="w-5 h-5 text-gray-500" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Contractor Type</p>
                                            {isEditingPersonal ? (
                                                <select
                                                    value={personalFormData.contractorType}
                                                    onChange={(e) => setPersonalFormData({ ...personalFormData, contractorType: e.target.value })}
                                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                >
                                                    <option value="">Select Type</option>
                                                    <option value="Trader">Trader</option>
                                                    <option value="Wholesaler">Wholesaler</option>
                                                    <option value="Retailer">Retailer</option>
                                                    <option value="Processor">Processor</option>
                                                    <option value="Exporter">Exporter</option>
                                                </select>
                                            ) : (
                                                <p className="font-semibold text-gray-900">{user?.contractorType || 'Not provided'}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Clock className="w-5 h-5 text-gray-500" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Years of Experience</p>
                                            {isEditingPersonal ? (
                                                <input
                                                    type="number"
                                                    value={personalFormData.contractorExperience}
                                                    onChange={(e) => setPersonalFormData({ ...personalFormData, contractorExperience: e.target.value })}
                                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            ) : (
                                                <p className="font-semibold text-gray-900">{user?.contractorExperience ? `${user.contractorExperience} years` : 'Not provided'}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <MapPin className="w-5 h-5 text-gray-500" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">State</p>
                                            {isEditingPersonal ? (
                                                <input
                                                    type="text"
                                                    value={personalFormData.state}
                                                    onChange={(e) => setPersonalFormData({ ...personalFormData, state: e.target.value })}
                                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            ) : (
                                                <p className="font-semibold text-gray-900">{user?.state || 'Not provided'}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <MapPin className="w-5 h-5 text-gray-500" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">District</p>
                                            {isEditingPersonal ? (
                                                <input
                                                    type="text"
                                                    value={personalFormData.district}
                                                    onChange={(e) => setPersonalFormData({ ...personalFormData, district: e.target.value })}
                                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            ) : (
                                                <p className="font-semibold text-gray-900">{user?.district || 'Not provided'}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <MapPin className="w-5 h-5 text-gray-500" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">City / Taluka</p>
                                            {isEditingPersonal ? (
                                                <input
                                                    type="text"
                                                    value={personalFormData.city}
                                                    onChange={(e) => setPersonalFormData({ ...personalFormData, city: e.target.value })}
                                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            ) : (
                                                <p className="font-semibold text-gray-900">{user?.city || 'Not provided'}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <MapPin className="w-5 h-5 text-gray-500" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Full Address</p>
                                            {isEditingPersonal ? (
                                                <textarea
                                                    value={personalFormData.fullAddress}
                                                    onChange={(e) => setPersonalFormData({ ...personalFormData, fullAddress: e.target.value })}
                                                    rows={3}
                                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            ) : (
                                                <p className="font-semibold text-gray-900">{user?.fullAddress || 'Not provided'}</p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Contractor Profile Fields or Farming Details */}
                    {isContractor ? (
                        <>
                            {/* SECTION 1: Crop & Trading Interest (Mandatory) */}
                            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Leaf className="w-5 h-5 text-primary" />
                                        SECTION 1: Crop & Trading Interest (Mandatory)
                                    </h3>
                                    <button
                                        onClick={handleSaveContractorSection1}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>

                                {/* Crops Interested In */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Crops Interested In (Multi-select) *</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {crops.map((crop) => (
                                            <button
                                                key={crop}
                                                type="button"
                                                onClick={() => {
                                                    const newCrops = contractorData.cropsInterested.includes(crop)
                                                        ? contractorData.cropsInterested.filter(c => c !== crop)
                                                        : [...contractorData.cropsInterested, crop];
                                                    setContractorData({ ...contractorData, cropsInterested: newCrops });
                                                }}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${contractorData.cropsInterested.includes(crop)
                                                    ? 'bg-green-50 border-2 border-primary text-primary'
                                                    : 'bg-gray-50 border-2 border-gray-200 text-gray-600'
                                                    }`}
                                            >
                                                {crop}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Minimum Quantity Required */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Quantity Required (Quintal / Ton) *</label>
                                    <input
                                        type="number"
                                        value={contractorData.minQuantityRequired}
                                        onChange={(e) => setContractorData({ ...contractorData, minQuantityRequired: e.target.value })}
                                        placeholder="Enter minimum quantity"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Maximum Quantity Capacity */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Quantity Capacity (Quintal / Ton) *</label>
                                    <input
                                        type="number"
                                        value={contractorData.maxQuantityCapacity}
                                        onChange={(e) => setContractorData({ ...contractorData, maxQuantityCapacity: e.target.value })}
                                        placeholder="Enter maximum capacity"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Preferred Quality Grade */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Quality Grade *</label>
                                    <select
                                        value={contractorData.preferredQualityGrade}
                                        onChange={(e) => setContractorData({ ...contractorData, preferredQualityGrade: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    >
                                        <option value="Any">Any</option>
                                        <option value="A">Grade A</option>
                                        <option value="B">Grade B</option>
                                        <option value="C">Grade C</option>
                                    </select>
                                </div>
                            </div>

                            {/* SECTION 2: Optional Fields */}
                            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-primary" />
                                        SECTION 2: Optional (For trust – keep optional)
                                    </h3>
                                    <button
                                        onClick={handleSaveContractorSection2}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>

                                {/* GST Number */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={contractorData.gstNumber}
                                            onChange={(e) => setContractorData({ ...contractorData, gstNumber: e.target.value })}
                                            placeholder="Enter GST Number"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* PAN Number */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={contractorData.panNumber}
                                            onChange={(e) => setContractorData({ ...contractorData, panNumber: e.target.value })}
                                            placeholder="Enter PAN Number"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Business License Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Business License Upload (PDF/Image)</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setContractorData({ ...contractorData, businessLicense: file.name });
                                                }
                                            }}
                                            className="hidden"
                                            id="businessLicense"
                                        />
                                        <label
                                            htmlFor="businessLicense"
                                            className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                            <Upload className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-700">
                                                {contractorData.businessLicense || 'Choose file (PDF/Image)'}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Farming Details Card */}
                            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Leaf className="w-5 h-5 text-primary" />
                                        Crop Grown (Multi-Select)
                                    </h3>
                                    <button
                                        onClick={handleSaveFarmingDetails}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mb-6">
                                    {crops.map((crop) => (
                                        <button
                                            key={crop}
                                            onClick={() => toggleCrop(crop)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCrops.includes(crop)
                                                ? 'bg-green-50 border-2 border-primary text-primary'
                                                : 'bg-gray-50 border-2 border-gray-200 text-gray-600'
                                                }`}
                                        >
                                            {crop}
                                        </button>
                                    ))}
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Droplets className="w-5 h-5 text-primary" />
                                        Irrigation Type (Multi-Select)
                                    </h3>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mb-6">
                                    {irrigationTypes.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => toggleIrrigation(type)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedIrrigation.includes(type)
                                                ? 'bg-green-50 border-2 border-primary text-primary'
                                                : 'bg-gray-50 border-2 border-gray-200 text-gray-600'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                                        <Leaf className="w-5 h-5 text-primary" />
                                        Organic Farming
                                    </h3>
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Leaf className="w-5 h-5 text-primary" />
                                            <span className="font-semibold text-gray-900">Organic Certified</span>
                                        </div>
                                        <button
                                            onClick={() => setIsOrganic(!isOrganic)}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${isOrganic ? 'bg-primary' : 'bg-gray-300'
                                                }`}
                                        >
                                            <span
                                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isOrganic ? 'translate-x-6' : 'translate-x-0'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Account Activity Card */}
                    {/*<div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Account Activity</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-700">Member Since</span>
                                </div>
                                <span className="font-semibold text-gray-900">Jan 2023</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-700">Total Contracts</span>
                                </div>
                                <span className="font-semibold text-gray-900">8 Completed</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Star className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-700">Rating</span>
                                </div>
                                <span className="font-semibold text-gray-900">4.8 / 5.0</span>
                            </div>
                        </div>
                    </div>*/}
                </div>
            </div>

            {/* Profile Sidebar */}
            <ProfileSidebar />
        </>
    );
};

export default Profile;
