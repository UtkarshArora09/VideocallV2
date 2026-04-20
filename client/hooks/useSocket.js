import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

let socket;
if (!socket) {
  socket = io(window.location.origin);
}

export function useSocket(roomId, userName, isDoctor = false) {
  const [chatMessages, setChatMessages] = useState([]);
  const [waitingPeers, setWaitingPeers] = useState([]);
  // callStatus: 'idle' | 'waiting' | 'admitted' | 'rejected' | 'in-call'
  const [callStatus, setCallStatus] = useState('joining');
  const [isHost, setIsHost] = useState(false);
  const [peerStates, setPeerStates] = useState({}); // { peerId: { isMicOn: boolean, isVideoOn: boolean } }

  useEffect(() => {
    if (!roomId) return;

    socket.emit('room:join', { roomId, userName, isDoctor });

    // Join room setup
    socket.on('room:status', ({ isHost: hostStatus }) => {
      setIsHost(hostStatus);
      if (!hostStatus) {
        setCallStatus('idle');
      }
    });

    socket.on('room:waiting', () => {
      setCallStatus('waiting');
    });

    socket.on('room:admitted', () => {
      setCallStatus('admitted');
    });

    socket.on('room:rejected', () => {
      setCallStatus('rejected');
    });

    // Host receives knock
    socket.on('room:knock-request', (peer) => {
      setWaitingPeers((prev) => {
        if (prev.find(p => p.socketId === peer.socketId)) return prev;
        return [...prev, peer];
      });
    });

    socket.on('chat:message', (msg) => {
      setChatMessages((prev) => {
         const newMsgs = [...prev, msg];
         if (newMsgs.length > 100) newMsgs.shift();
         return newMsgs;
      });
    });

    socket.on('peer:mediaState', ({ peerId, ...state }) => {
      setPeerStates((prev) => ({
        ...prev,
        [peerId]: { ...prev[peerId], ...state }
      }));
    });

    return () => {
      socket.off('room:status');
      socket.off('room:waiting');
      socket.off('room:admitted');
      socket.off('room:rejected');
      socket.off('room:knock-request');
      socket.off('chat:message');
      socket.off('peer:mediaState');
    };
  }, [roomId]);

  const knock = useCallback(() => {
    socket.emit('room:knock', { roomId, name: userName });
  }, [roomId, userName]);

  const admit = useCallback((peerId) => {
    setWaitingPeers(prev => prev.filter(p => p.socketId !== peerId));
    socket.emit('room:admit', { roomId, peerId });
  }, [roomId]);

  const reject = useCallback((peerId) => {
    setWaitingPeers(prev => prev.filter(p => p.socketId !== peerId));
    socket.emit('room:reject', { roomId, peerId });
  }, [roomId]);

  const kick = useCallback((peerId) => {
    socket.emit('room:kick', { roomId, peerId });
  }, [roomId]);

  const sendMessage = useCallback((text) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messagePayload = { roomId, message: text, senderName: userName, timestamp, senderId: socket.id };
    socket.emit('chat:message', messagePayload);
  }, [roomId, userName]);

  const broadcastMediaState = useCallback((state) => {
    // state: { isMicOn, isVideoOn }
    socket.emit('peer:mediaState', { roomId, ...state });
  }, [roomId]);

  return {
    socketId: socket.id,
    callStatus,
    setCallStatus,
    isHost,
    waitingPeers,
    knock,
    admit,
    reject,
    kick,
    chatMessages,
    sendMessage,
    peerStates,
    broadcastMediaState
  };
}
