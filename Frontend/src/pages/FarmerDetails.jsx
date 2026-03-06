import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Star, User, Phone, Mail } from 'lucide-react';

const FarmerDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Mock farmer data - in a real app this would be fetched based on `id`
    const farmer = {
        id: id || 'F001',
        name: 'Omkar Patil',
        verified: true,
        location: 'Maharashtra, Raigad',
        farmSize: '8.5 Acre',
        experience: '09 Years',
        crops: ['Rice', 'Cotton', 'Wheat'],
        phone: '+91 9167173584',
        email: 'omkarpatil@gmail.com',
        rating: 4.5
    };

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
                                {farmer.verified && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 font-medium">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span>{farmer.rating}</span>
                                </div>
                                <span>ID: {farmer.id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Add to Network Button */}
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl mb-6 transition-colors text-base shadow-sm">
                        Add to Network
                    </button>

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
                        <button className="flex-[2] flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm">
                            <span className="text-lg leading-none">+</span> Create Contract
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FarmerDetails;
