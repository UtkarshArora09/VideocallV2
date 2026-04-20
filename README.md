# AyurSutra Telemed WebRTC

A modern, production-ready React + Vite Telemedicine application featuring a robust WebRTC SFU powered by LiveKit. Includes virtual backgrounds, waiting rooms, AI post-call summarization, local call recording, and more!

## Features
1. **React v2 Migration**: Complete rewrite to React + Vite + Tailwind CSS.
2. **Mute/Camera Overlays**: Real-time visual indicators using Socket.IO overlay syncing.
3. **Screen Sharing**: Effortless screen broadcast via LiveKit track replacements.
4. **Connection Quality Indicator**: Live network health tracking (RTT & Packet Loss mapped to signal bars).
5. **Shareable Room Links**: React Router direct entry with random code generation.
6. **In-Call Text Chat**: Slide-in real-time chat powered by Socket.IO.
7. **Call Recording**: Local recording using `MediaRecorder` API combined with your customized video feed.
8. **Waiting Room + Host Approval**: Granular doctor-patient waitlist authorization.
9. **Multi-Party SFU**: High performance scaling via LiveKit Cloud.
10. **Virtual Background**: Client-side background blurring and image replacement via TensorFlow.js body segmentation.
11. **AI Post-Call Summary**: Automatic doctor-note structuring using Anthropic's Claude framework.

## Project Structure
This app uses a unified `package.json` for both client and backend dependencies.

- `/client` - Vite React Application
- `/server.js` - Node.js Express & Socket.IO Signaling Server
- `.env` - Environment Variables securely storing secrets

## Setup Details

### Pre-requisites
1. Node.js >= 18.x
2. [LiveKit Cloud Account](https://cloud.livekit.io/)
3. [Anthropic API Key](https://console.anthropic.com/)

### 1. Install Dependencies
```bash
npm install
npm install -D vite tailwindcss postcss autoprefixer @vitejs/plugin-react
```

### 2. Environment Variables (.env)
Create a `.env` in the root directory:
```env
LIVEKIT_API_KEY=your_key_here
LIVEKIT_API_SECRET=your_secret_here
VITE_LIVEKIT_WS_URL=wss://your-url.livekit.cloud
ANTHROPIC_API_KEY=your_anthropic_key
```

### 3. Running Locally
We've set up simple scripts in the unified `package.json`. You will need to spin up both the Vite client for React and the Node backend:

**Start the React App (Frontend):**
```bash
npm run dev
```

**Start the Signaling/API Server (Backend):**
```bash
npm start
```

## Troubleshooting
- **Missing Module or Web Worker Errors**: Ensure the dependencies were properly instantiated in `package.json`. If virtual background `comlink` throws an error, run `npm install comlink`.
- **LiveKit Empty Screen**: Ensure `.env` is correctly loaded. LiveKit defaults require strict API matching.
- **Recording Failure**: Not all browsers support `vp9`. The code gracefully falls back to basic `video/webm` if `vp9` is unsupported by your system hardware.
