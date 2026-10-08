import React from 'react';
import { MessageCircle } from 'lucide-react';

const ChatBotToggle = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40 group"
            aria-label="Open chatbot"
        >
            <MessageCircle size={28} className="group-hover:animate-pulse" />
            {/* <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-bold rounded-full h-5 w-20 flex items-center justify-center animate-bounce">
                OxyMoron
            </span> */}
        </button>
    );
};

export default ChatBotToggle;
