import { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useStateContext } from '../context';

const EditContractModal = ({ isOpen, onClose, contract, onUpdateSuccess }) => {
    // Contract data to edit: quantity, budgetPerUnit, expectedDeliveryDate
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const { updateContract: bcUpdateContract, address: walletAddress } = useStateContext();

    useEffect(() => {
        if (contract && isOpen) {
            setQuantity(contract.quantity || '');
            setPrice(contract.budgetPerUnit || '');
            if (contract.expectedDeliveryDate) {
                const d = new Date(contract.expectedDeliveryDate);
                setDeliveryDate(d.toISOString().split('T')[0]);
            }
        }
    }, [contract, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!quantity || !price || !deliveryDate) {
            toast.error('Please fill all fields');
            return;
        }

        try {
            setIsSaving(true);
            const numQuantity = Number(quantity);
            const numPrice = Number(price);

            // Step 1: Update on Blockchain (only if there's an existing smart contract)
            const bcId = contract.blockchainContractId;
            if (bcId !== undefined && bcId >= 0 && walletAddress) {
                // Check if price or quantity changed - both affect the on-chain total
                if (numPrice !== Number(contract.budgetPerUnit) || numQuantity !== Number(contract.quantity)) {
                    await bcUpdateContract(bcId, numPrice, numQuantity);
                }
            }

            // Step 2: Update in MongoDB
            const updatePayload = {
                quantity: numQuantity,
                budgetPerUnit: numPrice,
                expectedDeliveryDate: deliveryDate
            };

            const res = await api.put(`/contracts/${contract._id || contract.id}`, updatePayload);

            if (res.data.success) {
                toast.success('Contract updated successfully!');
                onUpdateSuccess(res.data.contract);
                onClose();
            }

        } catch (error) {
            console.error('Error updating contract:', error);
            toast.error(error?.reason || 'Failed to update contract');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Edit Contract</h3>
                    <button onClick={onClose} disabled={isSaving} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity ({contract?.quantityUnit || 'Quintal'})</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price per {contract?.quantityUnit || 'Quintal'} (₹)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
                            <input
                                type="date"
                                required
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Disclaimer about Blockchain */}
                    {contract?.transactionHash && (
                        <div className="mt-4 bg-orange-50 text-orange-800 text-xs p-3 rounded-lg border border-orange-100">
                            <p><strong>Note:</strong> Modifying the price will initiate a MetaMask transaction to update the smart contract escrow balance. Please confirm the transaction when prompted.</p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                            ) : (
                                <><Save className="w-4 h-4" /> Save Changes</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditContractModal;
