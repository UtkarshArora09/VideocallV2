# 🏥 QueueCare — Doctor–Patient Video Consultation Platform

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js" />
  <img src="https://img.shields.io/badge/Socket.IO-4.8.1-black?logo=socket.io" />
  <img src="https://img.shields.io/badge/WebRTC-Peer--to--Peer-blue?logo=webrtc" />
  <img src="https://img.shields.io/badge/Express-4.21-lightgrey?logo=express" />
  <img src="https://img.shields.io/badge/Deployed-Render-46E3B7?logo=render" />
</p>

<p align="center">
  A real-time, peer-to-peer video calling web app that connects doctors and patients through a smart queue system — no app download required.
</p>

---

## 🌐 Live Demo

| Role    | URL |
|---------|-----|
| 🩺 Doctor | [https://videocall-6nuu.onrender.com/doctor.html](https://videocall-6nuu.onrender.com/doctor.html) |
| 🧑‍⚕️ Patient | [https://videocall-6nuu.onrender.com/patient.html](https://videocall-6nuu.onrender.com/patient.html) |

> Open the **Doctor** link on one device/tab, and the **Patient** link on another to start a session.

---

## ✨ Features

- **Live Video Calls** — Peer-to-peer WebRTC video between doctor and patient
- **Smart Patient Queue** — Patients join a queue; doctor calls the next one in line
- **Real-time Signaling** — Socket.IO handles all signaling (offer/answer/ICE candidates)
- **Estimated Wait Time** — Patients see a live countdown of their expected wait
- **Camera Controls** — Mute audio, stop/start video, and switch between front/rear camera
- **Hang Up** — Either party can cleanly end the call
- **No Login Required** — Instant access via browser, no accounts needed
- **Mobile Friendly** — Works on desktop and mobile browsers

---

## 🖥️ How It Works

```
Patient joins queue  →  Doctor clicks "Call Next"  →  WebRTC offer/answer exchanged via Socket.IO
     ↕                                                         ↕
Estimated wait time shown                          Peer-to-peer video established
```

1. **Patient** opens the patient page and clicks **Join Queue**. They see their queue position and estimated wait time.
2. **Doctor** opens the doctor page and sees a live list of waiting patients.
3. Doctor clicks **Call Next** — the server signals the next patient in the queue.
4. A WebRTC handshake (offer → answer → ICE candidates) is brokered via Socket.IO.
5. Both sides connect directly peer-to-peer for low-latency video.

---

## 🗂️ Project Structure

```
Videocall/
├── server.js           # Express + Socket.IO signaling server
├── package.json        # Dependencies (express, socket.io)
├── public/
│   ├── doctor.html     # Doctor UI — queue management + video call
│   └── patient.html    # Patient UI — queue join + video call + wait time
└── .gitignore
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Real-time Signaling | Socket.IO 4.8.1 |
| Video | WebRTC (browser-native) |
| Frontend | Vanilla HTML / CSS / JavaScript |
| Hosting | Render.com |

---

## 🚀 Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/UtkarshArora09/Videocall.git
cd Videocall

# 2. Install dependencies
npm install

# 3. Start the server
node server.js
```

The server will start on **http://localhost:3000** (or whichever port is configured).

Open two browser tabs:
- **Doctor:** `http://localhost:3000/doctor.html`
- **Patient:** `http://localhost:3000/patient.html`

---

## 🔌 Socket.IO Events

| Event | Direction | Description |
|---|---|---|
| `join-queue` | Patient → Server | Patient joins the waiting queue |
| `queue-update` | Server → Doctor | Updated list of waiting patients |
| `call-next` | Doctor → Server | Doctor requests to call the next patient |
| `incoming-call` | Server → Patient | Patient is notified they're being called |
| `offer` | Doctor → Server → Patient | WebRTC offer SDP |
| `answer` | Patient → Server → Doctor | WebRTC answer SDP |
| `ice-candidate` | Both → Server → Both | ICE candidates for NAT traversal |
| `hang-up` | Either → Server → Both | End the active call |

---

## 📱 UI Controls

### Doctor Panel
| Button | Action |
|---|---|
| **Call Next** | Connects to the next patient in the queue |
| **Mute** | Toggle microphone on/off |
| **Stop Video** | Toggle camera on/off |
| **Switch Cam** | Switch between front and rear camera |
| **Hang Up** | End the current call |

### Patient Panel
| Button | Action |
|---|---|
| **Join Queue** | Enter the waiting queue |
| **Mute** | Toggle microphone on/off |
| **Stop Video** | Toggle camera on/off |
| **Switch Cam** | Switch between front and rear camera |
| **Hang Up** | Leave the call |

---

## ☁️ Deployment

This project is deployed on **[Render](https://render.com)**. To deploy your own instance:

1. Fork this repository
2. Create a new **Web Service** on Render
3. Connect your forked repo
4. Set the **Start Command** to: `node server.js`
5. Set the **Environment** to: `Node`
6. Deploy — Render will auto-install dependencies from `package.json`

---

## 📦 Dependencies

```json
{
  "express": "^4.21.2",
  "socket.io": "^4.8.1"
}
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests for:
- UI improvements
- Multi-doctor support
- Video recording
- Chat alongside video
- Authentication / patient ID system

---

## 📄 License

This project is open source. See the repository for details.

---

<p align="center">Built with ❤️ by <a href="https://github.com/UtkarshArora09">UtkarshArora09</a></p>
