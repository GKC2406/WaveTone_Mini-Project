# 🎙️ WaveTone

A modern, **anonymous voice room platform** built with cutting-edge web technologies. WaveTone enables real-time peer-to-peer voice communication in temporary, moderated rooms with a focus on privacy, accessibility, and elegant design.

---

## ✨ Features

- **Anonymous Voice Rooms** — Connect with others without revealing identity; temporary labels (User A, User B, etc.)
- **Real-Time Communication** — WebRTC for direct peer-to-peer audio; Socket.io for signaling and session management
- **Moderation & Safety** — Profanity filtering, warning system, vote-kick functionality, and transparent moderation notices
- **Room Customization** — Set room topic, max participants, duration, profanity filter, and rejoin policies
- **Dark & Light Themes** — Glassmorphic UI with smooth theme transitions and accessible colors
- **Responsive Design** — Mobile-first approach; works seamlessly across devices
- **Session Summary** — Post-room analytics including participation metrics and conversation insights

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (v18+) — Component-based UI
- **Vite** — Lightning-fast build tool
- **React Router** — Client-side navigation
- **CSS3** — Modern styling (Grid, Flexbox, animations, glassmorphism)
- **SVG Icons** — Theme-aware inline graphics

### Backend
- **Node.js** — JavaScript runtime
- **Express.js** — Web framework
- **MongoDB** — NoSQL database
- **Socket.io** — Real-time bidirectional communication
- **WebRTC** — Peer-to-peer audio streams
- **Deployment** - FrontEnd - Vercel, Backend - Render

### DevOps
- **Vite** (frontend build)
- **npm/npx** (package management)
- Deployment ready for Vercel (frontend), Render/Railway/Heroku (backend)

---

## 📁 Project Structure

```
WaveTone/
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/          # All 7 page components
│   │   │   ├── Home.jsx
│   │   │   ├── BrowseRooms.jsx
│   │   │   ├── CreateRoom.jsx
│   │   │   ├── JoinRoom.jsx
│   │   │   ├── VoiceRoom.jsx
│   │   │   ├── PostRoomSummary.jsx
│   │   │   └── About.jsx
│   │   ├── App.jsx         # Root component + navbar + theme toggle
│   │   ├── App.css         # Global navbar, theme styles
│   │   ├── index.css       # Reset, scrollbar, fonts
│   │   ├── theme.css       # Utility classes (buttons, badges, etc.)
│   │   ├── theme.js        # CSS variable definitions
│   │   ├── shared.css      # Reusable component patterns
│   │   ├── assets/         # Images, logos
│   │   └── index.jsx       # React entry point
│   ├── package.json
│   └── vite.config.js
├── server/                  # Node/Express backend
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── models/         # MongoDB schemas
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, etc.
│   │   └── app.js          # Express server setup
│   └── package.json
└── README.md
```

---

## 🎨 Color Palettes

### Dark Theme (Default)
| Element | Hex Code | Usage |
|---------|----------|-------|
| Background | `#0F1115` | Main page background |
| Surface | `#1A1D24` | Cards, surfaces |
| Card Border | `#262A33` | Subtle dividers |
| Accent | `#38BDF8` | Links, highlights (cyan) |
| Speaking Ring | `#38BDF8` | Active speaker indicator |
| Warning | `#F87171` | Alerts, errors |
| Text Primary | `#F1F5F9` | Main text |
| Text Secondary | `#94A3B8` | Muted text |

### Light Theme (Glassmorphic)
| Element | Hex Code | Usage |
|---------|----------|-------|
| Background | `#F0F9FC` | Main page background |
| Surface | `#FFFFFF` | Cards, surfaces |
| Card Border | `#CFFAFE` | Subtle dividers |
| Navbar Background | `#FFFFFFCC` | 80% opacity white with blur |
| Navbar Border | `#E2E8F0` | Hairline separator |
| Link Idle | `#64748B` | Medium slate text |
| Link Hover | `#0EA5E9` | Cyber blue highlight |
| Active Link | `#0F172A` | Deep navy with white text |
| Text Primary | `#0A2E50` | Main text (navy) |
| Warning | `#DC2626` | Alerts, errors |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ and npm v9+
- MongoDB (local or Atlas cluster)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/WaveTone.git
   cd WaveTone
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../server
   npm install
   ```

### Development

#### Start Frontend (Vite)
```bash
cd client
npm run dev
```
- Runs on `http://localhost:5173` (or next available port)
- Hot module replacement enabled

#### Start Backend (Node)
```bash
cd server
npm run dev
```
- Runs on `http://localhost:5000` (configurable in `.env`)
- Connect to MongoDB via `MONGO_URI` in `.env`

#### Access the App
- Open `http://localhost:5173` in your browser
- Dark theme loads by default; toggle via sun/moon icon in navbar

---

## 📖 Pages Overview

| Page | Purpose | Key Features |
|------|---------|--------------|
| **Home** | Landing page | Hero section, feature cards, animated wave, CTA buttons |
| **Browse Rooms** | Discover rooms | Search bar, category tabs, live room cards with participant count |
| **Create Room** | Start a room | Form: topic, category, max users, duration, moderation settings |
| **Join Room** | Enter a room | Room info display, rules checkbox, alias input |
| **Voice Room** | Active session | Top bar (title, timer, leave), participant grid, bottom controls (mute, raise hand, volume) |
| **Post-Room Summary** | Session review | Stats (duration, participants), conversation insights, re-join button |
| **About** | Info & rules | What WaveTone is, anonymity explanation, moderation transparency |

---

## 🔐 Anonymity & Moderation

### User Privacy
- No usernames or profiles shared in-room
- Temporary labels: "User A", "User B", etc.
- Session data cleared after room closes
- No voice recordings stored

### Moderation Features
- **Profanity Filter** — Configurable per room (ON/OFF)
- **Warning System** — Up to 3 warnings before removal
- **Vote-Kick** — Participants can vote to remove disruptive users
- **Moderation Notices** — Toast messages for warnings (non-intrusive)
- **Transparency** — Users see moderation rules on join

---

## 🎯 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy `dist/` folder to Vercel
```

### Backend (Render / Railway / Heroku)
```bash
cd server
# Set env variables: MONGO_URI, PORT, NODE_ENV=production
npm run build
npm start
```

**Note:** Ensure `FRONTEND_URL` and `BACKEND_URL` are correctly set in environment variables for CORS and WebRTC signaling.

---

## 🔄 API Endpoints (Stub)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rooms` | GET | List all rooms |
| `/api/rooms` | POST | Create a new room |
| `/api/rooms/:id` | GET | Get room details |
| `/api/rooms/:id/join` | POST | Join a room session |
| `/api/sessions/:id/summary` | GET | Post-room summary |

---

## 🛠️ Development Workflow

1. **Components:** Each page is a self-contained React component with its own CSS
2. **Styling:** Global theme variables in `theme.js`, component-specific styles in each `.css` file
3. **Theme Toggle:** Click sun/moon icon to switch themes; `data-theme` attribute on `<html>` triggers CSS overrides
4. **Reusable Patterns:** Check `shared.css` for button, badge, toggle, and card styles

### Adding a New Feature
1. Create component file in `src/pages/` or `src/components/`
2. Import and use shared styles from `shared.css`
3. Add theme overrides in `App.css` if needed
4. Use CSS custom properties (`--accent`, `--text-primary`, etc.) for theme consistency

---

## ✅ To-Do / Roadmap

- [ ] Backend API implementation
- [ ] MongoDB schemas and models
- [ ] Socket.io signaling server
- [ ] WebRTC peer connection logic
- [ ] Authentication (email/OAuth)
- [ ] AI conversation summarization (optional)
- [ ] Analytics dashboard (admin)
- [ ] Mobile app (React Native)
- [ ] Accessibility audit (WCAG AA)

---

## 📝 License

This project is open source under the MIT License. See `LICENSE` for details.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For questions or issues, please open a GitHub Issue or contact the maintainers.

---

**WaveTone** — *Connect anonymously. Speak freely. Listen respectfully.* 🎙️

