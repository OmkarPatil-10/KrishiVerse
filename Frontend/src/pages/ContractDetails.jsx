import { useNavigate, useParams } from 'react-router-dom';
import { Bell, User, Sprout, ArrowLeft, FileText, CheckCircle2, Info, Award, Truck, Download, Headphones, Edit3, Loader2, Shield, MessageCircle, X, Copy, Package, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useProfileSidebar } from '../context/ProfileSidebarContext';
import { useAuth } from '../context/AuthContext';
import { useStateContext } from '../context/index';
import { toast } from 'react-toastify';
import api from '../services/api';
import jsPDF from 'jspdf';
import ChatModal from '../components/ChatModal';
import EditContractModal from '../components/EditContractModal';

const ContractDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { openSidebar, isOpen: isSidebarOpen } = useProfileSidebar();
    const { user } = useAuth();

    // Blockchain context
    const {
        acceptContract: bcAccept,
        rejectContract: bcReject,
        markOutForDelivery: bcMarkOutForDelivery,
        confirmDelivery: bcConfirmDelivery,
        address: walletAddress,
    } = useStateContext();

    const [contract, setContract] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingAction, setProcessingAction] = useState('');
    const [copied, setCopied] = useState(false);

    // Support modal state
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [supportSubject, setSupportSubject] = useState('');
    const [supportMessage, setSupportMessage] = useState('');
    const [sendingSupport, setSendingSupport] = useState(false);

    // Negotiation & Edit Modals state
    const [showChatModal, setShowChatModal] = useState(false);
    const [showEditContractModal, setShowEditContractModal] = useState(false);

    // Determine role
    const userRole = user?.role || user?.userType;
    const isFarmer = userRole === 'farmer';

    // Fetch contract by ID
    useEffect(() => {
        const fetchContract = async () => {
            try {
                setIsLoading(true);
                const response = await api.get(`/contracts/${id}`);
                if (response.data.success) {
                    setContract(response.data.contract);
                }
            } catch (error) {
                console.error('Error fetching contract:', error);
                toast.error('Failed to load contract details');
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchContract();
    }, [id]);

    // Map backend status to display label
    const getStatusLabel = (status) => {
        switch (status) {
            case 'open': return isFarmer ? 'Negotiation' : 'Pending';
            case 'accepted': return 'Active';
            case 'outForDelivery': return 'Out for Delivery';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    // Status helpers
    const isPending = contract?.status === 'open';
    const isActive = contract?.status === 'accepted';
    const isOutForDelivery = contract?.status === 'outForDelivery';
    const isCompleted = contract?.status === 'completed';
    const isCancelled = contract?.status === 'cancelled';
    const bcId = contract?.blockchainContractId;
    const hasBcId = bcId !== undefined && bcId >= 0;

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        if (typeof dateString === 'string' && dateString.includes(' ') && !dateString.includes('T')) return dateString;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getContractId = () => {
        const rawId = contract?._id || contract?.id || '';
        return `KV${rawId.toString().slice(-3).toUpperCase()}`;
    };

    const formatINR = (amount) => {
        if (!amount && amount !== 0) return 'Rs.0';
        return 'Rs.' + Number(amount).toLocaleString('en-IN');
    };

    // ─── FARMER: Accept Contract ───
    const handleAccept = async () => {
        try {
            setIsProcessing(true);
            setProcessingAction('accepting');
            if (hasBcId && walletAddress) {
                await bcAccept(bcId);
            }
            const response = await api.post(`/contracts/${id}/accept`);
            if (response.data.success) {
                setContract(response.data.contract);
                toast.success('Contract accepted!');
            }
        } catch (error) {
            console.error('Error accepting contract:', error);
            toast.error('Failed to accept contract');
        } finally {
            setIsProcessing(false);
            setProcessingAction('');
        }
    };

    // ─── FARMER: Reject Contract ───
    const handleReject = async () => {
        try {
            setIsProcessing(true);
            setProcessingAction('rejecting');
            if (hasBcId && walletAddress) {
                await bcReject(bcId);
            }
            const response = await api.post(`/contracts/${id}/reject`);
            if (response.data.success) {
                setContract(response.data.contract);
                toast.success('Contract rejected. Funds returned to contractor');
            }
        } catch (error) {
            console.error('Error rejecting contract:', error);
            toast.error('Failed to reject contract');
        } finally {
            setIsProcessing(false);
            setProcessingAction('');
        }
    };

    // ─── FARMER: Out for Delivery ───
    const handleOutForDelivery = async () => {
        try {
            setIsProcessing(true);
            setProcessingAction('outForDelivery');
            if (hasBcId && walletAddress) {
                await bcMarkOutForDelivery(bcId);
            }
            const response = await api.post(`/contracts/${id}/out-for-delivery`);
            if (response.data.success) {
                setContract(response.data.contract);
                toast.success('Marked as Out for Delivery');
            }
        } catch (error) {
            console.error('Error marking out for delivery:', error);
            toast.error('Failed to mark out for delivery');
        } finally {
            setIsProcessing(false);
            setProcessingAction('');
        }
    };

    // ─── CONTRACTOR: Confirm Delivery ───
    const handleDeliver = async () => {
        try {
            setIsProcessing(true);
            setProcessingAction('delivering');
            if (hasBcId && walletAddress) {
                await bcConfirmDelivery(bcId);
            }
            const response = await api.post(`/contracts/${id}/deliver`);
            if (response.data.success) {
                setContract(response.data.contract);
                toast.success('Delivery confirmed! Payment released to farmer');
            }
        } catch (error) {
            console.error('Error delivering contract:', error);
            toast.error('Failed to confirm delivery');
        } finally {
            setIsProcessing(false);
            setProcessingAction('');
        }
    };

    // Copy blockchain hash
    const handleCopyHash = () => {
        const hash = contract?.transactionHash || '';
        if (hash) {
            navigator.clipboard.writeText(hash);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getTotalValue = () => {
        if (!contract) return 0;
        return contract.totalBudget || (contract.budgetPerUnit * contract.quantity) || 0;
    };

    const getStatusBadge = () => {
        if (isPending && isFarmer) return 'bg-yellow-100 text-yellow-700';
        if (isPending) return 'bg-orange-100 text-orange-600';
        if (isActive) return 'bg-green-100 text-green-600';
        if (isOutForDelivery) return 'bg-purple-100 text-purple-600';
        if (isCompleted) return 'bg-blue-100 text-blue-600';
        if (isCancelled) return 'bg-red-100 text-red-600';
        return 'bg-gray-100 text-gray-600';
    };

    // ─── Download Contract PDF ───
    const handleDownloadPDF = () => {
        if (!contract) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = 20;

        const addCentered = (text, yPos, size = 12, style = 'normal') => {
            doc.setFontSize(size);
            doc.setFont('helvetica', style);
            doc.text(text, pageWidth / 2, yPos, { align: 'center' });
        };

        const addRow = (label, value, yPos) => {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(80, 80, 80);
            doc.text(label, margin, yPos);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30, 30, 30);
            doc.text(String(value || 'N/A'), margin + 60, yPos);
            return yPos + 8;
        };

        // Header bar
        doc.setFillColor(22, 163, 74);
        doc.rect(0, 0, pageWidth, 35, 'F');
        doc.setTextColor(255, 255, 255);
        addCentered('KrishiVerse', 15, 20, 'bold');
        addCentered('Smart Farming Contract Agreement', 27, 10, 'normal');

        y = 48;
        doc.setTextColor(30, 30, 30);

        // Contract ID and Status
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Contract #${getContractId()}`, margin, y);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Status: ${getStatusLabel(contract.status)}`, pageWidth - margin, y, { align: 'right' });
        y += 5;

        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;

        // Section: Contract Details
        doc.setTextColor(22, 163, 74);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Contract Details', margin, y);
        y += 10;

        y = addRow('Crop Name:', contract.cropName, y);
        y = addRow('Quantity:', `${contract.quantity} ${contract.quantityUnit || 'quintal'}`, y);
        y = addRow('Price/Unit:', `Rs.${contract.budgetPerUnit?.toLocaleString('en-IN')}/quintal`, y);
        y = addRow('Total Value:', `Rs.${getTotalValue().toLocaleString('en-IN')}`, y);
        y = addRow('Contract Date:', formatDate(contract.createdAt), y);
        y = addRow('Delivery Date:', formatDate(contract.expectedDeliveryDate), y);
        y += 5;

        // Section: Parties
        doc.setTextColor(22, 163, 74);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Parties Involved', margin, y);
        y += 10;

        y = addRow('Buyer:', contract.buyerName || 'N/A', y);
        y = addRow('Farmer:', contract.acceptedBy?.farmerName || 'Not assigned', y);
        y = addRow('Contact:', contract.contactPhone || 'Not provided', y);
        const loc = contract.location;
        y = addRow('Location:', `${loc?.city || ''} ${loc?.state || ''}`.trim() || 'Not specified', y);
        y += 5;

        // Section: Quality
        doc.setTextColor(22, 163, 74);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Quality Specifications', margin, y);
        y += 10;

        y = addRow('Quality:', contract.qualityRequirements || 'Grade A, Moisture < 12%', y);
        y = addRow('Farming Method:', contract.farmingMethod || 'Certified Organic Farm', y);
        y += 5;

        // Blockchain info
        if (contract.transactionHash) {
            doc.setTextColor(22, 163, 74);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Blockchain Verification', margin, y);
            y += 10;

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            doc.text(`Tx Hash: ${contract.transactionHash}`, margin, y);
            y += 6;
            doc.text('This contract is secured on the Ethereum blockchain and is immutable.', margin, y);
            y += 10;
        }

        // Footer
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        addCentered(`Generated on ${new Date().toLocaleString('en-IN')} - KrishiVerse Platform`, y);
        y += 5;
        addCentered('This is a digitally generated contract document.', y);

        doc.save(`KrishiVerse_Contract_${getContractId()}.pdf`);
        toast.success('Contract PDF downloaded!');
    };

    // ─── Send Support Query ───
    const handleSendSupport = async () => {
        if (!supportSubject.trim() || !supportMessage.trim()) {
            toast.error('Please fill in both subject and message');
            return;
        }
        try {
            setSendingSupport(true);
            const res = await api.post('/support', {
                userName: user?.name,
                userEmail: user?.email,
                userRole: userRole,
                contractId: getContractId(),
                subject: supportSubject,
                message: supportMessage,
            });
            if (res.data.success) {
                toast.success('Support query sent! We will get back to you soon');
                setShowSupportModal(false);
                setSupportSubject('');
                setSupportMessage('');
            }
        } catch (error) {
            console.error('Error sending support query:', error);
            toast.error('Failed to send support query. Please try again.');
        } finally {
            setSendingSupport(false);
        }
    };

    // Processing button helper
    const ActionButton = ({ onClick, disabled, color, icon: Icon, label, loadingLabel }) => (
        <button
            onClick={onClick}
            disabled={isProcessing || disabled}
            className={`w-full ${color} text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed`}
        >
            {isProcessing && processingAction === loadingLabel?.toLowerCase()?.replace(/\s/g, '') ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Confirm in MetaMask...
                </>
            ) : (
                <>
                    <Icon className="w-5 h-5" />
                    {label}
                </>
            )}
        </button>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500 text-lg">Contract not found</p>
                <button onClick={() => navigate('/contracts')} className="text-blue-600 font-semibold hover:underline">
                    Back to Contracts
                </button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isFarmer ? 'bg-green-50/60' : 'bg-blue-50/60'} pb-24 md:pb-6`}>
            {/* Top Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10 md:relative md:shadow-none">
                <div className="px-4 py-3 md:px-6 md:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 ${isFarmer ? 'bg-green-600' : 'bg-blue-500'} rounded-full flex items-center justify-center`}>
                                <Sprout className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex items-center gap-2 md:hidden">
                                <span className={`text-lg font-bold ${isFarmer ? 'text-green-700' : 'text-blue-600'}`}>KrishiVerse</span>
                                {!isFarmer && (
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                        Contractor
                                    </span>
                                )}
                            </div>
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

            {/* Back + Title */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 md:px-6">
                <div className="flex items-center gap-3 max-w-4xl mx-auto">
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
            <div className="px-4 py-4 md:px-6 md:py-6 max-w-4xl mx-auto">
                <div className="lg:grid lg:grid-cols-2 lg:gap-5">

                    {/* Contract Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-4 border border-gray-100">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold text-gray-900">#{getContractId()}</h2>
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        </div>
                                        <p className="text-gray-500 text-sm mt-0.5">
                                            {contract.cropName || 'Crop'} - {contract.quantity} Quintal
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusBadge()}`}>
                                    {getStatusLabel(contract.status)}
                                </span>
                            </div>

                            {/* Total Value */}
                            <div className="bg-blue-50 rounded-xl p-4 text-center">
                                <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                                    {formatINR(getTotalValue())}
                                </p>
                                <p className="text-sm text-blue-600 font-medium">Total contract value</p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="w-5 h-5 text-blue-500" />
                            <h3 className="text-lg font-bold text-gray-900">Basic information</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Buyer</p>
                                <p className="font-semibold text-gray-900 text-sm">{contract.buyerName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Farmer</p>
                                <p className="font-semibold text-gray-900 text-sm">{contract.acceptedBy?.farmerName || 'Not assigned'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Delivery Date</p>
                                <p className="font-semibold text-gray-900 text-sm">{formatDate(contract.expectedDeliveryDate)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Contract Date</p>
                                <p className="font-semibold text-gray-900 text-sm">{formatDate(contract.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Location</p>
                                <p className="font-semibold text-gray-900 text-sm">
                                    {contract.location?.state || 'Not specified'}{contract.location?.city && contract.location.city !== 'Not specified' ? `, ${contract.location.city}` : ''}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Price per Quintal</p>
                                <p className="font-semibold text-gray-900 text-sm">{formatINR(contract.budgetPerUnit)}/quintal</p>
                            </div>
                        </div>
                    </div>

                    {/* Quality Specifications */}
                    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Award className="w-5 h-5 text-green-600" />
                            <h3 className="text-lg font-bold text-gray-900">Quality Specifications</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Quality Standards</p>
                                <p className="font-semibold text-gray-900 text-sm">
                                    {contract.qualityRequirements || 'Grade A, Moisture < 12%'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Farming Method</p>
                                <p className="font-semibold text-gray-900 text-sm">
                                    {contract.farmingMethod || 'Certified Organic Farm'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Blockchain Security Card */}
                {contract?.transactionHash && (
                    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-4 border border-gray-100 max-w-4xl mx-auto">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="w-5 h-5 text-orange-500" />
                            <h3 className="text-lg font-bold text-gray-900">Blockchain Security</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Contract Hash</p>
                                    <p className="text-sm text-gray-600 font-mono break-all">
                                        {contract.transactionHash}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCopyHash}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2 shrink-0"
                                >
                                    {copied ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <Copy className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-green-700">
                                <Shield className="w-4 h-4" />
                                <p className="text-sm font-medium">Secured on blockchain | Immutable | Transparent</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 max-w-4xl mx-auto lg:max-w-md lg:mx-auto mt-2">

                    {/* FARMER: Pending - Accept / Reject */}
                    {isFarmer && isPending && (
                        <>
                            <ActionButton
                                onClick={handleAccept}
                                color="bg-green-600 hover:bg-green-700 shadow-green-200"
                                icon={CheckCircle2}
                                label="Accept Contract"
                                loadingLabel="accepting"
                            />
                            <ActionButton
                                onClick={() => setShowChatModal(true)}
                                color="bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                                icon={MessageCircle}
                                label="Negotiate"
                                loadingLabel="negotiating"
                            />
                            <ActionButton
                                onClick={handleReject}
                                color="bg-red-500 hover:bg-red-600 shadow-red-200"
                                icon={X}
                                label="Reject Contract"
                                loadingLabel="rejecting"
                            />
                        </>
                    )}

                    {/* FARMER: Active - Out for Delivery */}
                    {isFarmer && isActive && (
                        <ActionButton
                            onClick={handleOutForDelivery}
                            color="bg-purple-600 hover:bg-purple-700 shadow-purple-200"
                            icon={Package}
                            label="Out for Delivery"
                            loadingLabel="outfordelivery"
                        />
                    )}

                    {/* CONTRACTOR: Pending - Edit / Negotiate */}
                    {!isFarmer && isPending && (
                        <>
                            <ActionButton
                                onClick={() => setShowEditContractModal(true)}
                                color="bg-[#2196F3] hover:bg-[#1E88E5] shadow-blue-200"
                                icon={Edit3}
                                label="Edit Contract"
                                loadingLabel="editing"
                            />
                            <ActionButton
                                onClick={() => setShowChatModal(true)}
                                color="bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                                icon={MessageCircle}
                                label="Negotiate (Chat)"
                                loadingLabel="negotiating"
                            />
                        </>
                    )}

                    {/* CONTRACTOR: Out for Delivery - Delivered */}
                    {!isFarmer && isOutForDelivery && (
                        <ActionButton
                            onClick={handleDeliver}
                            color="bg-[#2196F3] hover:bg-[#1E88E5] shadow-blue-200"
                            icon={Truck}
                            label="Delivered"
                            loadingLabel="delivering"
                        />
                    )}

                    {/* Download + Support - always visible */}
                    <button
                        onClick={handleDownloadPDF}
                        className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Download Contract
                    </button>
                    <button
                        onClick={() => setShowSupportModal(true)}
                        className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        <Headphones className="w-5 h-5" />
                        Contact Support
                    </button>
                </div>
            </div>

            {/* Support Modal */}
            {showSupportModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Headphones className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-bold text-gray-900">Contact Support</h3>
                            </div>
                            <button
                                onClick={() => setShowSupportModal(false)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-5">
                            <div className="bg-gray-50 rounded-xl p-3 mb-4">
                                <p className="text-xs text-gray-500 mb-1">Contract</p>
                                <p className="text-sm font-semibold text-gray-800">
                                    #{getContractId()} - {contract.cropName} ({contract.quantity} {contract.quantityUnit || 'quintal'})
                                </p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
                                <input
                                    type="text"
                                    value={supportSubject}
                                    onChange={(e) => setSupportSubject(e.target.value)}
                                    placeholder="e.g. Delivery issue, Payment query"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                />
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Message *</label>
                                <textarea
                                    value={supportMessage}
                                    onChange={(e) => setSupportMessage(e.target.value)}
                                    rows={4}
                                    placeholder="Describe your issue or query in detail..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
                                />
                            </div>
                            <button
                                onClick={handleSendSupport}
                                disabled={sendingSupport || !supportSubject.trim() || !supportMessage.trim()}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sendingSupport ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Query
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-gray-400 text-center mt-3">
                                Your query will be sent to the KrishiVerse admin team
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Negotiation & Edit Modals */}
            <ChatModal 
                isOpen={showChatModal} 
                onClose={() => setShowChatModal(false)}
                contractId={contract._id || contract.id}
                currentUser={user}
                contractData={contract}
            />
            
            <EditContractModal
                isOpen={showEditContractModal}
                onClose={() => setShowEditContractModal(false)}
                contract={contract}
                onUpdateSuccess={(updatedContract) => setContract(updatedContract)}
            />
        </div>
    );
};

export default ContractDetails;
