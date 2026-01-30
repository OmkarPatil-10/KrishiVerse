import { useState } from 'react';
import { Bell, User, Sprout, Mail, Phone, MapPin, Building, Lock, Ruler, Clock, Calendar, FileText, Star, Leaf, Droplets, ChevronRight, Plus, CheckCircle2 } from 'lucide-react';
import ProfileSidebar from '../components/ProfileSidebar';
import { useProfileSidebar } from '../context/ProfileSidebarContext';

const Profile = () => {
    const { openSidebar, isOpen: isSidebarOpen } = useProfileSidebar();
    const [selectedCrops, setSelectedCrops] = useState(['Rice', 'Wheat', 'Corn', 'SugarCane', 'Cotton']);
    const [selectedIrrigation, setSelectedIrrigation] = useState(['Rainfed', 'Tank', 'Canal']);
    const [isOrganic, setIsOrganic] = useState(true);

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
                                <div className="flex items-center gap-3">
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
                    <div className="bg-gradient-to-br from-primary to-green-700 rounded-xl shadow-sm p-6 mb-4 text-white relative">
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
                                        <h2 className="text-2xl font-bold">Omkar Patil</h2>
                                        <button className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                                            <Plus className="w-4 h-4" />
                                            Edit
                                        </button>
                                    </div>
                                    <p className="text-lg opacity-90 mb-4">Farmer</p>
                                </div>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Verified
                            </span>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                <Leaf className="w-4 h-4" />
                                Smart Contract
                            </span>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                <Leaf className="w-4 h-4" />
                                Organic
                            </span>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white/20 rounded-lg p-3 text-center">
                                <p className="text-xl font-bold">15</p>
                                <p className="text-xs opacity-90">Acres</p>
                            </div>
                            <div className="bg-blue-500/30 rounded-lg p-3 text-center">
                                <p className="text-xl font-bold">20</p>
                                <p className="text-xs opacity-90">Years Exp</p>
                            </div>
                            <div className="bg-yellow-500/30 rounded-lg p-3 text-center">
                                <p className="text-xl font-bold">08</p>
                                <p className="text-xs opacity-90">Contracts</p>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information Card */}
                    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900">My Profile</h3>
                            <p className="text-sm text-gray-600">Manage your account information</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <User className="w-5 h-5 text-gray-500" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Full Name</p>
                                    <p className="font-semibold text-gray-900">Omkar Patil</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Mail className="w-5 h-5 text-gray-500" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Email Address</p>
                                    <p className="font-semibold text-gray-900">omkarpati@gmail.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Phone className="w-5 h-5 text-gray-500" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Phone Number</p>
                                    <p className="font-semibold text-gray-900">+91 91671 73584</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <MapPin className="w-5 h-5 text-gray-500" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Address</p>
                                    <p className="font-semibold text-gray-900">Village pen, Tehsil pen</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Building className="w-5 h-5 text-gray-500" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">District</p>
                                    <p className="font-semibold text-gray-900">Raigad</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <MapPin className="w-5 h-5 text-gray-500" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">State</p>
                                    <p className="font-semibold text-gray-900">Maharashtra</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Lock className="w-5 h-5 text-gray-500" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">PIN Code</p>
                                    <p className="font-semibold text-gray-900">402107</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Ruler className="w-5 h-5 text-gray-500" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Farm Size</p>
                                    <p className="font-semibold text-gray-900">15 acres</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Clock className="w-5 h-5 text-gray-500" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Farming Experience</p>
                                    <p className="font-semibold text-gray-900">20 years</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Farming Details Card */}
                    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Leaf className="w-5 h-5 text-primary" />
                                Crop Grown (Multi-Select)
                            </h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-6">
                            {crops.map((crop) => (
                                <button
                                    key={crop}
                                    onClick={() => toggleCrop(crop)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        selectedCrops.includes(crop)
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
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        selectedIrrigation.includes(type)
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
                                    className={`relative w-12 h-6 rounded-full transition-colors ${
                                        isOrganic ? 'bg-primary' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                            isOrganic ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Account Activity Card */}
                    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
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
                    </div>
                </div>
            </div>

            {/* Profile Sidebar */}
            <ProfileSidebar />
        </>
    );
};

export default Profile;
