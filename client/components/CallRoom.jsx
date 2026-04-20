import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { LiveKitRoom } from '@livekit/components-react';
import { useSocket } from '../hooks/useSocket';
import { useVirtualBackground } from '../hooks/useVirtualBackground';
import WaitingRoom from './WaitingRoom';
import HostApprovalToast from './HostApprovalToast';
import ChatDrawer from './ChatDrawer';
import Notepad from './Notepad';
import VideoGrid from './VideoGrid';
import ControlBar from './ControlBar';
import PostCallSummary from './PostCallSummary';

export default function CallRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const userName = location.state?.userName || 'Guest';
  const isDoctor = location.state?.isDoctor || false;

  const {
     callStatus, setCallStatus, isHost, waitingPeers, knock, admit, reject,
     chatMessages, sendMessage, peerStates, broadcastMediaState
  } = useSocket(roomId, userName, isDoctor);

  const [token, setToken] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [postCallActive, setPostCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const startTimeRef = useRef(Date.now());
  const [localStream, setLocalStream] = useState(null);
  const useVirtualBg = useVirtualBackground(localStream);

  // Fetch LiveKit token upon admission
  useEffect(() => {
     if (callStatus === 'admitted') {
        fetchToken();
     }
  }, [callStatus]);

  useEffect(() => {
     if (callStatus === 'idle') {
        knock(); // automatically knock when entering Room component
     }
  }, [callStatus, knock]);

  useEffect(() => {
     if (!chatOpen && chatMessages.length > 0) {
        setUnreadCount(prev => prev + 1);
     }
  }, [chatMessages, chatOpen]);

  const fetchToken = async () => {
     try {
       const res = await fetch('/api/livekit/token', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ roomId, participantName: userName })
       });
       const data = await res.json();
       setToken(data.token);
       startTimeRef.current = Date.now();
     } catch (err) {
       console.error('Fetch token err:', err);
     }
  };

  const handleEndCall = () => {
     const duration = (Date.now() - startTimeRef.current) / 1000;
     setCallDuration(duration);
     setPostCallActive(true);
     setToken(null); // Disconnects LiveKitRoom
     if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
     }
  };

  if (postCallActive) {
     return <PostCallSummary roomId={roomId} userName={userName} duration={callDuration} />;
  }

  if (callStatus === 'rejected') {
     return (
       <div className="flex h-full items-center justify-center text-red-500 font-bold bg-gray-900">
          You were rejected by the host. 
          <button onClick={() => navigate('/')} className="ml-4 px-4 py-2 bg-gray-800 rounded">Go Back</button>
       </div>
     );
  }

  if (callStatus === 'waiting' || callStatus === 'idle') {
     return (
       <div className="h-full bg-gray-900 relative">
          {isHost && <HostApprovalToast waitingPeers={waitingPeers} admit={admit} reject={reject} />}
          <WaitingRoom roomCode={roomId} />
       </div>
     );
  }

  return (
    <div className="w-full h-full bg-black relative overflow-hidden flex flex-col">
       {/* Use wrapper or conditional render because LiveKitRoom requires token */}
       {token ? (
         <LiveKitRoom
           serverUrl={import.meta.env.VITE_LIVEKIT_WS_URL || 'wss://your-livekit-url.livekit.cloud'}
           token={token}
           connect={true}
           // publish default tracks only if not using virtual BG? 
           // Actually LiveKit components can auto-publish if we set audio/video
           video={true}
           audio={true}
           className="flex-1 w-full h-full relative"
         >
           <VideoGrid peerStates={peerStates} />
           
           <ControlBar 
              onLeave={handleEndCall}
              onToggleChat={() => { setChatOpen(!chatOpen); setUnreadCount(0); }}
              onToggleNotes={() => setNotesOpen(!notesOpen)}
              unreadCount={unreadCount}
              broadcastMediaState={broadcastMediaState}
              useVirtualBg={useVirtualBg} // Pass for recording
           />

           <ChatDrawer 
              isOpen={chatOpen} 
              onClose={() => setChatOpen(false)} 
              messages={chatMessages} 
              sendMessage={sendMessage} 
           />

           <Notepad 
              isOpen={notesOpen} 
              onClose={() => setNotesOpen(false)} 
              roomId={roomId} 
           />

           {isHost && <HostApprovalToast waitingPeers={waitingPeers} admit={admit} reject={reject} />}
         </LiveKitRoom>
       ) : (
         <div className="flex items-center justify-center h-full text-white">Connecting SFU...</div>
       )}
    </div>
  );
}
