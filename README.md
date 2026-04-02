# WaveTone

WaveTone is a cutting-edge, anonymous voice room platform designed for real-time peer-to-peer communication. Built with modern web technologies, it emphasizes privacy, accessibility, and elegant design.

---


## Features

- **Anonymous Voice Rooms**: Connect without revealing your identity.
- **Real-Time Communication**: Powered by WebRTC and Socket.io.
- **Advanced Moderation**: Profanity filters, warning systems, and vote-kick mechanisms.
- **AI-Powered Summaries**: Post-session summaries using Groq SDK and fallback summaries.
- **Customizable Rooms**: Set topics, categories, and participant limits.
- **Responsive Design**: Optimized for both desktop and mobile.

---

## Tech Stack

### Frontend
- React.js, Vite, React Router
- Web Audio API, Web Speech API
- CSS3 with glassmorphism and animations

### Backend
- Node.js, Express.js, Socket.io
- MongoDB Atlas, Mongoose
- Groq SDK, WebRTC

---

## Project Structure

```
CodeBase/
├── client/                  # React frontend
│   ├── index.html           # Entry HTML
│   ├── vite.config.js       # Vite config
│   ├── public/              # Static assets
│   └── src/                 # Source code
│       ├── App.jsx          # Root component
│       ├── pages/           # React pages
│       ├── audio/           # Audio pipeline
│       └── services/        # API and socket helpers
├── server/                  # Node backend
│   ├── index.js             # Entry point
│   ├── src/                 # Source code
│       ├── controllers/     # API controllers
│       ├── routes/          # API routes
│       ├── models/          # Database models
│       └── utils/           # Utility functions
└── Z+ Updates & Help/       # Documentation
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Groq API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/WaveTone.git
cd WaveTone/CodeBase

# Install dependencies
cd client && npm install
cd ../server && npm install
```

### Environment Variables

Create a `.env` file in `server/` with the following:
```
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
```

### Run Locally

```bash
# Start backend
cd server
npm run dev

# Start frontend
cd client
npm run dev
```

---

## Deployment

### Frontend
- Deploy `client/dist/` to Vercel.
- Set `VITE_API_URL` environment variable.

### Backend
- Deploy `server/` to Railway or Render.
- Set `MONGO_URI`, `GROQ_API_KEY`, and `PORT`.

---

## Documentation

- **Project_Info.txt**: Architecture and data flows.
- **Future Upgrades AI.txt**: AI feature roadmap.
- **Viva_Questions.txt**: Viva preparation Q&A.

---

**WaveTone**: *Connect anonymously. Speak freely. Listen respectfully.*
