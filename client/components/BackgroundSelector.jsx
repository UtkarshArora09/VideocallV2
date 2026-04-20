import React from 'react';
import { useRoomContext } from '@livekit/components-react';

export default function BackgroundSelector({ isOpen, onClose, useVirtualBg }) {
  const { mode, setMode, setBgImage } = useVirtualBg;

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      setBgImage(img);
      setMode('image');
    };
  };

  return (
    <div className="absolute bottom-24 right-4 bg-gray-800 border border-gray-700 p-4 rounded-xl shadow-2xl z-50 w-64">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Virtual Background</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white min-h-[48px] min-w-[48px] flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        <button 
          onClick={() => setMode('none')}
          className={`min-h-[48px] min-w-[48px] flex-shrink-0 flex items-center justify-center rounded border-2 ${mode === 'none' ? 'border-brand-teal' : 'border-gray-600'} bg-gray-700 text-xs text-white`}
        >
          None
        </button>
        <button 
          onClick={() => setMode('blur')}
          className={`min-h-[48px] min-w-[48px] flex-shrink-0 flex items-center justify-center rounded border-2 ${mode === 'blur' ? 'border-brand-teal' : 'border-gray-600'} bg-gray-700 text-xs text-white blur-[1px]`}
        >
          Blur
        </button>
        <label className="min-h-[48px] min-w-[48px] flex-shrink-0 flex flex-col items-center justify-center rounded border-2 border-dashed border-gray-600 bg-gray-800 text-xs text-gray-400 cursor-pointer hover:border-gray-400 transition-colors">
          <span>Img +</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>
      <p className="text-xs text-gray-500 mt-2">Note: Virtual backgrounds can use more CPU battery.</p>
    </div>
  );
}
