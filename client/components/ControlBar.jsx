import React, { useState, useEffect, useRef } from 'react';
import { useLocalParticipant } from '@livekit/components-react';
import { Track } from 'livekit-client';
import BackgroundSelector from './BackgroundSelector';

export default function ControlBar({ 
  onLeave, 
  onToggleChat, 
  onToggleNotes, 
  unreadCount, 
  broadcastMediaState,
  useVirtualBg 
}) {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();
  const [isRecording, setIsRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [bgMenuOpen, setBgMenuOpen] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Sync state up to socket via broadcastMediaState
  useEffect(() => {
    broadcastMediaState({ isMicOn: isMicrophoneEnabled, isVideoOn: isCameraEnabled });
  }, [isMicrophoneEnabled, isCameraEnabled, broadcastMediaState]);

  // Recording Timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setRecTime(t => t + 1), 1000);
    } else {
      setRecTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleMic = async () => {
    await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  };
  const toggleCamera = async () => {
    await localParticipant.setCameraEnabled(!isCameraEnabled);
  };
  const toggleScreenShare = async () => {
    await localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
  };

  const startRecording = () => {
    try {
      const audioTrackPub = localParticipant.getTrackPublication(Track.Source.Microphone);
      const videoTrackPub = localParticipant.getTrackPublication(Track.Source.Camera);
      
      const stream = new MediaStream();
      if (audioTrackPub?.track?.mediaStreamTrack) stream.addTrack(audioTrackPub.track.mediaStreamTrack);
      if (videoTrackPub?.track?.mediaStreamTrack) stream.addTrack(videoTrackPub.track.mediaStreamTrack);
      
      // If Virtual Background processedStream is active, use that instead? 
      if (useVirtualBg.processedStream) {
         useVirtualBg.processedStream.getTracks().forEach(t => stream.addTrack(t));
      }

      if (stream.getTracks().length === 0) return alert("Nothing to record");

      const options = { mimeType: 'video/webm;codecs=vp9' };
      const mr = new MediaRecorder(stream, MediaRecorder.isTypeSupported(options.mimeType) ? options : { mimeType: 'video/webm' });
      mediaRecorderRef.current = mr;
      
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const now = new Date();
        a.download = `recording-${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}.webm`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        chunksRef.current = [];
      };

      mr.start();
      setIsRecording(true);
    } catch (e) {
      console.error('Recording failed:', e);
      alert('Could not start recording. Check console.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleLeave = () => {
    if (isRecording) {
       if(!window.confirm("You are still recording. Stop recording before leaving?")) return;
       stopRecording();
    }
    onLeave();
  };

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <>
      <BackgroundSelector isOpen={bgMenuOpen} onClose={() => setBgMenuOpen(false)} useVirtualBg={useVirtualBg} />
      
      {/* Banner / Recording overlay */}
      {(isScreenShareEnabled || isRecording) && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-50 pointer-events-none">
          {isScreenShareEnabled && <div className="bg-brand-teal px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg">You are sharing your screen</div>}
          {isRecording && <div className="bg-red-600 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg flex items-center space-x-2"><div className="w-2 h-2 bg-white rounded-full animate-pulse"></div><span>{formatTime(recTime)}</span></div>}
        </div>
      )}

      {/* Screen share stop button if sharing */}
      {isScreenShareEnabled && (
        <button onClick={toggleScreenShare} className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold shadow-xl min-h-[48px] z-50 border-2 border-red-500">
          Stop Sharing
        </button>
      )}

      <div className="fixed bottom-0 left-0 w-full bg-slate-900/40 backdrop-blur-3xl border-t border-white/10 p-4 safe-area-inset-bottom z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between overflow-x-auto gap-2">
          {/* Audio / Video */}
          <div className="flex space-x-3 px-2">
            <button onClick={toggleMic} className={`h-14 min-w-[56px] px-4 font-semibold flex items-center justify-center rounded-2xl transition-all duration-300 shadow-lg ${!isMicrophoneEnabled ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 'bg-white/10 hover:bg-white/20 text-white border border-white/5'}`}>
              {!isMicrophoneEnabled ? 'Mic Off' : 'Mic On'}
            </button>
            <button onClick={toggleCamera} className={`h-14 min-w-[56px] px-4 font-semibold flex items-center justify-center rounded-2xl transition-all duration-300 shadow-lg ${!isCameraEnabled ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 'bg-white/10 hover:bg-white/20 text-white border border-white/5'}`}>
              {!isCameraEnabled ? 'Cam Off' : 'Cam On'}
            </button>
          </div>

          {/* Action Center */}
          <div className="flex space-x-3 px-2">
            <button onClick={toggleScreenShare} className={`h-14 min-w-[56px] px-4 font-semibold flex items-center justify-center rounded-2xl transition-all duration-300 shadow-lg ${isScreenShareEnabled ? 'bg-brand-teal text-white shadow-brand-teal/20' : 'bg-white/10 hover:bg-white/20 text-white border border-white/5'}`}>
              Share
            </button>
            <button onClick={() => setBgMenuOpen(!bgMenuOpen)} className="h-14 min-w-[56px] px-4 font-semibold flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/5 transition-all duration-300 shadow-lg">
              Virtual BG
            </button>
            <button onClick={isRecording ? stopRecording : startRecording} className={`h-14 min-w-[56px] px-4 font-semibold flex items-center justify-center rounded-2xl transition-all duration-300 shadow-lg ${isRecording ? 'bg-black text-red-500 border border-red-500/50' : 'bg-white/10 hover:bg-white/20 text-white border border-white/5'}`}>
               <div className={`w-3 h-3 rounded-full mr-2 ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-gray-400'}`}></div> Rec
            </button>
          </div>

          {/* Chat & Notes */}
          <div className="flex space-x-3 px-2 border-l border-white/10 ml-2">
            <button onClick={onToggleChat} className="relative h-14 min-w-[56px] px-4 font-semibold flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/5 transition-all duration-300 shadow-lg">
              Chat
              {unreadCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-xs font-bold text-white rounded-full h-6 w-6 flex items-center justify-center shadow-lg transform scale-110">{unreadCount}</span>}
            </button>
            <button onClick={onToggleNotes} className="h-14 min-w-[56px] px-4 font-semibold flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/5 transition-all duration-300 shadow-lg">
              Notes
            </button>
          </div>

          {/* End Call */}
          <div className="px-2">
            <button onClick={handleLeave} className="h-14 px-8 font-bold flex items-center justify-center rounded-2xl bg-red-600 hover:bg-red-500 text-white transition-all duration-300 shadow-[0_4px_20px_rgba(220,38,38,0.4)] hover:shadow-[0_4px_25px_rgba(220,38,38,0.6)] transform hover:-translate-y-0.5">
              End Consult
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
