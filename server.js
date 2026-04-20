require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { AccessToken } = require('livekit-server-sdk');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());

// In-memory room state for Waitlist / Host approval
// rooms = { [roomId]: { hostId, waitingList: [], participants: [] } }
const rooms = {};

// Optional: Initialize Anthropic if key exists
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

io.on('connection', (socket) => {
  socket.on('room:join', ({ roomId, userName, isDoctor }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = { hostId: null, hostName: null, waitingList: [], participants: [] };
    }

    const room = rooms[roomId];

    if (isDoctor) {
      // Doctor overwrites host state, even if patient joined first
      room.hostId = socket.id;
      room.hostName = userName;
      socket.emit('room:status', { isHost: true });
      socket.emit('room:admitted'); // Host is auto-admitted
    } else {
      socket.emit('room:status', { isHost: false });
    }
  });

  socket.on('room:knock', ({ roomId, name }) => {
    const room = rooms[roomId];
    if (room && room.hostId) {
      const peer = { socketId: socket.id, name };
      room.waitingList.push(peer);
      socket.emit('room:waiting');
      io.to(room.hostId).emit('room:knock-request', peer);
    }
  });

  socket.on('room:admit', ({ roomId, peerId }) => {
    const room = rooms[roomId];
    if (room && room.hostId === socket.id) {
      room.waitingList = room.waitingList.filter(p => p.socketId !== peerId);
      room.participants.push(peerId);
      io.to(peerId).emit('room:admitted');
    }
  });

  socket.on('room:reject', ({ roomId, peerId }) => {
    const room = rooms[roomId];
    if (room && room.hostId === socket.id) {
      room.waitingList = room.waitingList.filter(p => p.socketId !== peerId);
      io.to(peerId).emit('room:rejected');
    }
  });

  socket.on('room:kick', ({ roomId, peerId }) => {
     const room = rooms[roomId];
     if (room && room.hostId === socket.id) {
        room.participants = room.participants.filter(p => p !== peerId);
        io.to(peerId).emit('room:rejected');
     }
  });

  socket.on('chat:message', ({ roomId, message, senderName, timestamp, senderId }) => {
     io.to(roomId).emit('chat:message', { message, senderName, timestamp, senderId });
  });

  socket.on('peer:mediaState', ({ roomId, isMicOn, isVideoOn }) => {
     io.to(roomId).emit('peer:mediaState', { peerId: socket.id, isMicOn, isVideoOn });
  });

  socket.on('disconnect', () => {
    // Cleanup if host disconnects or user leaves
    for (const [roomId, room] of Object.entries(rooms)) {
      if (room.hostId === socket.id) {
         // Optionally assign new host or destroy room
         delete rooms[roomId];
      } else {
         room.waitingList = room.waitingList.filter(p => p.socketId !== socket.id);
         room.participants = room.participants.filter(p => p !== socket.id);
      }
    }
  });
});

app.post('/api/livekit/token', async (req, res) => {
  const { roomId, participantName } = req.body;
  if (!roomId || !participantName) {
    return res.status(400).json({ error: 'Missing room or participant' });
  }

  const at = new AccessToken(process.env.LIVEKIT_API_KEY || 'devkey', process.env.LIVEKIT_API_SECRET || 'devsecret', {
    identity: participantName + '-' + Math.floor(Math.random()*1000),
    name: participantName,
  });

  at.addGrant({ roomJoin: true, room: roomId });
  
  try {
     const token = await at.toJwt();
     res.json({ token });
  } catch(e) {
     res.status(500).json({ error: e.message });
  }
});

app.post('/api/summarize', async (req, res) => {
  const { notes, patientName, doctorName, duration, date } = req.body;

  if (!anthropic) {
    return res.json({
      summary: {
        chiefComplaint: "MOCK AI DATA: Missing ANTHROPIC_API_KEY",
        observations: notes,
        recommendations: "Drink water",
        followUp: "1 week",
        disclaimer: "Mock mode enabled because Anthropic API key is missing."
      }
    });
  }

  try {
    const prompt = `You are a medical note summarizer for Ayurvedic consultations. 
    Given raw doctor notes from a telemedicine session, output a structured JSON with fields: chiefComplaint, observations, recommendations, followUp, duration, disclaimer.
    Notes: ${notes}
    Doctor: ${doctorName}
    Duration: ${duration}s`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      temperature: 0.2,
      system: "Output exactly valid JSON only, no markdown markdown formatting.",
      messages: [{ role: "user", content: prompt }]
    });

    const outputText = response.content[0].text;
    res.json({ summary: JSON.parse(outputText) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Since client is built with Vite, Express can serve the dist folder in production
// But it will primarily be backend API for local dev.
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
