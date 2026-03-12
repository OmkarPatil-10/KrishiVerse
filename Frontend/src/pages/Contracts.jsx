import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, Sprout, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import { useProfileSidebar } from '../context/ProfileSidebarContext';
import { useAuth } from '../context/AuthContext';
import CreateContractForm from '../components/CreateContractForm';
import api from '../services/api';
import { toast } from 'react-toastify';

const Contracts = () => {
    const navigate = useNavigate();
    const { openSidebar, isOpen: isSidebarOpen } = useProfileSidebar();
    const { user } = useAuth();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [contracts, setContracts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');

    // Determine role
    const userRole = user?.role || user?.userType;
    const isFarmer = userRole === 'farmer';
    const isContractor = userRole === 'contractor' || userRole === 'buyer';

    // Fetch contracts from API
    const fetchContracts = async () => {
        try {
            setIsLoading(true);
            const url = isFarmer
                ? `/contracts?farmerId=${user?._id || user?.id}`
                : `/contracts?buyerId=${user?._id || user?.id}`;
            const response = await api.get(url);
            if (response.data.success) {
                setContracts(response.data.contracts || []);
            }
        } catch (error) {
            console.error('Error fetching contracts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    // Re-fetch when form closes (new contract may have been created)
    const handleFormClose = () => {
        setShowCreateForm(false);
        fetchContracts();
    };

    // Map backend status → UI label
    const getStatusLabel = (status) => {
        switch (status) {
            case 'open': return 'Pending';
            case 'accepted': return 'Active';
            case 'outForDelivery': return 'Out for Delivery';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'open': return 'bg-orange-100 text-orange-600';
            case 'accepted': return 'bg-green-100 text-green-600';
            case 'outForDelivery': return 'bg-purple-100 text-purple-600';
            case 'completed': return 'bg-blue-100 text-blue-600';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Filter logic
    const filteredContracts = contracts.filter(c => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Pending') return c.status === 'open';
        if (activeFilter === 'Active') return c.status === 'accepted';
        if (activeFilter === 'Completed') return c.status === 'completed';
        return true;
    });

    // Stats for farmer view
    const farmerStats = {
        active: contracts.filter(c => c.status === 'accepted').length,
        pending: contracts.filter(c => c.status === 'open').length,
        totalValue: contracts
            .filter(c => c.status !== 'cancelled' && c.status !== 'open')
            .reduce((sum, c) => sum + (c.totalBudget || c.budgetPerUnit * c.quantity || 0), 0),
    };

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Generate contract display ID
    const getContractId = (contract) => {
        const id = contract._id || contract.id || '';
        return `KV${id.toString().slice(-3).toUpperCase()}`;
    };

    // Farmer accepts a contract from the list
    const handleAccept = async (contractId, e) => {
        e.stopPropagation();
        try {
            const response = await api.post(`/contracts/${contractId}/accept`);
            if (response.data.success) {
                toast.success('Contract accepted! ✅');
                fetchContracts();
            }
        } catch (error) {
            console.error('Error accepting contract:', error);
            toast.error('Failed to accept contract');
        }
    };

    const filters = ['All', 'Active', 'Pending', 'Completed'];

    // ─────────────────── FARMER VIEW ───────────────────
    if (isFarmer) {
        return (
            <div className="min-h-screen bg-green-50/60 pb-24 md:pb-6">
                {/* Top Header */}
                <div className="bg-white shadow-sm sticky top-0 z-10 md:relative md:shadow-none">
                    <div className="px-4 py-3 md:px-6 md:py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                    <Sprout className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-lg font-bold text-green-700 md:hidden">KrishiVerse</span>
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

                {/* Main Content */}
                <div className="px-4 py-4 md:px-6 md:py-6 max-w-4xl mx-auto">
                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Smart Contracts</h1>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                            <p className="text-2xl md:text-3xl font-bold text-green-600 mb-1">{farmerStats.active}</p>
                            <p className="text-xs text-gray-500 font-medium">Active</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                            <p className="text-2xl md:text-3xl font-bold text-orange-500 mb-1">{farmerStats.pending}</p>
                            <p className="text-xs text-gray-500 font-medium">Pending</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                            <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                                ₹{farmerStats.totalValue >= 100000
                                    ? `${(farmerStats.totalValue / 100000).toFixed(1)}L`
                                    : farmerStats.totalValue.toLocaleString('en-IN')}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">Total Value</p>
                        </div>
                    </div>

                    {/* Contract List */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-16">
                            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                        </div>
                    ) : filteredContracts.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                            <p className="text-gray-500 text-lg mb-2">No contracts found</p>
                            <p className="text-gray-400 text-sm">Contracts assigned to you will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredContracts.map((contract) => (
                                <div
                                    key={contract._id || contract.id}
                                    className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100"
                                >
                                    {/* Header: ID + Status */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                                                <Sprout className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-gray-900">#{getContractId(contract)}</h3>
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {contract.cropName || 'Crop'} - {contract.quantity} Quintal
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusStyle(contract.status)}`}>
                                            {getStatusLabel(contract.status)}
                                        </span>
                                    </div>

                                    {/* Buyer + Price */}
                                    <div className="grid grid-cols-2 gap-3 mt-3 mb-3">
                                        <div>
                                            <p className="text-xs text-gray-400">Buyer</p>
                                            <p className="font-semibold text-gray-900 text-sm">{contract.buyerName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Price</p>
                                            <p className="font-semibold text-gray-900 text-sm">
                                                ₹{contract.budgetPerUnit?.toLocaleString('en-IN')}/quintal
                                            </p>
                                        </div>
                                    </div>

                                    {/* Delivery + Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <p className="text-xs text-gray-500">
                                            📅 Delivery: {formatDate(contract.expectedDeliveryDate)}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => navigate(`/contracts/${contract._id || contract.id}`)}
                                                className="text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
                                            >
                                                View Details
                                            </button>
                                            {/* Accept button for pending/open contracts */}
                                            {contract.status === 'open' && (
                                                <button
                                                    onClick={(e) => handleAccept(contract._id || contract.id, e)}
                                                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Accept
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─────────────────── CONTRACTOR VIEW (existing) ───────────────────
    return (
        <div className="min-h-screen bg-blue-50 pb-20 md:pb-6">
            {/* Create Contract Form Popup */}
            {showCreateForm && (
                <CreateContractForm onClose={handleFormClose} />
            )}

            {/* Top Header Section - Mobile */}
            <div className="bg-white shadow-sm sticky top-0 z-10 md:hidden">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <Sprout className="w-5 h-5 text-white" />
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
                                <Bell className="w-5 h-5 text-gray-600 cursor-pointer" />
                                <button onClick={openSidebar}>
                                    <User className="w-5 h-5 text-gray-600 cursor-pointer" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
                {/* Title + New Contract */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Contracts</h1>
                        <p className="text-sm text-gray-500">See all your contracts</p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200 transition-all"
                    >
                        <Plus className="w-5 h-5 text-white stroke-[3]" />
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${activeFilter === filter
                                ? 'bg-blue-500 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Contract List */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : filteredContracts.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <p className="text-gray-500 text-lg mb-2">No contracts found</p>
                        <p className="text-gray-400 text-sm">Create your first contract to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredContracts.map((contract) => (
                            <div
                                key={contract._id || contract.id}
                                className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                {/* Header: Farmer name + status */}
                                <div className="flex items-start justify-between mb-1">
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="font-bold text-gray-900">
                                                {contract.acceptedBy?.farmerName || contract.buyerName || 'Unknown'}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(contract.status)}`}>
                                                {getStatusLabel(contract.status)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">Contract ID: {getContractId(contract)}</p>
                                    </div>
                                </div>

                                {/* Crop / Quantity / Price row */}
                                <div className="grid grid-cols-3 gap-3 mt-3 mb-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Crop</p>
                                        <p className="font-bold text-gray-900">{contract.cropName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Quantity</p>
                                        <p className="font-bold text-gray-900">
                                            {contract.quantity || 0} {contract.quantityUnit || 'Quintal'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Price</p>
                                        <p className="font-bold text-blue-600">
                                            ₹{(contract.totalBudget || contract.budgetPerUnit * contract.quantity || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Delivery + View Details */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">
                                        📅 Delivery: {formatDate(contract.expectedDeliveryDate)}
                                    </p>
                                    <button
                                        onClick={() => navigate(`/contracts/${contract._id || contract.id}`)}
                                        className="text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Contracts;
