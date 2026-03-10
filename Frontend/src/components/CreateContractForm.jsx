import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useStateContext } from '../context/index';

const CreateContractForm = ({ onClose, initialFarmer = '' }) => {
    const { user } = useAuth();
    const { createKrishiContract, address } = useStateContext();

    const [farmers, setFarmers] = useState([]);
    const [loadingFarmers, setLoadingFarmers] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStep, setSubmitStep] = useState(''); // 'blockchain' | 'mongodb' | ''

    const [formData, setFormData] = useState({
        farmer: initialFarmer,
        cropType: '',
        quantity: '',
        pricePerTon: '',
        qualityGrade: '',
        farmingMethod: '',
        startDate: '',
        endDate: '',
        deliveryDate: '',
    });

    // Fetch farmers list (includes walletAddress)
    useEffect(() => {
        const fetchFarmers = async () => {
            try {
                const response = await api.get('/users/network/my');
                if (response.data.success && response.data.data.length > 0) {
                    const formatted = response.data.data.map(f => ({
                        id: f._id,
                        name: f.name,
                        location: f.location || 'Unknown',
                        crops: f.cropsInterested || [],
                        walletAddress: f.walletAddress || '',
                    }));
                    setFarmers(formatted);
                } else {
                    loadMockFarmers();
                }
            } catch (error) {
                console.error('Error fetching farmers:', error);
                loadMockFarmers();
            } finally {
                setLoadingFarmers(false);
            }
        };

        const loadMockFarmers = () => {
            setFarmers([
                { id: 'F001', name: 'Omkar Patil', location: 'Maharashtra', crops: ['Rice', 'Wheat', 'Cotton'], walletAddress: '' },
                { id: 'F003', name: 'Sahil Shete', location: 'Maharashtra', crops: ['Rice', 'Wheat'], walletAddress: '' },
                { id: 'F004', name: 'Ayush Rokade', location: 'Punjab', crops: ['Rice', 'Corn', 'Cotton'], walletAddress: '' },
                { id: 'F005', name: 'Vaibhav Shedge', location: 'Telangana', crops: ['Rice', 'Wheat', 'Cotton'], walletAddress: '' },
            ]);
        };

        fetchFarmers();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Find the selected farmer
        const selectedFarmer = farmers.find(f => f.id === formData.farmer);
        if (!selectedFarmer) {
            toast.error('Please select a farmer');
            return;
        }

        if (!formData.quantity || !formData.pricePerTon) {
            toast.error('Quantity and Price per Ton are required');
            return;
        }

        setIsSubmitting(true);

        try {
            // ===== STEP 1: Blockchain Transaction =====
            let txHash = '';
            let blockchainContractId = -1;
            if (selectedFarmer.walletAddress && address) {
                setSubmitStep('blockchain');
                console.log('📦 Step 1: Creating contract on blockchain...');

                const txData = await createKrishiContract({
                    farmer: selectedFarmer.walletAddress,
                    cropName: formData.cropType,
                    quantity: Number(formData.quantity),
                    pricePerTon: Number(formData.pricePerTon),
                });

                // Extract transaction hash from blockchain response
                txHash = txData?.receipt?.transactionHash || txData?.hash || '';

                // Extract blockchain contract ID from event logs
                // The ContractCreated event emits the contract ID as first indexed param
                try {
                    const event = txData?.receipt?.events?.find(e => e.event === 'ContractCreated');
                    if (event?.args?.id) {
                        blockchainContractId = event.args.id.toNumber();
                    }
                } catch (e) {
                    console.log('Could not extract blockchain contract ID from event:', e);
                }

                console.log('✅ Blockchain contract created! Tx Hash:', txHash, 'Contract ID:', blockchainContractId);
            } else {
                console.log('⚠️ Skipping blockchain (no wallet connected or farmer has no wallet)');
            }

            // ===== STEP 2: MongoDB via Backend API =====
            setSubmitStep('mongodb');
            console.log('💾 Step 2: Saving contract to MongoDB...');

            const contractPayload = {
                buyerId: user?._id || user?.id || 'unknown',
                buyerName: user?.name || 'Unknown Contractor',
                cropName: formData.cropType,
                quantity: Number(formData.quantity),
                quantityUnit: 'Quintal',
                budgetPerUnit: Number(formData.pricePerTon),
                qualityRequirements: formData.qualityGrade || 'Grade A, Moisture < 12%',
                farmingMethod: formData.farmingMethod || 'Certified Organic Farm',
                expectedDeliveryDate: formData.deliveryDate || undefined,
                transactionHash: txHash,
                blockchainContractId: blockchainContractId,
                location: {
                    city: selectedFarmer.location || 'Not specified',
                    state: selectedFarmer.location || 'Not specified',
                },
                // Store farmer reference
                acceptedBy: {
                    farmerId: selectedFarmer.id,
                    farmerName: selectedFarmer.name,
                },
            };

            const response = await api.post('/contracts', contractPayload);

            if (response.data.success) {
                console.log('✅ Contract saved to MongoDB:', response.data);
                toast.success('Contract created successfully! 🌾');
            } else {
                throw new Error(response.data.message || 'Failed to save contract');
            }

            onClose();
        } catch (error) {
            console.error('❌ Contract creation failed:', error);

            if (submitStep === 'blockchain') {
                toast.error('Blockchain transaction failed. Contract not created.');
            } else {
                toast.error('Failed to save contract to database.');
            }
        } finally {
            setIsSubmitting(false);
            setSubmitStep('');
        }
    };

    const inputClass =
        'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm';

    const selectClass =
        'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer';

    return (
        /* Overlay — full-screen on mobile, centered backdrop on md+ */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            {/* Backdrop click to close (disabled during submit) */}
            <div
                className="fixed inset-0"
                onClick={isSubmitting ? undefined : onClose}
            />

            {/* Form container */}
            <div className="relative z-10 w-full max-w-sm bg-white rounded-[32px] overflow-hidden border-2 border-blue-400 shadow-2xl animate-in fade-in zoom-in duration-200">

                {/* Scrollable Form Body */}
                <div className="max-h-[90vh] overflow-y-auto px-6 py-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Select Farmer */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Select Farmer</label>
                            <div className="relative">
                                <select
                                    name="farmer"
                                    value={formData.farmer}
                                    onChange={handleChange}
                                    className={selectClass}
                                    required
                                    disabled={isSubmitting}
                                >
                                    <option value="" disabled>
                                        {loadingFarmers ? 'Loading farmers...' : '-- Choose a farmer --'}
                                    </option>
                                    {farmers.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name} — {f.location}
                                        </option>
                                    ))}
                                </select>
                                {/* Custom chevron */}
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Crop Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Crop Type</label>
                            <input
                                type="text"
                                name="cropType"
                                value={formData.cropType}
                                onChange={handleChange}
                                placeholder="Rice"
                                className={inputClass}
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Quantity + Price — side by side */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Quantity (Tons)</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    placeholder="30"
                                    className={inputClass}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Price per Ton (₹)</label>
                                <input
                                    type="number"
                                    name="pricePerTon"
                                    value={formData.pricePerTon}
                                    onChange={handleChange}
                                    placeholder="28000"
                                    className={inputClass}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Quality Grade */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Quality Grade</label>
                            <input
                                type="text"
                                name="qualityGrade"
                                value={formData.qualityGrade}
                                onChange={handleChange}
                                placeholder="Grade A"
                                className={inputClass}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Farming Method */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Farming Method</label>
                            <input
                                type="text"
                                name="farmingMethod"
                                value={formData.farmingMethod}
                                onChange={handleChange}
                                placeholder="Certified Organic Farm"
                                className={inputClass}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Start Date + End Date — side by side */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className={inputClass}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className={inputClass}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Delivery Date */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Delivery Date</label>
                            <input
                                type="date"
                                name="deliveryDate"
                                value={formData.deliveryDate}
                                onChange={handleChange}
                                className={inputClass}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 text-lg ${isSubmitting
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-[#2196F3] hover:bg-[#1E88E5] active:bg-[#1976D2]'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {submitStep === 'blockchain'
                                            ? 'Confirm in MetaMask...'
                                            : 'Saving to Database...'}
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-6 h-6 stroke-[3]" />
                                        Create Contract
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Wallet connection hint */}
                        {!address && (
                            <p className="text-xs text-amber-600 text-center">
                                ⚠️ Wallet not connected. Contract will be saved to database only (no blockchain).
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateContractForm;
