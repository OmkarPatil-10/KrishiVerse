// import { Bell, User, Sprout, ArrowDown, Building2, Clock, FileText } from 'lucide-react';
// import { useProfileSidebar } from '../context/ProfileSidebarContext';

// const Wallet = () => {
//     const { openSidebar, isOpen: isSidebarOpen } = useProfileSidebar();
//     // Mock transaction data
//     const transactions = [
//         {
//             id: 1,
//             description: 'Contract KV001 - Wheat Sale',
//             date: '12 Mar 2024',
//             amount: 130000,
//             status: 'Completed'
//         },
//         {
//             id: 2,
//             description: 'Contract KV002 - Rice Sale',
//             date: '10 Mar 2024',
//             amount: 72000,
//             status: 'Completed'
//         }
//     ];

//     const totalBalance = 243250;
//     const availableBalance = 243250;
//     const pendingBalance = 46250;

//     return (
//         <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
//             {/* Top Header Section */}
//             <div className="bg-white shadow-sm sticky top-0 z-10 md:relative md:shadow-none">
//                 <div className="px-4 py-3 md:px-6 md:py-4">
//                     <div className="flex items-center justify-between mb-2">
//                         <div className="flex items-center gap-2">
//                             <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
//                                 <Sprout className="w-5 h-5 text-white" />
//                             </div>
//                             <span className="text-lg font-bold text-gray-800 md:hidden">KrishiVerse</span>
//                         </div>
//                         {!isSidebarOpen && (
//                             <div className="flex items-center gap-3">
//                                 <Bell className="w-5 h-5 text-gray-600 cursor-pointer" />
//                                 <button onClick={openSidebar}>
//                                     <User className="w-5 h-5 text-gray-600 cursor-pointer" />
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                     <div className="hidden md:block">
//                         <h1 className="text-3xl font-bold text-gray-900 mb-1">Wallet</h1>
//                     </div>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div className="px-4 py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
//                 {/* Title - Mobile */}
//                 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:hidden">Wallet</h1>

//                 {/* Total Balance Card */}
//                 <div className="bg-gradient-to-br from-primary to-green-700 rounded-xl shadow-sm p-6 mb-4 text-white">
//                     <div className="flex items-start justify-between mb-4">
//                         <div>
//                             <p className="text-sm opacity-90 mb-2">Total Balance</p>
//                             <p className="text-4xl font-bold">₹{totalBalance.toLocaleString()}</p>
//                         </div>
//                         <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
//                             <FileText className="w-5 h-5" />
//                         </button>
//                     </div>
//                     <div className="flex items-center justify-between pt-4 border-t border-white/20">
//                         <div>
//                             <p className="text-xs opacity-90 mb-1">Available</p>
//                             <p className="text-lg font-semibold">₹{availableBalance.toLocaleString()}</p>
//                         </div>
//                         <div>
//                             <p className="text-xs opacity-90 mb-1">Pending</p>
//                             <p className="text-lg font-semibold">₹{pendingBalance.toLocaleString()}</p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Quick Actions */}
//                 <div className="grid grid-cols-2 gap-4 mb-6">
//                     <button className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors">
//                         <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                             <Building2 className="w-6 h-6 text-blue-600" />
//                         </div>
//                         <span className="text-sm font-medium text-gray-700">Withdraw</span>
//                     </button>
//                     <button className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors">
//                         <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
//                             <Clock className="w-6 h-6 text-yellow-600" />
//                         </div>
//                         <span className="text-sm font-medium text-gray-700">History</span>
//                     </button>
//                 </div>

//                 {/* Recent Transactions */}
//                 <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
//                     <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h2>
//                     <div className="space-y-3">
//                         {transactions.map((transaction) => (
//                             <div
//                                 key={transaction.id}
//                                 className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
//                             >
//                                 <div className="flex items-center gap-3 flex-1">
//                                     <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
//                                         <ArrowDown className="w-5 h-5 text-green-700" />
//                                     </div>
//                                     <div className="flex-1 min-w-0">
//                                         <p className="font-medium text-gray-900">{transaction.description}</p>
//                                         <p className="text-sm text-gray-500">{transaction.date}</p>
//                                     </div>
//                                 </div>
//                                 <div className="text-right">
//                                     <p className="font-bold text-green-700">+₹{transaction.amount.toLocaleString()}</p>
//                                     <p className="text-xs text-green-600">{transaction.status}</p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Bank Account */}
//                 <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
//                     <h2 className="text-lg font-bold text-gray-900 mb-4">Bank Account</h2>
//                     <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
//                         <div className="flex items-center gap-3">
//                             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                                 <Building2 className="w-6 h-6 text-blue-600" />
//                             </div>
//                             <div>
//                                 <p className="font-semibold text-gray-900">State Bank of India</p>
//                                 <p className="text-sm text-gray-600">****1234</p>
//                             </div>
//                         </div>
//                         <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
//                             Change
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Wallet;


import { Bell, User, Sprout, ArrowDown, Building2, Clock, FileText } from 'lucide-react';
import { useProfileSidebar } from '../context/ProfileSidebarContext';

const Wallet = () => {
    const { openSidebar, isOpen: isSidebarOpen } = useProfileSidebar();
    // Mock transaction data
    const transactions = [
        {
            id: 1,
            description: 'Contract KV001 - Wheat Sale',
            date: '12 Mar 2024',
            amount: 130000,
            status: 'Completed'
        },
        {
            id: 2,
            description: 'Contract KV002 - Rice Sale',
            date: '10 Mar 2024',
            amount: 72000,
            status: 'Completed'
        }
    ];

    const totalBalance = 243250;
    const availableBalance = 243250;
    const pendingBalance = 46250;

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
                    <div className="hidden md:block">
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Wallet</h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
                {/* Title - Mobile */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:hidden">Wallet</h1>

                {/* Total Balance Card */}
                <div className="bg-gradient-to-br from-primary to-green-700 rounded-xl shadow-sm p-6 mb-4 text-white">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm opacity-90 mb-2">Total Balance</p>
                            <p className="text-4xl font-bold">₹{totalBalance.toLocaleString()}</p>
                        </div>
                        <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <FileText className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/20">
                        <div>
                            <p className="text-xs opacity-90 mb-1">Available</p>
                            <p className="text-lg font-semibold">₹{availableBalance.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs opacity-90 mb-1">Pending</p>
                            <p className="text-lg font-semibold">₹{pendingBalance.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Withdraw</span>
                    </button>
                    <button className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">History</span>
                    </button>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h2>
                    <div className="space-y-3">
                        {transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <ArrowDown className="w-5 h-5 text-green-700" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900">{transaction.description}</p>
                                        <p className="text-sm text-gray-500">{transaction.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-700">+₹{transaction.amount.toLocaleString()}</p>
                                    <p className="text-xs text-green-600">{transaction.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bank Account */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Bank Account</h2>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">State Bank of India</p>
                                <p className="text-sm text-gray-600">****1234</p>
                            </div>
                        </div>
                        <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                            Change
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wallet;

