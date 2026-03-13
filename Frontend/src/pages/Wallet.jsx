import { useState, useEffect } from 'react';
import { Bell, User, Sprout, ArrowDown, ArrowUp, Wallet as WalletIcon, Loader2, FileText, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { useProfileSidebar } from '../context/ProfileSidebarContext';
import { useAuth } from '../context/AuthContext';
import { useStateContext } from '../context';
import { ethers } from 'ethers';
import api from '../services/api';

// Hardcoded ETH to INR rate (same as in StateContext)
const ETH_TO_INR_RATE = 1 / 0.0000052632; // ~₹1,90,000 per ETH

const Wallet = () => {
    const { openSidebar, isOpen: isSidebarOpen } = useProfileSidebar();
    const { user } = useAuth();
    const { address } = useStateContext();

    const userRole = user?.role || user?.userType;
    const isFarmer = userRole === 'farmer';

    // State
    const [ethBalance, setEthBalance] = useState(null);
    const [balanceLoading, setBalanceLoading] = useState(true);
    const [contracts, setContracts] = useState([]);
    const [contractsLoading, setContractsLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // Fetch ETH balance from blockchain
    useEffect(() => {
        const fetchBalance = async () => {
            if (!address) {
                setBalanceLoading(false);
                return;
            }
            try {
                setBalanceLoading(true);
                if (window.ethereum) {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const balance = await provider.getBalance(address);
                    setEthBalance(ethers.utils.formatEther(balance));
                }
            } catch (err) {
                console.error('Failed to fetch ETH balance:', err);
            } finally {
                setBalanceLoading(false);
            }
        };
        fetchBalance();
    }, [address]);

    // Fetch contracts
    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const res = await api.get('/contracts');
                if (res.data.success) {
                    setContracts(res.data.contracts || []);
                }
            } catch (err) {
                console.error('Failed to load contracts:', err);
            } finally {
                setContractsLoading(false);
            }
        };
        fetchContracts();
    }, []);

    // === Computed values ===
    const userId = user?._id || user?.id;

    // Filter contracts based on role
    const myContracts = isFarmer
        ? contracts.filter(c => c.acceptedBy?.farmerId === userId)
        : contracts.filter(c => c.buyerId === userId);

    const completedContracts = myContracts.filter(c => c.status === 'completed');
    const pendingContracts = myContracts.filter(c =>
        c.status === 'accepted' || c.status === 'outForDelivery'
    );

    // Balance calculations
    const ethBalanceNum = ethBalance ? parseFloat(ethBalance) : 0;
    const inrBalance = Math.round(ethBalanceNum * ETH_TO_INR_RATE);

    // Pending amount = sum of totalBudget for in-progress contracts
    const pendingAmount = pendingContracts.reduce((sum, c) => sum + (c.totalBudget || 0), 0);

    // Total earned/spent from completed contracts
    const completedTotal = completedContracts.reduce((sum, c) => sum + (c.totalBudget || 0), 0);

    // Copy address to clipboard
    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Format date
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Shorten address
    const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected';

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
                            <div className="flex items-center gap-3 md:hidden">
                                <Bell className="w-5 h-5 text-gray-600 cursor-pointer" />
                                <button onClick={openSidebar}>
                                    <User className="w-5 h-5 text-gray-600 cursor-pointer" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Wallet</h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
                {/* Title - Mobile */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:hidden">Wallet</h1>

                {/* Blockchain Wallet Card */}
                <div className="bg-gradient-to-br from-primary to-green-700 rounded-xl shadow-sm p-6 mb-4 text-white">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm opacity-90 mb-2">Wallet Balance</p>
                            {balanceLoading ? (
                                <Loader2 className="w-8 h-8 animate-spin" />
                            ) : address ? (
                                <>
                                    <p className="text-4xl font-bold">₹{inrBalance.toLocaleString()}</p>
                                    <p className="text-sm opacity-80 mt-1">
                                        {ethBalanceNum.toFixed(6)} ETH
                                    </p>
                                </>
                            ) : (
                                <p className="text-2xl font-bold opacity-70">Wallet not connected</p>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <WalletIcon className="w-6 h-6 opacity-80" />
                            {address && (
                                <button
                                    onClick={copyAddress}
                                    className="flex items-center gap-1 bg-white/15 hover:bg-white/25 rounded-lg px-3 py-1.5 text-xs transition-colors"
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle2 className="w-3 h-3" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3 h-3" />
                                            {shortAddress}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/20">
                        <div>
                            <p className="text-xs opacity-90 mb-1">
                                {isFarmer ? 'Total Earned' : 'Total Spent'}
                            </p>
                            {contractsLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <p className="text-lg font-semibold">
                                    ₹{completedTotal.toLocaleString()}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-xs opacity-90 mb-1">In Escrow</p>
                            {contractsLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <p className="text-lg font-semibold">
                                    ₹{pendingAmount.toLocaleString()}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-xs opacity-90 mb-1">Completed</p>
                            {contractsLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <p className="text-lg font-semibold">
                                    {completedContracts.length}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Network Info */}
                {address && (
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                            <div>
                                <p className="text-sm font-medium text-gray-800">Sepolia Testnet</p>
                                <p className="text-xs text-gray-500">Ethereum Test Network</p>
                            </div>
                        </div>
                        <a
                            href={`https://sepolia.etherscan.io/address/${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            View on Etherscan
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                )}

                {/* Recent Transactions - Completed Contracts */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h2>

                    {contractsLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    ) : completedContracts.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <FileText className="w-7 h-7 text-gray-300" />
                            </div>
                            <p className="text-gray-500 text-sm">No completed transactions yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {completedContracts.slice(0, 10).map((contract) => (
                                <div
                                    key={contract._id}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isFarmer
                                                ? 'bg-green-100'
                                                : 'bg-red-100'
                                            }`}>
                                            {isFarmer ? (
                                                <ArrowDown className="w-5 h-5 text-green-700" />
                                            ) : (
                                                <ArrowUp className="w-5 h-5 text-red-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {contract.cropName} — {contract.quantity} {contract.quantityUnit}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {isFarmer
                                                    ? `From ${contract.buyerName}`
                                                    : `To ${contract.acceptedBy?.farmerName || 'Farmer'}`
                                                } • {formatDate(contract.updatedAt || contract.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right ml-3">
                                        <p className={`font-bold ${isFarmer ? 'text-green-700' : 'text-red-600'}`}>
                                            {isFarmer ? '+' : '-'}₹{(contract.totalBudget || 0).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-green-600">Completed</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pending / In-Progress Contracts */}
                {pendingContracts.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">In Escrow</h2>
                        <div className="space-y-3">
                            {pendingContracts.map((contract) => (
                                <div
                                    key={contract._id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-yellow-50"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <WalletIcon className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {contract.cropName} — {contract.quantity} {contract.quantityUnit}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {contract.status === 'outForDelivery' ? 'Out for Delivery' : 'Accepted'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right ml-3">
                                        <p className="font-bold text-yellow-700">
                                            ₹{(contract.totalBudget || 0).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-yellow-600">Locked</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wallet;
