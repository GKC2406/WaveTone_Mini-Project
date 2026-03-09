# WaveTone

A modern, **anonymous voice room platform** built with cutting-edge web technologies. WaveTone enables real-time peer-to-peer voice communication in temporary, moderated rooms with a focus on privacy, accessibility, and elegant design.

---


## Features

- **Anonymous Voice Rooms** -- Connect with others without revealing identity; temporary aliases (Echo, Wave, Drift, etc.)
- **Real-Time Communication** -- WebRTC for direct peer-to-peer audio; Socket.io for signaling and session management
- **Audio Buffer Pipeline** -- 400ms AudioWorklet ring buffer with profanity gate; SpeechRecognition detects profanity in real-time and mutes offending segments before they reach peers
- **Profanity Filter** -- Leet-speak aware regex matching on room topics, categories, and aliases; real-time speech detection via Web Speech API
- **Warning System** -- 3 profanity strikes with rate-limiting; auto-kick + IP ban at threshold
- **Vote-Kick (3+ participants only)** -- 70% participant threshold, 30-second timeout, progress bar UI. Vote kick is only available when there are at least 3 participants in the room, preventing unfair kicks in small rooms.
- **Host-Only Kick** -- Only the Host (first participant) can directly kick others. Normal users can only initiate a vote kick (if eligible).
- **IP-Based Room Bans** -- Kicked users are banned from rejoining the same room
- **AI Conversation Summary** -- Google Gemini generates post-session summaries from collected transcripts
- **Speaker Balance** -- Per-participant speaking time tracked via AnalyserNode; shown with progress bars on summary page
- **Room Customization** -- Topic, category (including custom), max participants (2-10), private toggle
- **Join by Code/Link** -- Share private room links; paste room ID or URL to join directly
- **Dark & Light Themes** -- Glassmorphic UI with smooth transitions and accessible colors
- **Responsive Design** -- Works across desktop and mobile browsers
- **Auto-Destroy Rooms** -- Rooms deactivate in MongoDB when last participant leaves

---

## Moderation Model (Upgraded)

- **Host Role:** The first participant in a room is assigned as Host and has the exclusive ability to directly kick any other participant.
- **Vote Kick:** Only available when there are 3 or more participants. Requires 70% of non-target users to vote 'yes' within 30 seconds. Not available in 2-person rooms to prevent unfair removal of the Host or sole participant.
- **Warning System:** Profanity or disruptive behavior triggers warnings. 3 warnings result in auto-kick and IP ban for the session.
- **IP Ban:** Kicked or auto-kicked users are banned from rejoining the same room for the session duration.

---

## Known Limitations

- **Vote Kick Unavailable in Small Rooms:** Vote kick is disabled for rooms with fewer than 3 participants.
- **Host Cannot Be Vote-Kicked in 2-Person Rooms:** The Host is protected from unfair removal in small rooms.
- **Browser Compatibility:** AudioWorklet and SpeechRecognition may not be supported in all browsers (e.g., Firefox, some mobile browsers).
- **No Mobile App:** Currently web-only; mobile browser support is prioritized.
- **No Host Transfer:** If the Host leaves, there is currently no auto-assignment of a new Host (future enhancement).

---

---

## Tech Stack

### Frontend
- **React.js** (v18) -- Component-based UI
- **Vite** -- Build tool with API proxy for development
- **React Router v6** -- Client-side navigation with v7 future flags
- **Web Audio API** -- AudioWorklet for audio buffering, AnalyserNode for speaking detection
- **Web Speech API** -- SpeechRecognition for real-time speech-to-text profanity detection
- **CSS3** -- CSS variables for theming, glassmorphism, animations

### Backend
- **Node.js + Express.js** -- REST API + HTTP server
- **Socket.io** -- Real-time signaling (WebRTC offer/answer/ICE, warnings, vote-kick)
- **MongoDB Atlas** -- Room persistence, participant tracking via Mongoose
- **Google Gemini API** -- Post-session AI conversation summary
- **WebRTC** -- Peer-to-peer audio (mesh topology, STUN for NAT traversal)

---

## Project Structure

```
CodeBase/
├── client/                          # React frontend
│   ├── index.html                   # Entry HTML
│   ├── vite.config.js               # Vite config with /api proxy
│   ├── public/
│   │   └── profanity-worklet.js     # AudioWorklet processor (400ms ring buffer + gate)
│   └── src/
│       ├── main.jsx                 # React entry point
│       ├── App.jsx                  # Root component, navbar, theme toggle, routes
│       ├── App.css                  # Theme variables, navbar, buttons
│       ├── theme.js                 # Dark/light theme CSS variable objects
│       ├── theme.css                # Utility classes, animations
│       ├── index.css                # Global resets, fonts
│       ├── audio/
│       │   ├── AudioPipeline.js     # Orchestrator: AudioContext + worklet + SpeechRecognition
│       │   └── profanityWordList.js # Client-side blocked words + leet-speak regex
│       ├── services/
│       │   ├── api.js               # Centralized API fetch helpers
│       │   └── socket.js            # Socket.io singleton
│       └── pages/
│           ├── Home.jsx + Home.css
│           ├── BrowseRooms.jsx + BrowseRooms.css
│           ├── CreateRoom.jsx
│           ├── JoinRoom.jsx
│           ├── VoiceRoom.jsx        # Core: WebRTC + audio pipeline + vote-kick
│           ├── PostRoomSummary.jsx   # AI summary + speaker balance
│           ├── About.jsx
│           └── shared.css           # Reusable component styles
│
├── server/                          # Node/Express backend
│   ├── .env                         # MONGO_URI, GEMINI_API_KEY (not in git)
│   ├── index.js                     # Express + Socket.io signaling + warnings + vote-kick
│   └── src/
│       ├── db.js                    # MongoDB connection
│       ├── models/Room.js           # Mongoose schema
│       ├── controllers/
│       │   ├── roomController.js    # List + create rooms (with profanity check)
│       │   ├── roomDetailsController.js  # Get/join/leave room
│       │   └── summaryController.js      # Session summary + Gemini AI summary
│       ├── routes/
│       │   ├── roomRoutes.js
│       │   ├── roomDetailsRoutes.js
│       │   └── summaryRoutes.js
│       └── utils/
│           └── profanityFilter.js   # Server-side blocked words + regex
│
└── Z+ Updates & Help/              # Documentation
    ├── Project_Info.txt             # Architecture, WebRTC deep dive, data flows
    ├── Future Upgrades AI.txt       # AI feature options
    ├── Future_Features[Non-AI].txt  # Non-AI enhancements
    ├── AI_Recommendations.txt       # Prioritized feature roadmap with statuses
    └── Viva_Questions.txt           # 50+ Q&A for viva preparation
```

---

## Getting Started

### Prerequisites
- Node.js v18+ and npm
- MongoDB Atlas cluster (or local MongoDB)
- Google AI Studio API key (free tier, for AI summary)

### Installation

```bash
# Clone
git clone https://github.com/yourusername/WaveTone.git
cd WaveTone/CodeBase

# Install frontend
cd client && npm install

# Install backend
cd ../server && npm install
```

### Environment Variables

Create `server/.env`:
```
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_ai_studio_key
```

### Run Development

```bash
# Terminal 1 -- Backend
cd server
npm run dev          # Runs on http://localhost:5000

# Terminal 2 -- Frontend
cd client
npm run dev          # Runs on http://localhost:5173
```

Vite proxies `/api` requests to the backend automatically.

---

## How It Works

### Room Lifecycle
1. **Create** -- POST /api/rooms (profanity checked) -- saved to MongoDB
2. **Browse** -- GET /api/rooms (stale rooms auto-cleaned, private rooms hidden)
3. **Join** -- Enter alias -- navigate to VoiceRoom
4. **Voice** -- WebRTC peer connections + audio buffer pipeline + moderation
5. **Leave** -- Room auto-deactivates when empty -- summary with AI + speaker balance

### Audio Pipeline (Core Innovation)
```
Mic --> AudioWorklet (400ms ring buffer with gate)
         --> MediaStreamAudioDestination --> processedStream --> WebRTC peers

Mic --> SpeechRecognition (parallel, interimResults: true)
         --> profanity regex check --> if detected --> mute gate 500ms + server warning
```

### Moderation Layers
1. **Text filter** -- Room topics, categories, aliases checked server-side
2. **Audio filter** -- Real-time SpeechRecognition + profanity gate (client-side)
3. **Warning system** -- 3 strikes, rate-limited, server-authoritative
4. **Host kick** -- Instant removal + IP ban
5. **Vote-kick** -- 70% democratic threshold + IP ban
6. **IP bans** -- Per-room, in-memory, cleaned on room close

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rooms` | GET | List active, non-private rooms (newest first) |
| `/api/rooms` | POST | Create room (profanity checked, whitelisted fields) |
| `/api/rooms/:id` | GET | Get room details |
| `/api/rooms/:id/join` | POST | Join room (capacity check, participant tracking) |
| `/api/rooms/:id/leave` | POST | Leave room (auto-deactivate if empty) |
| `/api/sessions/:id/summary` | GET | Session stats |
| `/api/sessions/:id/ai-summary` | POST | AI conversation summary via Gemini |

## Socket.io Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `join-room` | Client -> Server | Join with roomId + alias |
| `room-users` | Server -> Client | Current participants list |
| `user-joined` / `user-left` | Server -> Clients | Participant changes |
| `offer` / `answer` / `ice-candidate` | Relay | WebRTC signaling |
| `kick-user` | Client -> Server | Host kick + IP ban |
| `profanity-warning` | Client -> Server | Report detected profanity |
| `warning-issued` | Server -> Client | Warning count feedback |
| `vote-kick-start` / `vote-kick-cast` | Client -> Server | Vote-kick flow |
| `vote-kick-active` / `vote-kick-update` / `vote-kick-ended` | Server -> Clients | Vote-kick broadcasts |
| `kicked` / `join-denied` | Server -> Client | Removal / ban notification |

---

## Color Palettes

### Dark Theme
| Variable | Value | Usage |
|----------|-------|-------|
| `--bg` | `#13161B` | Background |
| `--surface` | `#1E2128` | Cards |
| `--card-border` | `#2A2F3A` | Borders |
| `--speaking` | `#38BDF8` | Accent, speaking indicator |
| `--warning` | `#F87171` | Alerts |
| `--text-primary` | `#F1F5F9` | Main text |

### Light Theme
| Variable | Value | Usage |
|----------|-------|-------|
| `--bg` | `#F0F9FC` | Background |
| `--surface` | `#FFFFFF` | Cards |
| `--card-border` | `#CFFAFE` | Borders |
| `--speaking` | `#00D4FF` | Accent |
| `--text-primary` | `#0A2E50` | Main text (navy) |

---

## Deployment

### Frontend (Vercel)
```bash
cd client && npm run build
# Deploy dist/ to Vercel
# Set env: VITE_API_URL=https://your-backend-url.com
```

### Backend (Railway / Render)
```bash
# Set env: MONGO_URI, GEMINI_API_KEY, PORT
# Root directory: server
# Start command: npm start
```

---

## Completed Features

- [x] Backend API (Express + MongoDB + Mongoose)
- [x] Socket.io signaling server
- [x] WebRTC peer-to-peer voice
- [x] Audio buffer pipeline (400ms AudioWorklet + profanity gate)
- [x] Real-time speech profanity detection (Web Speech API)
- [x] Text profanity filter (leet-speak aware regex)
- [x] Warning system (3 strikes, rate-limited, auto-kick)
- [x] Vote-kick (70% threshold, 30s timeout)
- [x] IP-based room bans
- [x] Room auto-destroy when empty
- [x] Private rooms + copy link + join by code
- [x] Custom room categories
- [x] Dark/light theme with persistence
- [x] AI conversation summary (Google Gemini)
- [x] Speaker balance tracking

## Future Enhancements

- [ ] AI behavior detection (interruptions, volume spikes, monologues)
- [ ] Adaptive moderation thresholds per room category
- [ ] Room timer with auto-close
- [ ] Conversation phase control (Intro / Discussion / Summary)
- [ ] TensorFlow.js toxicity model (upgrade from regex)

---

**WaveTone** -- *Connect anonymously. Speak freely. Listen respectfully.*
