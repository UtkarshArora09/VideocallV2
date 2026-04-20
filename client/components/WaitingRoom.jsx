import React from 'react';

export default function WaitingRoom({ roomCode }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-full border-4 border-t-brand-teal border-gray-700 animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Waiting for Host</h2>
        <p className="text-gray-400">
          Room: <span className="font-mono text-brand-teal bg-gray-900 px-2 py-1 rounded">{roomCode}</span>
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Please wait until the host admits you to the consultation...
        </p>
      </div>
    </div>
  );
}
