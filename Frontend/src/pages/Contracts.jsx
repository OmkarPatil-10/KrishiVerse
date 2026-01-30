import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, Sprout, FileText, CheckCircle2 } from 'lucide-react';
import { useProfileSidebar } from '../context/ProfileSidebarContext';

const Contracts = () => {
    const navigate = useNavigate();
    const { openSidebar, isOpen: isSidebarOpen } = useProfileSidebar();

    // Mock contract data
    const contracts = [
        {
            id: 'KV001',
            crop: 'Rice',
            quantity: 50,
            buyer: 'AgriCrop Ltd',
            price: 2600,
            deliveryDate: '15 Mar 2024',
            status: 'Active',
            totalValue: 130000
        },
        {
            id: 'KV002',
            crop: 'Rice',
            quantity: 30,
            buyer: 'FoodMart Co',
            price: 2400,
            deliveryDate: '20 Mar 2024',
            status: 'Pending',
            totalValue: 72000
        },
        {
            id: 'KV003',
            crop: 'Rice',
            quantity: 30,
            buyer: 'GrainTech',
            price: 1950,
            deliveryDate: '20 Mar 2024',
            status: 'Negotiation',
            totalValue: 58500
        }
    ];

    const activeCount = contracts.filter(c => c.status === 'Active').length;
    const pendingCount = contracts.filter(c => c.status === 'Pending' || c.status === 'Negotiation').length;
    const totalValue = contracts.reduce((sum, c) => sum + (c.totalValue || 0), 0);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-700';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'Negotiation':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const handleViewDetails = (contract) => {
        navigate(`/contracts/${contract.id}`, { state: { contract } });
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
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Smart Contracts</h1>
                        <button className="text-primary text-sm font-medium hover:text-green-700 transition-colors">
                            + New Contract
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-primary mb-1">{activeCount}</p>
                        <p className="text-sm text-gray-600">Active</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-yellow-600 mb-1">{pendingCount}</p>
                        <p className="text-sm text-gray-600">Pending</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600 mb-1">
                            ₹{(totalValue / 100000).toFixed(1)}L
                        </p>
                        <p className="text-sm text-gray-600">Total Value</p>
                    </div>
                </div>

                {/* Contract List */}
                <div className="space-y-3">
                    {contracts.map((contract) => (
                        <div
                            key={contract.id}
                            className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900">
                                                #{contract.id} {contract.crop} - {contract.quantity} Quintal
                                            </h3>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{contract.buyer}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(contract.status)}`}>
                                    {contract.status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm text-gray-600">Price</p>
                                    <p className="font-semibold text-gray-900">₹{contract.price.toLocaleString()}/quintal</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Delivery</p>
                                    <p className="font-semibold text-gray-900">Delivery: {contract.deliveryDate}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                {contract.status === 'Negotiation' && (
                                    <button
                                        onClick={() => handleViewDetails(contract)}
                                        className="text-primary font-medium hover:text-green-700 transition-colors"
                                    >
                                        Accept
                                    </button>
                                )}
                                <button
                                    onClick={() => handleViewDetails(contract)}
                                    className="text-blue-600 font-medium hover:text-blue-700 transition-colors ml-auto"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Contracts;
