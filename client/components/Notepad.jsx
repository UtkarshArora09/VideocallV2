import React, { useState, useEffect } from 'react';

export default function Notepad({ isOpen, onClose, roomId }) {
  const storageKey = `notes-${roomId}`;
  const [notes, setNotes] = useState(() => localStorage.getItem(storageKey) || '');

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(storageKey, notes);
    }, 1000); // Save after 1s of no typing
    return () => clearTimeout(timer);
  }, [notes, storageKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-[#1e1e1e] border-l border-gray-700 shadow-2xl flex flex-col z-40">
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
        <h3 className="text-lg font-semibold text-brand-teal">Consultation Notes</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-2 min-h-[48px] min-w-[48px]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div className="flex-1 p-4 bg-[#1e1e1e]">
        <textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Type consultation notes here... (Auto-saving)"
          className="w-full h-full bg-transparent text-gray-200 resize-none focus:outline-none"
        ></textarea>
      </div>
    </div>
  );
}
