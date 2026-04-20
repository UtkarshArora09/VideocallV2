import React, { useState } from 'react';

export default function ChatDrawer({ isOpen, onClose, messages, sendMessage }) {
  const [text, setText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-80 bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col z-40 transform transition-transform duration-300 translate-x-0">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">In-Call Chat</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-2 min-h-[48px] min-w-[48px]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === undefined; // Quick hack, or pass myId down
          // Ideally useSocket exposes socketId, and we check if msg.senderId === socketId
          return (
            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-gray-500 mb-1">{msg.senderName} • {msg.timestamp}</span>
              <div className={`px-4 py-2 rounded-2xl max-w-[85%] ${isMe ? 'bg-brand-teal text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                {msg.message}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-800 safe-area-inset-bottom">
        <div className="flex space-x-2">
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-brand-teal min-h-[48px]"
          />
          <button type="submit" className="bg-brand-teal hover:bg-brand-teal-dark text-white rounded-xl px-4 font-medium min-h-[48px] min-w-[48px]">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
