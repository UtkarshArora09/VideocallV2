import React from 'react';

export default function HostApprovalToast({ waitingPeers, admit, reject }) {
  if (waitingPeers.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
      {waitingPeers.map(peer => (
        <div key={peer.socketId} className="bg-gray-800 border border-gray-700 p-4 rounded-xl shadow-2xl w-80 flex flex-col">
          <p className="text-white font-medium mb-3">
            <span className="text-brand-teal">{peer.name}</span> is knocking...
          </p>
          <div className="flex space-x-2">
            <button 
              onClick={() => admit(peer.socketId)}
              className="flex-1 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-lg py-2 text-sm font-semibold min-h-[48px]"
            >
              Admit
            </button>
            <button 
              onClick={() => reject(peer.socketId)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 text-sm font-semibold min-h-[48px]"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
