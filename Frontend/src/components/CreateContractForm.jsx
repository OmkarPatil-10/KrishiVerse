import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';

const CreateContractForm = ({ onClose, initialFarmer = '' }) => {
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Contract data:', formData);
        onClose();
    };

    const inputClass =
        'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm';

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
                            <input
                                type="text"
                                name="farmer"
                                value={formData.farmer}
                                onChange={handleChange}
                                placeholder="Sahil Shete - Maharashtra, Raigad"
                                className={inputClass}
                            />
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
