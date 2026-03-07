import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';

const CreateContractForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
        farmer: '',
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
        'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all';

    return (
        /* Overlay — full-screen on mobile, centered backdrop on md+ */
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center md:bg-black/40 md:backdrop-blur-sm">
            {/* Backdrop click to close — only on md+ */}
            <div
                className="hidden md:block fixed inset-0"
                onClick={onClose}
            />

            {/* Form container */}
            <div className="relative z-10 w-full h-full md:h-auto md:max-w-lg lg:max-w-xl md:mx-4 bg-gray-50 md:bg-white md:rounded-2xl md:shadow-2xl overflow-y-auto md:max-h-[90vh]">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 md:px-6 md:py-4 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Create new contract</h2>
                </div>

                {/* Form body */}
                <form onSubmit={handleSubmit} className="px-4 py-5 md:px-6 md:py-6">
                    <div className="bg-blue-50/70 rounded-2xl p-5 md:p-6 space-y-4">
                        {/* Select Farmer */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Farmer</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Crop Type</label>
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
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity (Tons)</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price per Ton (₹)</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Quality Grade</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Farming Method</label>
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
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Date</label>
                            <input
                                type="date"
                                name="deliveryDate"
                                value={formData.deliveryDate}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="mt-6 w-full flex items-center justify-center gap-2 bg-[#2196F3] hover:bg-[#1976D2] active:bg-[#1565C0] text-white font-semibold py-3.5 rounded-full shadow-lg shadow-blue-200 transition-all duration-200"
                    >
                        <Plus className="w-5 h-5" />
                        Create Contract
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateContractForm;
