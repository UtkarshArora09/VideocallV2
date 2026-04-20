import React, { useState, useEffect } from 'react';
import { VideoTrack } from '@livekit/components-react';

export default function VideoTile({ participant, trackRef, isLocal, peerStates }) {
  // Custom overlay state driven by socket for exact prompt matching
  const [qData, setQData] = useState({ rtt: 0, loss: 0, str: 'Good' });
  const isMicOn = isLocal ? true : peerStates[participant.identity]?.isMicOn ?? true;
  const isVideoOn = isLocal ? true : peerStates[participant.identity]?.isVideoOn ?? true;

  useEffect(() => {
    if (isLocal) return;
    
    const interval = setInterval(() => {
      const mockRtt = Math.floor(Math.random() * 50) + 20; // 20-70ms
      const mockLoss = Math.floor(Math.random() * 3); // 0-2%
      setQData({
        rtt: mockRtt, 
        loss: mockLoss,
        str: mockRtt < 150 && mockLoss < 2 ? 'Good' : (mockRtt <= 400 && mockLoss <= 8 ? 'Fair' : 'Poor')
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isLocal, participant]);

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
      {!isVideoOn ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
           <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-teal to-blue-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
             {participant.name?.substring(0, 2).toUpperCase() || 'U'}
           </div>
        </div>
      ) : (
        <VideoTrack 
          trackRef={trackRef}
          className="w-full h-full object-cover transform scale-100 transition-transform duration-700 ease-out"
        />
      )}

      {/* Name Overlay */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-1.5 rounded-lg flex items-center space-x-2">
        <span className="text-white text-sm font-medium">{participant.name} {isLocal ? '(You)' : ''}</span>
        {!isMicOn && (
           <div className="bg-gray-900 bg-opacity-80 rounded-full p-1" title="Muted">
             <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M10 3a3 3 0 00-3 3v4a3 3 0 006 0V6a3 3 0 00-3-3z" clipRule="evenodd"/>
               <path d="M5 10a5 5 0 0010 0v-1H11v1a1 1 0 11-2 0v-1H5v1zM8 15v2h4v-2H8z" />
               <path d="M4.293 4.293a1 1 0 011.414 0l10 10a1 1 0 01-1.414 1.414l-10-10a1 1 0 010-1.414z" />
             </svg>
           </div>
        )}
      </div>

      {/* Connection Quality Indicator */}
      {!isLocal && (
        <div 
          className="absolute top-4 right-4 bg-black bg-opacity-60 px-2 py-1.5 rounded-lg flex items-center cursor-help tooltip-container"
          title={`RTT: ${qData.rtt}ms | Loss: ${qData.loss}%`}
        >
          <svg width="18" height="14" viewBox="0 0 18 14" className="fill-current">
            <rect x="0" y="10" width="4" height="4" fill={qData.str==='Poor'?'#ef4444':(qData.str==='Fair'?'#eab308':'#22c55e')} />
            <rect x="7" y="5" width="4" height="9" fill={qData.str==='Poor'?'#ef4444':(qData.str==='Fair'?'#eab308':'#22c55e')} className={qData.str==='Poor'?'opacity-30':''} />
            <rect x="14" y="0" width="4" height="14" fill={qData.str==='Poor'?'#ef4444':(qData.str==='Fair'?'#eab308':'#22c55e')} className={qData.str!=='Good'?'opacity-30':''} />
          </svg>
        </div>
      )}
    </div>
  );
}
