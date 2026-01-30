import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, Sprout, ArrowLeft, FileText, CheckCircle2, Info, Award, Shield, Truck, Download, Headphones, MessageCircle, X, Copy } from 'lucide-react';
import { useState } from 'react';
import { useProfileSidebar } from '../context/ProfileSidebarContext';

const ContractDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { openSidebar, isOpen: isSidebarOpen } = useProfileSidebar();
    const contract = location.state?.contract || {
        id: 'KV001',
        crop: 'Rice',
        quantity: 50,
        buyer: 'AgriCorp Ltd',
        price: 2600,
        deliveryDate: '15 May 2026',
        contractDate: '01 Jan 2026',
        location: 'Maharashtra, India',
        paymentTerms: '45 days after delivery',
        status: 'Active',
        totalValue: 130000,
        qualityStandards: 'Grade A, Moisture < 12%',
        farmingMethod: 'Certified Organic Farm',
        contractHash: '0x1a2b3c45di30gd5e6f7890abcdef1234567890'
    };

    const [copied, setCopied] = useState(false);

    const isActive = contract.status === 'Active';
    const isNegotiation = contract.status === 'Negotiation';

    const handleCopyHash = () => {
        navigator.clipboard.writeText(contract.contractHash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        // If it's already formatted (like "15 Mar 2024"), return as is
        if (dateString.includes(' ')) return dateString;
        // Otherwise format it
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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
                </div>
            </div>

            {/* Page Header with Back Button */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 md:px-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/contracts')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Contract Details</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
                {/* Contract Summary Card */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-gray-900">#{contract.id}</h2>
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-gray-600 mt-1">
                                    {contract.crop} - {contract.quantity} Quintal
                                </p>
                            </div>
                        </div>
                        <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                isActive
                                    ? 'bg-green-100 text-green-700'
                                    : isNegotiation
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-yellow-100 text-yellow-700'
                            }`}
                        >
                            {contract.status}
                        </span>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-gray-900 mb-1">
                            ₹{contract.totalValue?.toLocaleString() || (contract.price * contract.quantity).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Total contract value</p>
                    </div>
                </div>

                {/* Basic Information Card */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold text-gray-900">Basic information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Buyer</p>
                            <p className="font-semibold text-gray-900">{contract.buyer}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Price per Quintal</p>
                            <p className="font-semibold text-gray-900">₹{contract.price.toLocaleString()}/quintal</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Delivery Date</p>
                            <p className="font-semibold text-gray-900">{formatDate(contract.deliveryDate)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Contract Date</p>
                            <p className="font-semibold text-gray-900">{formatDate(contract.contractDate || '01 Jan 2026')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Location</p>
                            <p className="font-semibold text-gray-900">{contract.location || 'Maharashtra, India'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Payment Terms</p>
                            <p className="font-semibold text-gray-900">
                                {contract.paymentTerms || (isActive ? '45 days after delivery' : '30 days after delivery')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quality Specifications Card */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold text-gray-900">Quality Specifications</h3>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Quality Standards</p>
                            <p className="font-semibold text-gray-900">
                                {contract.qualityStandards || 'Grade A, Moisture < 12%'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Farming Method</p>
                            <p className="font-semibold text-gray-900">
                                {contract.farmingMethod || 'Certified Organic Farm'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Blockchain Security Card */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-orange-500" />
                        <h3 className="text-lg font-bold text-gray-900">Blockchain Security</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 font-mono">
                                {contract.contractHash || '0x1a2b3c45di30gd5e6f7890abcdef1234567890'}
                            </p>
                            <button
                                onClick={handleCopyHash}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                {copied ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                    <Copy className="w-5 h-5 text-gray-600" />
                                )}
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-green-700">
                            <Shield className="w-4 h-4" />
                            <p className="text-sm font-medium">Secured on blockchain • Immutable • Transparent</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {isActive ? (
                    <div className="space-y-3">
                        <button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                            <Truck className="w-5 h-5" />
                            Out for Delivery
                        </button>
                        <button className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                            <Download className="w-5 h-5" />
                            Download Contract
                        </button>
                        <button className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                            <Headphones className="w-5 h-5" />
                            Contact Support
                        </button>
                    </div>
                ) : isNegotiation ? (
                    <div className="space-y-3">
                        <button className="w-full bg-primary hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                            <CheckCircle2 className="w-5 h-5" />
                            Accept Contract
                        </button>
                        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                            <MessageCircle className="w-5 h-5" />
                            Negotiate
                        </button>
                        <button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                            <X className="w-5 h-5" />
                            Reject Contract
                        </button>
                        <button className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                            <Download className="w-5 h-5" />
                            Download Contract
                        </button>
                        <button className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                            <Headphones className="w-5 h-5" />
                            Contact Support
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default ContractDetails;

