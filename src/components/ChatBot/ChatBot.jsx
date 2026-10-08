import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Send, Bot, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTour } from '../../context/TourContext';
import { detectContext } from '../../services/chatbot/contextDetector';
import { buildPrompt, buildGreeting } from '../../services/chatbot/promptBuilder';
import { callGemini } from '../../services/chatbot/geminiClient';

const TOUR_KEYWORDS = /(tour|walkthrough|guide)/i;

const ChatBot = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { user } = useAuth();
    const { startTour } = useTour();
    const context = detectContext(location, user);

    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: buildGreeting(context),
        },
    ]);
    const [showTourLink, setShowTourLink] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleProductTourClick = () => {
        onClose?.();
        startTour(0);
        setShowTourLink(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        const shouldSuggestTour = TOUR_KEYWORDS.test(input);
        setShowTourLink(shouldSuggestTour);
        setInput('');
        setIsLoading(true);

        try {
            const prompt = buildPrompt(input, context);
            const response = await callGemini(prompt);

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: response,
                },
            ]);
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: `⚠️ ${error.message || 'Sorry, I encountered an error. Please try again.'}`,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-4 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <Bot className="text-white" size={24} />
                    </div>
                    <div className="text-white">
                        <h3 className="font-bold">Oxygen</h3>
                        <p className="text-xs opacity-90">Ask me anything</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleProductTourClick}
                        className="text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-[11px] uppercase tracking-wide font-semibold transition"
                    >
                        Product tour
                    </button>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                        aria-label="Close chat"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {msg.content}
                            </p>
                        </div>
                    </div>
                ))}
                {showTourLink && (
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={handleProductTourClick}
                            className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border border-emerald-200 px-3 py-1 rounded-full text-xs uppercase tracking-wide font-semibold transition"
                        >
                            Start the product tour
                        </button>
                    </div>
                )}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200">
                            <Loader2 className="animate-spin text-emerald-500" size={20} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        aria-label="Send message"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatBot;
