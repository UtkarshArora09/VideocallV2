import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RoomEntry() {
  const [roomCode, setRoomCode] = useState('');
  const [userName, setUserName] = useState('');
  const [isDoctor, setIsDoctor] = useState(false);
  const navigate = useNavigate();

  const generateAndCopyLink = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const url = `${window.location.origin}/room/${code}`;
    navigator.clipboard.writeText(url);
    alert(`Link copied: ${url}`);
    setRoomCode(code);
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (!roomCode || !userName) return;
    navigate(`/room/${roomCode}`, { state: { userName, isDoctor } });
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 relative z-10 w-full h-full overflow-y-auto">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-xl backdrop-blur-md bg-opacity-80">
        <h1 className="text-3xl font-bold text-center text-brand-teal mb-6">AyurSutra Telemed</h1>
        <form onSubmit={joinRoom} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Your Name</label>
            <input 
              type="text" 
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-teal focus:outline-none min-h-[48px]"
              placeholder="Dr. Smith or Patient Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Room Code</label>
            <div className="flex space-x-2">
              <input 
                type="text" 
                required
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-teal focus:outline-none min-h-[48px]"
                placeholder="Enter existing code..."
              />
            </div>
          </div>
          <div className="flex items-center space-x-3 pt-2">
            <input 
              type="checkbox" 
              id="isDoctor"
              checked={isDoctor}
              onChange={(e) => setIsDoctor(e.target.checked)}
              className="w-5 h-5 rounded bg-gray-900 border-gray-700 text-brand-teal focus:ring-brand-teal"
            />
            <label htmlFor="isDoctor" className="text-gray-300 font-medium">I am the Doctor (Host)</label>
          </div>
          <button 
            type="submit" 
            className="w-full py-3 mt-4 text-white bg-brand-teal hover:bg-brand-teal-dark rounded-xl font-semibold shadow-lg transition-colors min-h-[48px]"
          >
            Join Call
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Or start a new consultation</p>
          <button 
            onClick={generateAndCopyLink}
            className="text-brand-teal hover:text-white transition-colors text-sm font-medium p-2 min-h-[48px] min-w-[48px]"
          >
            Generate & Copy New Link
          </button>
        </div>
      </div>
    </div>
  );
}
