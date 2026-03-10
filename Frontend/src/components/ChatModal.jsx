import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { X, Send, Loader2 } from 'lucide-react';
import api from '../services/api';

const ChatModal = ({ isOpen, onClose, contractId, currentUser, contractData }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Fetch initial messages and connect socket
    useEffect(() => {
        if (!isOpen) return;
        
        const fetchMessages = async () => {
            try {
                setIsLoading(true);
                const res = await api.get(`/contracts/${contractId}/messages`);
                if (res.data.success) {
                    setMessages(res.data.messages);
                }
            } catch (err) {
                console.error('Error fetching messages:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();

        // Connect to Socket.IO backend
        // Assuming backend runs on the same origin or we provide the URL
        const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const newSocket = io(backendUrl);

        newSocket.on('connect', () => {
             newSocket.emit('join_room', contractId);
        });

        newSocket.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [isOpen, contractId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const role = currentUser?.role || currentUser?.userType;
        
        const messageData = {
            contractId,
            senderId: currentUser._id || currentUser.id,
            senderName: currentUser.name || currentUser.farmerName || 'User',
            role: role,
            text: newMessage.trim()
        };

        socket.emit('send_message', messageData);
        setNewMessage('');
    };

    if (!isOpen) return null;

    // Determine the other party's name for the header
    const role = currentUser?.role || currentUser?.userType;
    const isFarmer = role === 'farmer';
    const otherPartyName = isFarmer ? contractData?.buyerName : contractData?.acceptedBy?.farmerName;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="bg-white rounded-2xl w-full max-w-md h-[600px] flex flex-col shadow-xl overflow-hidden">
                {/* Header */}
                <div className={`${isFarmer ? 'bg-green-600' : 'bg-blue-600'} px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-white shrink-0`}>
                    <div>
                        <h3 className="font-bold text-lg">Negotiation Chat</h3>
                        <p className={`${isFarmer ? 'text-green-100' : 'text-blue-100'} text-xs text-left`}>
                            with {otherPartyName || 'Unknown'}
                        </p>
                    </div>
                    <button onClick={onClose} className={`p-2 ${isFarmer ? 'hover:bg-green-700' : 'hover:bg-blue-700'} rounded-full transition-colors self-end sm:self-auto`}>
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                    {isLoading ? (
                        <div className="flex-1 flex justify-center items-center">
                            <Loader2 className={`w-6 h-6 animate-spin ${isFarmer ? 'text-green-500' : 'text-blue-500'}`} />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex-1 flex flex-col justify-center items-center text-gray-400">
                            <p className="text-sm">No messages yet.</p>
                            <p className="text-xs mt-1">Start negotiating details here.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.senderId === (currentUser._id || currentUser.id);
                            return (
                                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                                        isMe 
                                        ? `${isFarmer ? 'bg-green-600' : 'bg-blue-600'} text-white rounded-tr-none` 
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                                    }`}>
                                        <p>{msg.text}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 select-none">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                                        {!isMe && ` • ${msg.senderName}`}
                                    </span>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className={`flex-1 bg-gray-100 border-transparent focus:bg-white focus:ring-2 rounded-full px-4 py-2.5 text-sm transition-all outline-none ${
                            isFarmer 
                                ? 'focus:border-green-500 focus:ring-green-200' 
                                : 'focus:border-blue-500 focus:ring-blue-200'
                        }`}
                    />
                    <button 
                         type="submit" 
                         disabled={!newMessage.trim()}
                         className={`w-10 h-10 ${
                             isFarmer 
                                ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-300' 
                                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300'
                         } text-white rounded-full flex items-center justify-center disabled:cursor-not-allowed transition-colors shrink-0`}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatModal;
