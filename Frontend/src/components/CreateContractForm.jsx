import { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import api from '../services/api';

const CreateContractForm = ({ onClose, initialFarmer = '' }) => {
    const [farmers, setFarmers] = useState([]);
    const [loadingFarmers, setLoadingFarmers] = useState(true);

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

    // Fetch farmers list
    useEffect(() => {
        const fetchFarmers = async () => {
            try {
                const response = await api.get('/users/farmers');
                if (response.data.success && response.data.data.length > 0) {
                    const formatted = response.data.data.map(f => ({
                        id: f._id,
                        name: f.name,
                        location: f.location || 'Unknown',
                        crops: f.cropsInterested || [],
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
                { id: 'F001', name: 'Omkar Patil', location: 'Maharashtra', crops: ['Rice', 'Wheat', 'Cotton'] },
                { id: 'F003', name: 'Sahil Shete', location: 'Maharashtra', crops: ['Rice', 'Wheat'] },
                { id: 'F004', name: 'Ayush Rokade', location: 'Punjab', crops: ['Rice', 'Corn', 'Cotton'] },
                { id: 'F005', name: 'Vaibhav Shedge', location: 'Telangana', crops: ['Rice', 'Wheat', 'Cotton'] },
            ]);
        };

        fetchFarmers();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Find the selected farmer's full details
        const selectedFarmer = farmers.find(f => f.id === formData.farmer);
        console.log('Contract data:', { ...formData, farmerDetails: selectedFarmer });
        onClose();
    };

    const inputClass =
        'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm';

    const selectClass =
        'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer';

    return (
        /* Overlay — full-screen on mobile, centered backdrop on md+ */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            {/* Backdrop click to close */}
            <div
                className="fixed inset-0"
                onClick={onClose}
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
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 bg-[#2196F3] hover:bg-[#1E88E5] active:bg-[#1976D2] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 text-lg"
                            >
                                <Plus className="w-6 h-6 stroke-[3]" />
                                Create Contract
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateContractForm;
