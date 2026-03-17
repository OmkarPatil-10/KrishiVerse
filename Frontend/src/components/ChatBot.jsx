import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import api from '../services/api';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your Krishiverse Farming Assistant. How can I help you with your crops or livestock today?", isBot: true }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { id: Date.now(), text: input, isBot: false };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await api.post('/chatbot/chat', { message: input });
            const botMessage = { id: Date.now() + 1, text: response.data.response, isBot: true };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage = { 
                id: Date.now() + 1, 
                text: "Sorry, I'm having trouble connecting right now. Please try again later.", 
                isBot: true,
                isError: true 
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-emerald-100"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between text-white shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Bot size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Krishi AI</h3>
                                    <p className="text-xs text-emerald-50 text-emerald-100/80">Farming & Agriculture Expert</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: msg.isBot ? -10 : 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div className={`flex gap-2 max-w-[85%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                            msg.isBot ? 'bg-emerald-100 text-emerald-700' : 'bg-teal-600 text-white'
                                        }`}>
                                            {msg.isBot ? <Bot size={16} /> : <User size={16} />}
                                        </div>
                                        <div className={`p-3 rounded-2xl shadow-sm ${
                                            msg.isBot 
                                                ? (msg.isError ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-white text-gray-800 rounded-tl-none border border-emerald-50') 
                                                : 'bg-teal-600 text-white rounded-tr-none'
                                        }`}>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="flex gap-2 items-center text-emerald-600 bg-white p-3 rounded-2xl rounded-tl-none border border-emerald-50 shadow-sm">
                                        <Loader2 size={16} className="animate-spin" />
                                        <span className="text-xs font-medium">Krishi AI is thinking...</span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-emerald-50">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask anything about farming..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1.5"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className={`p-2 rounded-lg transition-all ${
                                        !input.trim() || isLoading 
                                            ? 'text-gray-400' 
                                            : 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700'
                                    }`}
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                            <p className="text-[10px] text-center text-gray-400 mt-2 italic">
                                Only answers farming related questions
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ${
                    isOpen ? 'bg-white text-emerald-600 rotate-90 border border-emerald-100' : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                }`}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </motion.button>
        </div>
    );
};

export default ChatBot;
